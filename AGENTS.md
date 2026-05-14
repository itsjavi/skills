# AGENTS.md

Instructions for coding agents working in this repository.

This repo publishes reusable `SKILL.md`-based skills for Codex, Claude Code, and compatible agents. Keep each skill
self-contained, accurate, and easy for an agent to select from metadata alone.

## Skill Change Checklist

When adding or modifying a skill, keep these files in sync:

- `skills/<skill-name>/SKILL.md`: the canonical skill source. Update frontmatter `name` and `description` whenever the
  skill's trigger, scope, or behavior changes.
- `skills/<skill-name>/agents/openai.yaml`: update or regenerate when present and the skill's display name, summary,
  default prompt, or user-facing positioning changes.
- `skills/<skill-name>/assets/`, `references/`, `scripts/`, and `examples/`: keep bundled support files aligned with the
  workflow described in `SKILL.md`. Remove stale examples instead of preserving misleading ones.
- `README.md`: keep the public catalog accurate and concise. Update the skill table when adding, removing, renaming, or
  materially repositioning a skill; update the tools table or install/maintenance notes when tool or script behavior
  changes; update the rules table when rule files are added, removed, renamed, or materially changed.
- `registry.json`: regenerate after adding/removing skills, renaming skill folders, or changing any skill frontmatter
  description.

Prefer improving the skill body and frontmatter over adding extra docs inside a skill folder. A skill folder should stay
focused on instructions and resources the agent actually needs at runtime.

## Naming And Descriptions

- Skill folder names and frontmatter names must match exactly.
- Names should read naturally in a user request, for example `create-design-guidelines for this app`.
- Descriptions are selection metadata, not marketing copy. They should state when to use the skill, what task it
  handles, and any important boundaries.
- Keep descriptions accurate enough that an agent can choose the right skill without opening every `SKILL.md`.

## Repository Scripts

Run the narrowest script that matches the change:

- `pnpm skills:validate`: validate skill structure, required frontmatter, folder/name consistency, and registry paths.
- `pnpm generate-registry`: rebuild `registry.json` from skill frontmatter. Run this after skill additions, removals,
  renames, or description changes.
- `pnpm typecheck`: type-check the TypeScript maintenance scripts.
- `pnpm format`: format the repository and sort `package.json`.
- `pnpm tools:install`: symlink top-level tools into `/usr/local/bin` by default. Pass a bin dir with
  `scripts/install-tools.sh --bin-dir <dir>` when a user-local or custom location is preferred, or pass `--no-symlink`
  to copy files instead.
- `pnpm skills:install codex`: symlink all skills into `~/.agents/skills` for manual local testing.
- `pnpm skills:install claude`: symlink all skills into `~/.claude/skills` for manual Claude Code testing.
- `pnpm skills:install cursor`: symlink all skills into `~/.cursor/skills` for manual Cursor testing.

If a sandbox blocks `tsx` from opening its local IPC pipe, rerun the same command outside the sandbox with approval.

## Formatting And Checks

When changing code or other formatted files, run `pnpm format` before finishing. For the general verification flow, run
`pnpm typecheck` first, then run `pnpm format`, then rerun any validation command whose output may have changed.

## Expected Workflows

For a new skill:

1. Create `skills/<skill-name>/SKILL.md` with focused frontmatter and concise instructions.
2. Add only the assets, examples, references, or scripts that directly support the skill.
3. Update `README.md` with a concise catalog row.
4. Run `pnpm generate-registry`.
5. Run `pnpm skills:validate`.
6. Run `pnpm typecheck` if scripts changed.
7. Run `pnpm format`.

For an existing skill:

1. Update `SKILL.md` first.
2. Adjust supporting files that would otherwise become stale.
3. Update `agents/openai.yaml`, `README.md`, and `registry.json` when the public meaning, trigger, behavior, or metadata
   changes.
4. Run `pnpm skills:validate`.
5. Run `pnpm typecheck` if scripts changed.
6. Run `pnpm format`.

For installer, registry, or validation script changes:

1. Run `pnpm typecheck`.
2. Update `README.md` when user-facing commands, install targets, tool behavior, or maintenance rules changed.
3. Run `pnpm format`.
4. Run `pnpm skills:validate`.
5. Run `pnpm generate-registry` if registry output or frontmatter parsing changed, then rerun `pnpm skills:validate`.
6. Optionally test install behavior with `pnpm skills:install codex <skill-name>` or
   `/path/to/skills/scripts/install-skills.sh repo-codex <skill-name>` from a temporary project. Use `claude`, `cursor`,
   `repo-claude`, or `repo-cursor` when changing platform-specific install behavior.

For rule changes:

1. Update files under `rules/`.
2. Update the `README.md` rules table when adding, removing, renaming, or materially changing a rule.
3. Run `pnpm format`.

## Git usage rules

- Do not stage, unstage, commit, amend, reset, or otherwise alter the git index unless the user explicitly asks. This
  repo may have staged files that belong to the human.
- When generating commit messages, use one-line Conventional Commit format:
  `<type>(optional-scope): <imperative summary>`. Do not add a body unless the user explicitly asks for one.
