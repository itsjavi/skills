# Upgrading Existing Planning Workflows

Use this guide when a project already has an older setup-planning-workflow installation and needs to adopt the current
blueprint, standalone `GUIDE.md`, status vocabulary, three-digit numbering, and optional `plan-coord` live coordinator.

Treat the upgrade as a migration, not a reinstall. Preserve project truth, replace workflow rules where the blueprint is
canonical, and report anything that still needs human review.

## Resource Path Rules

This guide refers to two different roots:

- **Skill resources:** this skill folder, including `SKILL.md`, `UPGRADING.md`, and the bundled `blueprint/` directory.
- **Target project files:** the project being upgraded, especially its chosen `<planning-root>/`.

When this guide says `blueprint/...`, read from this skill folder's bundled `blueprint/` directory. When it says
`<planning-root>/...`, read or write the target project's planning docs. Do not use a target project's old templates or
old guide as the source for "latest blueprint" replacements.

## Preflight

Before editing:

- Inspect the current planning root, root agent guide, README, and existing workflow docs.
- Read the current `GUIDE.md`, `MILESTONES.md`, `BUSINESS_RULES.md`, `COORDINATION.md`, active milestone records, active
  plans, and latest relevant checkpoints when they exist.
- Check whether any active work rows, blockers, or handoffs in `COORDINATION.md` still matter.
- Preserve the user's git index state. Do not stage, unstage, commit, amend, reset, or discard files unless explicitly
  asked.
- Identify project-specific template customizations before replacing templates.

## Upgrade Strategy

Prefer three categories of changes:

- Replace files that are workflow rules or reusable scaffolds.
- Merge files that contain project truth.
- Initialize live coordination only when `plan-coord` is available.
- Create missing required files and directories from this skill folder's current blueprint, using `TBD` where project
  facts are unknown.

Before editing, identify the planning root. Common roots are `.specs/`, `docs/`, `project-specs/`, `.agents/specs/`, or
`ai/`. Use the existing root unless the user explicitly asks to move it.

## Replace From Blueprint

These files can usually be replaced from this skill folder's bundled `blueprint/` directory:

- `<planning-root>/GUIDE.md`
- `<planning-root>/templates/DECISION.md`
- `<planning-root>/templates/MILESTONE.md`
- `<planning-root>/templates/BUSINESS_RULE.md`
- `<planning-root>/templates/PLAN.md`
- `<planning-root>/templates/PLAN_CHECKPOINT.md`

Replace templates when they are generic, stale, or only lightly customized. If a project has intentional custom template
requirements, merge in the current required vocabulary, numbering, final review phase, docs-sync checklist, and
checkpoint expectations instead of deleting those local conventions.

Copy this skill folder's `blueprint/GUIDE.md` to `<planning-root>/GUIDE.md` nearly verbatim. Adapt only:

- planning root paths, such as `.specs/`
- `[project name]`
- links or examples that must change because the planning root is not `.specs/`

Do not rewrite the guide's rules, document roles, lifecycle guidance, vocabulary, or workflow sections to match local
tone. The goal is for users to be able to say: "following `<planning-root>/GUIDE.md`, elaborate a milestone/plan for
...".

## Replace Or Carefully Merge

`<planning-root>/COORDINATION.md` is volatile. Replace it from this skill folder's `blueprint/COORDINATION.md` when it
only contains stale examples. If it contains current active work, preserve the useful rows or use `plan-coord export-md`
after registering the active sessions.

If `plan-coord` is unavailable, manually update `COORDINATION.md` to the current active-work snapshot format and keep
the meaningful active rows, blockers, ownership notes, project directories, branches, worktree paths, and handoff links.

## Merge, Do Not Replace

Preserve the actual project content in these files:

