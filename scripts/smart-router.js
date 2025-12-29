/**
 * SMART ROUTER - Intelligent Task Routing System
 * Routes tasks to optimal AI, tool, MCP, or agent
 *
 * Port: 8775
 * Endpoints:
 *   POST /route - Route a task
 *   GET /status - Router status
 *   GET /patterns - View learned patterns
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  port: 8775,
  cooperPort: 8765,
  geminiPort: 8766,
  patternsFile: path.join(process.env.USERPROFILE, '.claude', 'learnings', 'routing-patterns.json'),
  decisionsLog: path.join(process.env.USERPROFILE, '.claude', 'logs', 'routing-decisions.json'),
  bridgeCommand: path.join(process.env.USERPROFILE, '.claude', 'bridge-command.json')
};

// Default routing rules
const ROUTES = {
  coding: { primary: 'claude-code', agents: ['coder', 'reviewer'], fallback: 'gemini' },
  research: { primary: 'gemini', agents: ['researcher'], fallback: 'claude-code' },
  windows_ops: { primary: 'cooper', agents: [], fallback: null },
  consensus: { primary: 'pal-mcp', agents: [], fallback: null },
  memory: { primary: 'memory-mcp', agents: [], fallback: 'graphiti' },
  security: { primary: 'claude-code', agents: ['security-reviewer'], fallback: null },
  testing: { primary: 'claude-code', agents: ['tester'], fallback: null },
  general: { primary: 'claude-code', agents: [], fallback: 'gemini' }
};

// Load learned patterns
let learnedPatterns = [];
try {
  if (fs.existsSync(CONFIG.patternsFile)) {
    learnedPatterns = JSON.parse(fs.readFileSync(CONFIG.patternsFile, 'utf-8'));
  }
} catch (e) {
  console.log('No learned patterns found, using defaults');
}

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

/**
 * Analyze task to determine type, complexity, and context needs
 */
function analyzeTask(task) {
  const lower = task.toLowerCase();

  // Classify task type
  let type = 'general';
  let confidence = 0.5;

  // Coding indicators
  if (/\b(fix|bug|error|implement|code|refactor|function|class|method|variable)\b/.test(lower)) {
    type = 'coding';
    confidence = 0.85;
  }
  // Research indicators
  else if (/\b(research|summarize|analyze|explain|what is|how does|compare)\b/.test(lower)) {
    type = 'research';
    confidence = 0.8;
  }
  // Windows operations
  else if (/\b(powershell|windows|admin|run|execute|start|stop|service)\b/.test(lower)) {
    type = 'windows_ops';
    confidence = 0.9;
  }
  // Consensus needed
  else if (/\b(consensus|agree|multiple models|compare models|best approach)\b/.test(lower)) {
    type = 'consensus';
    confidence = 0.9;
  }
  // Memory operations
  else if (/\b(remember|recall|what did we|previous|history|we discussed)\b/.test(lower)) {
    type = 'memory';
    confidence = 0.85;
  }
  // Security review
  else if (/\b(security|vulnerability|audit|penetration|xss|injection)\b/.test(lower)) {
    type = 'security';
    confidence = 0.85;
  }
  // Testing
  else if (/\b(test|spec|coverage|unit test|integration test)\b/.test(lower)) {
    type = 'testing';
    confidence = 0.85;
  }

  // Estimate context size (rough heuristic)
  let contextSize = task.length * 10; // Base estimate
  if (/\b(entire|whole|all|codebase|project)\b/.test(lower)) {
    contextSize = 500000; // Large context likely needed
  }

  // Calculate complexity (0-1)
  let complexity = 0.5;
  if (/\b(simple|quick|just|only)\b/.test(lower)) complexity = 0.2;
  if (/\b(complex|comprehensive|thorough|complete)\b/.test(lower)) complexity = 0.8;
  if (/\b(multi-step|coordinate|orchestrate|swarm)\b/.test(lower)) complexity = 0.9;

  return { type, confidence, contextSize, complexity };
}

/**
 * Check learned patterns for better routing
 */
function checkLearnedPatterns(analysis, task) {
  for (const pattern of learnedPatterns) {
    if (pattern.confidence >= 0.8 && pattern.taskType === analysis.type) {
      // Check if pattern applies
      const regex = new RegExp(pattern.trigger, 'i');
      if (regex.test(task)) {
        return {
          route: pattern.route,
          confidence: pattern.confidence,
          source: 'learned'
        };
      }
    }
  }
  return null;
}

/**
 * Determine optimal route for task
 */
