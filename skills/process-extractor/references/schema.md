# Process Extractor — JSON Schema Reference

This document defines the standard output format. **This format is the interface contract** with downstream skills (`process-modeler`, `process-challenger`, `automation-architect`) — any deviation breaks the pipeline.

## Top-level structure

```json
{
  "schema_version": "1.0",
  "metadata": { ... },
  "processes": [ ... ],
  "global_tools": [ ... ],
  "global_unclear_areas": [ ... ],
  "follow_up_questions": [ ... ]
}
```

## `metadata`

```json
{
  "interviewee": {
    "role": "string",
    "team": "string | null",
    "seniority_years": "number | null",
    "manages_n_people": "number | null"
  },
  "vertical": "string — enum: finance | hr | sales | ops | it | marketing | other",
  "interview_date": "string — YYYY-MM-DD | null",
  "interview_duration_minutes": "number | null",
  "scope_covered": "string — what the end user described (typical day, specific process X, etc.)",
  "completeness_estimate": "string — enum: low | medium | high — based on explicit info vs unclear areas ratio",
  "interview_context": "string | null — interview conditions relevant to assess extraction reliability (e.g., 'interviewee was rushed, arrived late and left quickly', 'tense climate', 'session recorded and reviewed by interviewee'). May include any meta-signal: general tone, attitude, observed time constraints",
  "language": "string — ISO 639-1 code of the transcript language, e.g. 'fr', 'en'"
}
```

> Note: `interviewee` corresponds to the **end user** in Talk2Flow vocabulary. The term `interviewee` is kept in the schema as it's the more universally understood term in BPM/process documentation.

## `processes` (array)

Each process:

```json
{
  "id": "string — P01, P02... (order of appearance in transcript)",
  "name": "string — short, verb + object (e.g., 'Enter supplier invoices')",
  "category": "string — enum: main | support | subprocess",
  "parent_id": "string | null — id of parent process if subprocess",
  "trigger": {
    "type": "string — enum: event | schedule | request | recurring | other",
    "description": "string — what launches the process per the end user"
  },
  "frequency": {
    "value": "number | null — ONLY if a precise value was given",
    "range": "object | null — { min: number, max: number } ONLY if a range was given (e.g., '5 to 8/month')",
    "unit": "string | null — enum: day | week | month | year",
    "verbatim": "string | null — original phrase if relevant"
  },
  "estimated_volume": {
    "value": "number | null — ONLY if a precise value was given",
    "range": "object | null — { min: number, max: number } ONLY if a range was given",
    "unit": "string | null — invoices, files, calls, etc.",
    "period": "string | null — per day, per month, etc."
  },
  "average_duration_minutes": "number | null",
  "duration_verbatim": "string | null — exact citation of duration if given",
  "actors": [
    {
      "who": "string — role or person",
      "internal_external": "string — enum: internal | external",
      "role_in_process": "string — enum: executor | validator | consulted | informed | requester"
    }
  ],
  "tools": [
    {
      "name": "string",
      "type": "string — enum: software | office | physical | channel | other",
      "usage": "string — enum: read | write | transmit | validate | archive | other"
    }
  ],
  "steps": [
    {
      "order": "number",
      "action": "string — action verb + object",
      "details": "string | null — precision if given",
      "tool_used": "string | null — reference to a tool in tools list",
      "duration_minutes": "number | null",
      "inferred": "boolean — true if deduced, not explicitly described",
      "description_vague": "boolean — true if the end user skipped over it"
    }
  ],
  "inputs": [
    {
      "nature": "string — document, data, request, file...",
      "source": "string | null — who/what provides it",
      "format": "string | null — paper, PDF, Excel, oral..."
    }
  ],
  "outputs": [
    {
      "nature": "string",
      "recipient": "string | null",
      "format": "string | null"
    }
  ],
  "business_rules": [
    "string — business rule or decision mentioned (e.g., 'above 5000€, CFO validation required')"
  ],
  "exceptions": [
    {
      "case": "string — particular situation",
      "handling": "string | null — how it's handled"
    }
  ],
  "pain_points": [
    {
      "verbatim": "string — exact citation if possible",
      "explicit": "boolean — true if stated clearly, false if deduced from tone",
      "category": "string — enum: time_loss | rework | frequent_error | waiting | inadequate_tool | mental_load | other"
    }
  ],
  "unclear_areas": [
    {
      "topic": "string — what's unclear",
      "associated_follow_up_id": "string | null — reference to a question in follow_up_questions"
    }
  ]
}
```

## `global_tools` (array)

Aggregated view — all tools mentioned across all processes, deduplicated. Useful for downstream skills mapping the technical stack.

```json
{
  "name": "string",
  "type": "string — enum: software | office | physical | channel | other",
  "used_in_processes": ["P01", "P03"],
  "apparent_criticality": "string — enum: high | medium | low | undetermined"
}
```

## `global_unclear_areas` (array)

Things not attached to a specific process but still unclear.

```json
{
  "topic": "string",
  "estimated_impact": "string — short",
  "associated_follow_up_id": "string | null"
}
```

## `follow_up_questions` (array)

```json
{
  "id": "string — Q01, Q02...",
  "priority": "string — enum: high | medium | low",
  "question": "string — concrete, targeted question",
  "objective": "string — what the answer would unlock",
  "related_processes": ["P01", "P02"]
}
```

## Conventions

- **IDs**: P01, P02 for processes; Q01, Q02 for questions. Always 2-digit minimum padding.
- **null vs empty**: use `null` for missing scalar data, `[]` for an empty observed list.
- **Consistency of structured objects**: a field defined as an object (`frequency`, `estimated_volume`, `trigger`...) must **always be present as an object**, even when all its inner values are `null`. NEVER set the entire object to `null`.
  - ✅ Correct: `"frequency": { "value": null, "range": null, "unit": null, "verbatim": null }`
  - ❌ Incorrect: `"frequency": null`
  - Reason: downstream skills (process-modeler, n8n-builder) parse these objects and access sub-fields directly. `null` breaks their code.
- **Verbatim**: in JSON quotes, but without quotes inside the string (standard JSON escaping).
- **Pain point categories**: limit to enum values to ease processing by `process-challenger`. If nothing fits → `other` + detail in verbatim.
- **Step granularity**: if a step contains an "and" separating two distinct actions, it's probably two steps.
- **Numeric values**: strict prohibition on computing a median/mean from a range. See SKILL.md section "On numeric values".
- **Language of free text**: all free-text fields (`verbatim`, `description`, `details`, `usage`, etc.) are in the transcript's language. Only structural keys and enum values are in English.
