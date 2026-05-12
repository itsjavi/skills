# Coordination

Active parallel-work board for humans and agents.

Planning root: `.specs/`.

This is a live board. Keep durable roadmap state in [Milestones](MILESTONES.md), current product/domain rules in
[Business Rules](BUSINESS_RULES.md), workflow rules in [Guide](GUIDE.md), and completed phase handoffs in
`checkpoints/`.

Last reviewed: YYYY-MM-DD HH:mm TZ

## Active Work

| Owner / agent  | Branch                 | Workspace / session | Task               | Files / area owned | Depends on         | Status      | Last update      | Handoff |
| -------------- | ---------------------- | ------------------- | ------------------ | ------------------ | ------------------ | ----------- | ---------------- | ------- |
| backend-agent  | feat/api-contract      | project-api session | First API contract | `src/api/**`       | Repo foundation    | In progress | YYYY-MM-DD HH:mm | TBD     |
| frontend-agent | feat/ui-vertical-slice | project-ui session  | First UI flow      | `src/ui/**`        | First API contract | Mocking     | YYYY-MM-DD HH:mm | TBD     |
| human          | main                   | .                   | Review milestones  | `.specs/**`        | None               | Active      | YYYY-MM-DD HH:mm | TBD     |

## Blocked Or Waiting

| Owner / agent  | Waiting for             | Current fallback              | Next check                     |
| -------------- | ----------------------- | ----------------------------- | ------------------------------ |
| frontend-agent | API contract checkpoint | Use Plan 01 mock API strategy | After backend checkpoint lands |

## Coordination Rules

- Add or update your row when starting, pausing, blocking, resuming, or completing active work.
- If multiple agents share the same working directory, claim file or area ownership before editing.
- Keep rows brief; link to plans and checkpoints for details.
- Remove or archive stale rows after the work has a checkpoint and no longer needs active coordination.
- Update `.specs/MILESTONES.md` only when durable roadmap, phase, ordering, or dependency state changes.
- Update `.specs/BUSINESS_RULES.md` or `.specs/business-rules/` when current product/domain rules change.
- Durable completion details belong in checkpoints, not in this board.
- Branch/worktree inspection rules live in [Guide](GUIDE.md).
