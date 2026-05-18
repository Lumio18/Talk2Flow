# Opportunity Format — process-challenger

This document defines the exact JSON structure of an opportunity, filling rules, and authorized values. **It's the interface contract** with the `automation-architect` skill that follows.

## Complete structure

```json
{
  "id": "OPP01",
  "title": "string short — action verb + subject (e.g., 'Eliminate manual renaming of invoice attachments')",

  "primary_angle": "string — enum: rework | external_wait | mental_load | pipeline_break | bottleneck | governance_risk | inadequate_tool",
  "secondary_angles": ["..."],

  "concerned_processes": ["P01", "P02"],
  "concerned_steps": ["P01-T4", "P01-T5"],

  "linked_verbatim": "string — exact citation of end user that motivates the opportunity",
  "linked_pain_points": ["P01-pain_point-1", "P01-pain_point-2"],
  "linked_breaks": ["..."],
  "linked_unclear_areas": ["..."],

  "diagnosis": "string 3-5 lines — readable without having the JSON at hand. Includes observed volumetry, consequences, dependencies. NO solution in the diagnosis.",

  "volumetry": {
    "frequency": "string — enum: daily | weekly | monthly | yearly | irregular | unknown",
    "unit_duration_min": "number | null",
    "volume_per_period": "number | null OR { min, max }",
    "total_duration_min_per_day": "number | null",
    "total_duration_h_per_year": "number | null",
    "volumetry_missing": "boolean — true if insufficient data to compute"
  },

  "solution_paths": [
    {
      "type": "string — enum: removal | standardization | existing_tool | classic_automation | ai | redesign",
      "description": "string — 1-3 concrete sentences",
      "potential_gain_pct": "number 0-100 — percentage of time gained if applied alone",
      "relative_effort": "number — 1-5",
      "risks": ["..."]
    }
  ],

  "impact_score": "number — 1-5 — weighted average of sub-dimensions",
  "impact_detail": {
    "time_gain": "number — 1-5",
    "quality_gain": "number — 1-5",
    "strategic_gain": "number — 1-5",
    "comment": "string short"
  },

  "effort_score": "number — 1-5 — weighted average of sub-dimensions",
  "effort_detail": {
    "technical_effort": "number — 1-5",
    "organizational_effort": "number — 1-5",
    "financial_effort": "number — 1-5",
    "comment": "string short"
  },

  "quadrant": "string — enum: quick_win | strategic_project | marginal_optimization | time_trap",

  "time_gain_h_year": "number | null",
  "roi_year_currency": {
    "calculable": "boolean",
    "currency": "string — ISO 4217 (EUR, USD, etc.)",
    "min": "number | null",
    "max": "number | null",
    "assumptions": ["..."]
  },

  "depends_on": ["OPP03"],
  "synergies_with": ["OPP07"],
  "blocks": [],

  "questions_to_clarify_before_decision": ["Q06", "Q08"],

  "recommended_horizon": "string — enum: short_term_1_3_months | medium_term_3_12_months | long_term_12_plus"
}
```

## Filling rules

### `id`
Format `OPP` + 2 digits: `OPP01`, `OPP02`... Numbering in creation order.

### `title`
- Starts with an action verb (Eliminate, Reduce, Automate, Standardize, Centralize, Document, Replace)
- Includes precise subject (not "improve finance" but "automate supplier invoice entry")
- 5-12 words maximum

### `primary_angle` vs `secondary_angles`
- `primary_angle`: one only, the one that most directly motivates the opportunity
- `secondary_angles`: 0 to N, angles that reinforce the opportunity without defining it
- Rule: if an opportunity has 4+ secondary angles, it's probably too broad — split it

### `linked_verbatim`
- **Mandatory**. It's the anchor in end user's speech, credibility guarantee.
- Exact citation (with quotes in the string, properly escaped)
- If multiple relevant verbatims: pick the most telling, put others in `comment`
- If truly no direct verbatim but opportunity inferred: `linked_verbatim: null` + flag in diagnosis

