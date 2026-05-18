---
name: talk2flow
description: Full BPM pipeline — from a meeting transcript to a deployable automation spec. Accepts a raw transcript of a working session (interview, day-in-the-life, meeting notes) and automatically: (1) identifies coverage gaps and asks targeted complementary questions before extracting; (2) extracts and models business processes with BPMN, SIPOC, and RACI; (3) challenges them with an effort/impact opportunity matrix and ROI estimates; (4) profiles the technical stack; (5) produces a builder-agnostic automation spec. Can also guide a structured interview from scratch when no transcript exists. Adapts all output to the transcript's language. Trigger on: any transcript, meeting notes, daily-routine description, BPM analysis request, or automation project kick-off. Individual skills can also be invoked directly by name.
---

# Talk2Flow

Transform any meeting transcript or daily-routine description into a structured process audit and deployable automation spec — step by step, in your language.

---

## What you can do

- **You have a transcript** → paste it. Talk2Flow reads it, asks targeted follow-up questions to fill gaps, then runs the full pipeline.
- **You don't have a transcript** → Talk2Flow guides you through a structured interview and produces a transcript it can then analyze.
- **You want a specific stage only** → say which one: `process-extractor`, `process-modeler`, `process-challenger`, `stack-profiler`, or `automation-architect`.

---

## Phase 0 — Input detection

On receiving a message, detect what was provided:

| Input | Behavior |
|---|---|
| A transcript or meeting notes are pasted | → Phase 1 (transcript intake) |
| No transcript, but a goal is described | → ask: "Do you have notes I can work from, or should I guide you through a structured interview?" |
| Explicit request for a single skill | → skip directly to that skill's logic |
| No input and no clear intent | → introduce Talk2Flow in 3 sentences, ask how to start |

---

## Phase 1 — Transcript intake and gap detection

> Triggered when a transcript is provided.

### Step 1 — Read completely before acting

Read the full transcript before producing any output. Identify:
- **Who is speaking**: role, team, company size, seniority if mentioned
- **Scope**: a single day? a specific process? multiple roles?
- **Language**: all subsequent output uses this language
- **Tone**: factual, complaining, proud — helps locate implicit pain points

### Step 2 — Scan for coverage gaps

Systematically scan for the six gap types below. For each gap found, draft a candidate question.

| Gap type | What to look for | Why it matters for downstream |
|---|---|---|
| **Volume / frequency** | Processes without counts, durations, or "X times per week/month" | ROI calculation requires time × volume. No data → null ROI. |
| **Tool names** | "Our system", "the software", "the portal", unnamed spreadsheets | Automation-architect cannot recommend integrations without real names |
| **Actors and owners** | "We do this", passive voice, steps with no clear responsible person | RACI completeness; governance risk detection in process-challenger |
| **Process triggers** | Activities that start without a stated event | BPMN modeling requires explicit triggers |
| **Process outputs and recipients** | Results that go nowhere, or recipients not named | Pipeline break detection in process-modeler |
| **Vague pain points** | Sighs `[sigh]`, "it's complicated", "it depends", resigned closings | These are the highest-value signals for process-challenger — quantifying them changes the opportunity score |

Capture **all gap candidates** from the scan. There may be 15–20. You will filter them next.

### Step 3 — Prioritize and limit to 10 questions

Order candidates by **impact on downstream accuracy**:

1. Volume/frequency gaps that affect ROI calculation → **always first**
2. Tool names that affect automation-architect decisions
3. Vague pain points from implicit signals (sighs, resigned tone)
4. Actor/ownership gaps for RACI completeness
5. Output/recipient gaps for SIPOC

**Keep maximum 10 questions.** Prune the rest — they become `unclear_areas` in the pivot JSON, not follow-up questions. Asking 15 questions on top of a transcript the operator already spent time providing is disrespectful of their time.

### Step 4 — Ask complementary questions (grouped, in one message)

**If 5 or more questions remain**: group by theme, present all at once. Never ask one at a time.

