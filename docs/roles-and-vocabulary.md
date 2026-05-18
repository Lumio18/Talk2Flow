# Roles and vocabulary

Talk2Flow uses a three-role model. Mixing them up is the most common source of bad automation specs.

## The three roles

### End user

The person whose **work is being automated**.

- May or may not be technical
- May or may not be present during the Talk2Flow session
- Their existing tools, budget, and skills are the subject of the `stack-profiler` output
- Their language is the language all final deliverables use

### Operator

The person **using Talk2Flow** — the one currently talking to Claude.

- Can be the end user themselves (`operator_role = self`)
- Can be a consultant interviewing on the end user's behalf (`operator_role = consultant`)
- Can be an internal IT/ops person working with the end user (`operator_role = internal_it`)
- Their language is the language the conversation is conducted in (usually the same as the end user, but not always)

### Deployer

The person who **ships the final automation to production**.

- Typically a developer, freelancer, internal IT, or sometimes the end user themselves
- May not be known when the session starts — `stack-profiler` captures this explicitly
- Receives a dedicated "Notes for the deployer" section in every downstream skill's output
- Has access to the technical artifacts (n8n JSON, BPMN XML, deploy doc) without needing to re-run the pipeline

## Why this matters

A single conversation can involve all three:

- A consultant (operator) interviews their client (end user) about their daily work
- The end user describes processes they want automated
- The consultant runs the full Talk2Flow pipeline
- A freelance developer (deployer) takes the final spec and ships it

Each role has different needs:

| Role | Needs from Talk2Flow |
|---|---|
| End user | Validation that the output reflects their reality; readable summaries in plain language |
| Operator | Efficient interview flow; structured intermediate artifacts; control over depth |
| Deployer | Unambiguous technical spec; explicit assumptions; gotchas flagged; nothing left to guess |

## Anti-patterns

❌ **Confusing operator and end user.** A consultant's tech comfort is irrelevant — only the end user's matters.

❌ **Assuming the operator is the deployer.** Many end users will hand off the spec to someone else. Always ask.

❌ **Producing only one level of documentation.** End users need to validate; deployers need to ship. Both audiences must be served.

❌ **Skipping the routing question.** `stack-profiler` asks operator role first thing. Don't skip it.

## Operator modes (orthogonal to role)

Independent from `operator_role`, the operator interacts in one of two modes:

| Mode | When | Behavior |
|---|---|---|
| `guided` | Default; operator wants structure | One question at a time, plain language, adaptive depth |
| `expert` | Operator asks for the schema directly | JSON skeleton emitted, operator fills it |

Mode is detected from initial signals. Operator can switch mode at any time by asking.
