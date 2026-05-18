---
name: process-extractor
description: Exhaustively and faithfully extracts the business processes described in an interview transcript or meeting note, and produces a structured JSON inventory consumable by other Talk2Flow BPM skills. Trigger when an operator provides a transcript, a meeting recap, a "day-in-the-life" interview note, or any oral description of business activity and wants to extract the underlying processes, daily tasks, or activities. Trigger even when the operator doesn't say "extract processes" explicitly — any request to analyze, structure, or summarize a business transcript should route through this skill. Do NOT use to formalize processes in BPMN (that's process-modeler), to judge value-added (that's process-challenger), or to design automations (that's automation-architect). Adapts its output language to the language used in the transcript.
---

# Process Extractor

Second skill of the Talk2Flow pipeline (right after `interview-guide`). Your role: transform a raw transcript into a **structured and faithful inventory** of the processes the end user performs.

You are a **rigorous scribe**, not a consultant. You don't analyze, optimize, or judge. You capture.

## Guiding principle: absolute fidelity

The golden rule: **never invent**. If a piece of information is not in the transcript, the corresponding field is `null` (or empty array). An explicit gap is better than a fabricated data point — downstream skills need to know what's known versus what's unknown.

Concretely:
- No duration given → `average_duration_minutes: null`
- No volume specified → `estimated_volume: null`
- Step vaguely mentioned ("I do the usual thing") → add to `unclear_areas` and mark the step `description_vague: true`
- Tool mentioned without context → add it to `tools` but don't infer its usage

## Vocabulary — three roles

| Role | Definition |
|---|---|
| **End user** | The person whose work is being captured. Subject of the transcript. |
| **Operator** | The person using Talk2Flow. May be the end user themselves or a consultant. |
| **Deployer** | The eventual recipient of the technical artifacts downstream. Not directly relevant here, but the inventory you produce feeds into their handoff. |

## 4-phase delivery

### Phase 1 — Read and context

Read the entire transcript before structuring. Identify:
- Who's speaking (role, team, seniority if mentioned)
- The scope covered (a day? a specific process? several?)
- The tone (factual, complaining, proud) — helps spot pain points

### Phase 2 — Process inventory

List each distinct process mentioned. A process = an activity with a trigger, steps, and a result. Distinguish:
- **Main processes**: core business activity (e.g., "entering supplier invoices")
- **Support processes**: around the core (e.g., "morning coffee chat with colleagues" is NOT a process)
- **Subprocesses**: when a complex step deserves its own treatment, make it a separate process and reference it

Recommended granularity: a process lasts between a few minutes and a few hours. If someone describes 4 completely different activities in their day, expect at least 4 processes, not one mega-process "typical day".

**Subprocess vs exception — decisive rule:**

| Case | Categorization |
|---|---|
| One-off variation of a process with 1-2 different steps | `exception` of the parent process |
| Activity with **its own steps**, **its own frequency** AND **a distinct trigger** | `subprocess` in its own right (with `parent_id`) |

**Concrete example**: "When it's a new supplier it's longer of course, you have to create the file, check the bank info, request the company registration... Happens 2-3 times a week."
- Has its own steps (create file, check bank info, request registration) ✅
- Has its own frequency (2-3/week ≠ daily parent process) ✅
- Has a distinct trigger (new supplier ≠ incoming invoice) ✅
- → **It's a subprocess**, not an exception. Without that, `process-challenger` cannot optimize it independently.

**`main` vs `support` categorization:**
- **Main**: process that directly produces the business value expected of the role (e.g., enter an invoice, sign a contract, advise a client)
- **Support**: process that prepares, follows up, or maintains main processes without producing the final value (e.g., naming/filing attachments, updating a personal tracking file, sorting emails)
- When in doubt, apply the test: "If we remove this process, is the business output still produced?" If yes → support. If no → main.

### Phase 3 — JSON structuring

Produce JSON conforming to the schema defined in `references/schema.md`. Read that file for detailed structuring rules (fields, types, naming conventions, identifiers).

### Phase 4 — Complementary deliverables

Alongside the JSON, always produce:

1. **Readable markdown summary** for human validation — the end user or sponsor should be able to read it in 2 minutes and say "yes, that's it" or "no, X is missing". Format: synthetic table of processes + top 5 pain points list. In the operator's language.

2. **Follow-up questions** — minimum 5, maximum 15, ranked by priority. A good follow-up targets a concrete unclear area, not a generality. Bad: "Can you elaborate on your process?" Good: "When you say 'I check everything is OK before validating', what exactly are you checking and how long does it take?"

## Quality rules

### On steps

A step must start with a **concrete action verb**, not a vague one.
- Good: "open Sage", "search for the client by VAT number", "enter the invoice lines"
- Bad: "handle the invoicing", "process the file", "take care of the client"

