# MMM-PPP — Plan Title

- **Status:** 🧭 Proposed
- **Owner:** TBD
- **Created:** YYYY-MM-DD
- **Milestone:** [MMM - Milestone Title](../milestones/MMM-milestone-title.md)
- **Depends on:** TBD

## Goal

Describe the scoped outcome this plan should deliver.

## Definition of Done

- [ ] User-facing, operator-facing, or developer-facing behavior works, if applicable.
- [ ] Project architecture and ownership boundaries are respected.
- [ ] Phase deliverables are completed, intentionally deferred, or marked not applicable.
- [ ] Human QA steps are documented in **How to QA**.
- [ ] Relevant docs are updated.
- [ ] Decision record needs are resolved in **Decision Records**.
- [ ] Verification checks have run or skipped checks are explained.

## Out of Scope

- Item intentionally deferred.

## Phase Status

| Phase                   | Status      | Started | Completed | Checkpoint |
| ----------------------- | ----------- | ------- | --------- | ---------- |
| A — Discovery and shape | 🧭 Proposed | TBD     | TBD       | TBD        |
| B — Implementation      | 🧭 Proposed | TBD     | TBD       | TBD        |
| C — Validation and docs | 🧭 Proposed | TBD     | TBD       | TBD        |
| D — Final review pass   | 🧭 Proposed | TBD     | TBD       | TBD        |

## Phases

### Phase A — Discovery and Shape

Scope:

- Confirm requirements, existing code paths, dependencies, and risks.

Deliverables:

- Requirements/code-path notes, risk decisions, or `None` if discovery only confirms the existing plan.

Acceptance checks:

- [ ] Relevant docs and code areas identified.
- [ ] Existing decisions reviewed; **Decision Records** is set to `Needed`, `Not needed`, `Created`, or `Superseded`.
- [ ] Plan updated if discovery changes scope.

### Phase B — Implementation

Scope:

- Implement the scoped code or documentation changes.

Deliverables:

- Concrete artifact(s) for this phase, such as schema changes, services, handlers/controllers/routes, UI components,
  APIs, scripts, tests, or docs.

Acceptance checks:

- [ ] Implementation matches project conventions.
- [ ] Major durable choices made during implementation are captured or superseded in `../decisions/`.
- [ ] Docs-sync needs are handled.

### Phase C — Validation and Docs

Scope:

- Run focused checks and update related docs.

Deliverables:

- Verification results, docs updates, QA notes, and any required checkpoint or follow-up records.

Acceptance checks:

- [ ] Checks pass or failures are documented.
- [ ] **How to QA** describes the manual workflow a human should follow.
- [ ] Decision links are current in this plan and any checkpoint created in this phase.
- [ ] Relevant docs are updated.

### Phase D — Final Review Pass

Scope:

- Review diff, verify no unrelated churn, and capture final follow-ups.

Deliverables:

- Final checkpoint/handoff updates and explicit follow-up list, or `None` if there are no remaining artifacts.

Acceptance checks:

- [ ] Diff is scoped.
- [ ] Checkpoint exists for completed phases.
- [ ] **Decision Records** is no longer `TBD`; linked decisions exist or the plan explains why none were needed.
- [ ] Handoff is clear.

## Test / Validation Plan

- Typecheck command: `TBD`, when typed code changed.
- Lint/format command: `TBD`, before final handoff when scope is broad.
- Additional focused tests: `TBD`.

## How to QA

Assume the relevant local system, package, service, app, or docs preview is available when applicable. Describe the main
manual QA flows a human should walk through without turning this into an exhaustive click-by-click script. Name the
relevant area, command, route, or workflow, the user/operator/developer intent, and the expected outcome.

- Flow: `TBD`.
- Flow: `TBD`.
- Expected result: `TBD`.

## Risk Notes

- TBD.

## Decision Records

- Decision check: `TBD` (`Needed`, `Not needed`, `Created`, or `Superseded`).
- Related decisions: `TBD`.
- New decision records: `TBD`.
- Superseded decisions: `TBD`.
- Notes: if this plan chooses between major durable project approaches, create or supersede a decision record in
  `../decisions/`. Routine endpoint fields, small schema additions, local sequencing choices, and phase-level
  implementation details can stay in this plan or its checkpoints.

## Documentation Updates

- [ ] `../PRODUCT.md`
- [ ] `../MILESTONES.md`
- [ ] `../milestones/`
- [ ] `../BUSINESS_RULES.md`
- [ ] `../business-rules/`
- [ ] `../COORDINATION.md`
- [ ] `../DESIGN.md`
- [ ] `../ENV_VARS.md`
- [ ] `../SECURITY.md`
- [ ] Decision records / setup docs / research notes as needed.
