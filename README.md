# itsjavi/skills

Reusable `SKILL.md`-based coding-agent skills and small CLI tools for Codex, Claude Code, Cursor, and compatible agents.
The collection focuses on docs-first planning workflows, implementation handoffs, and agent-friendly project memory.

## Skills

| Skill                          | Use it for                                                                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setup-planning-workflow`      | Bootstrap or upgrade a docs-first planning workflow with product docs, milestones, business rules, decisions, plans, checkpoints, setup/security/env docs, templates, and agent instructions. |
| `create-milestone`             | Create or update milestones in an established workflow; chooses the next three-digit milestone id and keeps `MILESTONES.md` as an index.                                                      |
| `create-plan`                  | Create an implementation plan, update the plan index, and ask whether implementation should start.                                                                                            |
| `create-implementation-prompt` | Draft a paste-ready prompt for implementing an existing plan, then ask whether implementation should start.                                                                                   |
| `document-decision`            | Capture or supersede major durable architecture/product/security/operational decisions when they are decision-worthy.                                                                         |
| `create-design-guidelines`     | Create or update a project `DESIGN.md` / design-system guide for web or mobile UI work.                                                                                                       |
| `find-docs`                    | Retrieve current documentation, API references, and examples for libraries, frameworks, SDKs, CLIs, and cloud services with Context7.                                                         |

Each skill lives in `skills/<skill-name>/SKILL.md`. The registry is generated from skill frontmatter.

## Tools

| Tool              | Purpose                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create-worktree` | Create a Git worktree under `../<repo>-worktrees/`, copy `.env` when present, install dependencies from the detected lockfile, and optionally launch an agent in Ghostty.                         |
| `plan-coord`      | Coordinate live planning-workflow sessions across local worktrees with Bun + SQLite. Docs stay canonical; SQLite tracks active sessions, worktree dirs, branches, claims, blockers, and handoffs. |

`plan-coord` stores its database at `$XDG_STATE_HOME/plan-coord/coord.sqlite`, or
`~/.local/state/plan-coord/coord.sqlite` when `XDG_STATE_HOME` is unset. Set `PLAN_COORD_DB` to override it.

## Rules

| Rule                         | Applies | Purpose                                                                                                                  |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `rules/token-efficiency.mdc` | Always  | Enforces terse, code-centric replies: no filler, changed snippets over full files, and minimal explanation unless asked. |

Rules are reusable agent/editor rule files. They are separate from skills and tools. There is no rules installer yet, so
copy or reference them manually in agent environments that support them.

## Install

Install dependencies:

```bash
pnpm install
```

Install all skills. Skill directories are symlinked by default:

| Target            | Command                                                 | Destination        |
| ----------------- | ------------------------------------------------------- | ------------------ |
| Codex user        | `pnpm skills:install codex`                             | `~/.agents/skills` |
| Claude user       | `pnpm skills:install claude`                            | `~/.claude/skills` |
| Cursor user       | `pnpm skills:install cursor`                            | `~/.cursor/skills` |
| Codex repo-local  | `/path/to/skills/scripts/install-skills.sh repo-codex`  | `./.agents/skills` |
| Claude repo-local | `/path/to/skills/scripts/install-skills.sh repo-claude` | `./.claude/skills` |
| Cursor repo-local | `/path/to/skills/scripts/install-skills.sh repo-cursor` | `./.cursor/skills` |

Useful installer options:

```bash
pnpm skills:install codex create-plan
pnpm skills:install codex --dry-run
pnpm skills:install codex --no-symlink
pnpm skills:install --help
```

Install tools. Tools are symlinked into `/usr/local/bin` by default. Tool files ending in `.sh` are installed without
the suffix:

```bash
pnpm tools:install
scripts/install-tools.sh --bin-dir "$HOME/.local/bin"
scripts/install-tools.sh --dry-run
scripts/install-tools.sh --no-symlink
```

## Maintenance

Run the narrowest check that matches the change:

| Command                  | Purpose                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `pnpm skills:validate`   | Validate skill folders, frontmatter, folder/name consistency, and registry entries.    |
| `pnpm generate-registry` | Regenerate `registry.json` after adding/removing skills or changing skill frontmatter. |
| `pnpm format`            | Format files with `oxfmt` and sort `package.json`.                                     |
| `pnpm typecheck`         | Type-check TypeScript maintenance scripts and tools.                                   |

Repository rules of thumb:

- Keep skill folder names and frontmatter `name` values identical.
- Keep skill descriptions accurate; they are selection metadata for agents.
- Regenerate `registry.json` after skill additions, removals, renames, or frontmatter description changes.
- Prefer improving `SKILL.md` and bundled resources over adding extra docs inside a skill folder.
- Preserve the git index; do not stage, unstage, commit, or reset unless explicitly asked.

## Structure

```txt
skills/
  <skill-name>/
    SKILL.md
    agents/          # optional UI metadata
    assets/          # optional output assets/templates
    references/      # optional reference docs
    scripts/         # optional helper scripts
tools/
  *.sh               # installed without .sh suffix
  <tool-name>/
rules/
  *.mdc
scripts/
  install-skills.*
  install-tools.sh
  generate-registry.ts
  validate-skills.ts
```

## Author

Maintained by [@itsjavi](https://github.com/itsjavi).
