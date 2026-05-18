# Universal Automation Spec — Schema v1.0

This document defines the JSON output schema of `automation-architect`. The spec is **builder-agnostic**: any builder (n8n, Make, Zapier, Power Automate, Python, …) must be able to consume it and produce a working artifact for its target platform.

The schema lives at version `1.0`. Breaking changes bump the major version.

---

## Top-level structure

```jsonc
{
  "spec_version": "1.0",
  "opportunity_id": "string",
  "name": "string",
  "description": "string",
  "trigger": { … },
  "steps": [ … ],
  "data_flows": [ … ],
  "error_handling": { … },
  "human_checkpoints": [ … ],
  "recommended_builder": { … },
  "alternative_builders": [ … ],
  "roi_estimate": { … },
  "assumptions": [ "string", … ],
  "confidence_flags": [ … ]
}
```

All fields are **required** unless explicitly marked optional. Missing required fields make the spec invalid — `n8n-builder` and siblings must refuse to consume it.

---

## Top-level fields

### `spec_version` *(string, required)*
Schema version. Currently `"1.0"`. Builders must check this field and refuse versions they don't support.

### `opportunity_id` *(string, required)*
The `id` of the opportunity in the prioritized opportunities JSON the spec materializes. Enables traceability all the way back to the verbatim in the interview.

### `name` *(string, required)*
Short, readable name **in the operator's language**. Aimed at humans reviewing a list of specs.
- ✅ `"Traitement automatique des commandes email"`
- ❌ `"opp-001-email-order-automation-v1"`

### `description` *(string, required)*
One-paragraph plain-language description of what the automation does. **No jargon, no platform mention.** Reads as if explained to the end user.

---

## `trigger` *(object, required)*

What kicks the automation off.

```jsonc
{
  "type": "enum",        // see below
  "description": "string",
  "source_tool": "string", // must match a tools[].name from stack profile
  "details": { … } | null  // type-specific
}
```

### `trigger.type` enum

| Value | Meaning |
|---|---|
| `webhook` | The source tool calls a webhook URL on an event (preferred when available) |
| `cron` | Time-based schedule (e.g., every 15 min, daily 9am) |
| `email_received` | New email matching a filter (high-level, builder picks IMAP/webhook) |
| `file_created` | New file appears in a watched location (folder, S3 bucket, Drive) |
| `form_submitted` | A form submission (Tally, Google Forms, Typeform, custom HTML) |
| `manual` | Operator clicks "Run" — used for utilities or one-off workflows |
| `api_call` | Another system calls a documented endpoint of the automation |
| `event` | Generic event emitted by a third-party platform (Slack message, calendar event, …) |

Pick the **least invasive** trigger that fits. Webhook > cron polling > manual. Polling has latency cost and API-quota cost.

### `trigger.details` examples

```jsonc
// cron
{ "schedule": "*/15 * * * *", "timezone": "Europe/Paris" }

// email_received
{ "filter_from": "*@example-supplier.com", "filter_subject_contains": "Commande" }

// file_created
{ "path": "/shared/univerre-exports/", "pattern": "*.csv" }
```

`details: null` is acceptable for `manual` and well-specified `webhook` triggers.

---

## `steps` *(array, required)*

The ordered list of business actions. Each step is **one verbalizable action**. Keep step count ≤ 12 for a single opportunity.

```jsonc
{
  "id": "step-001",
  "name": "string",
  "description": "string",
  "actor": "system" | "human",
  "input_data": ["string"],
  "output_data": ["string"],
  "source_tool": "string" | null,
  "target_tool": "string" | null,
  "notes": "string" | null
}
```

### `steps[].id`
Sequential `step-001`, `step-002`, … regardless of language. Stable identifier referenced by `data_flows[]`, `error_handling[]`, `human_checkpoints[]`.

### `steps[].name`
3-7 words in operator language. ✅ `"Extraire les champs de commande"`. ❌ `"Set node"`.

### `steps[].description`
1-3 sentences in operator language explaining what the step does **and why**. Aimed at the deployer and the operator validating the spec.

