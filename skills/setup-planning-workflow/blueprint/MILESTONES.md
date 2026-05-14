# Milestones

General milestone index, durable project roadmap, and recommended execution order. Milestone phase maps and drafted-plan
registries live in the linked records under `milestones/`, not in this overview.

For workflow conventions, plan creation, templates, and resume rules, see [Guide](GUIDE.md). For active parallel work,
see [Coordination](COORDINATION.md). For current product/domain rules, see [Business Rules](BUSINESS_RULES.md).

Last reviewed: YYYY-MM-DD

## Status Vocabulary

Use the exact status labels from [Guide: Status Vocabulary](GUIDE.md#status-vocabulary).

## Current Focus

- **Active milestone:** TBD
- **Recommended next plan:** TBD
- **Latest checkpoint:** TBD
- **Coordination board:** [COORDINATION.md](COORDINATION.md)
- **Business-rule index:** [BUSINESS_RULES.md](BUSINESS_RULES.md)

## Milestone Index

| #   | Milestone | Status      | Record | Summary |
| --- | --------- | ----------- | ------ | ------- |
| TBD | TBD       | 🧭 Proposed | TBD    | TBD     |

Milestone objectives, scope, drafted plans, phase maps, risks, acceptance criteria, and checkpoint rollups live in the
linked milestone records under `milestones/`. Keep this file focused on the overview and cross-milestone ordering.

## Recommended Execution Order

1. Keep [COORDINATION.md](COORDINATION.md) current for active work.
2. Read [BUSINESS_RULES.md](BUSINESS_RULES.md) before changing product/domain behavior.
3. Draft or update numbered implementation plans using `MMM-PPP-slug.md`, where `MMM` is the three-digit milestone id
   and `PPP` is the next three-digit plan number inside that milestone.
4. Add or update the plan row in the target milestone record's **Drafted Plans** section.
5. Define expected deliverables for every plan phase, such as schema/migrations, endpoints, services, UI slices,
   scripts, tests, docs, checkpoints, or `None`.
6. Add checkpoints after each completed plan phase so future sessions can resume without chat history.
7. Create decision records before making durable architecture, product, security, or operational choices that should
   outlive an implementation plan.
