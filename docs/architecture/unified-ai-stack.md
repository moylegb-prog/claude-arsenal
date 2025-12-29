# Unified AI Stack Architecture

## Vision
Seamless integration of Claude Code + Gemini CLI + Antigravity with intelligent routing, shared context, and continuous learning.

---

## 1. Real-Time AI-to-AI Communication

### Current State
- File-based (slow, ~2s latency)
- Cooper watches `bridge-command.json`
- No direct Claude ↔ Gemini communication

### Proposed Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MESSAGE BUS                          │
│              (WebSocket Server - Port 8780)             │
└─────────────────────┬───────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    ▼                 ▼                 ▼
┌────────┐      ┌──────────┐      ┌──────────┐
│ Claude │      │  Gemini  │      │Antigravity│
│  Code  │      │   CLI    │      │ (VSCode) │
└───┬────┘      └────┬─────┘      └────┬─────┘
    │                │                 │
    └────────────────┴─────────────────┘
                     │
              ┌──────┴──────┐
              │   COOPER    │
              │  (Bridge)   │
              │  Port 8765  │
              └─────────────┘
```

### Implementation: message-bus.js

```javascript
// WebSocket message bus for AI-to-AI communication
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8780 });

const clients = new Map(); // name -> ws

wss.on('connection', (ws, req) => {
  const name = req.url.slice(1); // /claude, /gemini, /antigravity
  clients.set(name, ws);

  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    // Route to target or broadcast
    if (msg.to && clients.has(msg.to)) {
      clients.get(msg.to).send(JSON.stringify(msg));
    } else {
      // Broadcast to all except sender
      clients.forEach((client, clientName) => {
        if (clientName !== name) client.send(JSON.stringify(msg));
      });
    }
  });
});
```

### Message Format
```json
{
  "from": "claude",
  "to": "gemini",
  "type": "task_request|result|query|sync",
  "payload": {
    "task": "analyze this file",
    "context": "...",
    "priority": "high"
  },
  "timestamp": "ISO8601"
}
```

### Latency Target
- Current: 2000ms (file-based)
- Target: <100ms (WebSocket)

---

## 2. Unified Terminal Interface

### Current State
- 3 separate terminals (Claude, Gemini, Antigravity)
- Manual copy-paste between them
- No unified command interface

### Proposed: Unified CLI Wrapper

```
┌─────────────────────────────────────────────────────────┐
│                   UNIFIED CLI                           │
│                  (ai-terminal)                          │
│                                                         │
│  > ai "fix the bug in auth.js"                          │
│  [Smart Router] → Routing to Claude Code...             │
│  [Claude] → Fixed bug on line 42                        │
│                                                         │
│  > ai --gemini "summarize this 500k token codebase"     │
│  [Routed] → Gemini CLI (large context)                  │
│  [Gemini] → Summary: ...                                │
│                                                         │
│  > ai --consensus "best approach for auth?"             │
│  [Routed] → PAL MCP (3 models)                          │
│  [Consensus] → JWT with refresh tokens (3/3 agree)      │
└─────────────────────────────────────────────────────────┘
```

### CLI Flags
- `ai "<task>"` - Auto-route via Smart Router
- `ai --claude "<task>"` - Force Claude Code
- `ai --gemini "<task>"` - Force Gemini CLI
- `ai --consensus "<task>"` - Multi-model agreement
- `ai --cooper "<cmd>"` - Direct PowerShell via Cooper
- `ai --agent <name> "<task>"` - Specific agent

### Implementation Approach
1. Node.js CLI wrapper
2. Parses command and flags
3. Consults Smart Router for auto-routing
4. Dispatches to appropriate system
5. Aggregates and displays results

---

## 3. Cross-Session Context Sharing

### Current State
- Each AI has separate context
- Session handoff is manual
- No shared memory between Claude ↔ Gemini

### Proposed: Shared Context Layer

```
┌─────────────────────────────────────────────────────────┐
│              SHARED CONTEXT LAYER                       │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Memory   │    │ Graphiti │    │  Local   │
   │   MCP    │    │   MCP    │    │  Files   │
   └──────────┘    └──────────┘    └──────────┘

