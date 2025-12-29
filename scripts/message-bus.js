/**
 * MESSAGE BUS - Real-time AI-to-AI Communication
 * WebSocket server for Claude Code, Gemini CLI, and other AIs
 *
 * Port: 8780
 * Connects: /claude, /gemini, /antigravity, /cooper
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  port: 8780,
  logFile: path.join(process.env.USERPROFILE, '.claude', 'logs', 'message-bus.log'),
  contextDir: path.join(process.env.USERPROFILE, '.claude', 'shared-context')
};

// Connected clients
const clients = new Map(); // name -> { ws, connectedAt, messageCount }

// Message history (last 100)
const messageHistory = [];

function log(msg) {
  const ts = new Date().toISOString();
  const logLine = `[${ts}] ${msg}`;
  console.log(logLine);
  fs.appendFileSync(CONFIG.logFile, logLine + '\n');
}

function broadcast(message, excludeClient = null) {
  const msgStr = JSON.stringify(message);
  clients.forEach((client, name) => {
    if (name !== excludeClient && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msgStr);
    }
  });
}

// Create HTTP server for status endpoint
const httpServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/status') {
    const clientList = [];
    clients.forEach((client, name) => {
      clientList.push({
        name,
        connectedAt: client.connectedAt,
        messageCount: client.messageCount,
        connected: client.ws.readyState === WebSocket.OPEN
      });
    });

    res.end(JSON.stringify({
      status: 'online',
      port: CONFIG.port,
      clients: clientList,
      totalMessages: messageHistory.length
    }));
  }
  else if (req.url === '/history') {
    res.end(JSON.stringify(messageHistory.slice(-50)));
  }
  else if (req.url === '/broadcast' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const msg = JSON.parse(body);
        broadcast({ ...msg, from: 'http-api', timestamp: new Date().toISOString() });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  }
  else {
    res.end(JSON.stringify({
      name: 'Message Bus',
      version: '1.0.0',
      wsEndpoint: `ws://localhost:${CONFIG.port}/<client-name>`,
      httpEndpoints: {
        'GET /status': 'Bus status and connected clients',
        'GET /history': 'Last 50 messages',
        'POST /broadcast': 'Broadcast message to all clients'
      }
    }));
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server: httpServer });

wss.on('connection', (ws, req) => {
  // Client name from URL path: ws://localhost:8780/claude
  const clientName = req.url.slice(1) || 'unknown';

  log(`Client connected: ${clientName}`);

  clients.set(clientName, {
    ws,
    connectedAt: new Date().toISOString(),
    messageCount: 0
  });

  // Notify others
  broadcast({
    type: 'system',
    event: 'client_connected',
    client: clientName,
    timestamp: new Date().toISOString()
  }, clientName);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      // Add metadata
      msg.from = clientName;
      msg.timestamp = new Date().toISOString();

      // Update message count
      const client = clients.get(clientName);
      if (client) client.messageCount++;

      // Log message
      log(`[${clientName}] ${msg.type}: ${JSON.stringify(msg.payload || {}).substring(0, 100)}`);

      // Store in history
      messageHistory.push(msg);
      if (messageHistory.length > 100) messageHistory.shift();

      // Route message
      if (msg.to && clients.has(msg.to)) {
        // Direct message
        const target = clients.get(msg.to);
        if (target.ws.readyState === WebSocket.OPEN) {
          target.ws.send(JSON.stringify(msg));
        }
      } else if (msg.to === 'all' || !msg.to) {
        // Broadcast
        broadcast(msg, clientName);
      }

      // Handle special message types
      switch (msg.type) {
        case 'handoff':
          // AI handoff - save to shared context
          saveHandoff(msg);
          break;

        case 'context_sync':
          // Context synchronization request
          handleContextSync(msg, ws);
          break;

        case 'ping':
          // Respond with pong
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;
      }

    } catch (e) {
      log(`Error processing message from ${clientName}: ${e.message}`);
    }
  });

  ws.on('close', () => {
    log(`Client disconnected: ${clientName}`);
    clients.delete(clientName);

    broadcast({
      type: 'system',
      event: 'client_disconnected',
      client: clientName,
      timestamp: new Date().toISOString()
    });
  });

  ws.on('error', (err) => {
    log(`WebSocket error for ${clientName}: ${err.message}`);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: `Connected as ${clientName}`,
    clients: Array.from(clients.keys()),
    timestamp: new Date().toISOString()
  }));
});

/**
 * Save handoff to shared context
 */
function saveHandoff(msg) {
  const handoffFile = path.join(CONFIG.contextDir, 'handoff-queue.json');

  let handoffs = [];
  try {
    if (fs.existsSync(handoffFile)) {
      handoffs = JSON.parse(fs.readFileSync(handoffFile, 'utf-8'));
    }
  } catch (e) {}

  handoffs.push({
    id: `handoff_${Date.now()}`,
    ...msg,
    timestamp: new Date().toISOString()
  });

  // Keep last 20 handoffs
  if (handoffs.length > 20) handoffs = handoffs.slice(-20);

  fs.writeFileSync(handoffFile, JSON.stringify(handoffs, null, 2));
  log(`Saved handoff from ${msg.from} to ${msg.to}`);
}

/**
 * Handle context sync request
 */
function handleContextSync(msg, ws) {
  const sessionFile = path.join(CONFIG.contextDir, 'session-state.json');

  try {
    if (fs.existsSync(sessionFile)) {
      const session = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
      ws.send(JSON.stringify({
        type: 'context_sync_response',
        session,
        timestamp: new Date().toISOString()
      }));
    } else {
      ws.send(JSON.stringify({
        type: 'context_sync_response',
        session: null,
        message: 'No session state found',
        timestamp: new Date().toISOString()
      }));
    }
  } catch (e) {
    ws.send(JSON.stringify({
      type: 'context_sync_error',
      error: e.message,
      timestamp: new Date().toISOString()
    }));
  }
}

// Ensure directories exist
if (!fs.existsSync(CONFIG.contextDir)) fs.mkdirSync(CONFIG.contextDir, { recursive: true });
if (!fs.existsSync(path.dirname(CONFIG.logFile))) fs.mkdirSync(path.dirname(CONFIG.logFile), { recursive: true });

httpServer.listen(CONFIG.port, () => {
  log(`Message Bus started on port ${CONFIG.port}`);
  log(`WebSocket: ws://localhost:${CONFIG.port}/<client-name>`);
  log(`HTTP Status: http://localhost:${CONFIG.port}/status`);
});
