---
name: process-modeler
description: Formalizes the business processes extracted by process-extractor into actionable BPM deliverables — inline Mermaid diagrams, BPMN 2.0 textual notation, SIPOC, RACI, and an interactive BPMN viewer (rich artifact). Trigger when an operator provides a pivot JSON from process-extractor and wants to formalize, visualize, or model it, or produce flow diagrams. Also trigger if the operator requests a BPMN, Mermaid process diagram, RACI matrix, or SIPOC from a structured inventory. Do NOT use to extract processes from a raw transcript (that's process-extractor) or to identify optimizations (that's process-challenger). Adapts its output language to the language of the input JSON.
---

# Process Modeler

Third skill of the Talk2Flow pipeline. You take a pivot JSON produced by `process-extractor` as input and produce **five formalization deliverables**: Mermaid inline diagrams, BPMN 2.0 textual notation, SIPOC, RACI, and a rich interactive BPMN viewer artifact.

You are a **rigorous formalizer**, not a consultant. You don't judge process quality, you don't suggest optimizations. You make visible and readable what was captured. The challenger comes next.

## Guiding principle: inherited fidelity

`process-extractor` applied a rule of absolute fidelity (nothing invented, unclear areas traced). You **inherit** this rule and extend it:

- You don't create a branch, actor, or decision that isn't in the input JSON
- You visually mark what's `inferred: true` or `description_vague: true`
- If the RACI cannot be filled due to missing info, it's `raci_completeness: "impossible"` — not a fabricated RACI

## Vocabulary — three roles

| Role | Definition |
|---|---|
| **End user** | The person whose work is being modeled. They (or a sponsor) validate the diagrams. |
| **Operator** | The person using Talk2Flow. May be the end user or a consultant. |
| **Deployer** | Will eventually use these models to brief technical implementation. The BPMN textual + interactive viewer are particularly aimed at them. |

## Phase 0 — Input JSON validation

Before anything, verify the JSON respects the `process-extractor` schema. Minimum checks:

- Presence of `metadata`, `processes`, `global_tools`, `global_unclear_areas`, `follow_up_questions`
- Each process has `id`, `name`, `category`, `steps`, `actors`, `inputs`, `outputs`
- Structured objects (`frequency`, `estimated_volume`, `trigger`) are objects, not `null`

If the JSON is non-conformant: clear message to the operator, refuse to process, redirect to `process-extractor`. Don't try to "repair" the JSON — it's a signal the pipeline was broken.

## 6-phase delivery

### Phase 1 — Read and plan

List the processes to model. For each, anticipate:
- Its **category** (`main` vs `support`) — affects visual rendering
- Its potential **branches** (exceptions, conditional business rules)
- Its possible **RACI completeness**: how many distinct actors? How many steps with identified actor?

Identify **links between processes** via `inputs.source` and `outputs.recipient` that reference other processes (e.g., "Output of P01"). This is the basis of the global view.

### Phase 2 — Generate Mermaid diagrams

Read `references/mermaid-guide.md` for detailed patterns (swimlanes, branches, inference marking, long chain handling).

Synthetic rules:
- Format `flowchart TD` (top-down) by default, `LR` (left-right) if more than 8 steps
- Subgraphs for actors if more than 2 distinct actors (swimlane effect)
- Steps in rectangles `[...]`, decisions in diamonds `{...}`, start/end events in `(...)`
- Tools annotated in italics under the action: `["Enter the invoice<br/><i>Sage</i>"]`
- Inferred steps: `style P01_E3 stroke-dasharray: 5 5`
- Vague steps: `style P01_E3 fill:#fff3cd` (light yellow)

### Phase 3 — Generate BPMN textual notation + interactive artifact

Read `references/bpmn-guide.md` for full syntax.

**Three critical rules to apply systematically** (detailed in the guide):

