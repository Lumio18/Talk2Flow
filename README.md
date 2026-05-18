<div align="center">

# Talk2Flow

**Turn talk into deployable workflows.**

From a meeting transcript to an automation spec your developer can deploy — without consultants, without code.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: V1 beta](https://img.shields.io/badge/status-v1--beta-green)](#pipeline-status)
[![Built for Claude](https://img.shields.io/badge/built%20for-Claude-purple)](https://claude.ai)

</div>

---

## The problem

Most automation projects fail before they start. A business owner knows their work is repetitive. A consultant interviews them. Notes get lost. The eventual solution doesn't fit the client's actual tools, budget, or skills. Nobody deploys it.

**Talk2Flow fixes the front half of that loop.**

You — or your client — describe a daily routine out loud. Talk2Flow reads the transcript, asks targeted follow-up questions to fill gaps, extracts the underlying processes, maps the existing stack, identifies optimization opportunities, and produces an automation spec adapted to what the business actually has and can run. A developer (or capable freelancer) takes that spec to production.

The last technical mile still needs a human. Talk2Flow makes that mile short.

---

## How it works

```
[End user describes their day — transcript or live interview]
      │
      ▼
┌─────────────────────────────────────────────────────┐
│ interview-guide     gap detection + follow-up Q&A   │
│ process-extractor   process inventory (JSON)         │
│ process-modeler     BPMN, Mermaid, SIPOC, RACI       │
│ process-challenger  opportunities matrix + ROI       │
│ stack-profiler      tools, budget, deployment ctx    │
│ automation-architect  technical spec (WHAT)          │
│ n8n-builder         importable workflow (HOW)        │
└─────────────────────────────────────────────────────┘
      │
      ▼
[Deployer ships it. End user uses it.]
```

Every skill is a Claude skill — a structured prompt with a clear contract, runnable in Claude.ai today. The pipeline can be run end-to-end or one stage at a time.

**New in V1**: when you paste a transcript, Talk2Flow automatically scans it for coverage gaps (missing volumes, unnamed tools, vague pain points) and asks targeted complementary questions *before* extracting — making the output dramatically more accurate.

---

## Why it's different

| | Generic automation builders | Workflow templates | Talk2Flow |
|---|---|---|---|
| Starts from your actual words | ❌ | ❌ | ✅ |
| Asks follow-up questions to fill gaps | ❌ | ❌ | ✅ |
| Maps your real existing stack | ❌ | partial | ✅ |
| Adapts to your budget + skills | ❌ | ❌ | ✅ |
| Produces a deployable artifact | ✅ | ✅ | ✅ |
| Explicit handoff doc for your developer | ❌ | ❌ | ✅ |

Talk2Flow doesn't compete with n8n, Make, or Zapier. It produces the spec that **feeds into them**.

---

## Who it's for

Three roles around any Talk2Flow project:

- **End user** — the person whose daily work is being automated
- **Operator** — the person using Talk2Flow (the end user themselves, or a consultant interviewing them)
- **Deployer** — the developer or technical freelancer who ships the final automation to production

The framework adapts based on who is operating it. See [docs/roles-and-vocabulary.md](docs/roles-and-vocabulary.md).

---

## Pipeline status

### ✅ Available now

| Skill | What it does |
|---|---|
| `interview-guide` | Guided interview (Mode 1) or transcript review with gap detection + follow-up Q&A (Mode 2) |
| `process-extractor` | Transcript → structured process inventory (JSON). Multilingual. |
| `process-modeler` | Inventory → BPMN, inline Mermaid, SIPOC, RACI, interactive BPMN viewer |
| `process-challenger` | Inventory → effort/impact opportunity matrix, ROI estimates, dependency map |
| `stack-profiler` | Guided interview → stack profile (tools, budget, compliance, deployment context) |
| `automation-architect` | Opportunity + stack profile → builder-agnostic technical spec |

### 🔨 In progress

| Skill | Status |
|---|---|
| `n8n-builder` | Implemented — full test on a real scenario pending |

### 🔜 Roadmap

```
automation-architect
        │  universal spec
        ▼
n8n-builder (V1) · make-builder · zapier-builder
power-automate-builder · python-builder
[your-platform-builder] ← contribute yours
```

No forced migrations: if the end user already has Zapier, they get Zapier output.

**After V1:**
- `make-builder` — Make.com blueprints
- `zapier-builder` — Zaps export
- `power-automate-builder` — Microsoft Power Automate flows
- `python-builder` — Python/Node scripts with deployment instructions
- `deployment-coach` — checklists, monitoring, rollback plan

---

## Getting started

### Option 1 — Claude.ai Project (recommended)

1. Open [Claude.ai](https://claude.ai) → **Projects** → **New Project**
2. In Project Settings → **Project instructions**, paste the content of `SKILL.md` (root of this repo)
3. Optionally add individual `skills/*/SKILL.md` files as project knowledge files for deeper reference
4. Start a conversation: paste a transcript, or say "guide me through an interview"

### Option 2 — Claude Code (CLI)

```bash
# Clone the repo
git clone https://github.com/[your-org]/talk2flow.git
cd talk2flow

# Add as a Claude Code command
cp SKILL.md .claude/commands/talk2flow.md
```

Then invoke with `/talk2flow` in your Claude Code session.

### Option 3 — Individual skills

Each `skills/<skill-name>/SKILL.md` file is self-contained. Copy any skill's content into a Claude project's instructions to run that stage independently.

---

## Enhance with MCP

Talk2Flow works out of the box without any MCP. Install these to upgrade specific output stages:

| MCP | Install | What it unlocks |
|---|---|---|
| **draw.io** (`@drawio/mcp`) | `npx -y @drawio/mcp` | Process diagrams as editable `.drawio` files instead of static HTML — opens in [diagrams.net](https://app.diagrams.net) |
| **n8n** (`n8n-mcp`) | `npx -y n8n-mcp` | Live knowledge of 1,650+ n8n nodes — more accurate workflow JSON from `n8n-builder` |
| **Notion** (hosted) | `mcp.notion.com/mcp` | Push process inventory, opportunity matrix, and specs directly to Notion databases |
| **GitHub** (`@modelcontextprotocol/server-github`) | npm package | Push deployer handoff artifacts to a GitHub repo branch |

See [docs/mcp-integrations.md](docs/mcp-integrations.md) for setup instructions and per-skill behavior details.

---

## Repository structure

```
talk2flow/
├── skills/              one folder per skill (SKILL.md + references/)
│   ├── interview-guide/
│   ├── process-extractor/
│   ├── process-modeler/
│   ├── process-challenger/
│   ├── stack-profiler/
│   ├── automation-architect/
│   └── n8n-builder/
├── templates/           reusable HTML/Markdown templates (BPMN viewer, etc.)
├── demos/               end-to-end scenarios with all artifacts
│   ├── pme-order-management/    (scaffold — in progress)
│   └── hr-admin-rh/             (Sophie scenario — reference quality)
├── docs/                architecture, conventions, vocabulary
├── SKILL.md             root skill — Talk2Flow entry point for Claude projects
├── README.md            this file
├── PROJECT.md           internal working document (decisions, session journal)
├── CONTRIBUTING.md      how to help
└── LICENSE              MIT
```

---

## Demo scenarios

### HR Administration (Sophie scenario)
Located in `demos/hr-admin-rh/`. A complete run of the full pipeline on an HR administrator's day-in-the-life interview, including gap detection, opportunity matrix, and automation spec. Reference quality — all artifacts present.

### PME Order Management (in progress)
Located in `demos/pme-order-management/`. A small e-commerce business automating email order processing. Exercises all six pipeline phases.

---

## Contributing

Talk2Flow is open source from day one. Issues, PRs, and skill contributions welcome.

See [CONTRIBUTING.md](CONTRIBUTING.md) for ground rules and conventions.

Want to add a builder for a new platform? See [docs/architecture.md](docs/architecture.md) for the builder plugin contract.

---

## License

MIT — see [LICENSE](LICENSE).

You can use Talk2Flow commercially, fork it, embed it, modify it. Attribution required.
