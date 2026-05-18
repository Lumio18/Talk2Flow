# PROJECT.md — Talk2Flow
> Internal working document. Tracks decisions, roadmap, and session journal.
> Last update: Session 8 — full pipeline end-to-end, GitHub publication, Claude plugin entry point

---

## Identity

- **Name:** `Talk2Flow` ✅ locked
- **Tagline:** *"Turn talk into deployable workflows."*
- **License:** MIT ✅ locked
- **Framework language:** English (README, skill metadata, docs)
- **User content language:** detected per skill, preserved in output

## Usage model: hybrid (Model C) — locked

Three roles, distinct concerns:

| Role | Definition |
|---|---|
| **End user** | Person whose work is being automated |
| **Operator** | Person using Talk2Flow (self / consultant / internal_it) |
| **Deployer** | Person who ships the spec to production |

Each downstream skill produces dual-audience deliverables: end-user doc + deployer doc.

## UX convention: dual visualization

Every visual deliverable comes in two forms:
- **Inline simple** (Mermaid, markdown tables) — in-conversation overview
- **Rich artifact** (HTML interactive widget) — for download, deep exploration, sharing

Validated technically Session 4 with bpmn-js in a Claude artifact via unpkg CDN.

---

## Locked decisions

| Decision | Choice | Rejected alternatives |
|---|---|---|
| Early adopter persona | Consultant / freelancer in automation | Ops manager, developer |
| Visibility model | Stars / community (viral traction) | Enterprise, ecosystem play |
| Technical format | Claude.ai skills (system prompts) — CLI later | Web app, prompt library only |
| LLM positioning | Claude-native for V1 | LLM-agnostic (deferred V2+) |
| Framework language | English | French |
| Multilingual content | Skills adapt output to operator's language | English-only output |
| V1 builder stack | n8n-builder for V1 — plugin architecture, other builders V2+ | Multiple fixed builders at V1 (scope too large) |
| Flagship demo | PME order management | RH onboarding, freelance client tracking |
| V1 scope | 5 active skills + 1 stack | Full pipeline at once |
| Launch | Credible V1 with 2 complete end-to-end demos | Progressive soft launch |
| Timeline estimate | 10-12 weeks of serious construction | — |
| Name | `Talk2Flow` | Flowra (saturated), Spoken (weak SEO), Distill (saturated), Workkit (taken) |
| Usage model | Model C — hybrid with human last mile | A (full autonomy, unrealistic), B (consultant-only, less viral) |
| Tagline | "Turn talk into deployable workflows." | "You talk. It runs." (oversells) |
| UX visualization | Inline (Mermaid/markdown) + rich artifact (bpmn-js HTML) | Mermaid only, BPMN-only, copy-paste to draw.io |
| **Builder architecture** | **Plugin model — universal agnostic spec + interchangeable builders** | Fixed multi-builder V1 (quality dilution), single adaptive builder (too shallow) |
| License | MIT | Apache 2.0 (over-corporate), AGPL (kills adoption) |

---

## Pipeline state

### ✅ Implemented and pipeline-tested
| Skill | Status | Notes |
|---|---|---|
| `interview-guide` | ✅ Delivered EN (Session 8) | Mode 1 (fresh interview) + Mode 2 (transcript review with gap detection) |
| `process-extractor` | ✅ Ported to EN (Session 7) | Tested on Sophie Marchand HR scenario (Session 8) |
| `process-modeler` | ✅ Ported to EN + dual viz (Session 7) | Tested on Sophie Marchand HR scenario (Session 8) |
| `process-challenger` | ✅ Ported to EN (Session 7) | Tested on Sophie Marchand HR scenario (Session 8) — 11 processes, 6 opportunities |
| `stack-profiler` | ✅ Delivered EN (Session 3) | Tested with hypothetical Sophie profile (Session 8) |
| `automation-architect` | ✅ Delivered EN (Session 8) | Tested on OPP08 (self-service Lucca) — two approaches, full spec |

### 🔄 Implemented — end-to-end test pending
| Skill | Status | Notes |
|---|---|---|
| `n8n-builder` | ✅ Implemented (Session 9) | Trigger mapping, node catalog, workflow JSON schema, dual-audience docs. Not yet tested on a live scenario. |

### 🔧 Shared templates
| Template | Status |
|---|---|
| `templates/bpmn-viewer.html` | Prototype validated Session 4, to finalize |

