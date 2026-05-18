# Contributing to Talk2Flow

Thanks for considering a contribution. Talk2Flow is a curated framework, not a free-for-all skill dump — every contribution should align with the principles below.

## Ground rules

1. **Talk2Flow is a pipeline, not a skill library.** Every skill has a defined role in the chain. Read [docs/architecture.md](docs/architecture.md) before proposing a new one.
2. **All skills are written in English.** User-facing output adapts to the operator's language. See [docs/ux-conventions.md](docs/ux-conventions.md).
3. **Skills follow a consistent format.** See [Skill structure](#skill-structure) below.
4. **Two audiences per skill: operator and deployer.** Skills that produce technical artifacts should include a "Notes for the deployer" section in their output.
5. **No tool pushing.** Talk2Flow maps what users have, it doesn't sell them new tools. Recommendations come from `automation-architect`, never from upstream skills.

## How to contribute

### Reporting issues

Use the issue templates in `.github/ISSUE_TEMPLATE/`. Include:
- Which skill is involved
- A minimal reproduction (transcript or input that triggers the issue)
- Expected vs actual output

### Proposing a new skill

Open a discussion first. A new skill is justified only if:
- It fills a clear gap in the pipeline (see [docs/architecture.md](docs/architecture.md))
- It doesn't overlap with an existing skill's contract
- Its output is consumable by an existing or planned downstream skill

### Improving an existing skill

PRs welcome. Each PR should:
- Touch one skill at a time
- Update the skill's `references/` if the JSON schema changes
- Update the relevant demo in `demos/` if the output format changes

## Skill structure

Every skill folder follows the same layout:

```
skills/<skill-name>/
├── SKILL.md                  the skill prompt itself (Claude skill format)
└── references/               supporting documents the skill loads on demand
    ├── <schema-name>.md      JSON schemas, taxonomies, examples
    └── ...
```

The `SKILL.md` frontmatter must include `name` and `description`. The description tells Claude when to invoke the skill — be precise about triggers and anti-triggers.

## Demo contributions

End-to-end demos live in `demos/<demo-name>/` and contain every artifact of a complete pipeline run: input transcript, all intermediate JSON outputs, final automation spec, deployer doc.

Demos are how people decide whether Talk2Flow is for them. Quality matters more than quantity.

## Language and localization

The framework's source code, skill metadata, README, docs, and JSON keys are in English. User-facing content (markdown summaries, opportunity lists, deployer notes) is produced in the operator's language by each skill.

Do not commit content that mixes languages in structural fields.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Disagreements are welcome; disrespect is not.
