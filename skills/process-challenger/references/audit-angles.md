# 7 Audit Angles — process-challenger

For each process in the JSON, systematically apply the 7 angles below. Each angle has its own detection logic, JSON signals, and opportunity template.

## Angle 1 — Rework and duplicates

### What the angle looks for
Any information that is entered, copied, transformed, or transcribed multiple times in the chain. The hidden cost is high: double effort + transcription error risk.

### JSON signals
- `pain_points` with category `rework`
- Multiple steps manipulating the same input data (e.g., read in Outlook → rename → drop → re-enter in Sage)
- Multiple tools on same data in `global_tools` (e.g., supplier data present in Sage, GestiCo, Excel)
- Typical verbatims: "I re-enter", "I retype", "I transfer", "I copy over"
- Manual matching steps between two systems (e.g., PO-invoice matching)

### Opportunity template
- **Title**: "Eliminate rework of [data] between [system A] and [system B]"
- **Diagnosis type**: "[Person] enters/manipulates [data] [N times/day] in [systems], for a volume of [V] and a total duration of [T]. Information is already structurally available in [upstream system]."
- **Typical paths**: API integration between systems, RPA, AI extraction if unstructured data, removal of a redundant system, EDI

### Example from finance test
Sylvie enters into Sage information already present in the invoice PDF. → opportunity "Automate supplier invoice entry into Sage".

---

## Angle 2 — External waits

### What the angle looks for
Any wait point blocking the process continuation, depending on an external actor (lawyer, candidate, IT, supplier, bank, other internal department).

### JSON signals
- `receive` tasks in the BPMN
- `[/.../]` parallelograms in the Mermaid
- `pain_points` with category `waiting`
- Typical verbatims: "I wait for...", "we need to chase", "can take 2 weeks", "she sends back when..."
- Actors with `validator` role or one-off intervener

### Opportunity template
- **Title**: "Reduce wait time on [step] with [external actor]"
- **Diagnosis type**: "Process [P0X] is blocked for [variable duration] waiting for [actor]. Observed case: [verbatim]."
- **Typical paths**: SLA formalized with external actor, automatic escalation on overrun, e-signature instead of email, parallelizing other tasks during wait, simplifying the request to reduce arbitration need

### Important note
Don't try to eliminate all waits — some are **structural and healthy** (hierarchical validation, external quality control). The goal is to reduce **useless waits** or **mis-managed waits** (no reminder, no visibility, no SLA).

---

## Angle 3 — Mental load & tacit knowledge

### What the angle looks for
Anything relying on one person's head: unwritten rules, "by eye" verifications, mental checklists, implicit know-how acquired through experience.

### JSON signals
- `pain_points` with category `mental_load`
- Global unclear areas mentioning "verifications by habit", "from experience"
- Steps with `description_vague: true` or `inferred: true`
- Typical verbatims: "by eye", "out of habit", "I have the experience", "I just sense it", "you have to be careful about..."
- Personal tracking files (personal Excel, sticky notes, memo)
- `raci_warnings` mentioning "single actor"

### Opportunity template
- **Title**: "Formalize/transfer tacit knowledge about [domain]"
- **Diagnosis type**: "[Person] performs [task] with undocumented expertise. In case of departure or absence, [consequence]. Verbatim mention: [citation]."
- **Typical paths**: procedure documentation, peer-to-peer training, video capture of business gestures, AI decision support (recommendations based on history), checklist integrated into the tool, tool redesign to make the rule explicit

### Important note
Mental load is NOT always an automation opportunity. Often the right path is **organizational** (documentation, backup training) rather than technical. The challenger must signal this, not push AI everywhere.

---

## Angle 4 — Pipeline breaks

### What the angle looks for
Any point where information is lost, has no clear recipient, or restarts from a system without traceability.

### JSON signals
- `detected_breaks` from the modeler (output_without_customer, input_without_supplier, orphan_actor, undocumented_loop)
- SIPOC with empty cells
- Outputs without identified recipient
- Inputs with source "Marc himself" or equivalent (silo)

### Opportunity template
- **Title**: "Bridge the pipeline break between [point A] and [point B]"
- **Diagnosis type**: "Information [X] produced by [P0X] has no formalized recipient / no identified supplier. Consequence: [operational risk]."
- **Typical paths**: API integration, automated transmission workflow, formalize a transmission rule, remove the flow if not useful, shared database