### 🔜 Deferred to V2
- `deployment-coach` — real value but not blocking flagship demo
- `make-builder` — second stack, after n8n validation
- `script-builder` — dev target, not V1 persona
- `solution-matcher` — absorbed by stack-profiler + automation-architect

---

## Admin checklist

| # | Action | Status |
|---|---|---|
| 1 | Reserve `github.com/talk2flow` org | 🔲 This week |
| 2 | Reserve `talk2flow.dev` or `.io` domain | 🔲 This week |
| 3 | Reserve `talk2flow` on PyPI (placeholder) | 🔲 Before V1 |
| 4 | Reserve `@talk2flow` handles on X / LinkedIn | 🔲 Before launch |
| 5 | Translate process-extractor to EN | ✅ Done Session 7 |
| 6 | Translate process-modeler to EN | ✅ Done Session 7 |
| 7 | Translate process-challenger to EN | ✅ Done Session 7 |
| 8 | Build `automation-architect` | ✅ Done Session 8 |
| 9 | Build `interview-guide` (Mode 1 + Mode 2 with gap detection) | ✅ Done Session 8 |
| 10 | Write root `SKILL.md` as Claude plugin entry point | ✅ Done Session 8 |
| 11 | Create Sophie Marchand HR demo (hr-admin-rh) | ✅ Done Session 8 |
| 12 | Finalize `templates/bpmn-viewer.html` | 🔲 Before launch |
| 13 | Refactor process-modeler to produce HTML artifact | 🔲 Before launch |
| 14 | Verify current process-modeler outputs OMG-compliant BPMN | 🔲 Blocking refactor |
| 15 | Reserve `github.com/talk2flow` org | 🔲 This week |
| 16 | Reserve `talk2flow.dev` or `.io` domain | 🔲 This week |

---

## Open questions

| # | Question | Priority |
|---|---|---|
| 1 | Current BPMN format from process-modeler (OMG standard or custom) | 🟠 Blocks bpmn-viewer finalization |
| 2 | PME order management demo: transcript still to write | 🟠 Blocks flagship demo |
| 3 | Target V1 launch date | 🟡 Frames scope |
| 4 | n8n-builder: scope for V1 (simple linear workflows only, or full branching?) | 🟡 Before implementation |

---

## Recommended next step

The pipeline is end-to-end functional (interview-guide → automation-architect). Three natural next steps:

**Path A — Complete the PME flagship demo**: write the founder transcript, run the full pipeline, add all artifacts to `demos/pme-order-management/`. This is the social-shareable demo that makes the repo credible.

**Path B — Implement n8n-builder**: the last V1 missing piece. Takes an automation-architect spec and produces an importable n8n workflow JSON.

**Path C — GitHub publication**: create the org, push the repo, set up the README for discoverability (badges, GIF, one-click Claude install).

My recommendation: **Path A**, then **Path C**. The PME demo is the argument; the GitHub repo is the vehicle. n8n-builder (Path B) can follow post-launch.

---

## Session journal

| Session | Decisions made |
|---|---|
| 1 | Phase 0: persona, visibility model, technical format, flagship demo, V1 scope, build order |
| 2 | English framework locked + name `Talk2Flow` locked |
| 3 | Model C (hybrid) locked + 3-role vocabulary + tagline revised + `stack-profiler` v1 delivered |
| 4 | UX visualization convention (inline + rich artifact) + bpmn-js prototype validated in Claude artifact |
| 5 | License MIT locked + full repository scaffold created (skills, templates, demos, docs, .github) |
| 6 | Builder plugin architecture locked — automation-architect produces universal agnostic spec, builders are interchangeable plugins |
| 7 | Three FR skills ported to EN with Talk2Flow conventions: process-extractor, process-modeler (+ bpmn-js artifact integration), process-challenger. JSON keys in English snake_case, free-text fields adapt to transcript language. |
| 8 | Full end-to-end pipeline run on Sophie Marchand HR scenario (11 processes, 6 quick-win opportunities, automation spec on OPP08). `automation-architect` delivered. `interview-guide` implemented (Mode 1 + Mode 2 with 6-type gap detection). Root `SKILL.md` rewritten as Claude plugin orchestrator with transcript intake + complementary questions feature. `hr-admin-rh` demo created. Workspace cleaned for GitHub publication. |