function route(task) {
  const analysis = analyzeTask(task);

  // Check learned patterns first
  const learned = checkLearnedPatterns(analysis, task);
  if (learned) {
    log(`Using learned pattern for ${analysis.type} task`);
    return {
      ...learned,
      analysis
    };
  }

  // Get default route
  let routeConfig = ROUTES[analysis.type] || ROUTES.general;

  // Override for large context
  if (analysis.contextSize > 200000) {
    log('Large context detected, routing to Gemini');
    routeConfig = { primary: 'gemini', reason: 'large_context', agents: [], fallback: 'claude-code' };
  }

  return {
    route: routeConfig,
    confidence: analysis.confidence,
    source: 'default',
    analysis
  };
}

/**
 * Log routing decision for learning
 */
function logDecision(task, result) {
  const decision = {
    id: `route_${Date.now()}`,
    timestamp: new Date().toISOString(),
    task: task.substring(0, 200), // Truncate for storage
    taskType: result.analysis.type,
    complexity: result.analysis.complexity,
    contextSize: result.analysis.contextSize,
    routeChosen: result.route,
    confidence: result.confidence,
    source: result.source
  };

  // Append to log file
  let decisions = [];
  try {
    if (fs.existsSync(CONFIG.decisionsLog)) {
      decisions = JSON.parse(fs.readFileSync(CONFIG.decisionsLog, 'utf-8'));
    }
  } catch (e) {}

  decisions.push(decision);

  // Keep last 1000 decisions
  if (decisions.length > 1000) {
    decisions = decisions.slice(-1000);
  }

  fs.writeFileSync(CONFIG.decisionsLog, JSON.stringify(decisions, null, 2));

  return decision;
}

/**
 * Execute route - send to appropriate target
 */
async function executeRoute(task, routeResult) {
  const primary = routeResult.route.primary;

  switch (primary) {
    case 'cooper':
      // Send to Cooper for Windows execution
      const cmd = {
        command: `powershell:${task}`,
        from: 'smart-router',
        timestamp: new Date().toISOString(),
        executed: false,
        priority: 'ROUTED'
      };
      fs.writeFileSync(CONFIG.bridgeCommand, JSON.stringify(cmd, null, 2));
      return { target: 'cooper', status: 'dispatched' };

    case 'gemini':
      // Instructions for Gemini
      return {
        target: 'gemini',
        status: 'instruction',
        instruction: `Route to Gemini CLI: ${task}`
      };

    case 'claude-code':
      // Claude Code handles directly
      return {
        target: 'claude-code',
        status: 'ready',
        agents: routeResult.route.agents,
        instruction: `Execute with agents: ${routeResult.route.agents.join(', ')}`
      };

    case 'pal-mcp':
      return {
        target: 'pal-mcp',
        status: 'instruction',
        instruction: 'Use PAL MCP for multi-model consensus'
      };

    case 'memory-mcp':
      return {
        target: 'memory-mcp',
        status: 'instruction',
        instruction: 'Query Memory MCP for recall'
      };

    default:
      return {
        target: primary,
        status: 'unknown',
        instruction: `Route to ${primary}`
      };
  }
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Route a task
  if (req.url === '/route' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { task, force } = JSON.parse(body);

        // Force specific route if requested
        let result;
        if (force) {
          result = { route: { primary: force }, confidence: 1.0, source: 'forced', analysis: analyzeTask(task) };
        } else {
          result = route(task);
        }

        // Log decision
        const decision = logDecision(task, result);

        // Execute route
        const execution = await executeRoute(task, result);

        res.end(JSON.stringify({
          success: true,
          decision,
          execution,
          route: result.route,
          confidence: result.confidence
        }));
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  }
  // Status
  else if (req.url === '/status') {
    res.end(JSON.stringify({
      status: 'online',
      port: CONFIG.port,
      learnedPatterns: learnedPatterns.length,
      routes: Object.keys(ROUTES)
    }));
  }
  // View patterns
  else if (req.url === '/patterns') {
    res.end(JSON.stringify({
      default: ROUTES,
      learned: learnedPatterns
    }));
  }
  // Help
  else {
    res.end(JSON.stringify({
      name: 'Smart Router',
      version: '1.0.0',
      endpoints: {
        'POST /route': 'Route a task { task: string, force?: string }',
        'GET /status': 'Router status',
        'GET /patterns': 'View routing patterns'
      }
    }));
  }
});

// Ensure directories exist
const logsDir = path.dirname(CONFIG.decisionsLog);
const learningsDir = path.dirname(CONFIG.patternsFile);
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
if (!fs.existsSync(learningsDir)) fs.mkdirSync(learningsDir, { recursive: true });

server.listen(CONFIG.port, () => {
  log(`Smart Router started on port ${CONFIG.port}`);
  log(`Loaded ${learnedPatterns.length} learned patterns`);
});