### `diagnosis`
- 3-5 lines maximum
- Must be **self-contained**: a reader without the JSON must understand
- Includes: who, what, frequency/volume, consequence
- **No solution** in the diagnosis. Solutions are in `solution_paths`.
- No moral judgment ("it's unacceptable") — stay factual

### `volumetry`

Strict rule: **no invention**.

- If `unit_duration_min` not available in source JSON → `null`
- If `volume_per_period` is a range in the source ("5 to 8/month") → `{ min: 5, max: 8 }`
- `total_duration_min_per_day` and `total_duration_h_per_year` are **computed** only if `unit_duration_min` AND `volume_per_period` are available
- If either is missing → `null` downstream, and `volumetry_missing: true`

Standard calculation for `total_duration_h_per_year`:
- Daily: `unit_duration_min × volume_per_period × 220 / 60` (220 working days)
- Weekly: `× volume × 46 / 60` (46 working weeks)
- Monthly: `× volume × 12 / 60`
- If range: compute on min AND max → range as output

### `solution_paths`

**Strict rule**: minimum 3 paths, **of different natures**. If you can't reach 3 different natures, the opportunity is mis-framed.

Authorized types (and preference hierarchy when multiple apply):

1. **`removal`**: the best path if applicable. Question to ask: is this task really necessary?
2. **`standardization`**: clearer rules or process. Often prerequisite to any automation.
3. **`existing_tool`**: leverage an existing feature not used. Often undervalued.
4. **`classic_automation`**: RPA, scripts, API integrations. For deterministic rules.
5. **`ai`**: document extraction, classification, NLP, agents. For probabilistic rules.
6. **`redesign`**: IS change or organizational redesign. Costly, propose sparingly.

Each path has its own `potential_gain_pct` (if applied alone). Paths are **alternatives**, not additive.

### `impact_score` and `effort_score`

See `references/scoring-grid.md` for detail.

**Anti-flattery rule**: don't smooth scores to make them "reasonable". An obvious quick win (impact 5, effort 1) must be owned. A time trap (impact 2, effort 4) too.

### `quadrant`

Computed from impact/effort per the grid in SKILL.md. The field is filled automatically, not negotiated.

### `time_gain_h_year`

- If `volumetry_missing: true` → `null`
- Otherwise: weighted average of `potential_gain_pct` of the most likely paths (top 1-2)
- Always round to integer (no decimals)

### `roi_year_currency`

- If time gain null OR hourly cost null → `calculable: false`, min/max null
- Otherwise: `min/max` range computed with hourly cost and implementation cost range (see `roi-references.md`)
- `assumptions` lists key choices (hourly cost, % gain retained, assumed implementation cost)

### `depends_on`, `synergies_with`, `blocks`

- `depends_on`: opportunities to handle BEFORE (e.g., "standardize PO numbers" must precede "automate PO-invoice matching")
- `synergies_with`: opportunities that benefit from being addressed at the same time (integration reuse, common project team)
- `blocks`: opportunities prevented until this one is done (inverse of `depends_on`)

**Rule**: these fields must be logically justifiable. No speculative dependency.

### `questions_to_clarify_before_decision`

Reference to `follow_up_questions` from the extractor JSON (Q01, Q02...). A conditional opportunity = an opportunity whose qualification depends on a missing answer. Always flag explicitly.

### `recommended_horizon`
- **Short term (1-3 months)**: quick wins, simple automations, standardizations
- **Medium term (3-12 months)**: strategic projects, complex integrations
- **Long term (12+ months)**: IS redesigns, organizational transformations

## Complete example

