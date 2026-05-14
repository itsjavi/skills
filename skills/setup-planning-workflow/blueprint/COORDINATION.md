# Coordination

Active parallel-work board for humans and agents.

Planning root: `.specs/`.

This is the human-readable coordination snapshot. It may be edited manually, or exported from `plan-coord` when the
local live coordinator is available. Keep durable roadmap state in [Milestones](MILESTONES.md), current product/domain
rules in [Business Rules](BUSINESS_RULES.md), workflow rules in [Guide](GUIDE.md), and completed phase handoffs in
`checkpoints/`.

Last reviewed: YYYY-MM-DD HH:mm TZ

## Active Work

| Owner / agent | Branch | Project dir / worktree | Workspace / session | Task | Files / area owned | Depends on | Status      | Last update      | Handoff |
| ------------- | ------ | ---------------------- | ------------------- | ---- | ------------------ | ---------- | ----------- | ---------------- | ------- |
| TBD           | TBD    | TBD                    | TBD                 | TBD  | TBD                | TBD        | 🧭 Proposed | YYYY-MM-DD HH:mm | TBD     |

## Blocked Or Waiting

| Owner / agent | Waiting for | Current fallback | Next check |
| ------------- | ----------- | ---------------- | ---------- |
| TBD           | TBD         | TBD              | TBD        |

## Coordination Rules

- Add or update your row when starting, pausing, blocking, resuming, or completing active work.
- If `plan-coord` is available, use it for live register, claim, update, release, and export operations.
- If multiple agents share the same working directory, claim file or area ownership before editing.
- Keep rows brief; link to plans and checkpoints for details.
- Remove or archive stale rows after the work has a checkpoint and no longer needs active coordination.
- Update `.specs/MILESTONES.md` only when milestone focus, milestone status, cross-milestone ordering, latest
  checkpoint, or overview state changes.
- Update `.specs/BUSINESS_RULES.md` or `.specs/business-rules/` when current product/domain rules change.
- Durable completion details belong in checkpoints, not in this board.
- Branch/worktree inspection rules live in [Guide](GUIDE.md).
