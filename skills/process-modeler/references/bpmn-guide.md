# BPMN Guide for process-modeler

Talk2Flow produces BPMN at two levels of fidelity:

1. **Textual notation** — synthetic, human-readable, embedded directly in the Markdown response
2. **BPMN 2.0 XML + interactive viewer** — fully compliant XML rendered in the `templates/bpmn-viewer.html` artifact

This guide covers both. The textual notation is for the operator to read in conversation. The XML is for the deployer (and downstream toolchain like Camunda, bpmn.io, draw.io).

## Textual notation — design philosophy

Textual notation inspired by BPMN 2.0, designed to be:
- **Readable** by a human not familiar with BPMN
- **Synthetic** (not full BPMN XML)
- **Importable** as a starting point into BPMN tools (Bizagi, Camunda, Signavio) with light manual transformation

## Textual notation — process skeleton

```
PROCESS [P01] — [Process name]
DESCRIPTION: [1-2 synthetic lines about the process]
TRIGGER: [type] — [trigger description]
FREQUENCY: [value unit or range]
VOLUME: [value unit period or range]

LANES:
  - [Actor 1] (role: executor | validator | consulted | informed | requester ; type: internal | external)
  - [Actor 2] (...)

START_EVENT: [description]

TASKS:
  T1 [type] [Action verb + object]
     lane: [Actor]
     tool: [Tool used or — if none]
     duration: [X min or —]
     flags: [inferred | vague | none]

  T2 [type] [...]
     ...

GATEWAYS:
  G1 [XOR | AND | OR] [Question or condition]
     -> [label]: [target task]
     -> [label]: [target task or END]

SEQUENCE_FLOW:
  START_EVENT -> T1 -> T2 -> G1
  G1 [yes] -> T3
  G1 [no] -> END_ALT_1

END_EVENTS:
  END_NORMAL: [normal result description]
  END_ALT_1: [alternative result description if present]

DATA_OBJECTS:
  Inputs:
    - [Nature] (source: [...], format: [...])
  Outputs:
    - [Nature] (recipient: [...], format: [...])

BUSINESS_RULES:
  - [Business rule 1]
  - [Business rule 2]

EXCEPTIONS:
  - [Exceptional case 1] -> [Handling or "Undocumented"]

NOTES:
  - [Any useful info not captured by the structure]
```

## Task types

| Type | When to use | BPMN symbol |
|---|---|---|
| `user` | Human action involving a software tool | User task |
| `manual` | Human action without tool (meeting, physical handling, paper) | Manual task |
| `service` | Already automated step (auto-export, calculation, generation) | Service task |
| `script` | Calculation or simple transformation step, often automatable | Script task |
| `send` | Sending a message, notification, email | Send task |
| `receive` | Waiting for and receiving an external message | Receive task |

**Default rule**: if the step involves a human and a tool → `user`. If human alone → `manual`. If automated step mentioned in the JSON → `service`.

### Mandatory detection of external waits (send / receive)

**Critical rule**: any handoff to an external actor (lawyer, candidate, IT, supplier, bank...) involving a **wait before continuing** must be modeled in two steps:

| Step | Type | Semantics |
|---|---|---|
| Sending to external | `send` | Transmission action (email, file drop, request) |
| Receiving the return | `receive` | Blocking wait for external return |

**Signals that should make you use `send`/`receive`**:
- The next step in the JSON depends on someone else's return
- JSON verbs: "I send to...", "they send back", "I wait for the return", "once she has reviewed"
- Lane of receive step ≠ lane of send step
- Mention of a variable delay in the verbatim ("can take 3 days, sometimes 2 weeks")

**Example — lawyer contract review**:

❌ Insufficient:
```
T4 [user] Send contract to lawyer for review (lane: Marc, tool: Outlook)
T5 [user] Receive reviewed contract (lane: Lawyer, tool: Outlook)
```

✅ Correct:
```
T4 [send] Send contract to lawyer for review (lane: Marc, tool: Outlook)
T5 [receive] Receive reviewed contract (lane: Marc, tool: Outlook)
   note: "External wait — variable duration, flagged as delay source"
T6 [user] Review lawyer's modifications (lane: Marc, tool: Word)
```

Note that the lane of `receive` is the one of **the waiter** (Marc in the example), not the external party. It's a wait on Marc's side.

**Why this matters**: `process-challenger` aims to reduce end-to-end delays. External waits are the **real levers** (gateways that can be automated, possible parallelization, automatic reminders, e-signature instead of email), not active actions. Without send/receive typing, these levers are invisible.

## Gateway types

| Type | Semantics | Typical use |
|---|---|---|
| `XOR` | Exclusive choice (only one branch) | "If new supplier, then A, otherwise B" |
| `AND` | Parallelization (all branches execute) | "In parallel: prepare equipment AND notify office manager" |
| `OR` | Inclusive choice (one or more branches) | Rarer, use with caution |

