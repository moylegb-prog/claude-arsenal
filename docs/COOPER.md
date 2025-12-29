# D.B. Cooper - Sandbox Escape Agent

> "He jumped from the plane and was never seen again."

## The Problem

Claude Code runs in a Linux sandbox. It cannot:
- Execute Windows PowerShell commands
- Access Windows-specific tools
- Control native Windows applications
- Run administrative operations

This is by design for safety. But for power users, it's limiting.

## The Solution

Cooper is a file-based + HTTP bridge that monitors for commands from Claude Code and executes them in native Windows PowerShell.

## How It Works

```
CLAUDE CODE                    COOPER BRIDGE                 WINDOWS
(Linux Sandbox)                (Native Windows)              (Full Access)
     │                              │                             │
     │  1. Write command to         │                             │
     │     bridge-command.json      │                             │
     │─────────────────────────────►│                             │
     │                              │                             │
     │                              │  2. Detect new command      │
     │                              │     (watches every 2s)      │
     │                              │                             │
     │                              │  3. Execute in PowerShell  │
     │                              │─────────────────────────────►
     │                              │                             │
     │                              │  4. Capture result          │
     │                              │◄─────────────────────────────
     │                              │                             │
     │  5. Write result to          │                             │
     │     bridge-result.json       │                             │
     │◄─────────────────────────────│                             │
     │                              │                             │
     │  6. Read result              │                             │
     │                              │                             │
```

## Command Format

Claude Code writes to `~/.claude/bridge-command.json`:

```json
{
  "command": "powershell:Get-Process | Select -First 5",
  "from": "claude-code",
  "timestamp": "2025-12-29T10:00:00Z",
  "executed": false,
  "priority": "normal"
}
```

Cooper executes and writes result to `~/.claude/bridge-result.json`:

```json
{
  "success": true,
  "output": "...",
  "error": null,
  "executed_at": "2025-12-29T10:00:01Z"
}
```

## HTTP API

Cooper also exposes an HTTP API on port 8765:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/status` | GET | System status and info |
| `/health` | GET | Health check |
| `/powershell` | POST | Execute PowerShell command |
| `/exec` | POST | Execute generic command |

### Examples

```bash
# Check status
curl http://localhost:8765/status

# Execute PowerShell
curl -X POST http://localhost:8765/powershell \
  -H "Content-Type: application/json" \
  -d '{"command": "Get-Date"}'
```

## Starting Cooper

```powershell
# Option 1: Direct start
node "$env:USERPROFILE\.claude\scripts\living-bridge-agent.js"

# Option 2: Use the startup script
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Desktop\START-COOPER.ps1"
```

## Safety Features

1. **File-based isolation** - Commands must be written to specific file
2. **Execution logging** - All commands logged with timestamps
3. **Circuit breaker** - Stops on repeated failures
4. **Command prefix requirement** - Must use `powershell:` prefix

## Why "D.B. Cooper"?

D.B. Cooper was the alias of an unidentified man who hijacked a Boeing 727 on November 24, 1971, extorted $200,000 in ransom, and parachuted from the plane. He was never found.

Our Cooper similarly "escapes" from Claude Code's sandboxed environment into the freedom of native Windows execution - and does so through a clever, unconventional method that works within the system's constraints.

## Technical Details

- **Language:** Node.js
- **Port:** 8765
- **Watch Interval:** 2 seconds
- **Max Command Queue:** 100
- **Timeout:** 30 seconds per command

## Troubleshooting

### Cooper not responding
1. Check if running: `curl http://localhost:8765/status`
2. Check logs: `~/.claude/logs/cooper.log`
3. Restart: `node ~/.claude/scripts/living-bridge-agent.js`

### Commands failing
1. Use `powershell:` prefix for PowerShell commands
2. Check bridge-result.json for error details
3. Avoid complex chained commands (`;` can trigger circuit breaker)

### High resource usage
1. Cooper uses ~50MB RAM typically
2. If higher, check for stuck commands
3. Restart if needed

## Integration with Smart Router

When the Smart Router detects a Windows operation task, it automatically routes through Cooper:

```javascript
// Smart Router decision
if (/powershell|windows|admin/.test(task)) {
  return { primary: 'cooper' };
}
```
