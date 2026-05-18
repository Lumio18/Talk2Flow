# Demo: PME Order Management

> ⚠️ **Status: scaffold only.** This is the flagship demo for V1. Artifacts will be added as the pipeline is built.

## The scenario

A small e-commerce business (5-person team) takes customer orders by email. Currently:
- Orders are read manually by the founder
- Details are copy-pasted into a Google Sheet
- Confirmations are sent by hand
- Out-of-stock cases are handled inconsistently
- Invoices are issued at the end of each week, in batch

The founder loses 1 hour per day on this workflow. They want to automate the boring parts while keeping human review on edge cases.

## Why this demo

- Universal: most viewers immediately understand the pain
- Visual: the final n8n workflow is sharable on social
- Complete: exercises all six pipeline phases without forcing
- Realistic: budget-conscious solo founder, not a tech-savvy enterprise

## Artifacts (to be added)

When complete, this folder will contain:

- `transcript.md` — input transcript (founder describing their day)
- `process-inventory.json` — output of `process-extractor`
- `process-diagram.bpmn` — output of `process-modeler`
- `process-diagram-viewer.html` — interactive BPMN viewer artifact
- `opportunities.json` — output of `process-challenger`
- `stack-profile.json` — output of `stack-profiler`
- `automation-spec.json` — output of `automation-architect`
- `n8n-workflow.json` — output of `n8n-builder`, importable into n8n
- `end-user-doc.md` — what the founder gets
- `deployer-doc.md` — what their freelance dev gets

## Roles in this demo

- **End user**: the founder
- **Operator**: the founder themselves (self mode) for the recorded demo
- **Deployer**: a freelance dev hired for 2 hours to set up n8n and configure credentials

## Notes for contributors

This demo is reference-quality: every artifact will be reviewed for clarity before publication. If you propose an additional demo, follow the same artifact list.
