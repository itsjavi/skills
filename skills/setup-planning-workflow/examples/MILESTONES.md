# Milestones

Durable project roadmap, milestone state, and recommended execution order.

For active parallel work across sessions, branches, or worktrees, see [Coordination](COORDINATION.md).

## Status Legend

`Proposed` · `Active` · `Complete` · `Paused` · `Cancelled` · `Future`

## Mental Model

- `MILESTONES.md`: durable roadmap, sub-milestones/phases, plan order, and dependency state.
- `COORDINATION.md`: current active work, session/branch/worktree locations, blockers, and handoff links.
- `checkpoints/`: completed phase handoffs that let another agent or human resume safely.

## Drafted Plans

| #   | Plan                                         | Milestone | Status | Phases | Depends on | Notes                                   |
| --- | -------------------------------------------- | --------- | ------ | ------ | ---------- | --------------------------------------- |
| 01  | [Vertical slice](plans/01-vertical-slice.md) | M1        | Active | 1/5    | None       | First end-to-end loop; proves the shape |
| 02  | [Auth foundation](plans/02-auth.md)          | M1        | Future | 0/5    | Plan 01    | Route/session model after slice exists  |

## Current Focus

- **Active / next plan:** [Plan 01 — Vertical slice](plans/01-vertical-slice.md)
- **Latest checkpoint:** [Plan 01 Phase A](checkpoints/01-vertical-slice-A.md)
- **Coordination board:** [COORDINATION.md](COORDINATION.md)

## Milestone 1 — MVP Foundation

Goal: prove the smallest useful loop before adding breadth.

Recommended order:

1. **Plan 01 — Vertical slice**: build the first end-to-end path.
2. **Plan 02 — Auth**: make subsequent routes auth-aware.
3. **Plan 03 — Observability**: make operations visible.

### Sub-milestones / Phases

| Sub-milestone      | Status   | Source plan | Durable dependency |
| ------------------ | -------- | ----------- | ------------------ |
| Repo foundation    | Complete | Plan 01     | None               |
| First API contract | Active   | Plan 01     | Repo foundation    |
| First UI flow      | Proposed | Plan 01     | First API contract |
| Tests and docs     | Proposed | Plan 01     | First UI flow      |
| Final review pass  | Proposed | Plan 01     | All Plan 01 phases |

## Durable Dependencies

- UI work may use the mock API strategy from Plan 01 until the first API contract checkpoint is complete.
- Auth work should not start until Plan 01 final review is complete.
- Observability can start after the first API route exists, but should check `COORDINATION.md` for active backend work.

## How To Resume Work

1. Find the first `Active` plan in **Drafted Plans**.
2. Read [Coordination](COORDINATION.md) to see active sessions, branches, worktrees, and blockers.
3. Open the plan and its latest checkpoint in `checkpoints/`.
4. Continue from the first non-complete phase.
5. If no plan is active, pick the first `Proposed` plan in recommended order.

## Creating A New Plan

1. Pick `NN` as the next unused two-digit number.
2. Copy `templates/PLAN.md` to `plans/NN-slug.md`.
3. Add a row to this file.
4. Ensure the final phase is **Final review pass**.

## Templates

- [Decision template](templates/DECISION.md)
- [Plan template](templates/PLAN.md)
- [Checkpoint template](templates/PLAN_CHECKPOINT.md)
