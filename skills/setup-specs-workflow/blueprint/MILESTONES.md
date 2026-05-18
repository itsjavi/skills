# Milestones

General milestone index, durable project roadmap, and recommended execution order. Milestone phase maps and drafted-plan
registries live in the linked records under `milestones/`, not in this overview.

For workflow conventions, plan creation, templates, and resume rules, see [Guide](GUIDE.md). For active parallel work,
see [Coordination](COORDINATION.md). For scoped defect work, see [Bug Fixes](BUG_FIXES.md). For current product/domain
rules, see [Business Rules](BUSINESS_RULES.md). For verification and manual QA coverage, see
[Automated Checks](CHECKS.md) and [Manual QA](MANUAL_QA.md).

Last reviewed: YYYY-MM-DD

## Status Vocabulary

Use the exact status labels from [Guide: Status Vocabulary](GUIDE.md#status-vocabulary).

## Current Focus

- **Active milestone:** TBD
- **Recommended next plan:** TBD
- **Latest checkpoint:** TBD
- **Coordination board:** [COORDINATION.md](COORDINATION.md)
- **Bug-fix index:** [BUG_FIXES.md](BUG_FIXES.md)
- **Business-rule index:** [BUSINESS_RULES.md](BUSINESS_RULES.md)
- **Verification contract:** [CHECKS.md](CHECKS.md)
- **Manual QA coverage:** [MANUAL_QA.md](MANUAL_QA.md)

## Milestone Index

| #   | Milestone | Status      | Record | Summary |
| --- | --------- | ----------- | ------ | ------- |
| TBD | TBD       | 🧭 Proposed | TBD    | TBD     |

Milestone objectives, scope, drafted plans, phase maps, risks, acceptance criteria, and checkpoint rollups live in the
linked milestone records under `milestones/`. Keep this file focused on the overview and cross-milestone ordering.

## Recommended Execution Order

1. Keep [COORDINATION.md](COORDINATION.md) current for active work.
2. Use [BUG_FIXES.md](BUG_FIXES.md) and `bug-fixes/` for scoped defect reports and fixes that do not need roadmap plan
   sequencing.
3. Read [BUSINESS_RULES.md](BUSINESS_RULES.md) before changing product/domain behavior.
4. Draft or update numbered implementation plans using `MMM-PPP-slug.md`, where `MMM` is the three-digit milestone id
   and `PPP` is the next three-digit plan number inside that milestone.
5. Add or update the plan row in the target milestone record's **Drafted Plans** section.
6. Define expected deliverables for every plan phase, such as schema/migrations, endpoints, services, UI slices,
   scripts, tests, docs, checkpoints, or `None`.
7. Link the relevant automated checks from [CHECKS.md](CHECKS.md) and manual QA flows from [MANUAL_QA.md](MANUAL_QA.md).
8. Add checkpoints after each completed plan phase so future sessions can resume without chat history.
9. Create decision records before making durable architecture, product, security, or operational choices that should
   outlive an implementation plan.