### Important note
Not all breaks become opportunities. Some are just **follow-up questions** to clarify with the end user. If the break comes from missing information in the transcript (modeler's unclear area), create instead a conditional opportunity with `questions_to_clarify_before_decision` filled.

---

## Angle 5 — Bottlenecks

### What the angle looks for
Steps that consume a disproportionate share of total process time. Pareto principle: 20% of steps consume 80% of time.

### JSON signals
- `average_duration_minutes` × `estimated_volume` producing a total > 1h/day
- Steps mentioned as "takes me the afternoon", "a big half-day", "every morning"
- Bottlenecks crossing other angles (rework + external wait = double penalty)

### Opportunity template
- **Title**: "Reduce bottleneck [step] (X hours/year consumed)"
- **Diagnosis type**: "[Step] represents [X h/year] on process [P0X], i.e., [Y%] of total time. Verbatim: [citation like 'I spend half my time on this']."
- **Typical paths**: automation, parallelization (if AND-split possible), outsourcing, scope reduction, step redesign

### Important note
Quantifying time gain is **mandatory** for this angle. If volumetry is missing, it's a signal the angle must be handled with caution (and `volumetry_missing: true`).

---

## Angle 6 — Governance risks

### What the angle looks for
Processes with fragile governance: no Accountable, dependency on one person, non-shared tracking, missing validation.

### JSON signals
- `raci_warnings` from the modeler (especially "No Accountable")
- `raci_completeness: "impossible"` or `partial`
- Global unclear areas on organizational resilience
- Non-shared personal tracking (Marc's personal Excel, Sylvie's mental tracking)
- Process with a single actor on all steps

### Opportunity template
- **Title**: "Establish robust governance on [process]"
- **Diagnosis type**: "Process [P0X] depends on a single person without backup. Output [X] inaccessible if absence. No Accountable identified."
- **Typical paths**: appoint an Accountable, mutualize the tracking (shared tool), continuity procedure, backup training, integration into a collaborative tool

### Important note
This angle often produces opportunities **not directly quantifiable** in time gain (the gain is in peace of mind, risk reduction). That's OK: `time_gain_h_year` can be null but `quality_gain` must be high.

---

## Angle 7 — Inadequate tools

### What the angle looks for
Tools that crash, that aren't designed for their use, that aren't integrated with others, that force workarounds.

### JSON signals
- `pain_points` with category `inadequate_tool`
- Tools with `apparent_criticality: "high"` but used in margin (e.g., Excel for operational tracking)
- Mentions of "it crashes", "it bugs", "there's no interface between"
- Multiple tools for a single function (e.g., Excel + GestiCo + Sage for matching)

### Opportunity template
- **Title**: "Replace/integrate [tool X] for [function Y]"
- **Diagnosis type**: "[Tool X] is used for [function] although it wasn't designed for it / doesn't integrate with [tool Z]. Consequence: [workaround, time waste, errors]."
- **Typical paths**: API integration, replace with dedicated tool, advanced configuration of existing tool, remove the tool if redundant, AI agent as unified interface

### Important note
Before proposing a new tool, **always** check if an existing feature of the current tool wouldn't suffice. The `existing_tool` path (better leverage of what's already in place) is often undervalued but generally the most profitable.

---

## Opportunity merging rules

The same observation can feed multiple angles. In that case:

1. Choose the **primary angle** = the one that most directly motivates the opportunity
2. List the **secondary angles** in the dedicated field
3. Weight them in impact scoring (a multi-angle subject often has stronger strategic impact)

**Example**: Marc's personal Excel file.
- Primary angle: `governance_risk` (non-shared tracking)
- Secondary angles: `inadequate_tool` (Excel for operational tracking), `mental_load` (Marc alone knows where each case stands)
- → 1 unique opportunity, not 3

## Anti-pile-up rule

Aim for 8-12 opportunities per audit. If you have more than 15, it's probably because:
- You didn't merge observations that relate to the same project
- You created opportunities on unclear areas that should remain follow-up questions
- You confuse symptom and cause (e.g., 5 opportunities on 5 different tools that crash, when the root cause is "lack of IT urbanization")

Conversely, fewer than 5 opportunities on a complete audit = you missed signals. Restart by going through the 7 angles again.
