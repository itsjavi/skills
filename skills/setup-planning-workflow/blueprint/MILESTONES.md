# Milestones

General milestone index, durable project roadmap, and recommended execution order. Milestone phase maps and drafted-plan
registries live in the linked records under `milestones/`, not in this overview.

For workflow conventions, plan creation, templates, and resume rules, see [Guide](GUIDE.md). For active parallel work,
see [Coordination](COORDINATION.md). For current product/domain rules, see [Business Rules](BUSINESS_RULES.md).

Last reviewed: YYYY-MM-DD

## Status Legend

`🧭 Proposed` · `🚧 Active` · `⛔ Blocked` · `⏸️ Paused` · `✅ Complete` · `🛑 Cancelled`

## Current Focus

- **Active milestone:** [0001 - MVP Foundation](milestones/0001-mvp-foundation.md)
- **Recommended next plan:** [01 - Vertical slice](plans/01-vertical-slice.md)
- **Latest checkpoint:** [Plan 01 Phase A](checkpoints/01-vertical-slice-A.md)
- **Coordination board:** [COORDINATION.md](COORDINATION.md)
- **Business-rule index:** [BUSINESS_RULES.md](BUSINESS_RULES.md)

## Milestone Index

| #    | Milestone      | Status    | Record                                                                 | Summary                    |
| ---- | -------------- | --------- | ---------------------------------------------------------------------- | -------------------------- |
| 0001 | MVP Foundation | 🚧 Active | [milestones/0001-mvp-foundation.md](milestones/0001-mvp-foundation.md) | First useful product loop. |

Milestone objectives, scope, drafted plans, phase maps, risks, acceptance criteria, and checkpoint rollups live in the
linked milestone records under `milestones/`. Keep this file focused on the overview and cross-milestone ordering.

## Recommended Execution Order

1. Keep [COORDINATION.md](COORDINATION.md) current for active work.
2. Read [BUSINESS_RULES.md](BUSINESS_RULES.md) before changing product/domain behavior.
3. Draft or update numbered implementation plans using `NN-slug.md`, where `NN` is the next unused two-digit plan
   number.
4. Add or update the plan row in the target milestone record's **Drafted Plans** section.
5. Define expected deliverables for every plan phase, such as schema/migrations, endpoints, services, UI slices,
   scripts, tests, docs, checkpoints, or `None`.
6. Add checkpoints after each completed plan phase so future sessions can resume without chat history.
7. Create decision records before making durable architecture, product, security, or operational choices that should
   outlive an implementation plan.