- `<planning-root>/PRODUCT.md`
- `<planning-root>/MILESTONES.md`
- `<planning-root>/milestones/*.md`
- `<planning-root>/BUSINESS_RULES.md`
- `<planning-root>/business-rules/*.md`
- `<planning-root>/decisions/*.md`
- `<planning-root>/plans/*.md`
- `<planning-root>/checkpoints/*.md`
- `<planning-root>/ENV_VARS.md`
- `<planning-root>/SECURITY.md`
- `<planning-root>/setup/*.md`
- `<planning-root>/DESIGN.md`, when present
- root `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, or equivalent

For these files, migrate structure and vocabulary without deleting project-specific requirements, decisions, status
history, implementation notes, setup details, or checkpoints.

When a required project-truth file is missing, create it from this skill folder's current blueprint and seed only what
can be inferred. Mark unknown product, security, env, setup, or operational facts as `TBD`.

For setup docs, merge current bundled blueprint structure only where it improves clarity. Do not invent a hosting,
deployment, container, database, CI, or operations model that the repository does not show.

## Required Normalization

Bring older workflows in line with the current guide:

- All numbered docs use exactly three digits.
- Decisions, milestones, and business rules use `NNN-kebab-case-title.md`.
- Plans use `MMM-PPP-slug.md`.
- Checkpoints use `MMM-PPP-slug-LETTER.md`.
- Milestones, plans, and phases use `🧭 Proposed`, `🚧 Active`, `⛔ Blocked`, `⏸️ Paused`, `✅ Complete`, or
  `🛑 Cancelled`.
- Business rules use `🧭 Proposed`, `✅ Active`, `🗄️ Superseded`, or `🧹 Deprecated`.
- Decisions use `🧭 Proposed`, `✅ Accepted`, `🗄️ Superseded`, or `🧹 Deprecated`.
- `MILESTONES.md` stays an index of milestones only. Drafted-plan registries, phase maps, risks, acceptance criteria,
  and checkpoint rollups live in milestone records.
- If file renames are needed to reach three-digit numbering, update all links and references in the same turn.
- Do not reuse retired numbers.
- `AGENTS.md` or equivalent stays thin. It should point to `<planning-root>/GUIDE.md` instead of duplicating guide
  rules. If no root agent guide exists, the workflow can still be valid because `GUIDE.md` is standalone; create an
  agent guide only when the user wants one or the project convention clearly expects one.

## Optional Live Coordination

If `plan-coord` is installed, initialize or refresh its local coordination cache from the project root:

```bash
plan-coord init --planning-root <planning-root>
plan-coord sync-docs
plan-coord export-md --out <planning-root>/COORDINATION.md
```

Docs remain canonical for milestones, plans, checkpoints, decisions, and business rules. SQLite is authoritative only
for live local coordination state: active sessions, worktree directories, branches, claims, blockers, and transient
handoffs.

By default, `plan-coord` stores its SQLite database at `$XDG_STATE_HOME/plan-coord/coord.sqlite`, or
`~/.local/state/plan-coord/coord.sqlite` when `XDG_STATE_HOME` is unset. `PLAN_COORD_DB` overrides this location.

Run `plan-coord sync-docs` again after substantial doc renames or status migrations so the local metadata cache matches
the upgraded docs.

## Agent Prompt

Use this prompt when asking an agent to upgrade a project:

```text
Upgrade this project's planning workflow to the latest setup-planning-workflow conventions.

Planning root: <docs-or-.specs>

Use the latest setup-planning-workflow skill folder as the workflow source. Read bundled blueprint files from that skill
folder, not from the target project. Replace <planning-root>/GUIDE.md nearly verbatim, adapting only the planning root
path, project name, and links. Replace templates from the latest bundled blueprint unless the project has intentional
customizations.

Do not overwrite project truth. Preserve and migrate existing PRODUCT.md, MILESTONES.md, milestone records,
BUSINESS_RULES.md, business-rule records, decisions, plans, checkpoints, ENV_VARS.md, SECURITY.md, and setup docs.

Normalize vocabulary and numbering:
- all numbered docs use exactly three digits
- plans use MMM-PPP-slug.md
- checkpoints use MMM-PPP-slug-LETTER.md
- use the GUIDE.md status vocabulary with emoji

Update COORDINATION.md to the new active-work snapshot format. If plan-coord is available, run:
plan-coord init --planning-root <planning-root>
plan-coord sync-docs
plan-coord export-md --out <planning-root>/COORDINATION.md

Update AGENTS.md or equivalent only as a thin cockpit checklist that points to <planning-root>/GUIDE.md. Do not
duplicate GUIDE.md rules there. If no root agent guide exists, keep GUIDE.md standalone unless the project convention or
user request calls for creating one.

Before finishing, report which files were replaced, which were merged, and any project docs that still need human
review.
```

## Final Report Checklist

In the final response, report:

- planning root used
- files replaced from blueprint
- files merged or preserved
- numbering/status migrations performed
- links updated after file renames
- missing required files created with `TBD`
- whether `plan-coord` was initialized or unavailable
- any files that still need human review
