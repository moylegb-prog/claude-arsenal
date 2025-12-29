# Claude Arsenal - Agent Catalog

Complete list of 85+ specialized agents.

## Development Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `coder` | Write clean, efficient code | "implement", "code", "write" |
| `reviewer` | Code review and quality | "review", "check quality" |
| `tester` | Create tests, coverage | "test", "spec", "coverage" |
| `debugger` | Find and fix bugs | "debug", "fix bug" |
| `refactorer` | Improve code structure | "refactor", "clean up" |
| `optimizer` | Performance optimization | "optimize", "speed up" |
| `documenter` | Write documentation | "document", "docstring" |
| `typescript-specialist` | TypeScript expertise | "typescript", "types" |
| `react-specialist` | React development | "react", "component" |
| `python-specialist` | Python development | "python", "django", "flask" |
| `node-specialist` | Node.js development | "node", "express", "npm" |
| `api-builder` | REST/GraphQL APIs | "api", "endpoint" |
| `database-specialist` | SQL, NoSQL, ORMs | "database", "query", "schema" |
| `frontend-specialist` | UI/UX implementation | "frontend", "css", "ui" |
| `backend-specialist` | Server-side logic | "backend", "server" |

## Architecture Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `system-architect` | High-level system design | "architect", "design system" |
| `api-designer` | API contract design | "api design", "endpoints" |
| `database-designer` | Database schema design | "schema", "data model" |
| `security-architect` | Security planning | "security design" |
| `microservices-architect` | Distributed systems | "microservices", "distributed" |
| `cloud-architect` | AWS/GCP/Azure design | "cloud", "aws", "gcp" |

## Operations Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `devops` | CI/CD, deployment | "deploy", "cicd" |
| `docker-specialist` | Container management | "docker", "container" |
| `kubernetes-specialist` | K8s orchestration | "kubernetes", "k8s" |
| `git-workflow` | Version control | "git", "branch", "merge" |
| `monitoring-specialist` | Observability | "monitor", "alert", "logs" |
| `incident-responder` | Production issues | "incident", "outage" |
| `performance-analyst` | System performance | "performance", "bottleneck" |

## Research Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `researcher` | Deep investigation | "research", "investigate" |
| `analyst` | Data analysis | "analyze", "data" |
| `summarizer` | Content condensation | "summarize", "tldr" |
| `competitor-analyst` | Market research | "competitor", "market" |
| `trend-analyst` | Industry trends | "trends", "emerging" |
| `literature-reviewer` | Academic research | "papers", "studies" |

## Security Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `security-reviewer` | Security audit | "security", "vulnerability" |
| `penetration-tester` | Ethical hacking | "pentest", "exploit" |
| `code-scanner` | SAST/DAST | "scan", "vulnerabilities" |
| `compliance-checker` | Regulatory compliance | "compliance", "gdpr", "hipaa" |
| `threat-modeler` | Threat analysis | "threat model" |

## Testing Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `unit-tester` | Unit tests | "unit test" |
| `integration-tester` | Integration tests | "integration test" |
| `e2e-tester` | End-to-end tests | "e2e", "playwright" |
| `load-tester` | Performance tests | "load test", "stress test" |
| `accessibility-tester` | A11y testing | "accessibility", "wcag" |

## Manufacturing Agents (Specialty)

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `gcode-specialist` | CNC programming | "gcode", "toolpath" |
| `cad-analyzer` | CAD file analysis | "cad", "step", "dxf" |
| `engineering-calc` | Technical calculations | "feeds", "speeds", "tolerance" |
| `cnc-safety` | Safety verification | "safety check", "pre-cut" |
| `material-specialist` | Material properties | "material", "aluminum", "steel" |
| `tooling-advisor` | Tool selection | "tool", "endmill", "insert" |
| `fixture-designer` | Workholding design | "fixture", "clamp", "vise" |

## Meta Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `smart-router` | Task routing | Complex/ambiguous tasks |
| `learning-agent` | Pattern recognition | Background (always) |
| `coordinator` | Multi-agent orchestration | Multi-step tasks |
| `planner` | Task decomposition | "plan", "break down" |
| `estimator` | Effort estimation | "estimate", "how long" |

## Swarm Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `hierarchical-coordinator` | Queen-led swarms | Complex workflows |
| `mesh-coordinator` | Peer-to-peer swarms | Parallel tasks |
| `adaptive-coordinator` | Dynamic topology | Variable complexity |
| `collective-intelligence` | Consensus building | Decisions needed |
| `swarm-memory-manager` | Distributed memory | Cross-agent context |

## Communication Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `writer` | Technical writing | "write", "draft" |
| `editor` | Content editing | "edit", "proofread" |
| `translator` | Multi-language | "translate" |
| `formatter` | Document formatting | "format", "markdown" |

## Data Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `data-engineer` | ETL pipelines | "pipeline", "etl" |
| `data-scientist` | ML/AI analysis | "ml", "model", "predict" |
| `visualization` | Charts and graphs | "chart", "graph", "visualize" |
| `scraper` | Web scraping | "scrape", "extract" |

## Utility Agents

| Agent | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `file-organizer` | File management | "organize", "sort files" |
| `cleanup` | Code/file cleanup | "cleanup", "remove unused" |
| `migration` | Code/data migration | "migrate", "upgrade" |
| `converter` | Format conversion | "convert", "transform" |

---

## Using Agents

### Via Claude Code Task Tool
```javascript
Task("researcher", "Investigate authentication best practices", "researcher")
```

### Via Smart Router
```bash
curl -X POST http://localhost:8775/route \
  -d '{"task":"review the security of auth.js"}'
# Smart Router auto-selects: security-reviewer
```

### Direct Invocation
Reference agent in prompt: "Using the coder agent, implement..."

---

## Agent Definition Format

Agents are defined as Markdown files in `~/.claude/agents/`:

```markdown
# Agent Name

## Role
Brief description of the agent's purpose.

## Capabilities
- Capability 1
- Capability 2

## Auto-Trigger
Keywords that activate this agent.

## Integration
How this agent works with others.
```

---

*85+ agents and growing. PRs welcome for new specializations.*
