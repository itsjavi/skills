# itsjavi/skills

Personal and reusable coding-agent skills for Codex, Claude Code, and other agents that support the `SKILL.md` folder
format.

## Structure

```txt
skills/
  <skill-name>/
    SKILL.md
    references/
    assets/
    scripts/
```

Each skill is self-contained. The canonical source lives under `skills/<skill-name>`.

## Install all skills

### Codex user skills

```bash
pnpm install
pnpm skills:install codex
```

or directly:

```bash
pnpm tsx scripts/install.ts codex
```

Installs into:

```txt
~/.agents/skills
```

### Claude Code user skills

```bash
pnpm tsx scripts/install.ts claude
```

Installs into:

```txt
~/.claude/skills
```

### Project-local Codex skills

From the target project root:

```bash
/path/to/skills/scripts/install.sh repo-codex
```

Installs into:

```txt
./.agents/skills
```

### Project-local Claude skills

```bash
/path/to/skills/scripts/install.sh repo-claude
```

Installs into:

```txt
./.claude/skills
```

## Install one skill from GitHub

Some agents support installing from a GitHub folder URL:

```txt
$skill-installer install https://github.com/itsjavi/skills/tree/main/skills/create-design-guidelines
```

## Validate skills

```bash
pnpm skills:validate
```

Validation checks:

- every skill has a `SKILL.md`
- `SKILL.md` has frontmatter
- frontmatter includes `name` and `description`
- folder name matches skill name
- `registry.json` paths exist

## Available skills

- `setup-planning-workflow` - bootstraps a docs-first development workflow for new or under-documented projects. It
  creates or adapts product docs, milestones, decision records, implementation plans, checkpoints, research/setup docs,
  environment and security notes, templates, and coding-agent instructions for book-keeping implementation and docs
  aligned.
- `create-design-guidelines` - creates or updates a project design guide, usually `DESIGN.md`, for web or mobile UI
  work. It inspects the codebase when available, then writes an opinionated design-system reference covering visual
  direction, colors, typography, components, accessibility, and implementation notes for future humans and agents.
- `create-plan` - creates the next numbered implementation plan under `docs/plans/`. It reads the existing product,
  decision, and plan context, drafts a phase/checkpoint-ready plan with acceptance checks and a final review pass, and
  updates the plan index.
- `start-implementing` - drafts a paste-ready handoff prompt for a fresh agent or chat to implement an existing plan. It
  resolves a plan by number or by the next pending plan, pulls in the relevant workflow and checkpoint context, and
  includes the execution rules, validation expectations, and cautions the next agent should follow.

## Author

Maintained by [@itsjavi](https://github.com/itsjavi).
