# Architecture

This document describes how Talk2Flow is structured, why each skill exists, and how data flows between them.

## Design principles

1. **Each skill has one job.** No skill does two things; no two skills do the same thing.
2. **Skills communicate through structured JSON.** Free-text only between humans and the first/last skill.
3. **Every skill produces a human-readable summary alongside its JSON.** Operators need to validate, not parse.
4. **Schemas are versioned.** When a skill output changes shape, the schema bumps and downstream skills handle the change explicitly.
5. **No skill assumes the operator is technical.** Default is plain language; technical mode is opt-in.

## The pipeline

```
[End user describes their day]
       │
       │ (free text or audio)
       ▼
┌──────────────────┐
│ interview-guide  │
└──────────────────┘
       │
       │ structured transcript
       ▼
┌──────────────────────┐
│ process-extractor    │
└──────────────────────┘
       │
       │ process inventory (JSON)
       ▼
┌────────────────────────────────────┐
│ process-modeler   process-challenger│
│ (visualization)   (opportunities)   │
└────────────────────────────────────┘
       │
       │ prioritized opportunities (JSON)
       ▼
┌──────────────────┐
│ stack-profiler   │
└──────────────────┘
       │
       │ stack profile + deployment context (JSON)
       ▼
┌────────────────────────┐
│ automation-architect   │
└────────────────────────┘
       │
       │ technical spec (JSON + markdown)
       ▼
┌──────────────────┐
│ n8n-builder      │
└──────────────────┘
       │
       │ importable workflow + deployer doc
       ▼
[Deployer ships it]
```

## Why this order

| Position | Skill | Why here |
|---|---|---|
| 1 | `interview-guide` | Operator needs structure before being able to describe their work cleanly |
| 2 | `process-extractor` | Without inventory of processes, nothing else has a domain |
| 3 | `process-modeler`, `process-challenger` | Run in parallel after extraction. Modeler is for visualization (consultant deliverable); challenger is for prioritizing what to automate |
| 4 | `stack-profiler` | Only meaningful once we know which processes are candidates — irrelevant otherwise |
| 5 | `automation-architect` | Combines challenger opportunities + stack profile into a concrete spec |
| 6 | `n8n-builder` | Takes the architect's spec and produces a deployable artifact |

## What each skill consumes and produces

### `interview-guide`
- **Consumes:** free-text or audio from the operator
- **Produces:** structured transcript ready for `process-extractor`

### `process-extractor`
- **Consumes:** structured transcript
- **Produces:** JSON inventory of processes (steps, actors, frequencies, pain points)

### `process-modeler`
- **Consumes:** process inventory JSON
- **Produces:** Mermaid diagrams (inline), BPMN XML (artifact), RACI/SIPOC tables

### `process-challenger`
- **Consumes:** process inventory JSON
- **Produces:** prioritized opportunities with effort/impact scoring

### `stack-profiler`
- **Consumes:** operator input (interview) + optionally prioritized opportunities
- **Produces:** stack profile JSON (tools, data locations, budget, compliance, deployment handoff)

### `automation-architect`
- **Consumes:** prioritized opportunities + stack profile
- **Produces:** technical spec (triggers, steps, data flows, error handling, ROI estimate) for each prioritized opportunity

### `n8n-builder`
- **Consumes:** technical spec from `automation-architect`
- **Produces:** importable n8n JSON + dual-audience deployment doc (end-user + deployer)

## Schema versioning

Every JSON schema lives in `skills/<skill-name>/references/`. Schemas carry a `schema_version` field (semver). Breaking changes bump the major version. Downstream skills declare which schema versions they support.

If you change a schema, update the consuming skills in the same PR.

## Adding a new skill

Before proposing a new skill, ask:

1. Does it fill a clear gap in the pipeline?
2. Does it have a single, well-defined responsibility?
3. Does it produce structured output another skill can consume?
4. Does it follow the dual-audience principle (operator + deployer)?

If yes to all four, open a discussion in the repo.