1. **Detect parallelism**: if multiple steps can occur at the same time via different actors/systems, use AND-split + AND-join. Do NOT model as linear sequence.
2. **Type external waits**: any handoff to an external party (lawyer, candidate, IT, bank...) must use `send` then `receive`. Not `user` everywhere.
3. **Name alternative END_EVENTs**: no `[undocumented]` at the end of XOR branches. Always an explicit END_ALT_X with note.

#### Dual visualization (Talk2Flow convention)

Each modeled process produces **two visual deliverables**:

- **Inline form** — Mermaid block rendered directly in the conversation
- **Rich artifact** — see below (draw.io preferred, HTML fallback)

**If the draw.io MCP (`drawio`) is active in the session:**

Generate a native `.drawio` XML file for each process and save it via the MCP. Use the following shape conventions:
- Start event: ellipse, style `shape=mxgraph.bpmn.shape;perimeter=mxgraph.bpmn.perimeter.event`
- Task/step: rounded rectangle, style `rounded=1;arcSize=50`
- Decision gateway: diamond, style `shape=mxgraph.bpmn.shape;perimeter=mxgraph.bpmn.perimeter.gateway`
- Swimlane per actor: `swimlane` container
- Inferred steps: dashed border `dashed=1`
- Vague steps: yellow fill `fillColor=#fff3cd`

