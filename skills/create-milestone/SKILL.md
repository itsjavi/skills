---
name: create-milestone
description:
  Use when the user asks to create, draft, add, or update a milestone in an existing project planning workflow,
  including finding the planning root, reading GUIDE.md, choosing the next three-digit milestone number, creating or
  updating milestones/NNN-slug.md, and updating MILESTONES.md without duplicating milestone detail into the index.
---

# Milestone Creator

Create or update a milestone inside an already established planning workflow.

Do not use this skill to bootstrap, upgrade, or repair the workflow itself. If the project has no standalone
`<planning-root>/GUIDE.md`, or the user asks to modernize the workflow, use `setup-specs-workflow` instead.

## Workflow

1. Resolve the target planning root:
   - Use the root named by the user when provided.
   - Otherwise prefer a directory with `GUIDE.md` and `MILESTONES.md`.
   - Check common roots in this order: `.specs/`, `docs/`, `project-specs/`, `.agents/specs/`, `ai/`.
   - If multiple plausible roots exist, choose the one whose `GUIDE.md` describes the active workflow or ask when the
     answer is not clear.
2. Read project context in tiers:
   - Always read only the root agent guide if present, `<planning-root>/GUIDE.md`, `PRODUCT.md`, `MILESTONES.md`,
     `BUSINESS_RULES.md`, and `COORDINATION.md`.
   - Read `<planning-root>/milestones/` filenames or index rows before opening milestone records.
   - Open only milestone records, decisions, plans, checkpoints, business rules, research notes, setup docs, design
     docs, or implementation files that are directly relevant to the requested milestone.
   - Do not bulk-read the planning root or every record in a directory.
3. Minimum context sources:
   - root `AGENTS.md`, `CLAUDE.md`, or `.cursor/rules` if present
   - `<planning-root>/GUIDE.md`
   - `<planning-root>/PRODUCT.md`
   - `<planning-root>/MILESTONES.md`
   - `<planning-root>/BUSINESS_RULES.md`
   - `<planning-root>/COORDINATION.md`
4. Treat `<planning-root>/GUIDE.md` as the workflow source of truth for status vocabulary, numbering, file naming,
   template usage, and index ownership.
5. Determine whether to create a new milestone or update an existing one:
   - If the user names an existing milestone number, title, or record, update that record and its index row.
   - Otherwise create a new milestone record.
6. For a new milestone, choose `NNN`:
   - Use the user's requested number only when it is exactly three digits and unused.
   - Otherwise pick the next unused three-digit number after scanning `<planning-root>/MILESTONES.md` and
     `<planning-root>/milestones/*.md`.
   - Never reuse retired, cancelled, or superseded milestone numbers.
7. Create or update `<planning-root>/milestones/NNN-kebab-case-title.md`:
   - Prefer `<planning-root>/templates/MILESTONE.md` when present.
   - If the template is missing, follow the milestone requirements in `<planning-root>/GUIDE.md`.
   - Use `🧭 Proposed` by default unless the user explicitly says the milestone should be active, paused, blocked,
     complete, or cancelled.
   - Keep objective, scope, non-goals, related work, acceptance criteria, risks, drafted plans, phase map, and
     checkpoint rollup in the milestone record.
8. Update `<planning-root>/MILESTONES.md`:
   - Add or update the milestone index row with number, title, status, record link, and summary.
   - Keep it as an index only. Do not paste drafted-plan registries, phase maps, risks, acceptance criteria, or
     checkpoint rollups into `MILESTONES.md`.
   - Update current focus, recommended next plan, latest checkpoint, or execution order only when the user asked for
     that or the new milestone clearly changes cross-milestone state.
9. Normalize links and vocabulary:
   - Use exactly three-digit milestone IDs.
   - Use the exact status vocabulary from `GUIDE.md`.
   - Link related PRD sections, business rules, decisions, plans, checkpoints, or research notes when known.
   - Mark unknown product facts as `TBD` rather than inventing details.
10. Preserve git index state. Do not stage, unstage, commit, amend, reset, or discard files unless explicitly asked.

## Active Milestone Caution

If the user asks to make the new milestone `🚧 Active` and another milestone is already active, do not silently rewrite
roadmap focus. Ask whether to switch focus, or keep the new milestone `🧭 Proposed` and mention the conflict.

If the user only asks to "create a milestone", default to `🧭 Proposed`.

## Final Response

Report:

- milestone record created or updated
- `MILESTONES.md` row added or changed
- status and milestone number used
- related docs linked or left as `TBD`
- checks run, if any

Keep the response concise. Do not paste the full milestone unless the user asks.