### `steps[].actor`
- `"system"` — the automation executes it autonomously
- `"human"` — a person performs the action (validation, manual fix, …)

If `actor: "human"`, there must be a corresponding entry in `human_checkpoints[]`.

### `steps[].input_data` / `steps[].output_data`
Lists of data field names. Use the same names across steps so flows are traceable.
- ✅ `["customer_name", "prescription_ref", "frame_model_id"]`
- ❌ `["the data from previous step"]`

### `steps[].source_tool` / `steps[].target_tool`
Reference `tools[].name` from the stack profile **exactly**. `null` if the step is purely internal (transformation, decision).

### `steps[].notes` *(optional)*
Anything the deployer must know but isn't part of the action itself. ✅ `"Univerre import via watched folder — confirm Marc's CSV column order"`.

---

## `data_flows` *(array, required)*

Documents data transfers between steps. The deployer must be able to draw the data path from this section alone.

```jsonc
{
  "from_step": "step-001" | "trigger",
  "to_step": "step-002" | "end",
  "data_fields": ["string"],
  "format": "string" | null
}
```

### `data_flows[].from_step` / `to_step`
A `step-NNN` id, or the literal `"trigger"` / `"end"` for boundary flows.

### `data_flows[].data_fields`
Same field names as `steps[].input_data` / `output_data`. Stable across the spec.

### `data_flows[].format`
`JSON`, `CSV`, `XML`, `plain text`, `multipart/form-data`, `SMTP message`, etc. `null` if undetermined — but then add an entry to `assumptions[]`.

---

## `error_handling` *(object, required)*

```jsonc
{
  "failure_modes": [ … ],
  "notification_channel": "string" | null,
  "retry_policy": "string" | null
}
```

### `error_handling.failure_modes[]`

```jsonc
{
  "step_id": "step-002",
  "failure_type": "API timeout" | "missing field" | "auth failure" | "validation error" | "rate limit" | "unknown error" | "string",
  "response": "retry" | "notify" | "fallback" | "skip" | "human_review"
}
```

At least one entry per **critical** step (any step where failure breaks the business outcome).

### `error_handling.notification_channel`
A tool from the stack profile used to notify on failure (typically Gmail, Slack, SMS service). **Never invent a channel.** `null` if the chosen response is purely silent (e.g., retry-only with no human notification).

### `error_handling.retry_policy`
Plain-language description. ✅ `"3 retries with exponential backoff (1s, 5s, 30s), then notify"`. The builder translates into platform-specific config.

---

## `human_checkpoints` *(array, required, possibly empty)*

```jsonc
{
  "step_id": "step-004",
  "reason": "string",
  "action_required": "string"
}
```

Every step with `actor: "human"` must have a corresponding checkpoint entry. A spec with `[]` and zero `human` actors is acceptable only if every step is genuinely safe to fully automate — re-examine for sensitive workflows (health data, financial, customer-facing communication).

### `human_checkpoints[].reason`
Why a human is in the loop. ✅ `"Commande inhabituelle (montant > 500€) — Marc valide avant envoi de la confirmation"`.

### `human_checkpoints[].action_required`
What the human does. ✅ `"Vérifier la commande et cliquer Approve/Reject dans l'email de notification"`.

---

## `recommended_builder` *(object, required)*

```jsonc
{
  "builder": "n8n-builder" | "make-builder" | "zapier-builder" | "python-builder" | "power-automate-builder" | "string",
  "justification": "string"
}
```

### `recommended_builder.builder`
The Talk2Flow builder skill name in kebab-case English. If you recommend a builder not yet released, set the `builder_not_available` confidence flag.

### `recommended_builder.justification`
2-4 sentences in operator language explaining why this builder dominates the alternatives **given this stack profile**. Reference specific stack profile fields (`tech_comfort.final_assessment`, `budget`, compliance constraints) — don't argue in the abstract.

---

## `alternative_builders` *(array, required, minimum 1 entry when meaningful)*

```jsonc
{
  "builder": "string",
  "trade_offs": "string"
}
```