### Mandatory detection of parallelism (AND)

**Critical rule**: if a process contains multiple steps **triggered at the same time** but handled by **different actors or systems** (and not depending on each other), you MUST model an AND-split then an AND-join. Do not put them in linear sequence.

**Signals that should make you suspect parallelism**:
- Multiple distinct actors mentioned on successive steps with no dependency between them
- Steps assigned to different teams (e.g., IT, office manager, HR) at the same time
- Multiple "triggering" verbs: "I send a request to IT, I notify the office manager, I prepare the kit..."
- No explicit mention of an order between steps

**Example — pre-arrival preparation of a new employee**:

❌ Wrong (false linear sequence):
```
TASKS:
  T1 [user] Create Lucca file (lane: Marc)
  T2 [user] Send equipment request to IT (lane: Marc)
  T3 [user] Send account request to IT (lane: Marc)
  T4 [user] Notify office manager (lane: Marc)
  T5 [user] Prepare welcome kit (lane: Marc)
SEQUENCE_FLOW:
  START -> T1 -> T2 -> T3 -> T4 -> T5 -> END
```

✅ Correct:
```
TASKS:
  T1 [user] Create Lucca file (lane: Marc)
  T2 [send] Send equipment request to IT (lane: Marc)
  T3 [send] Send account request to IT (lane: Marc)
  T4 [send] Notify office manager (lane: Marc)
  T5 [manual] Prepare welcome kit (lane: Marc)
  T6 [user] Process equipment order (lane: IT)
  T7 [user] Create accounts and access (lane: IT)
  T8 [user] Prepare badge and desk (lane: Office manager)

GATEWAYS:
  G1 [AND-split] Launch pre-arrival parallel actions
    -> T2, T3, T4, T5
  G2 [AND-join] Convergence before D-day
    <- T5, T6, T7, T8

SEQUENCE_FLOW:
  START -> T1 -> G1
  G1 -> T2 -> T6
  G1 -> T3 -> T7
  G1 -> T4 -> T8
  G1 -> T5
  T5, T6, T7, T8 -> G2 -> END
```

**Why this matters**: `process-challenger` reads this BPMN to evaluate process duration. With an AND-split, duration = MAX of branches (not SUM). And the challenger detects branch sync defects as optimization levers. Without AND, these analyses are impossible.

If an exception is documented but without explicit branching, model it as XOR with an `[undocumented]` branch:

```
GATEWAYS:
  G1 [XOR] Invoice for our entity?
     -> yes: T2
     -> no: END_ALT_1 [Undocumented — see follow-up Q03]
```

### Mandatory multiple END_EVENTS

**Rule**: if a XOR gateway has a branch that doesn't lead to the normal continuation of the process, that branch **must** lead to an explicit alternative END_EVENT, never to an empty placeholder or `[undocumented]`.

❌ Wrong:
```
GATEWAYS:
  G1 [XOR] Meeting actually scheduled?
    -> yes: T2
    -> no: [postponed or cancelled — no documented handling]

END_EVENT: [undocumented]
```

✅ Correct:
```
GATEWAYS:
  G1 [XOR] Meeting actually scheduled?
    -> yes: T2
    -> no: END_ALT_1

END_EVENTS:
  END_NORMAL: Meeting held (content not documented — see Q11)
  END_ALT_1: Meeting postponed or cancelled — no output produced (frequent case per interviewee)
```

**Why**: `process-challenger` reads END_EVENTS to evaluate **degraded outputs** of a process. A branch ending in `[undocumented]` gives it no handle. A named END_ALT_1 signals "this process has a known failure path, quantifiable".

**Special cases**:
- If the "no" branch leads to another process: `-> no: P0X (handoff)`
- If the "no" branch loops back to an earlier step: `-> no: T2 (loop)`
- If the branch is truly unknown: END_ALT_X with explicit note "Undocumented handling — see follow-up Q0X"

## Convention for inferred and vague steps

The `flags` field materializes the nuances of the pivot JSON:

```
T3 [user] Verify the supplier file
   lane: Sylvie M.
   tool: Sage
   duration: —
   flags: vague
   note: "Verification mentioned but scope not specified"
```

```
T6 [user] Integrate lawyer's modifications
   lane: Marc D.
   tool: Word
   duration: —
   flags: inferred, vague
```

## Convention for loops

```
SEQUENCE_FLOW:
  T5 -> G1
  G1 [validated no]: -> T2 (loop)
  G1 [validated yes]: -> T6
```

Annotate `(loop)` after the return to an earlier task, for readability.

## Complete example — P01 from finance test

