# itsjavi/skills

Personal and reusable coding-agent skills for Codex, Claude Code, Cursor, and other agents that support the `SKILL.md`
folder format, with a strong focus on spec-driven development.

## Available skills

- `setup-planning-workflow` - bootstraps a docs-first development workflow for new or under-documented projects. It
  creates or adapts product docs, milestone indexes and records, business-rule indexes and records, coordination docs,
  decision records, implementation plans, checkpoints, research/setup docs, environment and security notes, templates,
  and coding-agent instructions for keeping implementation and docs aligned.
- `create-design-guidelines` - creates or updates a project design guide, usually `DESIGN.md`, for web or mobile UI
  work. It inspects the codebase when available, then writes an opinionated design-system reference covering visual
  direction, colors, typography, components, accessibility, and implementation notes for future humans and agents.
- `create-milestone` - creates or updates milestones inside an established planning workflow. It follows the project
  `GUIDE.md`, chooses the next three-digit milestone number, creates or updates `milestones/NNN-slug.md`, and keeps
  `MILESTONES.md` as an index.
- `document-decision` - documents durable architecture, product, security, or operational decisions inside an
  established planning workflow. It creates or supersedes `decisions/NNN-slug.md` records when a choice is
  decision-worthy.
- `create-plan` - creates the next numbered implementation plan under `docs/plans/`. It reads the existing product,
  decision, and plan context, drafts a phase/checkpoint-ready plan with acceptance checks and a final review pass, and
  updates the plan index, then asks whether implementation should start.
- `create-implementation-prompt` - drafts a paste-ready handoff prompt for a fresh agent or chat to implement an
  existing plan. It resolves a plan by number or by the next pending plan, pulls in the relevant workflow and checkpoint
  context, includes the execution rules, validation expectations, and cautions the next agent should follow, then asks
  whether implementation should start.

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

## Install skills

Install dependencies first:

```bash
pnpm install
```

### Codex user skills

```bash
pnpm skills:install codex
```

Installs into:

```txt
~/.agents/skills
```

### Claude Code user skills

```bash
pnpm skills:install claude
```

Installs into:

```txt
~/.claude/skills
```

### Cursor user skills

```bash
pnpm skills:install cursor
```

Installs into:

```txt
~/.cursor/skills
```

### Project-local installs

From the target project root:

```bash
/path/to/skills/scripts/install-skills.sh repo-codex
/path/to/skills/scripts/install-skills.sh repo-claude
/path/to/skills/scripts/install-skills.sh repo-cursor
```

These install into:

```txt
./.agents/skills
./.claude/skills
./.cursor/skills
```

Skill directories are symlinked by default. To copy skill directories instead:

```bash
pnpm skills:install codex --no-symlink
```

To preview planned installs:

```bash
pnpm skills:install codex --dry-run
```

## Install one skill from GitHub

Some agents support installing from a GitHub folder URL:

```txt
$skill-installer install https://github.com/itsjavi/skills/tree/main/skills/create-design-guidelines
```

## Install tools

The repository also includes command-line helpers under `tools/`. Install symlinks into `/usr/local/bin` by default:

```bash
scripts/install-tools.sh
```

To use a different bin directory:

```bash
scripts/install-tools.sh --bin-dir "$HOME/.local/bin"
```

To copy files instead of symlinking them:

```bash
scripts/install-tools.sh --no-symlink
```

Files ending in `.sh` are installed without the `.sh` suffix, so `tools/create-worktree.sh` becomes `create-worktree`
and `tools/plan-coord.sh` becomes `plan-coord`.

Available tools:

- `create-worktree`: create and optionally launch an agent in a Git worktree.
- `plan-coord`: coordinate live planning-workflow sessions across local worktrees with Bun and SQLite.

`plan-coord` stores its local SQLite database at `$XDG_STATE_HOME/plan-coord/coord.sqlite`, or
`~/.local/state/plan-coord/coord.sqlite` when `XDG_STATE_HOME` is unset. Set `PLAN_COORD_DB` to override the path.

## Validate skills

```bash
pnpm skills:validate
```

Validation checks:

- every skill has a `SKILL.md`
- `SKILL.md` has frontmatter
- frontmatter includes `name` and `description`
- folder name matches skill name
- `registry.json` has matching skill names, paths, and descriptions

## Author

Maintained by [@itsjavi](https://github.com/itsjavi).