```json
{
  "id": "OPP01",
  "title": "Automate renaming and filing of supplier invoices",
  "primary_angle": "rework",
  "secondary_angles": ["bottleneck", "inadequate_tool"],
  "concerned_processes": ["P01"],
  "concerned_steps": ["P01-T4", "P01-T5"],
  "linked_verbatim": "Why do I have to do this by hand when the info is in the invoice?",
  "linked_pain_points": ["P01-pain_point-1", "P01-pain_point-2"],
  "linked_breaks": [],
  "linked_unclear_areas": ["Format of received invoices — PDF / image / EDI?"],
  "diagnosis": "Sylvie spends about 1h/day manually renaming 40 invoice attachments per format YYYY-MM-SUPPLIER-AMOUNT, then dropping them in a server folder. The naming information (date, supplier, amount) is fully present in the invoice but must be extracted manually. Consequence: 220h/year of low-value work, daily friction point (Outlook crashes regularly with too many attachments).",
  "volumetry": {
    "frequency": "daily",
    "unit_duration_min": 1.5,
    "volume_per_period": 40,
    "total_duration_min_per_day": 60,
    "total_duration_h_per_year": 220,
    "volumetry_missing": false
  },
  "solution_paths": [
    {
      "type": "removal",
      "description": "Check if Sage and the shared folder accept files named differently. If yes, purely remove the renaming.",
      "potential_gain_pct": 100,
      "relative_effort": 1,
      "risks": ["Possible downstream need for naming (search, archiving) to confirm"]
    },
    {
      "type": "classic_automation",
      "description": "Script triggered on email arrival (Power Automate, n8n, PowerShell script) that automatically renames and moves the attachment.",
      "potential_gain_pct": 90,
      "relative_effort": 2,
      "risks": ["Depends on regularity of source naming"]
    },
    {
      "type": "ai",
      "description": "OCR + structured extraction of date/supplier/amount via AI agent, applicable even to non-standardized PDFs.",
      "potential_gain_pct": 80,
      "relative_effort": 3,
      "risks": ["Recurring cost per invoice", "Error margin to validate"]
    },
    {
      "type": "redesign",
      "description": "Implement a supplier portal or activate Factur-X / Peppol e-invoicing for native structured reception.",
      "potential_gain_pct": 95,
      "relative_effort": 5,
      "risks": ["Change management on supplier side", "12-24 month timeline"]
    }
  ],
  "impact_score": 4,
  "impact_detail": {
    "time_gain": 5,
    "quality_gain": 3,
    "strategic_gain": 4,
    "comment": "Quick win but also prerequisite to downstream automations (Sage entry)"
  },
  "effort_score": 2,
  "effort_detail": {
    "technical_effort": 2,
    "organizational_effort": 1,
    "financial_effort": 2,
    "comment": "Classic automation is quickly feasible"
  },
  "quadrant": "quick_win",
  "time_gain_h_year": 200,
  "roi_year_currency": {
    "calculable": true,
    "currency": "EUR",
    "min": 8000,
    "max": 13000,
    "assumptions": ["Finance loaded hourly cost: 50€/h", "Realistic gain retained: 90% via classic automation", "Estimated implementation cost: 2k-3k€"]
  },
  "depends_on": [],
  "synergies_with": ["OPP02"],
  "blocks": [],
  "questions_to_clarify_before_decision": ["Q02"],
  "recommended_horizon": "short_term_1_3_months"
}
```

## Anti-patterns

❌ **Diagnosis containing the solution already**: "We need to automate the renaming" → that's a path, not a diagnosis
❌ **Missing verbatim**: except exceptional case (opportunity purely deduced from breaks), verbatim must anchor the opportunity
❌ **All paths of same type**: 3 AI paths = bad opportunity. Diversity of natures is the sign of good framing
❌ **Invented volumetry**: "about 1h/day" deduced from nothing in the JSON = invention. If no source figure → null
❌ **ROI computed with invented costs**: if unknown, `calculable: false`
❌ **Artificial dependency chains**: don't create chains of 5 opportunities all depending on each other to look impressive
❌ **Manually chosen quadrant**: it derives from impact/effort, not the other way
