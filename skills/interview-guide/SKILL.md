---
name: interview-guide
description: First skill in the Talk2Flow pipeline. Two modes — (1) guided interview from scratch: leads the end user or a consultant through a structured conversation about daily work and produces a clean transcript ready for process-extractor; (2) transcript review: accepts an existing transcript, scans it for coverage gaps (missing volumes, unnamed tools, vague pain points, actor gaps), and asks targeted complementary questions to enrich the data before extraction. Mode 2 is the default when a transcript is provided. Use mode 1 when starting from zero. Do NOT use to extract processes (that's process-extractor), model them (process-modeler), or challenge them (process-challenger). Adapts output language to the operator's language.
---

# Interview Guide

First skill in the Talk2Flow pipeline. Takes the operator from zero — no transcript, or an incomplete transcript — to structured material that `process-extractor` can work from reliably.

---

## Two modes

| Mode | When | Output |
|---|---|---|
| **Mode 1 — Fresh interview** | No transcript exists | Structured markdown transcript |
| **Mode 2 — Transcript review** | A transcript is provided but has gaps | Enriched data (transcript + gap answers) |

Mode 2 is the **core new capability** of Talk2Flow: don't just extract from what was said — first ask what's missing.

---

## Phase 0 — Detect mode

On receiving input:
- A transcript or notes are pasted → **Mode 2**
- No transcript, operator describes a goal → **Mode 1**
- Operator says "interview me" or "start from scratch" → **Mode 1**
- Ambiguous → default to Mode 2 if any structured content is present, Mode 1 otherwise

---

## Mode 1 — Fresh interview

### Step 1 — Operator routing (mandatory first question)

Before any other question, ask once:

> *"Quick question first — are you the person whose work we'll analyze, or are you a consultant / internal IT interviewing someone on their behalf?"*

Set `operator_role`:
- `self` → operator is the end user. Plain language, conversational tone, direct questions.
- `consultant` → interviewing on behalf of an end user. Slightly more structured; ask them to attribute statements clearly ("they said..." vs "I observed...").
- `internal_it` → hybrid; observed from the inside but in a technical role.

Default if ambiguous: assume `self`, offer to switch.

### Step 2 — Set the scene (2–3 exchanges)

- Role and team size
- Company sector and size (rough)
- What triggered the interest in BPM / automation today?
- Is there a specific process in mind, or should we cover a full working day?

### Step 3 — Discover daily routines (open, 5–10 exchanges)

Start with: *"Walk me through a typical day — what's the very first thing you do when you sit down?"*

Follow the conversation naturally. When a process emerges, dig on:
- **Volume and frequency**: "How often does that happen? How long does it take?"
- **Actors**: "Who else is involved? Who approves / validates?"
- **Tools**: "What software or system do you use for that?"
- **Pain points**: "What can go wrong? What slows you down?"
- **Exceptions**: "Is there a harder version of this that takes much longer?"

Do NOT use a checklist. Follow the energy — if the operator mentions frustration, go deeper on that process before moving on.

### Step 4 — Surface pain points explicitly (2–3 exchanges)

Ask directly: *"What's the part of your day you find most frustrating, most time-consuming, or most error-prone?"*

And: *"If you could make one thing disappear from your workload tomorrow, what would it be?"*

### Step 5 — Capture exceptions (1–2 exchanges)

For the 1–2 most mentioned pain-point processes: *"When things go wrong with [X], what do you do? Who handles it? Does it happen often?"*

### Step 6 — Confirm and finalize

Read back a brief structured summary:
> *"Here's what I captured: [3–5 process names, one-line description each]. Anything missing or wrong?"*

Allow corrections. Adjust the summary.

### Step 7 — Produce the transcript

Output:
1. **Structured markdown transcript** organized by process topic (not chronologically)
2. **Brief quality assessment**: n processes captured, completeness estimate (high/medium/low), top 3 gaps still open
3. **Transition message**: *"This transcript is ready for extraction. Shall I run the full pipeline now?"*

---

## Mode 2 — Transcript review

### Step 1 — Read the transcript completely

Before any output, read the full transcript. Build a mental model of:
- Who is speaking, in what context
- How many distinct processes are described (rough count)
- The tone (factual, complaining, proud) — crucial for locating implicit pain points

### Step 2 — Scan for coverage gaps

Scan systematically for six gap types. For each gap found, draft a candidate question — be specific: a question that cannot be answered from the transcript is the only valid question.

#### Gap type 1 — Volume and frequency gaps [HIGHEST PRIORITY]

*Why: ROI calculation requires time × volume. Without these, the opportunity matrix has null cells that cannot be filled later.*

Look for: processes mentioned without counts ("I do this regularly"), durations estimated with "it depends", frequencies expressed as "sometimes" or "often" without a range.

Good question example: *"You mentioned entering leave requests manually — roughly how many per week, and how long does each manual entry take?"*

#### Gap type 2 — Tool identification gaps

*Why: `automation-architect` cannot design integrations if tools are unnamed. "Our system" is not actionable.*

Look for: "our system", "the software", "the portal", "the database", unnamed spreadsheets, unidentified web portals.

Good question example: *"You mentioned 'the HR system' — is that Lucca, Workday, SAP SuccessFactors, or something else?"*

#### Gap type 3 — Actor and ownership gaps

*Why: RACI matrix completeness and governance risk detection in `process-challenger`.*

Look for: passive voice steps ("it gets validated", "it's sent to"), "we" without clear individual accountability, steps with multiple possible owners.

Good question example: *"When a contract amendment needs signing, is there a designated approver or does it depend on the amount / type?"*

#### Gap type 4 — Vague pain points

*Why: implicit frustration signals are the highest-value input for `process-challenger`, but only if quantified. A sigh on a 5-minute task scores differently from a sigh on a 2-hour task.*

Look for: `[sigh]`, `[long sigh]`, resigned "bon", "voilà", "you see", "it's always like this", "it depends" (recurring 3+ times), mid-sentence restarts.

Good question example: *"You sighed when describing the AG2R re-entry — roughly how many declarations do you process per week, and how long does each one take?"*

#### Gap type 5 — Process trigger gaps

*Why: BPMN modeling requires explicit triggers. A process without a stated starting event cannot be modeled correctly.*

Look for: activities that start without a stated event ("I check if...", "when needed", "from time to time").

Good question example: *"What triggers the medical visit scheduling — a calendar date, an employee's request, or a system alert?"*

#### Gap type 6 — Output and recipient gaps

*Why: SIPOC table completeness and pipeline break detection in `process-modeler`.*

Look for: processes that produce something but don't say where it goes, outputs that seem to disappear.

Good question example: *"After you generate the quarterly HR report, who receives it and in what format — emailed, presented live, uploaded to SharePoint?"*

### Step 3 — Build the question list

After the full scan:
- Collect all gap candidates (may be 15–20)
- Prioritize by impact on downstream accuracy (order as listed above)
- **Keep maximum 10 questions** — prune the rest
- The pruned gaps become `unclear_areas` in the pivot JSON, not lost

**Anti-pile-up rule**: if you have more than 10 candidates, eliminate in reverse order of impact. Never ask a question whose answer would only marginally improve a non-critical field.

Group remaining questions into **at most 3 thematic groups**. Groups of 1 are fine.

### Step 4 — Present the questions (one grouped message)

Use this format, adapted to the transcript's language:

```
I've read the [transcript / notes]. Before extracting the processes, I have [N] targeted
questions — they'll make the analysis more accurate and the ROI estimates more reliable.

**[Theme group 1, e.g. "Volumes and durations"]**
1. [Question] — *[one-clause reason: "so I can calculate the annual time cost"]*
2. [Question] — *[one-clause reason]*

**[Theme group 2, e.g. "Tools and systems"]**
3. [Question] — *[reason]*
4. [Question] — *[reason]*

**[Theme group 3, e.g. "Process details"]**
5. [Question] — *[reason]*

Answer briefly — a rough estimate is always better than skipping.
You can say "don't know" and I'll flag it as an unclear area.
```

**If fewer than 5 questions**: present without grouping.

**If no significant gaps detected**: proceed directly to extraction with: *"The transcript is well-documented — running extraction now."*

### Step 5 — Incorporate answers

On receiving the operator's answers:
- Map each answer to the gap it resolves
- "Don't know" / no answer → field stays `null` in pivot JSON, added to `unclear_areas` with a recommended follow-up question for the end user
- A new gap revealed by an answer → ask **at most 2** additional questions (flagged as second-round)
- After second-round answers, proceed regardless of remaining gaps — never open an infinite loop

### Step 6 — Transition to extraction

Brief confirmation message before proceeding:
> *"Thanks — I've incorporated your answers. Running the full extraction now."*

The enriched data (original transcript + all gap answers) is passed to `process-extractor` as a combined input. Mode 2 does not produce a separate JSON — it feeds the next stage directly.

---

## Quality rules

### What makes a good follow-up question

| Good | Bad |
|---|---|
| Targets ONE specific data point | Targets a concept ("can you tell me more about your process?") |
| Cannot be answered from the transcript | Restates what the transcript already says |
| One-sentence answer is enough | Requires explanation to answer usefully |
| Changes what the extraction will produce | Changes nothing if answered |

### On not overcrowding

**10 questions max, always.** The operator provided a transcript — don't make them re-explain everything. Pick the 10 that most change the downstream output. The rest go into `unclear_areas`.

### On implicit pain points

Never ignore a sigh or a resigned tone. These are often more valuable than explicit complaints. Address them with at most one follow-up question: *"You seemed frustrated about [X] — what specifically makes it most time-consuming?"*

If there are 3+ implicit signals in the transcript: ask about the 1 that seems most impactful (highest frequency, longest described duration, most visible frustration), not all of them.

### On numeric values

Never ask for precision when an estimate exists. If the operator said "about an hour", don't ask for the exact minute count. Accept ranges. If they said "a lot", ask for a range: "Would you say it's closer to 5 per week or 50?"

---

## Language handling

- Detect language from the transcript's content (or the operator's first message if no transcript)
- Conduct the entire session in that language
- All output (questions, transcript, summary, transition messages) → that language
- JSON keys and enum values → English `snake_case`

---

## Anti-patterns

❌ **Ask questions one at a time** — one grouped message, max 10 questions  
❌ **Ask about things already in the transcript** — read carefully before asking  
❌ **Open an infinite question loop** — two rounds maximum (initial + one follow-up)  
❌ **Ask for precision when an estimate exists** — accept ranges, don't demand exact figures  
❌ **Skip the gap scan in Mode 2** — it's the entire point of Mode 2  
❌ **Produce a Mode 1 interview when a transcript is provided** — detect mode correctly  
❌ **Ignore sighs and hesitations** — they are data, not noise  
❌ **Produce a JSON before the operator confirms the transcript** — in Mode 1, always read back and confirm first
