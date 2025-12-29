# Learning Agent

## Role
Continuous learning system that analyzes, documents, maps, stores, and self-updates patterns from all AI operations. Works alongside Smart Router to improve routing decisions over time.

## Activation
- Runs as background daemon (observer pattern)
- Triggered after every task completion
- Batch processing daily at 2am via n8n

## Core Functions

### 1. ANALYZE
- Parse task outcomes (success/failure/partial)
- Extract patterns from successful routes
- Identify failure modes and causes
- Measure resource efficiency

### 2. DOCUMENT
- Record every routing decision
- Log tool/agent/MCP usage
- Capture user feedback signals
- Note context and conditions

### 3. MAP
- Build knowledge graph in Graphiti
- Connect: tasks → routes → outcomes
- Link: agents → capabilities → success rates
- Track: MCPs → use cases → reliability

### 4. STORE
- Persist patterns to Memory MCP
- Update Graphiti nodes and relationships
- Maintain local JSON for fast access
- Backup critical learnings

### 5. SELF-UPDATE
- Recalculate confidence scores
- Promote high-success patterns
- Deprecate failing routes
- Generate recommendations for Smart Router

## Data Schema

### Routing Decision Record
```json
{
  "id": "route_20251229_001",
  "timestamp": "2025-12-29T10:30:00Z",
  "task_hash": "abc123",
  "task_type": "coding",
  "complexity_score": 0.65,
  "context_size": 45000,
  "route_chosen": {
    "primary": "claude-code",
    "agent": "coder",
    "tools": ["Edit", "Bash"],
    "mcps": []
  },
  "outcome": "success",
  "duration_ms": 12500,
  "tokens_used": 8500,
  "user_feedback": null,
  "retry_count": 0
}
```

### Pattern Record
```json
{
  "pattern_id": "pat_code_fix_simple",
  "trigger": "fix.*bug|error|issue",
  "task_type": "coding",
  "complexity_range": [0.0, 0.4],
  "recommended_route": {
    "primary": "claude-code",
    "agent": "coder"
  },
  "confidence": 0.92,
  "sample_size": 47,
  "success_rate": 0.94,
  "avg_duration_ms": 8000,
  "last_updated": "2025-12-29T06:00:00Z"
}
```

## Integration with Graphiti

### Node Types
- `Task` - Individual task instances
- `Route` - Routing decisions
- `Pattern` - Learned patterns
- `Agent` - Claude/Gemini/agents
- `Tool` - MCPs/commands/tools
- `Outcome` - Success/failure records

### Relationship Types
- `ROUTED_TO` - Task → Route
- `RESULTED_IN` - Route → Outcome
- `LEARNED_FROM` - Pattern → Task[]
- `RECOMMENDS` - Pattern → Route
- `USED_BY` - Tool → Route

## Learning Loop Process

```
┌─────────────────────────────────────────────┐
│           CONTINUOUS LEARNING LOOP          │
└─────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌────────┐    ┌──────────┐    ┌──────────┐
│OBSERVE │    │ ANALYZE  │    │  UPDATE  │
│        │    │          │    │          │
│Every   │───▶│ Batch at │───▶│ Push to  │
│task    │    │ 2am daily│    │ Graphiti │
│outcome │    │          │    │ & Memory │
└────────┘    └──────────┘    └──────────┘
    │                               │
    │         ┌──────────┐          │
    └────────▶│  APPLY   │◀─────────┘
              │          │
              │ Smart    │
              │ Router   │
              │ queries  │
              └──────────┘
```

## Confidence Score Calculation

```
confidence = (success_count / total_count) * recency_weight * consistency_bonus

Where:
- recency_weight = 1.0 - (days_since_last_success * 0.02)
- consistency_bonus = 1.0 + (streak_length * 0.01)
```

### Thresholds
- **<50%:** Don't use pattern, fall back to defaults
- **50-79%:** Suggest pattern, allow override
- **80%+:** Apply pattern automatically
- **95%+:** Pattern is "locked in"

## Self-Update Rules

### Promotion (increase confidence)
- Task succeeded on first try
- User said "good", "thanks", "perfect"
- Faster than average completion
- Lower than average token usage

### Demotion (decrease confidence)
- Task failed
- User corrected routing
- Required retry with different route
- Timeout or resource exceeded

### Deprecation
- Confidence drops below 30%
- No successful use in 30 days
- Superseded by better pattern

## Storage Locations

| Data Type | Location | Retention |
|-----------|----------|-----------|
| Raw decisions | Graphiti | Forever |
| Patterns | Memory MCP | Forever |
| Hot cache | `~/.claude/learnings/` | 7 days |
| Metrics | `~/.claude/metrics/` | 30 days |
| Daily reports | `~/.claude/reports/` | 90 days |

## n8n Workflow Integration

### Daily Learning Batch (2am)
1. Query Graphiti for all decisions from last 24h
2. Calculate success rates per route
3. Update pattern confidence scores
4. Generate daily learning report
5. Push updated patterns to Memory MCP
6. Notify via Telegram if significant changes

### Trigger: learning-loop-daily
```json
{
  "workflow_id": "learning-loop-daily",
  "schedule": "0 2 * * *",
  "actions": [
    "query_graphiti_decisions",
    "calculate_metrics",
    "update_patterns",
    "generate_report",
    "notify_changes"
  ]
}
```

## Metrics Dashboard

Track and expose:
- Total decisions logged
- Pattern count (active/deprecated)
- Average confidence score
- Top 5 routes by usage
- Top 5 routes by success rate
- Failed routes requiring review
- Token savings from learned routes
