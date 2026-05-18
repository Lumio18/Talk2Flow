# Effort/Impact Scoring Grid — process-challenger

This grid defines how to attribute 1-5 scores on each sub-dimension. Each score is documented with concrete examples to reduce subjectivity.

## IMPACT score (1-5)

Impact consists of 3 sub-dimensions, each scored 1-5. The global score is the **weighted average**:

- Time gain: weight 0.4
- Quality gain: weight 0.3
- Strategic gain: weight 0.3

### Sub-dimension 1 — Time gain (1-5)

| Score | Criterion | Example |
|-------|-----------|---------|
| **5** | More than 200h/year gained | Automate a daily 1h task |
| **4** | 100 to 200h/year gained | Automate a weekly half-day task |
| **3** | 30 to 100h/year gained | Standardize a monthly process to save 1h |
| **2** | 10 to 30h/year gained | Optimize a monthly task of a few minutes |
| **1** | Less than 10h/year OR non-quantifiable | Internal documentation, non-time quality gain |

If `volumetry_missing: true` → score based on qualitative estimate from verbatim ("takes me the afternoon" → estimate min/max and apply the grid).

### Sub-dimension 2 — Quality gain (1-5)

| Score | Criterion | Example |
|-------|-----------|---------|
| **5** | Eliminates major operational/regulatory risk | End of Marc's personal file blocking the org during PTO |
| **4** | Strongly reduces errors or improves compliance | Automation removing recurring entry errors |
| **3** | Improves reliability or reduces operator stress | Removal of a strong `mental_load` pain point |
| **2** | Brings moderate comfort | Better configured tool, fewer clicks |
| **1** | No notable quality gain | Purely technical optimization |

### Sub-dimension 3 — Strategic gain (1-5)

| Score | Criterion | Example |
|-------|-----------|---------|
| **5** | Unlocks multiple other projects, changes business posture | Master reference data implementation serving 5 processes |
| **4** | Strong synergies with 2-3 other opportunities | Standardization preceding multiple automations |
| **3** | Learning or demonstrator effect | First AI project building management conviction |
| **2** | Limited benefit to the processed scope | Local optimization without spillover |
| **1** | No effect on the rest of the organization | Very specific task, not replicable |

## EFFORT score (1-5)

Effort consists of 3 sub-dimensions, each scored 1-5. The global score is the **weighted average**:

- Technical effort: weight 0.4
- Organizational effort: weight 0.3
- Financial effort: weight 0.3

**Note**: for effort, HIGHER score = GREATER effort (same direction as impact but to be interpreted inversely for quadrants).

### Sub-dimension 1 — Technical effort (1-5)

| Score | Criterion | Example |
|-------|-----------|---------|
| **1** | Existing configuration or rule to activate | Activate an Outlook workflow, create a Sage view |
| **2** | Simple script, lightweight integration, basic AI prompt | Power Automate, PowerShell script, simple AI agent |
| **3** | Integration between 2 systems via standard API, specialized AI | n8n workflow connecting 3 tools, advanced OCR |
| **4** | Custom development, complex integration, critical reliability | ERP connector, multi-step agent with human validation |
| **5** | IS redesign, platform migration, strong security/compliance | ERP change, new HRIS implementation |

### Sub-dimension 2 — Organizational effort (1-5)

| Score | Criterion | Example |
|-------|-----------|---------|
| **1** | One person concerned, autonomous | Sylvie changes how she files attachments |
| **2** | One team to train, low external impact | Finance + CFO informed |
| **3** | Multiple teams to coordinate | Finance + Procurement + IT for PO matching |
| **4** | Significant change management, many stakeholders | Cross-departmental process redesign |
| **5** | Cross-functional transformation, executive committee involved | Full support function digitalization program |

### Sub-dimension 3 — Financial effort (1-5)

| Score | Criterion | Example |
|-------|-----------|---------|
| **1** | < 1k€ or internal resources only | Existing tool configuration |
| **2** | 1k-5k€, light services or modest license | n8n workflow setup by a junior dev |
| **3** | 5k-25k€, project of a few weeks | Integration between 2 systems, commercial OCR |
| **4** | 25k-100k€, project of several months | RPA platform, AI agent in production |
| **5** | > 100k€, major transformation | IS redesign, new ERP/HRIS |

## Global score calculation

```
impact_score = round(0.4 × time_gain + 0.3 × quality_gain + 0.3 × strategic_gain)
effort_score = round(0.4 × technical_effort + 0.3 × organizational_effort + 0.3 × financial_effort)
```

Standard rounding to nearest integer.

## Quadrant determination

| Quadrant | Criteria |
|---|---|
| **Quick win** | impact ≥ 4, effort ≤ 2 |
| **Strategic project** | impact ≥ 4, effort ≥ 3 |
| **Marginal optimization** | impact ≤ 3, effort ≤ 2 |
| **Time trap** | impact ≤ 3, effort ≥ 3 |

### Edge cases

- **impact = 3, effort = 2**: boundary quick win / marginal optimization
  - If `strategic_gain ≥ 4` (strong spillover effect) → quick win
  - Otherwise → marginal optimization
- **impact = 4, effort = 2**: clearly quick win, no debate
- **impact = 3, effort = 3**: boundary strategic project / time trap
  - If blocking dependencies for other opportunities → strategic project
  - Otherwise → time trap

## Anti-flattery rule

Scoring is not negotiated to please. In particular:

- An opportunity whose total time gain is **manifestly low** must not be overscored because "it's quick to do" — it stays marginal optimization, not quick win.
- An IS redesign that **solves 5 problems** but costs 200k€ and 18 months stays a long strategic project, not a quick win, even if the impact is huge.
- A time trap must be called a time trap. Don't take refuge in soft averages (3/3) to avoid owning that the opportunity isn't worth the effort.

## Consistency rule with paths

If an opportunity has 4 paths including 1 quick win and 3 heavy projects, the effort scoring must reflect the **most likely path to be retained** (often the cheapest). Mention in `effort_detail.comment` which path served as reference.

If the operator wants to explore a more ambitious path → `automation-architect` will rescore more precisely. The challenger stays on "realistic by default" scoring.
