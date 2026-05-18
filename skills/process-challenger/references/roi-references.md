# ROI References — process-challenger

This file provides default parameters to compute ROI when the operator doesn't provide their own figures. All values are **ranges**, never single points.

The default reference is France 2026 (EUR). For other geographies, the operator should provide their own loaded hourly cost — the implementation costs below are usable as rough orders of magnitude in any developed market.

## Loaded average hourly cost per vertical (€/h, France 2026)

Includes gross salary + employer contributions + overhead. Source: France private sector orders of magnitude.

| Vertical | Typical profile | Range €/h | Default median |
|----------|-----------------|-----------|----------------|
| Finance | Senior accountant, CPA | 40-65 | 50 |
| HR | HR officer, HR business partner | 40-70 | 55 |
| Sales | Sales rep, KAM | 50-90 | 65 |
| Ops/Production | Coordinator, planner | 35-60 | 45 |
| IT | Dev, sysadmin, support | 50-100 | 70 |
| Marketing | Comms officer, digital marketer | 40-70 | 55 |
| Management | Manager, director | 80-150 | 100 |
| Other | Unspecified profile | 35-70 | 50 |

**Rule**: if the operator provides their own hourly cost, use exclusively that one. Otherwise, use the median as central value and the range for min/max ROI calculation.

For non-EUR geographies, the operator should provide their own loaded cost. Implementation cost ranges below remain usable as orders of magnitude.

## Implementation costs per path type

Ranges in EUR for initial setup (CAPEX). Excludes recurring costs.

### Removal
| Effort | Cost |
|--------|------|
| Effort 1-2 | 0 - 1k€ |
| Effort 3 | 1k - 5k€ |
| Effort 4-5 | 5k - 20k€ |

Note: removal may require arbitration, change management, sometimes some redesign — hence non-zero costs in some cases.

### Standardization
| Effort | Cost |
|--------|------|
| Effort 1-2 | 1k - 5k€ (procedure writing, internal training) |
| Effort 3 | 5k - 15k€ (reference data overhaul, coaching) |
| Effort 4-5 | 15k - 50k€ (cross-departmental master data) |

### Existing tool (better leverage of what's in place)
| Effort | Cost |
|--------|------|
| Effort 1-2 | 0 - 3k€ (configuration, training) |
| Effort 3 | 3k - 15k€ (advanced config, vendor services) |
| Effort 4-5 | 15k - 50k€ (version upgrade, redeployment) |

### Classic automation (RPA, scripts, n8n, Power Automate, Make)
| Effort | Setup cost | Recurring costs |
|--------|------------|-----------------|
| Effort 1-2 | 1k - 5k€ | < 100€/month (licenses) |
| Effort 3 | 5k - 25k€ | 100 - 500€/month |
| Effort 4-5 | 25k - 80k€ | 500 - 2000€/month |

### AI (document extraction, classification, agents)
| Effort | Setup cost | Recurring costs |
|--------|------------|-----------------|
| Effort 2 | 2k - 8k€ (prompt, simple config) | 50 - 300€/month (API) |
| Effort 3 | 8k - 30k€ (RAG, integration) | 200 - 1000€/month |
| Effort 4-5 | 30k - 150k€ (multi-step agent, fine-tuning) | 1000 - 5000€/month |

**AI specificity**: always flag recurring costs in `roi_year_currency.assumptions`. Annual ROI must net recurring costs (otherwise it's a lie about year 1 and beyond).

### Redesign (IS change, organizational redesign)
| Effort | Cost |
|--------|------|
| Effort 4 | 50k - 200k€ |
| Effort 5 | 200k - 1M€+ |

For redesigns, set `recommended_horizon: "long_term_12_plus"` and flag in diagnosis that annual ROI on 12 months will be negative (amortization spans multiple years).

## Plausible gain percentages per path type

When computing the `potential_gain_pct` of a path, use these ranges:

| Type | Typical gain | Justification |
|------|--------------|---------------|
| Removal | 100% | If the task disappears, time is fully freed |
| Classic automation | 60-90% | Residual manual portion remains (exception handling, control) |
| AI | 50-80% | Real error margin, human validation often needed |
| Standardization | 20-40% | Gain via reduced back-and-forth and errors, not removal |
| Existing tool better used | 30-60% | Depending on feature activated |
| Redesign | 70-95% | After implementation — not applicable year 1 |

**Caution rule**: pick the lower end of the range by default, unless JSON context indicates a particularly favorable case. Better to underestimate than overpromise.

## Standard ROI calculation

```
roi_year_currency_min = (time_gain_h_year × hourly_cost_min) - implementation_cost_max - 12 × recurring_cost_monthly_max
roi_year_currency_max = (time_gain_h_year × hourly_cost_max) - implementation_cost_min - 12 × recurring_cost_monthly_min
```

Notes:
- Calculation over 12 months by default (audit horizon)
- If implementation cost exceeds annual gain, flag in `assumptions` that ROI is negative year 1 but becomes positive from year N
- Always round to thousands for ranges (readability)

## Flags to activate

In the `roi_year_currency.assumptions` field, flag:
- ✅ Hourly cost used (and whether from operator or default)
- ✅ Gain percentage retained (and reference path)
- ✅ Estimated implementation cost (range)
- ✅ Recurring costs if significant
- ⚠️ Signal "Negative ROI year 1, positive from year N" for heavy projects
- ⚠️ Signal "Indicative calculation, to refine by automation-architect" if multiple strong assumptions

## Cases where ROI = not calculable

- Volumetry missing on the opportunity → `calculable: false`
- Opportunity without direct time gain (e.g., pure governance) → `calculable: false`, but `quality_gain` must be high to justify the opportunity
- All paths in long-term `redesign` → `calculable: false` at 12 months, possible at 36 months (flag it)
