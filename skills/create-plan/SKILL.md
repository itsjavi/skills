---
name: create-plan
description:
  Use when the user asks to create, draft, add, or plan a new implementation plan in an established planning workflow,
  including finding the planning root, reading GUIDE.md, choosing the next milestone-scoped plan number, updating the
  target milestone record, creating a phase/checkpoint-ready plan file, and asking whether implementation should start
  afterward.
---

# Plan Creator

Create or update an implementation plan inside an already established planning workflow.

Do not use this skill to bootstrap, upgrade, or repair the workflow itself. If the project has no standalone
`<planning-root>/GUIDE.md`, or the user asks to modernize the workflow, use `setup-planning-workflow` instead.

## Workflow

1. Resolve the target planning root:
   - Use the root named by the user when provided.
   - Otherwise prefer a directory with `GUIDE.md` and `MILESTONES.md`.
   - Check common roots in this order: `.specs/`, `docs/`, `project-specs/`, `.agents/specs/`, `ai/`.
   - If multiple plausible roots exist, choose the one whose `GUIDE.md` describes the active workflow or ask when the
     answer is not clear.
2. Read project context in tiers:
   - Always read only the root agent guide if present, `<planning-root>/GUIDE.md`, `PRODUCT.md`, `MILESTONES.md`,
     `BUG_FIXES.md`, `BUSINESS_RULES.md`, `COORDINATION.md`, `CHECKS.md`, and `MANUAL_QA.md`.
   - Read the active or requested milestone record before opening related plans or checkpoints.
   - Read `DESIGN.md`, decisions, business-rule records, bug-fix records, research notes, setup docs, security docs, env
     docs, and implementation files only when they affect the requested plan.
   - Use `rg`, filename scans, and index rows to find relevant records before opening full files.
   - Do not bulk-read all plans, checkpoints, decisions, or business-rule records.
3. Minimum context sources:
   - root `AGENTS.md`, `CLAUDE.md`, or `.cursor/rules` if present
   - `<planning-root>/GUIDE.md`
   - `<planning-root>/PRODUCT.md`
   - `<planning-root>/MILESTONES.md`
   - `<planning-root>/BUG_FIXES.md`
   - `<planning-root>/BUSINESS_RULES.md`
   - `<planning-root>/COORDINATION.md`
   - `<planning-root>/CHECKS.md`
   - `<planning-root>/MANUAL_QA.md`
4. Treat `<planning-root>/GUIDE.md` as the workflow source of truth for status vocabulary, numbering, file naming,
   template usage, spec revision rules, checkpoint expectations, and index ownership.
5. Check whether the request belongs in a bug-fix record instead of a plan:
   - Use `<planning-root>/templates/BUG_FIX.md` and update `<planning-root>/BUG_FIXES.md` when the work is primarily a
     scoped defect report and fix proposal that does not need milestone sequencing, multiple implementation phases, or
     roadmap visibility.
   - Continue with plan creation when the fix expands into broad feature work, durable architecture changes, migrations,
     cross-domain behavior, or multi-phase delivery.
6. Determine the target milestone:
   - Use the milestone named by the user when provided.
   - Otherwise use the active milestone from `<planning-root>/MILESTONES.md`.
   - If there is no active milestone, pick the clearly requested milestone or ask whether to create/select one.
7. Choose `PPP` for a new plan:
   - Use the user's requested plan number only when it is exactly three digits and unused inside the target milestone.
   - Otherwise pick the next unused three-digit plan number after scanning `<planning-root>/plans/` and the target
     milestone record's **Drafted Plans** section.
   - Never reuse cancelled, retired, or superseded plan numbers.
8. Create or update `<planning-root>/plans/MMM-PPP-kebab-case-title.md`:
   - Prefer `<planning-root>/templates/PLAN.md` when present.
   - If the template is missing, follow the plan requirements in `<planning-root>/GUIDE.md`.
   - Draft phases A, B, C... with the final phase named **Final review pass**.
   - Include definition of done, out of scope, phase acceptance checks, validation plan, manual QA impact, circuit
     breakers, risk notes, changelog impact, documentation updates, and decision-record check.
9. Update the target milestone record:
   - Add or update the plan row in the milestone record's **Drafted Plans** section.
   - Keep plan registries and phase maps in the milestone record, not in `MILESTONES.md`.
10. Update `<planning-root>/MILESTONES.md` only when cross-milestone focus changed: active milestone, recommended next
    plan, latest checkpoint, milestone status, or recommended execution order.
11. Apply the spec revision rule: material changes to accepted or active plans require an explicit plan update before
    implementation continues, and unplanned work that changes behavior, architecture, configuration, APIs, operational
    flows, security posture, manual QA coverage, verification commands, or user-facing workflows must update the closest
    relevant spec in the same turn.

12. Preserve git index state. Do not stage, unstage, commit, amend, reset, or discard files unless explicitly asked.

## Plan Content Requirements

Include:

- status table with all phases initially `🧭 Proposed`
- goal
- definition of done with testable outcomes
- out of scope
- phases with goal, likely files or areas, deliverables, and acceptance checks
- test / validation plan that references `<planning-root>/CHECKS.md`
- manual QA impact that references `<planning-root>/MANUAL_QA.md`
- changelog impact using `Added`, `Changed`, `Fixed`, `Removed`, `Security`, `Operations`, `QA / Verification`, or
  `None`, plus a short human-readable note when release-visible
- circuit breakers and stop conditions
- risk notes
- decision-record check with links to created, existing, or superseded decisions
- documentation update checklist
- final **Final review pass** phase

## Circuit Breakers

Every plan should tell implementation agents when to stop instead of looping:

- Stop after two repeated failures of the same check with no new evidence or changed approach.
- Stop when requirements, business rules, decisions, or implementation constraints conflict.
- Stop when required verification cannot run and no documented fallback exists.
- Stop when the work expands beyond the active plan's scope.
- Stop before changing public behavior, security posture, data model, deployment flow, or manual QA coverage unless the
  relevant spec update is included.

## Implementation Offer

After creating or updating the plan and reporting the files changed, ask the user whether they want implementation to
start now.

Prefer a native choice UI when the host makes one available:

- In Codex, if a `request_user_input` style tool is available, use it before ending the turn. Ask: "Implement this plan
  now?" with choices:
  - `Implement this plan` - start implementing from the new plan in this thread.
  - `Just save the plan` - stop after the plan handoff.
- In Cursor or another host with an equivalent native quick-pick/choice UI, use the closest equivalent.

If no native choice UI is available, end the final response with a concise plain-text question:

```text
Want me to start implementing this plan now?
- Implement this plan
- Just save the plan
```

Do not begin implementation until the user chooses or clearly says yes. If the user chooses implementation, continue
from the plan using the project's normal plan/checkpoint workflow. If a separate fresh-agent handoff is more
appropriate, offer or generate an implementation prompt instead of editing code immediately.

## Final Response

Report:

- plan or bug-fix record created or updated
- milestone record or `BUG_FIXES.md` row added or changed
- plan or bug-fix number and status used
- related checks/manual QA/spec docs updated or left as `TBD`
- checks run, if any

Keep the response concise. Do not paste the full plan or bug-fix record unless the user asks.
