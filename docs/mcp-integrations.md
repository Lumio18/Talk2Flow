# MCP Integrations — Talk2Flow

Talk2Flow runs without any MCP server — Claude's built-in capabilities are enough for the full pipeline. But four MCP servers, when installed, meaningfully upgrade the output quality of specific skills.

This document covers what each integration does, which skill it affects, and how to set it up.

---

## Overview

| MCP | Package | Affects | Upgrade |
|---|---|---|---|
| **draw.io** | `@drawio/mcp` | `process-modeler`, `automation-architect` | Replaces HTML artifacts with native `.drawio` files — editable in browser |
| **n8n** | `n8n-mcp` | `n8n-builder` | Provides live knowledge of 1,650+ n8n nodes — eliminates guessed parameters |
| **Notion** | `mcp.notion.com` (hosted) | all output skills | Push deliverables directly to Notion databases and pages |
| **GitHub** | `@modelcontextprotocol/server-github` | `n8n-builder`, `automation-architect` | Deployer handoff via GitHub — push artifacts to a repo branch |

---

## 1. draw.io MCP

**What it does for Talk2Flow:**
`process-modeler` currently produces Mermaid diagrams (inline) and a bpmn-js HTML viewer (downloadable). With the draw.io MCP, it produces native `.drawio` XML files instead — files that open directly in [diagrams.net](https://app.diagrams.net) and are fully editable. No custom HTML, no dependency on bpmn-js CDN, no rendering quirks.

**Concrete improvements:**
- Process diagrams as `.drawio` files with proper BPMN swimlane shapes
- Global process chain diagram as an editable `.drawio` canvas
- `automation-architect` flowchart as an editable diagram (not just inline Mermaid)
- The end user or operator can open the file, move shapes, add annotations, export to PDF

**When process-modeler detects the draw.io MCP is active:**
1. Generates the standard Mermaid inline view (for conversation preview)
2. Also generates draw.io XML for each process diagram using the MCP
3. Saves `.drawio` files via the MCP instead of the bpmn-viewer.html template
4. The HTML artifact fallback (`templates/bpmn-viewer.html`) is bypassed

### Setup

```bash
# Claude Code — add to .claude/settings.json under mcpServers
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["-y", "@drawio/mcp"]
    }
  }
}
```

No API key required. Node.js >= 18 required.

Claude.ai Projects: install via Project settings → MCP servers → search for "draw.io".

**Recommended:** yes — the draw.io MCP is the single highest-impact upgrade for Talk2Flow's visual deliverables.

---

## 2. n8n MCP

**What it does for Talk2Flow:**
The `n8n-builder` skill generates n8n workflow JSON using a static node catalog (`references/n8n-node-catalog.md`). That catalog covers the most common nodes but can't know every parameter variation, community node, or minor version change.

The n8n MCP (`czlonkowski/n8n-mcp`) provides live access to documentation for 1,650+ n8n nodes (820 core + 830 community). When active, `n8n-builder` queries the MCP for exact node parameters before generating each node instead of relying on static documentation.

The official n8n built-in MCP (n8n >= v2.13) goes further: it can deploy the generated workflow directly to a running n8n instance.

**Concrete improvements:**
- Accurate `typeVersion` for every node (no version guessing)
- Correct parameter names for community nodes not in the static catalog
- Optional direct deployment to n8n (official MCP only)
- Validation: the MCP can confirm a node type exists before generating it

**When n8n-builder detects the n8n MCP is active:**
1. For each planned node, query the MCP: `get_node_info(type: "n8n-nodes-base.X")`
2. Use the returned parameter schema to fill node parameters precisely
3. If the official n8n MCP is connected, offer to push the workflow directly to the instance
4. Fall back to static catalog only for nodes the MCP doesn't know

### Setup (community MCP — node knowledge only)

```bash
# Claude Code
{
  "mcpServers": {
    "n8n-knowledge": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"]
    }
  }
}
```

No n8n instance required. Provides node documentation only.

### Setup (official n8n MCP — deploy capability)

Requires a running n8n instance (local or cloud). Get your API key from n8n: Settings → API → Create API key.

```bash
# Claude Code
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "@n8n/mcp-server"],
      "env": {
        "N8N_URL": "http://localhost:5678",
        "N8N_API_KEY": "<your-n8n-api-key>"
      }
    }
  }
}
```

**Recommended:** yes if you use n8n regularly. The community MCP (knowledge-only) is zero-config and worth installing unconditionally.

---

## 3. Notion MCP

**What it does for Talk2Flow:**
After each pipeline stage, the operator can say "push this to Notion" and the skill will create or update Notion pages/databases directly. No copy-paste.

**Concrete integration points:**

| Talk2Flow output | Notion destination |
|---|---|
| Process inventory JSON | Notion database: one row per process, columns for category, frequency, pain points |
| Opportunity matrix | Notion database: one row per opportunity, columns for quadrant, impact, effort, ROI |
| RACI matrix | Notion table in a page |
| Automation spec | Notion page with all sections |
| Deployer handoff doc | Notion page shared with the deployer |

**When any output skill detects the Notion MCP is active:**
- After producing its standard output, offer: *"Would you like me to push this to Notion? Say 'push to Notion' and specify a database or page URL."*
- The skill calls the MCP to create/update the Notion content

### Setup

Notion MCP is hosted — no local installation needed. Get an integration token from Notion: Settings → Connections → Develop or manage integrations → New integration. Grant it access to the workspace pages you want to write to.

```bash
# Claude Code — remote MCP (no local process)
{
  "mcpServers": {
    "notion": {
      "url": "https://mcp.notion.com/mcp",
      "headers": {
        "Authorization": "Bearer <your-notion-integration-token>"
      }
    }
  }
}
```

Claude.ai Projects: add `https://mcp.notion.com/mcp` in Project settings → MCP servers. Notion handles OAuth in-browser.

**Recommended:** yes for operators who use Notion as their primary workspace. Optional otherwise.

---

## 4. GitHub MCP

**What it does for Talk2Flow:**
The deployer handoff document today is a markdown file. With the GitHub MCP, `n8n-builder` and `automation-architect` can push the complete artifact set to a GitHub repository — workflow JSON, spec, end-user doc, deployer doc — on a dedicated branch, ready for the deployer to clone.

**Concrete integration points:**

| Talk2Flow output | GitHub action |
|---|---|
| n8n workflow JSON | Push to `handoffs/[slug]/n8n-workflow.json` |
| Automation spec JSON | Push to `handoffs/[slug]/automation-spec.json` |
| Deployer doc | Push to `handoffs/[slug]/DEPLOYER.md` |
| End-user doc | Push to `handoffs/[slug]/END-USER.md` |

**When n8n-builder or automation-architect detects the GitHub MCP is active:**
- After producing outputs, offer: *"Would you like me to push the handoff to GitHub? Say 'push to GitHub' and specify the repo."*
- Creates a branch `handoff/[opportunity-id]-[date]` and pushes all artifacts
- Opens a draft PR so the deployer can review before merging

### Setup

Create a GitHub personal access token (classic) with `repo` scope at github.com/settings/tokens.

```bash
# Claude Code
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-github-token>"
      }
    }
  }
}
```

**Recommended:** yes if the operator hands off to a developer via GitHub. Optional for non-technical deployers.

---

## Installing MCPs in Claude.ai Projects (recommended setup)

When using Talk2Flow as a Claude.ai Project (Option 1 in the README), add MCPs via Project Settings → MCP servers:

| MCP | Type | How to add |
|---|---|---|
| draw.io | npm | `@drawio/mcp` — install via Claude.ai marketplace or "Add by package name" |
| n8n (knowledge) | npm | `n8n-mcp` — install via Claude.ai marketplace |
| Notion | Remote URL | `https://mcp.notion.com/mcp` → Claude.ai handles OAuth |
| GitHub | npm | `@modelcontextprotocol/server-github` + PAT in env |

For Claude Code (Option 2), add all MCPs to `.claude/settings.json` in the `mcpServers` section as shown above.

---

## Skill behavior without MCPs

Every skill falls back gracefully when its MCP is not available:

| Skill | Without MCP | With MCP |
|---|---|---|
| `process-modeler` | Mermaid inline + bpmn-viewer.html | Mermaid inline + `.drawio` file |
| `automation-architect` | Mermaid inline flowchart | Mermaid inline + `.drawio` file |
| `n8n-builder` | Static node catalog (references/n8n-node-catalog.md) | Live node parameter lookup via MCP |
| Any output skill | Markdown output only | Optional push to Notion |
| `n8n-builder` | File download only | Optional GitHub push |

Talk2Flow never requires an MCP. When one is present, the skill uses it. When it's absent, the output is still complete — just not connected to external systems.