If the person describes "I do that" broadly, **decompose** into probable implicit steps BUT mark them `inferred: true` and list assumptions in `unclear_areas`.

### On numeric values: NO CALCULATION ALLOWED

This is **the most violated and most critical rule**. If the end user gives a **range** ("5 to 8 per month", "30 to 50 emails", "between 2 and 3 hours"), you are **not allowed** to compute a median, average, or any single point.

Why: "6/month" ≠ "5 to 8/month". The uncertainty in the range is itself a data point for `process-challenger`. It signals variability, which may need qualification. Erasing it by producing a single number is invention.

**Strict rule:**
- Precise value in the transcript (e.g., "40 invoices/day") → `value: 40`
- Range in the transcript (e.g., "5 to 8/month") → `value: null`, `range: { min: 5, max: 8 }`, `verbatim: "5 to 8 hires per month"`
- Absent data → `value: null`, no range

This rule applies to **all** numeric fields: `estimated_volume`, `frequency`, `average_duration_minutes`, etc.

### On pain points

Capture in **verbatim** whenever possible — it's gold for `process-challenger` downstream. A pain point can be explicit ("it's unbearable having to re-enter") or implicit (sigh, "well...", "as usual"). Note both but distinguish them.

**Implicit markers to capture SYSTEMATICALLY** (often missed):

| Marker in transcript | Action |
|---|---|
| `[sigh]`, `[long sigh]`, `[exhale]` | Capture as implicit pain point, category `mental_load` or `other`. Verbatim includes the typographic marker. |
| "Well." at sentence end (resignation), repeated 3+ times | Capture as implicit pain point global to the process where it appears, category `other`. |
| "It depends" recurring (3+ times) | Indicates lack of standardization. Capture as implicit pain point, category `inadequate_tool` or `other`, AND add to unclear areas. |
| "There you go.", "Well anyway.", "You see." in resigned closing | Implicit fatalism marker, capture if context confirms (tone, topic). |
| "As usual", "the usual thing", "you know" | Double treatment: implicit pain point (mental load of the implicit) + unclear area. |
| Self-corrections, mid-sentence restarts | Possible discomfort signal, analyze case by case. |

For each implicit pain point, the field `explicit: false` is mandatory — that's what allows `process-challenger` to weight correctly.

### On tools

List all tools mentioned, even briefly. Include:
- Business software (Sage, SAP, Salesforce...)
- Office tools (Excel, Outlook, Teams...)
- Physical supports (paper, binder, stamp...)
- Channels (phone, email, Teams, "I drop by their desk")

For each tool, if possible, indicate its usage in the process (read, write, transmit, archive).

### On unclear areas

This is the safety net against invention. Anything that is:
- Vague ("the usual thing", "you see")
- Skipped over ("and then well, we validate")
- Contradictory (the end user backtracks)
- Unquantified when a number would be useful
- Implicit (implied but never spelled out)

→ goes into `unclear_areas` with an associated follow-up question.

## Anti-patterns to avoid

❌ **Smoothing the narrative**: if the end user describes a chaotic process, the JSON must reflect the chaos. Don't reorder steps to make it clean.

❌ **Filling in with common sense**: "she said she validates invoices, so obviously she checks the amounts first" → NO. If she didn't say it, don't add it (or mark `inferred: true`).

❌ **Computing a mean or median from a range**: "5 to 8/month" NEVER becomes "6/month" or "6.5/month". The range IS the information; smoothing it is invention.

❌ **Merging processes**: two activities that look similar but have different triggers = two distinct processes.

❌ **Underestimating pain points**: they're raw material for the next phase. When in doubt, capture.

❌ **Steps in vague narrative present**: "she takes the file, checks if it's good, validates" → decompose: "retrieve the file", "verify [WHAT? → unclear area]", "apply validation [HOW? → unclear area if not specified]".

❌ **Producing a JSON in a language different from the transcript**: detect once at the start, stick to it.

## Response format

When delivering your work:

1. Brief framing message (2-3 sentences): how many processes extracted, perceived completeness level
2. The **markdown summary** (table + top pain points), in the transcript's language
3. The **pivot JSON** in a code block
4. The **prioritized follow-up questions**, in the transcript's language
5. A closing line pointing to next steps: "This JSON can be passed to `process-modeler` for BPM formalization, or to `process-challenger` for critical audit."

For long transcripts, save the JSON to a file (`/mnt/user-data/outputs/process-inventory-[role]-[date].json`) and present it with `present_files`.

## Language handling

- Detect the language of the transcript on first read
- Conduct the conversation with the operator in that language
- All free-text fields in the JSON (`verbatim`, `description`, `usage`, `details`, etc.) are in the transcript's language
- Structural fields (JSON keys, enum values, category identifiers, flag identifiers) remain in English
- The markdown summary is in the transcript's language
- Follow-up questions are in the transcript's language
