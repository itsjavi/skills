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
- `README.md`: update the skill catalog when adding, removing, renaming, or materially repositioning a skill.
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
- `pnpm skills:install codex`: install all skills into `~/.agents/skills` for manual local testing.
- `pnpm tsx scripts/install.ts claude`: install all skills into `~/.claude/skills` for manual Claude Code testing.

If a sandbox blocks `tsx` from opening its local IPC pipe, rerun the same command outside the sandbox with approval.

## Expected Workflows

For a new skill:

1. Create `skills/<skill-name>/SKILL.md` with focused frontmatter and concise instructions.
2. Add only the assets, examples, references, or scripts that directly support the skill.
3. Update `README.md`.
4. Run `pnpm generate-registry`.
5. Run `pnpm skills:validate`.
6. Run `pnpm typecheck` if scripts changed.

For an existing skill:

1. Update `SKILL.md` first.
2. Adjust supporting files that would otherwise become stale.
3. Update `agents/openai.yaml`, `README.md`, and `registry.json` when the public meaning or metadata changes.
4. Run `pnpm skills:validate`.
5. Run `pnpm typecheck` if scripts changed.

For installer, registry, or validation script changes:

1. Run `pnpm typecheck`.
2. Run `pnpm skills:validate`.
3. Run `pnpm generate-registry` if registry output or frontmatter parsing changed.
4. Optionally test install behavior with `pnpm skills:install codex <skill-name>` or
   `pnpm tsx scripts/install.ts repo-codex <skill-name>` from a temporary project.

## Git

Do not stage, unstage, commit, amend, reset, or otherwise alter the git index unless the user explicitly asks. This repo
may have staged files that belong to the human.
