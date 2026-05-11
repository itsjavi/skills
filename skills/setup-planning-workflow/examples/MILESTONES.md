# Milestones

Master implementation state and recommended execution order.

## Status Legend

`Proposed` · `Active` · `Complete` · `Paused` · `Cancelled` · `Future`

## Drafted Plans

| #   | Plan                                         | Status   | Phases | Notes                                   |
| --- | -------------------------------------------- | -------- | ------ | --------------------------------------- |
| 01  | [Vertical slice](plans/01-vertical-slice.md) | Proposed | 0/4    | First end-to-end loop; proves the shape |

## Milestone 1 — MVP Foundation

Goal: prove the smallest useful loop before adding breadth.

Recommended order:

1. **Plan 01 — Vertical slice**: build the first end-to-end path.
2. **Plan 02 — Auth**: make subsequent routes auth-aware.
3. **Plan 03 — Observability**: make operations visible.

## How To Resume Work

1. Find the first `Active` plan in **Drafted Plans**.
2. Open the plan and its latest checkpoint in `docs/checkpoints/`.
3. Continue from the first non-complete phase.
4. If no plan is active, pick the first `Proposed` plan in recommended order.

## Creating A New Plan

1. Pick `NN` as the next unused two-digit number.
2. Copy `docs/templates/PLAN.md` to `docs/plans/NN-slug.md`.
3. Add a row to this file.
4. Ensure the final phase is **Final review pass**.

## Templates

- [Decision template](templates/DECISION.md)
- [Plan template](templates/PLAN.md)
- [Checkpoint template](templates/PLAN_CHECKPOINT.md)