```
PROCESS P01 — Receive and file supplier invoices
DESCRIPTION: Sort incoming emails with invoices, verify entity targeting, rename and file in a shared folder.
TRIGGER: schedule — Open Outlook in the morning around 8:30
FREQUENCY: 1 per day
VOLUME: 40 invoices per day

LANES:
  - Sylvie M. (role: executor ; type: internal)
  - Suppliers (role: requester ; type: external)

START_EVENT: Incoming emails with invoice attachments

TASKS:
  T1 [user] Open Outlook and identify emails with invoices
     lane: Sylvie M.
     tool: Outlook
     duration: —
     flags: none
     note: "30-50 emails/day, about half contain invoices"

  T2 [user] Download attachments one by one
     lane: Sylvie M.
     tool: Outlook
     duration: —
     flags: none

  T3 [user] Verify the invoice belongs to the entity
     lane: Sylvie M.
     tool: —
     duration: —
     flags: none

  T4 [user] Rename attachment per format YYYY-MM-SUPPLIER-AMOUNT
     lane: Sylvie M.
     tool: —
     duration: —
     flags: none
     note: "Requires finding the invoice number in the document"

  T5 [user] Drop the invoice in the shared folder
     lane: Sylvie M.
     tool: Shared server folder
     duration: —
     flags: none

GATEWAYS:
  G1 [XOR] Invoice for our entity?
     -> yes: T4
     -> no: END_ALT_1 [Undocumented case — follow-up Q03]

SEQUENCE_FLOW:
  START_EVENT -> T1 -> T2 -> T3 -> G1
  G1 [yes] -> T4 -> T5 -> END_NORMAL
  G1 [no] -> END_ALT_1

END_EVENTS:
  END_NORMAL: Invoice renamed and filed in the shared folder
  END_ALT_1: Invoice redirected to another entity (handling not documented)

DATA_OBJECTS:
  Inputs:
    - Supplier invoice (source: Suppliers (email), format: Email attachment — PDF presumed)
  Outputs:
    - Renamed invoice (recipient: Shared server folder, format: File renamed per convention)

BUSINESS_RULES:
  - Naming format: YYYY-MM-SUPPLIER-AMOUNT
  - Verify entity ownership before processing

EXCEPTIONS:
  - Invoice addressed to another group entity -> Undocumented

NOTES:
  - Total process duration estimated at 1h/day for 40 invoices
  - Outlook crashes regularly with too many attachments (pain point: inadequate_tool)
```

## BPMN 2.0 XML for the interactive viewer

In addition to the textual notation above, produce a valid BPMN 2.0 XML for each process to inject into the `templates/bpmn-viewer.html` template.

The XML must:
- Be valid BPMN 2.0 (OMG standard) — verifiable in bpmn.io demo
- Include the `<bpmndi:BPMNDiagram>` section with `<dc:Bounds>` for each shape — without it, bpmn-js cannot render the layout
- Use namespaced IDs prefixed with the process (e.g., `P01_T1`, `P01_G1`)
- Map task types to BPMN elements:
  - `user` → `<bpmn2:userTask>`
  - `manual` → `<bpmn2:manualTask>`
  - `service` → `<bpmn2:serviceTask>`
  - `script` → `<bpmn2:scriptTask>`
  - `send` → `<bpmn2:sendTask>`
  - `receive` → `<bpmn2:receiveTask>`
- Map gateway types:
  - XOR → `<bpmn2:exclusiveGateway>`
  - AND → `<bpmn2:parallelGateway>`
  - OR → `<bpmn2:inclusiveGateway>`
- Include lanes via `<bpmn2:laneSet>` and `<bpmn2:lane>` if multiple actors

For coordinates: use a basic layout (left-to-right, 100px horizontal spacing, 120px vertical spacing between rows). bpmn-js renders correctly with explicit bounds, even simplified.

Inject the XML into the template by replacing the contents of `<script id="bpmn-source" type="application/xml">...</script>` and save to `/mnt/user-data/outputs/process-[id]-viewer.html`.

## Writing rules

- **No unnecessary internal quotes** (except for citation notes)
- **Infinitive verbs** for tasks (consistent with the pivot JSON)
- **`—`** for "not filled in" (visually consistent)
- **One line per field** in tasks — eases reading and diffing
- **Reference follow-up questions** by their ID (Q01, Q02...) in notes when relevant
- **Keep EXCEPTIONS short**: if an exceptional case is voluminous, it's probably a subprocess to model separately

## Anti-patterns

❌ **Convert to full BPMN XML** for the textual notation — keep textual synthetic. Full XML is for the artifact only.
❌ **Add advanced BPMN elements** not present in the JSON (compensations, ad-hoc intermediate events, ad-hoc subprocesses)
❌ **Invent an Accountable** in LANES if not identified
❌ **Duplicate a task** — each T1, T2... is unique within the process
❌ **Mix several processes** in the same PROCESS block — one process = one block
❌ **Produce BPMN XML without `<bpmndi:BPMNDiagram>` section** — bpmn-js can't render it