At least one alternative when meaningful. If only one builder is genuinely viable (e.g., compliance disqualifies everything else), `alternative_builders: []` is acceptable — but the `recommended_builder.justification` must explain the elimination.

### `alternative_builders[].trade_offs`
2-3 sentences expressing the **difference** in concrete dimensions: monthly cost, setup effort, maintenance, compliance, lock-in. Never argue from personal preference.

---

## `roi_estimate` *(object, required)*

```jsonc
{
  "time_saved_per_run_minutes": number | null,
  "estimated_runs_per_week": number | null,
  "annual_hours_saved": number | null,
  "assumptions": ["string"],
  "unavailable": boolean
}
```

### `roi_estimate.unavailable`
`true` when upstream `weekly_hours_on_repetitive_tasks` was null OR when volumetry is too uncertain to compute. **When `true`, all numeric fields MUST be `null`.** Never fabricate.

### `roi_estimate.assumptions`
Every assumption that went into the numbers, in plain language. ✅ `"Gain hypothesis: 80% time reduction on this task (from process-challenger solution_paths)"`, ✅ `"Working year: 46 weeks (excludes 6 weeks closure / leave)"`, ✅ `"Volume stable at 15 orders/day; surges in September not factored"`.

ROI is an **order of magnitude**, not a commercial quote.

---

## `assumptions` *(array, required)*

List of things the deployer must verify before or during deployment. One assumption per item. Be specific:

- ✅ `"Univerre supports CSV import via watched folder; column order: customer_name, prescription_ref, frame_model_id, lens_correction, total_amount"`
- ❌ `"Verify Univerre integration"`

Every upstream `confidence_flag` from stack profile or opportunity becomes **either** an entry in `assumptions[]` (verifiable by deployer) **or** a `confidence_flag` here (if it remains a structural blocker).

---

## `confidence_flags` *(array, required, possibly empty)*

```jsonc
{
  "flag": "string",
  "explanation": "string",
  "details": "string" | null
}
```

Includes upstream-inherited flags **and** architect-specific flags:

| Flag | Triggered when |
|---|---|
| `integration_blocker` | Critical tool has no known API or export — spec depends on unverified integration assumption |
| `compliance_risk_in_spec` | Spec processes sensitive data without compliance guarantee |
| `builder_not_available` | Recommended builder not yet released in Talk2Flow |
| `human_checkpoint_required` | A step cannot be fully automated without human validation |
| `roi_estimate_unavailable` | Upstream `weekly_hours_on_repetitive_tasks` was null or volumetry too uncertain |
| `path_arbitration_contested` | Two solution paths within ~10% on score — operator must arbitrate |

Plus all upstream flag types from `stack-profiler` (`compliance_not_assessed`, `integration_unknowns`, `single_source_of_truth_missing`, `deployment_handoff_unclear`, …) and from `process-challenger` (`volumetry_missing`, …).

### `confidence_flags[].explanation`
Why the flag is raised, in operator language.

### `confidence_flags[].details`
Optional: what action resolves the flag, who can answer, or what the worst-case impact is.

---

## Validation checklist (for builders consuming this spec)

A builder should refuse to materialize a spec if:

- `spec_version` is not supported
- Any required field is missing
- A `step-NNN` referenced by `data_flows` / `error_handling` / `human_checkpoints` is not in `steps[]`
- A `source_tool` / `target_tool` / `notification_channel` references a tool not in the linked stack profile
- `roi_estimate.unavailable: true` but numeric fields are not all `null`
- `recommended_builder.builder` is not a known Talk2Flow builder AND `builder_not_available` is not in `confidence_flags`

Other issues (e.g., `assumptions: []`, no `error_handling.failure_modes[]`) should produce **warnings** but not block.

---

## Versioning

Schema follows semver:
- **Patch** (1.0.x): documentation clarifications, no field changes
- **Minor** (1.x.0): additive fields with safe defaults
- **Major** (x.0.0): breaking changes — builders must update

Builders MUST declare which `spec_version` ranges they support and refuse out-of-range specs cleanly.
