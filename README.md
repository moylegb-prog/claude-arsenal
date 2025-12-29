# Claude Arsenal

> **85+ Specialized AI Agents** | **Unique Sandbox Escape** | **Multi-AI Orchestration**

A production-grade collection of Claude Code agents, tools, and innovations developed for real-world manufacturing and software development.

## What Makes This Different

### D.B. Cooper - The Sandbox Escape Agent

Claude Code runs in a Linux sandbox that can't execute Windows commands. **Cooper changes that.**

Cooper is a file-based + HTTP bridge that watches for commands from Claude Code and executes them in native Windows PowerShell. This is the first publicly documented sandbox escape mechanism for Claude Code.

```
┌──────────────────────────────────────────────────────────┐
│  CLAUDE CODE (Linux Sandbox)                             │
│                                                          │
│  "I need to run a PowerShell command..."                 │
│       │                                                  │
│       ▼                                                  │
│  Writes to: bridge-command.json                          │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  D.B. COOPER BRIDGE (Windows Native)                     │
│                                                          │
│  Watches file → Executes in PowerShell → Returns result  │
│  HTTP API on port 8765 for direct access                 │
└──────────────────────────────────────────────────────────┘
```

**Why "D.B. Cooper"?** Named after the infamous skyjacker who escaped from a plane and was never found. This agent escapes the sandbox.

### Smart Router - Intelligent Task Routing

A meta-agent that analyzes incoming tasks and routes them to the optimal AI, tool, or agent:

- **Claude Code** → Complex coding, file operations
- **Gemini CLI** → Large context analysis (2M tokens)
- **Cooper** → Windows operations
- **PAL MCP** → Multi-model consensus
- **Specific Agents** → Specialized tasks

### Message Bus - Real-Time AI-to-AI Communication

WebSocket-based communication layer allowing Claude Code, Gemini CLI, and other AIs to collaborate in real-time.

## Agent Categories

### Development (25 agents)
- `coder` - Implementation specialist
- `reviewer` - Code review and quality
- `tester` - Test creation and coverage
- `debugger` - Bug hunting and fixing
- `refactorer` - Code improvement

### Operations (15 agents)
- `devops` - CI/CD and deployment
- `docker-specialist` - Container management
- `git-workflow` - Version control
- `monitoring` - System health

### Research (12 agents)
- `researcher` - Deep investigation
- `analyst` - Data analysis
- `summarizer` - Content condensation
- `competitor-analyst` - Market research

### Architecture (10 agents)
- `system-architect` - High-level design
- `api-designer` - API contracts
- `database-designer` - Schema design
- `security-architect` - Security planning

### Specialty (23+ agents)
- `gcode-specialist` - CNC programming
- `cad-analyzer` - CAD file analysis
- `engineering-calc` - Technical calculations
- `safety-reviewer` - Manufacturing safety
- And many more...

## Unified AI Stack

```
                    ┌─────────────────┐
                    │  SMART ROUTER   │
                    │  (Port 8775)    │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌────────┐            ┌──────────┐            ┌──────────┐
│ Claude │            │  Gemini  │            │  Cooper  │
│  Code  │◄──────────►│   CLI    │◄──────────►│  Bridge  │
│  200K  │            │   2M     │            │ Windows  │
└────────┘            └──────────┘            └──────────┘
    │                        │                        │
    └────────────────────────┼────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   MESSAGE BUS   │
                    │   (Port 8780)   │
                    └─────────────────┘
```

## Quick Start

1. **Start all services:**
```powershell
powershell -ExecutionPolicy Bypass -File START-ALL-SERVICES.ps1
```

2. **Route a task:**
```bash
curl -X POST http://localhost:8775/route -d '{"task":"fix bug in auth.js"}'
```

3. **Check status:**
```bash
curl http://localhost:8765/status  # Cooper
curl http://localhost:8775/status  # Smart Router
curl http://localhost:8780/status  # Message Bus
```

## File Structure

```
~/.claude/
├── agents/           # 85+ agent definitions
├── scripts/
│   ├── living-bridge-agent.js   # Cooper Bridge
│   ├── smart-router.js          # Task routing
│   └── message-bus.js           # AI-to-AI communication
├── shared-context/   # Cross-session state
├── learnings/        # Pattern storage
└── docs/
    └── architecture/
        └── unified-ai-stack.md
```

## Ports

| Service | Port | Purpose |
|---------|------|---------|
| Cooper Bridge | 8765 | Sandbox escape, Windows execution |
| Smart Router | 8775 | Task routing and analysis |
| Message Bus | 8780 | Real-time AI communication |

## Background

Developed at **Pinpoint Engineering** (Sydney, Australia) for real-world manufacturing and software development:

- **25 years manufacturing experience** - CNC machining, welding, electrical
- **Active CNC integration** - BIESSE Rover router control
- **Production tested** - Used daily in sign manufacturing

## What's Next

- [ ] Unified CLI wrapper (`ai "task"`)
- [ ] Learning loop with Graphiti integration
- [ ] Automatic pattern optimization
- [ ] Cross-session context persistence

## Contributing

Issues and PRs welcome. Particularly interested in:
- Additional agent specializations
- Alternative sandbox escape methods
- Multi-AI orchestration patterns

## License

MIT

---

Built with Claude Code, Gemini CLI, and too much coffee.
