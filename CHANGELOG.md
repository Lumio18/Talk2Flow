# Changelog

All notable changes to Talk2Flow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Claude Code plugin distribution** — `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` so the framework installs in one line via `/plugin marketplace add lumio18/talk2flow` + `/plugin install talk2flow@talk2flow`
- README install section restructured with four options: Claude.ai Project (consultants), Claude Code plugin (developers), manual clone, individual skills

### Changed
- Translated the `pme-order-management` demo to English (transcript, gap questions, all JSON artifacts, n8n workflow, end-user and deployer docs)
- Harmonised README pipeline and roadmap diagrams using Mermaid for clearer rendering on GitHub
- Synced repository structure documentation across README, PROJECT.md, and demos/README.md

### Removed
- `demos/hr-admin-rh/` — scenario superseded by the fully-translated `pme-order-management` reference demo

## [1.0.0-beta] — 2026-05-18

Initial public beta of Talk2Flow on GitHub.

### Added
- **Seven Claude skills** covering the full pipeline:
  - `interview-guide` — guided interview (Mode 1) + transcript review with gap detection (Mode 2)
  - `process-extractor` — transcript → structured process inventory (JSON)
  - `process-modeler` — inventory → BPMN, Mermaid, SIPOC, RACI, interactive BPMN viewer
  - `process-challenger` — inventory → effort/impact opportunity matrix, ROI estimates, dependency map
  - `stack-profiler` — guided interview → stack profile (tools, budget, compliance, deployment context)
  - `automation-architect` — opportunity + stack profile → builder-agnostic universal spec with enterprise deployment gate
  - `n8n-builder` — universal spec → importable n8n workflow JSON + dual-audience documentation
- **Root `SKILL.md`** as Claude plugin entry point with transcript intake, gap detection, and pipeline orchestration
- **`pme-order-management` flagship demo** — full pipeline run with every artifact (transcript, gap-questions, process-inventory, opportunities, stack-profile, automation-spec, n8n-workflow, end-user doc, deployer doc)
- **Documentation set** — architecture, roles & vocabulary, UX conventions, MCP integrations
- **`templates/bpmn-viewer.html`** — self-contained interactive BPMN viewer using bpmn-js (CDN)
- **GitHub project scaffolding** — issue templates (bug, feature, skill proposal), PR template, CONTRIBUTING, CODE_OF_CONDUCT, MIT licence
- **Optional MCP integrations** documented: draw.io, n8n, Notion, GitHub
