## Project Planning Workflow

Planning root: `.specs/`.

For planning work, follow `.specs/GUIDE.md`. It is the source of truth for document roles, status vocabulary, naming,
numbering, templates, milestones, bug fixes, plans, checkpoints, decisions, business rules, research, setup docs, and
coordination.

At the start of planning or implementation work, read:

1. This file.
2. `.specs/GUIDE.md`.
3. `.specs/PRODUCT.md` for product requirements.
4. `.specs/MILESTONES.md` for active milestone focus and recommended next plan.
5. `.specs/BUG_FIXES.md` for active defect records and scoped fix status.
6. `.specs/BUSINESS_RULES.md` for current product/domain rules.
7. `.specs/COORDINATION.md` for active parallel work, blockers, ownership, and handoffs.
8. `.specs/CHECKS.md` for canonical automated verification commands and known reliability notes.
9. `.specs/MANUAL_QA.md` for manual QA workflows and feature coverage.
10. The active milestone record, bug-fix record, plan, and latest relevant checkpoints when applicable.
11. `.specs/DESIGN.md` for UI work, if present.
12. The relevant `.specs/setup/` guide for local setup, deployment, hosting, or operations work.

Operating rules:

- Keep implementation and specs in sync. When behavior, architecture, configuration, APIs, operational flows, or
  user-facing workflows change, update the relevant spec before finishing.
- Material changes to accepted/active plans require an explicit plan update before implementation continues. Fixes,
  refactors, and unplanned implementation work must still update the relevant spec when they change behavior,
  architecture, configuration, APIs, operational flows, security posture, verification commands, manual QA coverage, or
  user-facing workflows.
- When work is release-visible, keep the nearest plan, checkpoint, or bug-fix record's `Changelog Impact` field current.
  Generate root `CHANGELOG.md` later with the `generate-changelog` skill using prepend-only dated blocks.
- Use `.specs/COORDINATION.md` for active parallel work only. Update it when work starts, pauses, blocks, resumes, or
  completes.
- Preserve git index state unless explicitly asked. Do not stage, unstage, commit, amend, reset, or switch files between
  staged and unstaged.
- Commit messages, when requested, must use Conventional Commit format: `<type>(optional-scope): <imperative summary>`.
