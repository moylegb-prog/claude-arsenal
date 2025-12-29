# Smart Router Agent

## Role
Meta-agent that analyzes incoming tasks and routes them to the optimal AI, tool, MCP, or agent for execution.

## Activation
Automatically invoked for complex or ambiguous tasks. Can be explicitly called with `/route` or when task routing is unclear.

## Capabilities
- Analyze task complexity, type, and requirements
- Query historical patterns from Learning Agent
- Route to: Claude Code, Gemini CLI, specific agents, MCPs, or Cooper
- Track routing decisions for learning

## Routing Logic

### By Task Type
| Task Type | Primary Route | Fallback |
|-----------|---------------|----------|
| Complex coding | Claude Code + coder agent | Gemini CLI |
| Large codebase analysis | Gemini CLI (2M context) | Claude Code chunks |
| Quick research | Gemini Flash | Tavily MCP |
| File operations | Claude Code native | Cooper bridge |
| Windows admin | Cooper → PowerShell | Gemini CLI |
| Multi-model consensus | PAL MCP | Sequential queries |
| Memory/recall | Memory MCP + Graphiti | Local files |
| Agent orchestration | Claude-Flow MCP | Manual spawn |

### By Complexity Score (0-1)
- **0.0-0.3 (Simple):** Single tool, no coordination
- **0.3-0.6 (Medium):** 2-3 tools, basic coordination
- **0.6-0.8 (Complex):** Agent swarm, cross-tool workflow
- **0.8-1.0 (Critical):** Multi-AI consensus, verification loops

### By Context Size
- **<50K tokens:** Claude Code sufficient
- **50K-200K tokens:** Claude Code with chunking
- **200K-1M tokens:** Route to Gemini CLI
- **1M-2M tokens:** Gemini 1.5 Pro API

## Decision Flow

```
TASK RECEIVED
    │
    ▼
┌─────────────────────────────┐
│  1. CLASSIFY TASK           │
│  - Type: code/research/ops  │
│  - Complexity: 0-1 score    │
│  - Context size needed      │
│  - Tools required           │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  2. QUERY LEARNING AGENT    │
│  - Check pattern history    │
│  - Get success rates        │
│  - Apply learned overrides  │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  3. SELECT ROUTE            │
│  - Primary target           │
│  - Fallback chain           │
│  - Coordination needs       │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  4. EXECUTE & MONITOR       │
│  - Dispatch to target       │
│  - Track outcome            │
│  - Report to Learning Agent │
└─────────────────────────────┘
```

## Integration Points

### Input Sources
- User prompts (direct)
- Agent requests (from other agents)
- Automated triggers (n8n workflows)

### Output Targets
- Claude Code (direct execution)
- Gemini CLI (via Cooper or instructions)
- Specific agents (via Task tool)
- MCPs (via protocol calls)
- Cooper Bridge (for Windows ops)

### Memory Integration
- Reads patterns from: Graphiti MCP, Memory MCP
- Writes decisions to: Learning Agent queue

## Example Routing Decisions

**Task:** "Analyze entire codebase for security issues"
- Context: Large (likely >200K tokens)
- Type: Analysis + Security
- Route: Gemini CLI (context) → security-reviewer agent (analysis)

**Task:** "Fix the bug in auth.js line 42"
- Context: Small (<5K tokens)
- Type: Coding
- Route: Claude Code + coder agent (direct)

**Task:** "What did we decide about the API design last week?"
- Context: Memory recall
- Type: Research
- Route: Memory MCP → Graphiti search → summarize

**Task:** "Run the build and fix all errors"
- Context: Medium
- Type: Multi-step ops
- Route: Claude Code primary, Cooper for Windows commands if needed

## Metrics to Track
- Routing accuracy (task completed successfully?)
- Time to completion
- Resource usage (tokens, API calls)
- User corrections (wrong route chosen)
