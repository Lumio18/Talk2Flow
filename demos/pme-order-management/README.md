# Demo: PME Order Management

> **La Boîte Artisanale** — Email order processing automation
> Status: **reference** — all artifacts are present and finalised.

---

## The scenario

Marc Dupont is the founder of an online artisanal goods shop (jams, honeys, soaps). His 5-person team processes 8 to 12 email orders per day entirely by hand.

**Before automation**: every morning Marc spends 1 hour sorting emails, copying information into a Google Sheet, and sending confirmation emails — sometimes discovering too late that a product is out of stock.

**After**: the workflow processes standard orders automatically. Marc only receives an alert for cases that require his judgement (out of stock, missing address, ambiguous email).

---

## Why this scenario

- **Universal**: anyone who has ever handled orders by email immediately understands the pain
- **Visual**: the final n8n workflow is shareable on LinkedIn and social media — 12 nodes, clear logic
- **Complete**: exercises all 6 pipeline phases without forcing it
- **Realistic**: constrained budget (max €50/month), non-technical founder, freelance deployer

---

## Artifacts

| File | Talk2Flow Step | Description |
|---|---|---|
| `transcript.md` | Input | Interview with Marc (38 min, ~3,300 words, English) |
| `gap-questions.md` | Phase 1 | 8 targeted questions + Marc's answers |
| `process-inventory.json` | process-extractor | 5 processes, 5 pain points, 2 pipeline breaks |
| `opportunities.json` | process-challenger | 4 opportunities, effort/impact matrix, detailed ROI |
| `stack-profile.json` | stack-profiler | Gmail, Google Sheets, PrestaShop, budget €50/month |
| `automation-spec.json` | automation-architect | Spec OPP01+OPP02+OPP04, 7 steps, 3 email templates |
| `n8n-workflow.json` | n8n-builder | Importable workflow, 12 nodes, ready to configure |
| `end-user-doc.md` | n8n-builder | Marc's guide: what is automated, when to intervene |
| `deployer-doc.md` | n8n-builder | Romain's guide: full setup, testing, maintenance |

---

## Pipeline results

### Identified processes (5)

| ID | Process | Frequency | Duration | Actor |
|---|---|---|---|---|
| P01 | Email triage and qualification | Daily | 15 min | Marc |
| P02 | Order entry | 10×/day | 3 min | Marc |
| P03 | Confirmation email | 10×/day | 2 min | Marc |
| P04 | Out-of-stock management | 2–3×/month | 45 min | Marc + Julien |
| P05 | Weekly invoicing | 1×/week | 120 min | Marc |

### Automation opportunities (4)

| ID | Opportunity | Quadrant | Net annual ROI | Confidence |
|---|---|---|---|---|
| **OPP01** | Automatic order processing | Quick win | €5,800 | Medium |
| **OPP02** | Pre-confirmation stock alert | Quick win | €1,350 | High |
| **OPP03** | Automated weekly invoicing | Major project | €3,760 | Medium |
| **OPP04** | Missing address follow-up | Fill-in | €1,250 | Medium |

**Phase 1 (OPP01+02+04): €7,900 net in year one. Return on investment in 3 weeks.**

### Pipeline breaks detected

| ID | Issue | Severity | Recommendation |
|---|---|---|---|
| BREAK01 | Stock updated end-of-day by Delphine → confirmations sent against stale data | High | Mark orders "Pending stock check" until Delphine updates |
| BREAK02 | Order numbers incremented manually | Medium | Use prefix ML-YYYY-NNN to distinguish from PrestaShop orders |

---

## Roles in this scenario

| Role | Person | Note |
|---|---|---|
| **End user** | Marc Dupont (founder) | Self-interviews — Operator = self |
| **Operator** | Marc (for the demo) | The operator is Marc himself |
| **Deployer** | Romain (freelance) | Configures n8n, 4–6h of work, ~€300 |

---

## Deployment

**Recommended builder**: n8n (no enterprise context, no regulated sensitive data, budget-compatible, Romain knows how to install it)

**No `enterprise_deployment_required` flag** — the gate was checked and all 5 signals are absent.

**Deployment instructions**: see `deployer-doc.md`

---

## How to reproduce this scenario with Talk2Flow

1. Open a Claude conversation with the Talk2Flow skill loaded
2. Paste the content of `transcript.md`
3. Talk2Flow detects gaps and asks you the questions from `gap-questions.md`
4. Answer with Marc's responses
5. The pipeline generates the same artifacts (with minor variations depending on the model)