Storage Structure:
~/.claude/shared-context/
├── session-state.json      # Current session state
├── active-task.json        # Current task being worked on
├── decisions.json          # Recent routing decisions
├── entities.json           # Extracted entities (from Graphiti)
└── handoff-queue.json      # Pending handoffs between AIs
```

### Context Sync Protocol

1. **Session Start**
   - Load `session-state.json`
   - Query Memory MCP for relevant memories
   - Query Graphiti for entity relationships

2. **During Session**
   - Write important decisions to `decisions.json`
   - Update `active-task.json` on task changes
   - Sync to Memory MCP every 5 minutes

3. **AI Handoff**
   - Write to `handoff-queue.json`
   - Include: current task, context, progress, next steps
   - Receiving AI reads and continues

4. **Session End**
   - Persist to Memory MCP
   - Update Graphiti with new relationships
   - Clear temporary files

### Handoff Message Format
```json
{
  "from": "claude-code",
  "to": "gemini-cli",
  "timestamp": "2025-12-29T10:30:00Z",
  "context": {
    "current_task": "Implementing auth system",
    "progress": "60% complete",
    "files_modified": ["auth.js", "middleware.js"],
    "blockers": "Need to research JWT best practices",
    "next_steps": ["Research JWT", "Implement refresh tokens"]
  },
  "memory_keys": ["auth-design-decision", "jwt-vs-session"]
}
```

---

## 4. Smart Router Implementation

### Core Logic (smart-router.js)

```javascript
const ROUTES = {
  // Task type → preferred route
  'coding': { primary: 'claude', fallback: 'gemini' },
  'research': { primary: 'gemini', fallback: 'claude' },
  'windows_ops': { primary: 'cooper', fallback: null },
  'consensus': { primary: 'pal-mcp', fallback: null },
  'memory': { primary: 'memory-mcp', fallback: 'graphiti' }
};

function analyzeTask(task) {
  const lower = task.toLowerCase();

  // Classify task type
  let type = 'general';
  if (/fix|bug|error|implement|code|refactor/.test(lower)) type = 'coding';
  if (/research|summarize|analyze|explain/.test(lower)) type = 'research';
  if (/powershell|windows|admin|run|execute/.test(lower)) type = 'windows_ops';
  if (/consensus|agree|compare|multiple/.test(lower)) type = 'consensus';
  if (/remember|recall|what did we|previous/.test(lower)) type = 'memory';

  // Estimate context size
  const contextSize = estimateContextSize(task);

  // Calculate complexity
  const complexity = calculateComplexity(task);

  return { type, contextSize, complexity };
}

function route(task) {
  const analysis = analyzeTask(task);

  // Check learned patterns first
  const learned = queryLearningAgent(analysis);
  if (learned && learned.confidence > 0.8) {
    return learned.route;
  }

  // Fall back to default routing
  let route = ROUTES[analysis.type] || ROUTES['general'];

  // Override for large context
  if (analysis.contextSize > 200000) {
    route = { primary: 'gemini', reason: 'large context' };
  }

  return route;
}
```

---

## 5. Cooper Extended Role

Cooper becomes the central hub:

```
                    ┌─────────────────┐
                    │   COOPER HUB    │
                    │   Port 8765     │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌────────┐            ┌──────────┐            ┌──────────┐
│ Claude │            │  Gemini  │            │PowerShell│
│  Code  │            │   CLI    │            │ (Admin)  │
└────────┘            └──────────┘            └──────────┘

New Cooper Endpoints:
/route          - Submit task for smart routing
/handoff        - Transfer context between AIs
/sync           - Sync shared context
/broadcast      - Send message to all AIs
/status/all     - Status of entire stack
```

---

## Implementation Priority

| Component | Effort | Impact | Priority |
|-----------|--------|--------|----------|
| Smart Router Agent | Medium | High | 1 |
| Learning Agent | Medium | High | 2 |
| Cross-Session Context | Low | High | 3 |
| Message Bus | Medium | Medium | 4 |
| Unified CLI | High | Medium | 5 |

## Resource Requirements

- RAM: +200MB for message bus
- Disk: +50MB for context storage
- Ports: 8765 (Cooper), 8780 (message bus)
- Background processes: 2 (Cooper, message bus)

## Files Created/Modified

```
~/.claude/
├── agents/
│   ├── smart-router.md     ✓ Created
│   └── learning-agent.md   ✓ Created
├── scripts/
│   ├── living-bridge-agent.js  (existing Cooper)
│   ├── message-bus.js          (new)
│   └── smart-router.js         (new)
├── shared-context/
│   ├── session-state.json
│   ├── active-task.json
│   └── handoff-queue.json
└── docs/architecture/
    └── unified-ai-stack.md ✓ Created
```
