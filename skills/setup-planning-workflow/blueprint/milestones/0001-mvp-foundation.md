# Milestone: MVP Foundation

| Field       | Value                             |
| ----------- | --------------------------------- |
| Status      | 🚧 Active                         |
| Owner       | TBD                               |
| Target date | TBD                               |
| Index row   | [MILESTONES.md](../MILESTONES.md) |

## Objective

Prove the smallest useful product loop before adding breadth.

## Scope

- First end-to-end product path.
- Minimal route/session model needed by the first loop.
- Basic operational visibility once a first route exists.

## Non-Goals

- Complete production hardening.
- Broad feature coverage outside the first useful loop.

## Related Work

- Plans: [Plan 01 - Vertical slice](../plans/01-vertical-slice.md), Plan 02 - Auth foundation, Plan 03 - Observability
- Decisions: [0001 - Runtime and storage](../decisions/0001-runtime-and-storage.md)
- Business rules: [0001 - Membership](../business-rules/0001-membership.md)
- Checkpoints: [Plan 01 Phase A](../checkpoints/01-vertical-slice-A.md)

## Phase Map

| Phase              | Status      | Related plan | Acceptance signal       |
| ------------------ | ----------- | ------------ | ----------------------- |
| Repo foundation    | ✅ Complete | Plan 01      | Phase A checkpoint      |
| First API contract | 🚧 Active   | Plan 01      | Contract checkpoint     |
| First UI flow      | 🧭 Proposed | Plan 01      | UI flow smoke check     |
| Tests and docs     | 🧭 Proposed | Plan 01      | Verification pass       |
| Final review pass  | 🧭 Proposed | Plan 01      | Final review checkpoint |

## Acceptance Criteria

- First useful product path works end to end.
- The active plan has complete checkpoints for all phases.
- Durable follow-ups are captured in plans, decisions, business rules, or setup docs.

## Risks And Open Questions

- TBD

## Checkpoint Rollup

| Checkpoint                                               | Date       | Summary               |
| -------------------------------------------------------- | ---------- | --------------------- |
| [Plan 01 Phase A](../checkpoints/01-vertical-slice-A.md) | YYYY-MM-DD | Foundation completed. |