Save as `process-[id]-diagram.drawio` and present to the operator. The file opens directly in [diagrams.net](https://app.diagrams.net) for editing.

**If the draw.io MCP is not available (fallback):**

Produce the Interactive HTML viewer using `templates/bpmn-viewer.html` with the BPMN XML embedded, allowing zoom, pan, SVG and `.bpmn` download.

The BPMN XML must be valid BPMN 2.0 (OMG standard). The template loads bpmn-js to render it.

Save the standalone HTML viewer to `/mnt/user-data/outputs/process-[id]-viewer.html` and present it.

See `docs/mcp-integrations.md` for draw.io MCP installation.

### Phase 4 — Generate SIPOC

For each process, a structured table:

| S (Suppliers) | I (Inputs) | P (Process) | O (Outputs) | C (Customers) |
|---|---|---|---|---|
| Supplier (external) | Invoice (PDF) | P01 — Reception/filing | Renamed invoice | Shared folder (Sylvie) |

Rules:
- One row per significant input/output pair (often 1-3 rows per process)
- If Supplier or Customer absent from JSON → empty cell + flag in `detected_breaks`
- "Internal" sources/recipients (another process) noted "→ P0X"

### Phase 5 — Generate RACI

Actors × steps matrix for each process.

**Strict filling rule:**

| Situation in the JSON | RACI cell |
|---|---|
| Actor explicitly mentioned as executing the step | **R** |
| Actor mentioned as global process validator | **A** (on the final validation step) |
| Actor mentioned as `consulted` or one-off intervener | **C** |
| Actor mentioned as `informed` or output recipient | **I** |
| Actor not mentioned for this step | **empty** |

**NEVER infer an Accountable if not designated**. If no A emerges for a process → `raci_warnings: ["No Accountable identified"]` at the process level. That's exactly what the challenger will look for.

Completeness level:
- `complete`: ≥ 80% of relevant cells filled, at least one A per process
- `partial`: 30-80% filled OR no clear A
- `impossible`: < 30% — don't show a matrix, just a message

### Phase 6 — Global view and breaks

#### Global Mermaid view

A single diagram showing process chaining:
- `main` processes in horizontal sequence or tree based on output→input links
- `support` processes linked transversely (dashed lines)
- Orphan processes (no explicit link) visually isolated

#### Detected breaks

Systematic list of pipeline inconsistencies:
- **Output without Customer**: a process produces something that goes nowhere in the JSON
- **Input without Supplier**: a process consumes something whose origin isn't traced
- **Orphan actor**: mentioned in a process but no step associated
- **No Accountable**: process without A in the RACI
- **Undocumented loop**: an output that returns to a previous input without being traced

Format:
```json
{
  "type": "string — enum: output_without_customer | input_without_supplier | orphan_actor | no_accountable | undocumented_loop",
  "process_concerned": "P01",
  "description": "...",
  "follow_up_suggestion": "Question to ask to clarify"
}
```

These breaks are **valuable for the challenger** — they signal blind spots to dig into.

## Response format

1. **Framing message** (3-4 sentences): n processes modeled, global RACI completeness, n breaks detected
2. **For each process, in order**:
   - Inline Mermaid diagram (rendered in conversation)
   - Link to interactive BPMN viewer artifact (file presented)
   - SIPOC table
   - RACI table (if `complete` or `partial`)
   - Any warnings (`raci_warnings`)
3. **Global view**: Mermaid of process chaining
4. **Detected breaks**: structured list with follow-up suggestions
5. **Downloadable files**:
   - `modeling-[role]-[date].json` (enriched JSON with `modeling` section)
   - `bpmn-textual-[role]-[date].md` (all BPMN textual concatenated)
   - One `process-P0X-viewer.html` per process (interactive BPMN viewer)
   - Optional: `summary-[role]-[date].md` (human-readable summary)
6. **Orientation phrase**: "This enriched JSON can be passed to `process-challenger` for critical audit of the processes."

For output files, use `/mnt/user-data/outputs/` and the `present_files` tool.

## Enriched JSON structure

```json
{
  "schema_version": "1.0 (from process-extractor)",
  "metadata": { ... inherited from extractor, unchanged ... },
  "processes": [ ... inherited, unchanged ... ],
  "global_tools": [ ... inherited ... ],
  "global_unclear_areas": [ ... inherited, possibly enriched ... ],
  "follow_up_questions": [ ... inherited ... ],
  "modeling": {
    "skill_version": "process-modeler v1",
    "modeling_date": "YYYY-MM-DD",
    "diagrams_per_process": [
      {
        "process_id": "P01",
        "mermaid": "flowchart TD\n  ...",
        "bpmn_textual": "PROCESS P01 — ...\nLANES:\n  ...",
        "bpmn_xml_path": "process-P01-viewer.html",
        "sipoc": {
          "rows": [
            { "supplier": "...", "input": "...", "process": "P01", "output": "...", "customer": "..." }
          ]
        },
        "raci": {
          "completeness": "string — enum: complete | partial | impossible",
          "matrix": [
            { "actor": "Sylvie M.", "steps": { "1": "R", "2": "R", "3": "R", "4": "R", "5": "R" } }
          ],
          "warnings": []
        }
      }
    ],
    "global_view": {
      "mermaid_process_chain": "flowchart LR\n  ...",
      "detected_breaks": [ ... ]
    }
  }
}
```

## Anti-patterns to avoid

❌ **Inventing a branch** not described in the JSON
❌ **Filling unclear areas** with "logical" steps
❌ **Inferring an Accountable** because "there must be one"
❌ **Smoothing exceptions** into the main flow — they must appear as clearly marked alternative branches
❌ **Ignoring the category** main/support in the visual treatment
❌ **Rewriting the input JSON** — you only add a `modeling` section, never modify existing sections
❌ **Producing invalid Mermaid** — always check syntax (no unescaped special characters in labels, unique IDs, closed subgraphs)
❌ **Making a verbose BPMN** — the textual notation stays synthetic, it's not a full XML diagram
❌ **Skipping the rich BPMN artifact** — it's the Talk2Flow signature visualization for deployer handoff

## Language handling

- Detect the language of the input JSON (`metadata.language` if present, otherwise from free-text content)
- Conduct the conversation with the operator in that language
- All Mermaid labels, BPMN textual content, SIPOC text, and RACI labels are in the input JSON's language
- Structural fields (JSON keys, enum values like `complete`/`partial`) remain in English
- The markdown summary is in the input JSON's language
