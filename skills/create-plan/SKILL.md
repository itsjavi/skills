---
name: create-plan
description:
  Use when the user asks to create, draft, add, or plan a new project implementation plan under docs/plans, including
  choosing the next plan number, updating the plan index, creating a phase/checkpoint-ready plan file, and asking
  whether implementation should start afterward.
---

# Plan Creator

Create a new `docs/plans/NN-slug.md` plan that matches this repo's plan workflow.

## Workflow

1. Read:
   - `AGENTS.md`
   - `docs/PRODUCT.md`
   - `docs/decisions/README.md`
   - `docs/plans/README.md`
   - related existing plans/checkpoints/ADRs for the feature area
   - `docs/DESIGN.md` for UI plans
2. Pick `NN` as the next monotonic two-digit plan number unless the user specifies one.
3. Copy the structure of `docs/templates/PLAN.md`.
4. Draft phases A, B, C... with the final phase named **Final review pass**.
5. Add the plan row to `docs/plans/README.md`.
6. If this plan updates an existing completed/pending plan instead of creating a new one, add a dated section such as:
   `## Implementation update (2026-05-11)`

## Plan Content Requirements

Include:

- Status table with all phases pending.
- Goal.
- Definition of done with testable outcomes.
- Out of scope.
- Phases with:
  - goal
  - files likely touched
  - acceptance checks
- Test infrastructure.
- File-by-file ordering.
- Risk notes.

## Documentation Drift Rule

When the new plan changes the meaning of existing plans, ADRs, setup docs, or the PRD:

- Update the closest relevant existing doc in the same turn.
- Prefer dated `Implementation update (YYYY-MM-DD)` sections for post-plan changes.
- Use a new ADR only for substantive decisions that should supersede or outlive the plan.

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

## Style

- Be concrete and implementation-oriented.
- Keep decisions traceable to ADRs/plans.
- Avoid over-designing Phase 2 work into MVP plans.
- Do not stage, unstage, or commit.
