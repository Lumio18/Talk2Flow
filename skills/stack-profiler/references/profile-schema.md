# Stack Profile — JSON Schema Reference

This is the canonical schema for the `stack-profiler` output. Downstream skills (`automation-architect`, `n8n-builder`) rely on this structure. Do not add fields silently — if a field is missing, set it to `null` (scalars) or `[]` (arrays).

## Top-level structure

```json
{
  "schema_version": "1.1",
  "profile_id": "string — slug, e.g. 'acme-bakery-2026-05-15'",
  "language": "string — ISO 639-1 code of the conversation language, e.g. 'fr', 'en'",
  "captured_at": "string — ISO 8601 datetime",
  "interviewer_context": { ... },
  "end_user": { ... },
  "tools": [ ... ],
  "data_locations": [ ... ],
  "tech_comfort": { ... },
  "budget": { ... },
  "compliance": { ... },
  "change_management": { ... },
  "hosting_preferences": { ... },
  "deployment_handoff": { ... },
  "preferences": { ... },
  "confidence_flags": [ ... ]
}
```

## `interviewer_context` object

```json
{
  "operator_role": "string — enum: self | consultant | internal_it",
  "operator_notes": "string | null — any context the operator gave about themselves"
}
```

## `end_user` object

```json
{
  "role": "string",
  "team_size": "integer | null",
  "company_type": "string | null",
  "industry": "string | null",
  "geography": "string | null",
  "weekly_hours_on_repetitive_tasks": "number | null — rough estimate of hours/week spent on tasks to automate. Null if genuinely unknown; never omit the field."
}
```

**Rule:** `weekly_hours_on_repetitive_tasks` is the sole ROI input available to `automation-architect`. A rough estimate is far better than null. Acceptable inputs: `0.5` (30 min/day), `5` (1h/day × 5 days), `20` (half a day every day). If the operator says "no idea", capture `null` and add a `roi_estimate_unavailable` flag.

## `tools` array

```json
{
  "id": "string — tool-001, tool-002, ...",
  "name": "string",
  "category": "string — enum: crm | spreadsheet | communication | project_management | billing_accounting | document_storage | automation_platform | database | ai_llm | dev_environment | physical_support | other",
  "usage": "string",
  "criticality": "string — enum: core | secondary | incidental",
  "version_or_plan": "string | null",
  "source_attribution": "string | null — only if operator_role = consultant. observed | reported_by_end_user | assumed",
  "notes": "string | null"
}
```

## `data_locations` array

```json
{
  "data_type": "string",
  "stored_in": "string",
  "format": "string | null",
  "is_master": "boolean"
}
```

Rule: trigger `single_source_of_truth_missing` if no entry has `is_master: true`.

## `tech_comfort` object (concerns the END USER)

```json
{
  "self_assessment": "string — enum: beginner | intermediate | advanced | developer | unknown",
  "signals": ["string"],
  "consultant_observation": "string | null",
  "final_assessment": "string — enum: beginner | intermediate | advanced | developer",
  "assessment_diverges_from_signals": "boolean"
}
```

## `budget` object

```json
{
  "current_monthly_spend": "number | null",
  "currency": "string — ISO 4217, default 'EUR'",
  "appetite_for_new_costs": "string — enum: none | low | moderate | flexible | unknown",
  "decision_threshold": "number | null",
  "constraints": "string | null"
}
```

## `compliance` object

```json
{
  "personal_data_handled": "string — enum: yes | no | unsure",
  "regulated_industry": "string | null",
  "data_residency_constraints": "string | null",
  "existing_compliance_processes": "string | null"
}
```

## `change_management` object

```json
{
  "decision_maker": "string | null",
  "end_users_of_automation": "string | null",
  "expected_resistance": {
    "level": "string — enum: low | medium | high | unknown",
    "notes": "string | null"
  },
  "previous_automation_attempts": [
    {
      "tool": "string",
      "outcome": "string — enum: successful | abandoned | failed | partial",
      "reason": "string | null"
    }
  ]
}
```

## `hosting_preferences` object

```json
{
  "cloud_acceptable": "boolean | null",
  "self_hosted_required": "boolean | null",
  "specific_constraints": "string | null"
}
```

## `deployment_handoff` object

```json
{
  "deployer_identified": "boolean",
  "deployer_role": "string — enum: self | internal_it | external_freelancer | agency | unknown",
  "deployer_skills_estimated": "string — enum: none | beginner | intermediate | advanced | developer | unknown",
  "deployment_budget_separate_from_tooling": "boolean | null",
  "deployment_budget_amount": "number | null",
  "notes": "string | null"
}
```

**Rule — `deployment_budget_separate_from_tooling` and `deployment_budget_amount`:** always ask, even roughly. "I'll do it myself for free" is a valid answer (both fields `false` / `null`). "We have a few hundred euros for setup" is actionable. Never leave both null without a note explaining why.

Trigger `deployment_handoff_unclear` when:
- `deployer_identified: false` AND `deployer_role: "self"` AND `tech_comfort.final_assessment ∈ {beginner, intermediate}`, OR
- `deployer_role: "unknown"`, OR
- No internal capability AND no separate budget for external help

Trigger `roi_estimate_unavailable` when `end_user.weekly_hours_on_repetitive_tasks` is `null`.

## `preferences` object

```json
{
  "preferred_vendors": ["string"],
  "disliked_vendors": ["string"],
  "notes": "string | null"
}
```

## `confidence_flags` array

```json
{
  "flag": "string — enum: incomplete_tooling | budget_undefined | tech_comfort_unclear | compliance_not_assessed | decision_maker_unclear | integration_unknowns | single_source_of_truth_missing | deployment_handoff_unclear | roi_estimate_unavailable",
  "explanation": "string",
  "details": "string | null"
}
```

## ID conventions

- `profile_id`: lowercase, dash-separated, includes client identifier and date
- Tool IDs: `tool-001`, `tool-002`, etc., zero-padded to 3 digits

## What downstream skills consume

| Skill | Fields it relies on |
|---|---|
| `automation-architect` | `interviewer_context`, all of `tools`, `data_locations`, `tech_comfort.final_assessment`, `budget`, `compliance`, `hosting_preferences`, `deployment_handoff`, all `confidence_flags` |
| `n8n-builder` | `tools` (esp. `automation_platform` entries), `data_locations`, `compliance.data_residency_constraints`, `hosting_preferences`, `deployment_handoff.deployer_skills_estimated` |
