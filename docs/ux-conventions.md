# UX conventions

These conventions apply to every skill in Talk2Flow.

## Language handling

- Detect the operator's language from their first substantive message
- Conduct the entire conversation in that language
- All free-text fields in JSON outputs are in the operator's (or end user's) language
- Structural fields — JSON keys, enum values, flag identifiers, schema names — remain in English
- Markdown summaries are in the operator's language

If the operator writes in French, output is in French. If in Spanish, in Spanish. The framework itself stays English internally.

## Dual visualization

Every visual deliverable comes in two complementary forms.

### Inline form

Quick overview, displayed directly in the conversation.

- **Mermaid blocks** for process flows
- **Markdown tables** for matrices (RACI, SIPOC, opportunities)
- Renders natively in Claude.ai, GitHub, Notion

### Rich artifact form

Interactive, downloadable, shareable.

- **HTML widget** embedding a JS library (bpmn-js for BPMN, etc.)
- Loaded from approved CDNs (unpkg, jsdelivr, cdnjs, esm.sh)
- Includes download buttons (SVG, source format)
- See `templates/bpmn-viewer.html` for the canonical BPMN viewer

A skill produces **both**, not one or the other. Operators see the inline version first; deployers and stakeholders get the rich artifact.

## Dual-audience deliverables

Every skill that produces a technical artifact provides documentation for both the **operator** (who validates) and the **deployer** (who ships).

Structure for any final deliverable:

```
1. Brief framing (what was produced, confidence level)
2. End-user summary (plain language, what it does, why it matters)
3. Technical spec / artifact (JSON, XML, code)
4. Notes for the deployer (assumptions, gotchas, things to verify, deployment steps)
5. Confidence flags (what's uncertain and what it means downstream)
6. Closing line (what to do next, which skill to invoke)
```

## Tone

- **Direct, not chatty.** Operators want to make progress, not befriend Claude.
- **No emojis** in any output (skills or summaries).
- **No corporate jargon.** "Workflow synergy" gets cut. "Email arrives, we read it, we copy it" stays.
- **No tool pushing.** Skills map and recommend within the operator's stack — they don't sell new tools.

## Naming

- Skill names: kebab-case, English, descriptive (`stack-profiler`, not `stackprof` or `profiler`)
- JSON keys: snake_case, English (`current_monthly_spend`, not `currentMonthlySpend`)
- File names: kebab-case for docs, UPPERCASE for conventions (`README.md`, `LICENSE`, `CHANGELOG.md`)

## File outputs

Skills producing files use these conventions:

- Stack profile: `stack-profile-<client-slug>-<YYYY-MM-DD>.json`
- BPMN: `<process-slug>.bpmn`
- HTML artifact: `<process-slug>-viewer.html`
- n8n workflow: `<workflow-slug>.json`
- Demo runs: `demos/<demo-name>/run-<YYYY-MM-DD>/`

## Anti-patterns

❌ Mixing languages in structural fields (e.g., French JSON keys)
❌ Producing only an inline diagram or only a rich artifact (always both, when applicable)
❌ Using emojis or "fun" language in deliverables
❌ Asking the user to copy-paste output into another tool (use artifacts instead)
❌ Producing technical output without a parallel end-user summary
