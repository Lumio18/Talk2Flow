# PROJECT.md — Talk2Flow
> Internal working document. Tracks decisions, roadmap, and session journal.
> Last update: Session 10 — V1 beta published on GitHub, pme-order-management translated to English, hr-admin-rh demo retired

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
| `process-extractor` | ✅ Ported to EN (Session 7) | Validated against the pme-order-management transcript |
| `process-modeler` | ✅ Ported to EN + dual viz (Session 7) | Validated against the pme-order-management transcript |
| `process-challenger` | ✅ Ported to EN (Session 7) | Validated on the pme-order-management transcript — 5 processes, 4 opportunities |
| `stack-profiler` | ✅ Delivered EN (Session 3) | Tested on the pme-order-management scenario |
| `automation-architect` | ✅ Delivered EN (Session 8) | Tested on OPP01+OPP02+OPP04 (pme-order-management) — full spec produced |
| `n8n-builder` | ✅ Implemented (Session 9) | 12-node workflow generated for the pme-order-management spec |

### 📦 Flagship demo
| Demo | Status | Notes |
|---|---|---|
| `pme-order-management` | ✅ Reference quality (Session 10) | All artifacts present, translated to English |

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
| 1 | Reserve a GitHub repo for Talk2Flow | ✅ Done — `github.com/lumio18/talk2flow` |
| 2 | Reserve `talk2flow.dev` or `.io` domain | 🔲 Optional, post-launch |
| 3 | Reserve `talk2flow` on PyPI (placeholder) | 🔲 If/when a Python SDK lands |
| 4 | Reserve `@talk2flow` handles on X / LinkedIn | 🔲 Before broader launch |
| 5 | Translate process-extractor to EN | ✅ Done Session 7 |
| 6 | Translate process-modeler to EN | ✅ Done Session 7 |
| 7 | Translate process-challenger to EN | ✅ Done Session 7 |
| 8 | Build `automation-architect` | ✅ Done Session 8 |
| 9 | Build `interview-guide` (Mode 1 + Mode 2 with gap detection) | ✅ Done Session 8 |
| 10 | Write root `SKILL.md` as Claude plugin entry point | ✅ Done Session 8 |
| 11 | Build the V1 flagship demo (pme-order-management) | ✅ Done Session 10 |
| 12 | Finalize `templates/bpmn-viewer.html` | 🔲 Before broader launch |
| 13 | Refactor process-modeler to produce HTML artifact | 🔲 Before broader launch |
| 14 | Verify current process-modeler outputs OMG-compliant BPMN | 🔲 Blocking refactor |
| 15 | Publish v1.0.0-beta release on GitHub | ✅ Done Session 10 |
| 16 | Translate flagship demo to English | ✅ Done Session 10 |

---

## Open questions

| # | Question | Priority |
|---|---|---|
| 1 | Current BPMN format from process-modeler (OMG standard or custom) | 🟠 Blocks bpmn-viewer finalization |
| 2 | Target broader launch date (beyond GitHub beta) | 🟡 Frames scope |
| 3 | Second demo scenario: which industry / which platform builder to showcase? | 🟡 Post-V1 |
| 4 | Set up CI to validate JSON artifacts against the documented schemas | 🟡 Quality safeguard |

---

## Recommended next step

V1 beta is live. Three natural next steps in priority order:

**Path A — Run the flagship pipeline live**: pick one Claude.ai user (the operator), run the full pipeline against the pme-order-management transcript, capture any divergences from the canonical artifacts, fix the skills. This is the dogfooding pass.

**Path B — Second demo on a different builder**: prototype `make-builder` or `python-builder` to validate the plugin architecture from the architect down. A second demo with a different stack would prove portability.

**Path C — Discoverability**: domain reservation, social handles, a short demo video / GIF in the README.

My recommendation: **Path A**. The repo is published — what matters next is that someone outside the build team can run the pipeline end-to-end without hand-holding.

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
| 8 | Full end-to-end pipeline run on a first HR scenario. `automation-architect` delivered. `interview-guide` implemented (Mode 1 + Mode 2 with 6-type gap detection). Root `SKILL.md` rewritten as Claude plugin orchestrator with transcript intake + complementary questions feature. First demo (hr-admin-rh) created. Workspace cleaned for GitHub publication. |
| 9 | `n8n-builder` implemented — trigger mapping, node catalog, workflow JSON schema, dual-audience docs. pme-order-management pipeline run completed end-to-end producing the 12-node n8n workflow. |
| 10 | V1 beta published on GitHub at `lumio18/talk2flow`. Flagship demo retired down to pme-order-management only and translated to English (transcript, gap-questions, all JSON artifacts, n8n workflow, end-user and deployer docs). README pipeline + roadmap diagrams rewritten in Mermaid. Author identity cleaned (single contributor `lumio18`, no Claude co-author). hr-admin-rh demo retired. |