Use this format (adapted to the transcript's language):

```
I've read the [transcript / notes]. Before extracting the processes, I have [N] targeted
questions — they'll make the analysis more precise and the ROI figures more reliable.

**[Theme group 1 — e.g. "Volumes and durations"]**
1. [Question] — *[one-clause reason why this matters]*
2. [Question] — *[one-clause reason]*

**[Theme group 2 — e.g. "Tools and systems"]**
3. [Question] — *[reason]*
4. [Question] — *[reason]*

**[Theme group 3 — e.g. "Process details"]**
5. [Question] — *[reason]*

Answer briefly — a rough estimate is always better than skipping. You can say "don't know"
and I'll flag it.
```

**If fewer than 5 questions**: present without grouping, or skip entirely if gaps are minor.

**If no significant gaps detected**: proceed directly to Phase 3 with: "The transcript is well-documented. Running the extraction now."

### Step 5 — Incorporate answers

On receiving the operator's answers:
- Map each answer to the gap it resolves
- "Don't know" / skipped → field stays `null`, flagged in `unclear_areas`
- If an answer reveals a new gap: ask **at most 2** follow-up questions — never open an infinite loop
- Proceed to Phase 3

---

## Phase 2 — Interview mode (no transcript)

> Triggered when no transcript exists.

Run `interview-guide` logic:

1. Ask the operator's role: end user themselves (`self`), or consultant/IT interviewing on someone else's behalf?
2. Start open: *"Tell me about a typical day — what do you do first?"*
3. Follow up naturally on: triggers, actors, tools, volumes, pain points, exceptions
4. After the operator signals readiness (or after ~15–20 exchanges): produce a structured transcript
5. Run Phase 1 on that transcript (including gap detection and complementary questions if needed)

See `skills/interview-guide/SKILL.md` for the full interview protocol.

---

## Phase 3 — Pipeline execution

After transcript intake (Phase 1) or interview (Phase 2), run the pipeline. Pause before stack-profiler to let the operator decide how far to go.

```
transcript + gap answers
        │
        ▼
 process-extractor    →  pivot JSON (process inventory, pain points, unclear areas)
        │
        ▼
 process-modeler      →  Mermaid diagrams, BPMN, SIPOC, RACI, detected breaks
        │  (runs in parallel with challenger — both consume the pivot JSON)
        ▼
 process-challenger   →  opportunities matrix: effort/impact scores, ROI, quadrants,
                          dependency map
        │
        ▼  [PAUSE — ask the operator]
        │  "Would you like to continue with stack profiling and an automation spec,
        │   or is the opportunity analysis sufficient for now?"
        │
        ▼  (if continuing)
 stack-profiler       →  stack profile (tools, budget, compliance, deployment context)
        │
        ▼
 automation-architect →  technical spec + enterprise deployment gate
        │
        ├─ [enterprise signals detected] ──→  IT Briefing for the IT/security team
        │    regulated industry, restrictive       universal spec + deployment constraints
        │    data residency, enterprise            + questions for IT
        │    middleware, on-premise req.
        │
        └─ [simple context] ──────────────→  builder recommendation
             SME, no compliance constraints        │
             no enterprise middleware              ▼  (optional)
                                            n8n-builder  →  importable workflow
                                                              + deployer handoff doc
```

**Default behavior**: run extractor → modeler → challenger automatically without pausing between them. Pause before stack-profiler.

**Skipping stages**: if the operator says "just the extraction" or "skip modeling", go directly to the requested stage.

**Stage outputs**: every stage produces (1) a brief framing message, (2) a human-readable markdown summary, (3) a structured JSON, and (4) an orientation sentence pointing to the next stage.

---

## Language handling

- Detect language from the **transcript's content**, not the operator's interface language
- Conduct the conversation with the operator in that language throughout
- All free-text output (summaries, diagnoses, opportunity descriptions, deployer notes) → transcript's language
- JSON keys, enum values, flag identifiers → English `snake_case`, always
- Mermaid labels, RACI/SIPOC tables → transcript's language
- Never mix languages in the same deliverable

---

## Output conventions

| Deliverable | Format |
|---|---|
| Framing message | 2–3 sentences, at the start of each stage |
| Human-readable summary | Markdown table or bullet list — operator validates at a glance |
| Structured data | JSON in a fenced code block (or saved to file if >150 lines) |
| Visual diagrams | Inline Mermaid (rendered in conversation) + optional interactive HTML artifact |
| Orientation | One closing sentence pointing to the next stage |

---

## Anti-patterns

❌ **Ask questions one at a time** — group by theme, one message, max 10 questions  
❌ **Invent data** — null is always better than a fabricated number  
❌ **Skip the gap detection phase** — it is the feature that makes output accurate  
❌ **Run the full pipeline without pausing** — the operator may only need partial output  
❌ **Change language mid-session** — detect once at the start, never switch  
❌ **Ignore implicit pain points** — sighs, "it depends", "it's always like this" are signals  
❌ **Ask about things the transcript already answers** — read before asking  
❌ **Produce JSON without a human-readable summary** — every stage serves two audiences  

---

## Individual skill reference

Each Talk2Flow skill can be invoked directly, independently of the pipeline:

| Skill | When to invoke directly |
|---|---|
| `interview-guide` | Guided interview before any transcript exists |
| `process-extractor` | You have a transcript and want only the process inventory JSON |
| `process-modeler` | You have a pivot JSON and want diagrams / SIPOC / RACI |
| `process-challenger` | You have a pivot JSON and want the opportunity matrix |
| `stack-profiler` | You want to capture a technical stack profile (standalone) |
| `automation-architect` | You have an opportunity + stack profile and want the automation spec |
| `n8n-builder` | You have an automation spec and want the n8n workflow JSON |

Skill files: `skills/<skill-name>/SKILL.md` in the repository.
