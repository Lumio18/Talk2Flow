# Demo: HR Administration — Sophie Marchand

> **Status: reference quality.** Full pipeline run completed. All stages executed on a real interview transcript.

## The scenario

Sophie Marchand is the sole HR administrator for a French SME (~80 employees, no HRBP). Her day spans:
- Leave request management (manual entries in Lucca + Excel tracking sheet)
- Sick leave handling (Lucca declarations + AG2R mutual re-entries + Malakoff mutual cancellations)
- Employment contract management (amendments, trial period tracking, medical visits)
- Payroll variable preparation (monthly collection for the external payroll provider Silae)
- HR reporting (quarterly headcount + absenteeism, Excel-based)
- Recurring administrative tasks (social documents, employer certificates, onboarding/offboarding)

Sophie handles 8–15 employee requests per day, most by email or word-of-mouth. No ticketing system. All HR data is spread across Lucca (HRIS), Silae (payroll), Excel sheets, Outlook, and shared SharePoint folders.

## Why this demo

- **Realistic**: a single-actor HR admin is one of the most common automation targets in French SMEs
- **Frustration-rich**: multiple sighs and resignation signals in the transcript drive the gap detection
- **Representative**: 11 processes, multiple tool handoffs, compliance sensitivity (GDPR, social law)
- **Complete**: all six pipeline stages executed, with two automation approaches compared
- **Bilingual content**: interview and process names in French, framework output in English (JSON), narrative summaries in French

## Roles in this demo

- **End user**: Sophie Marchand, HR administrator
- **Operator**: consultant running the interview on Sophie's behalf (Mode 2 — transcript provided)
- **Deployer**: internal IT (Fabrice, DSI) + potential external freelancer for the n8n/Power Automate setup

## Pipeline execution

| Stage | Status | Output |
|---|---|---|
| `interview-guide` (Mode 2) | ✅ Run | Gap detection on original transcript — 8 complementary questions asked |
| `process-extractor` | ✅ Run | 11 processes extracted, pivot JSON produced |
| `process-modeler` | ✅ Run | Mermaid diagrams, SIPOC, RACI, 5 pipeline breaks detected |
| `process-challenger` | ✅ Run | 6 opportunities identified (4 quick wins, 1 strategic project, 1 marginal) |
| `stack-profiler` | ✅ Run | Hypothetical profile (M365, Lucca, Silae, Excel) |
| `automation-architect` | ✅ Run | Spec for OPP08 (self-service Lucca) — two approaches compared |
| `n8n-builder` | 🔲 Pending | Implementation in progress |

## Key findings

### Processes (P01–P11)

| ID | Name | Category | Volume |
|---|---|---|---|
| P01 | Leave request management | main | 5-10/week, 15 min each |
| P02 | Sick leave management | main | 2-3/week, 45 min each |
| P03 | AG2R mutual re-entry | support | 2-3/week, 20 min each |
| P04 | Malakoff mutual cancellation | support | 1-2/week, 15 min each |
| P05 | Contract amendments | main | 2-3/month, 30 min each |
| P06 | Trial period management | support | 3-4 active, 30 min/week total |
| P07 | Medical visit scheduling | support | 2-3/month, 20 min each |
| P08 | Payroll variable preparation | main | Monthly, 3 hours |
| P09 | HR reporting | support | Quarterly, 4 hours |
| P10 | Onboarding | main | 1-2/month, 2 hours each |
| P11 | Offboarding | support | 1-2/quarter, 1.5 hours each |

### Top opportunities

| ID | Name | Quadrant | Impact | Effort | Annual time saved |
|---|---|---|---|---|---|
| OPP08 | Self-service Lucca (employee portal) | quick_win | 4 | 1 | 147–275 h/year |
| OPP11 | HR digitalization project (Lucca expansion) | strategic_project | 5 | 4 | 200–400 h combined |
| OPP02 | Replace Excel absence tracker (SPOF) | quick_win | 4 | 1 | 55–73 h/year |
| OPP06 | Automated HR reporting | quick_win | 3 | 1 | 64 h/year |
| OPP03 | Congés hors-circuit (out-of-band requests) | quick_win | 3 | 2 | 57–115 h/year |
| OPP10 | Payroll variable collection delays | quick_win | 3 | 2 | 25–50 h/year |

### Pipeline breaks detected

| ID | Type | Description |
|---|---|---|
| B01 | no_accountable | All 11 processes — Sophie is sole actor, no designated backup or escalation path |
| B02 | output_without_customer | Sick leave continuity check has no traceability in Silae |
| B03 | undocumented_loop | Malakoff mutual cancellation — no confirmation tracking |
| B04 | orphan_actor | Fabrice (DSI) mentioned but no formalized SLA or integration role |
| B05 | input_without_supplier | Payroll variables depend on Lucca validation with no defined SLA |

### Automation spec (OPP08)

**Trigger**: employee sends email to Sophie asking about leave balance, attestation, or HR information.

**Approach A** (recommended first): activate Lucca self-service employee portal — 0€, 1 day effort, reduces 30–40% of interruptions immediately without automation.

**Approach B**: Power Automate flow (M365, no additional license cost) — classifies incoming Outlook emails, queries Lucca API for leave balance, triggers Silae attestation generation, sends auto-reply to employee, routes exceptions to Sophie.

Two integration blockers flagged: Lucca API access (requires IT activation) and Silae attestation endpoint (requires vendor verification with Silae support).

## Artifacts

```
demos/hr-admin-rh/
├── README.md                          this file
├── transcript.md                      → to add: Sophie's interview transcript
├── gap-questions.md                   → to add: 8 complementary questions + answers
├── process-inventory.json             → to add: pivot JSON (11 processes)
├── process-modeler-output.json        → to add: enriched JSON with modeling section
├── opportunities.json                 → to add: challenger output (6 opportunities)
├── stack-profile.json                 → to add: Sophie's stack profile
├── automation-spec-opp08.json         → to add: automation-architect output
├── bpmn/
│   └── process-P0X-viewer.html        → to add: one interactive viewer per process
├── end-user-doc.md                    → to add: what Sophie receives
└── deployer-doc.md                    → to add: what Fabrice / freelancer receives
```

## Notes for contributors

This is the reference demo for Talk2Flow's French SME persona. When adding artifacts:
- The transcript should be in French (it is the source language for this scenario)
- All JSON keys and enum values remain in English per Talk2Flow conventions
- Free-text fields (`name`, `description`, `notes`) remain in French
- The deployer doc must include the two integration blockers (Lucca API, Silae endpoint) as explicit action items
