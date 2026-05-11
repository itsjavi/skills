# Plan 01 — Vertical Slice

**Status:** Active **Owner:** TBD **Last updated:** 2026-05-11

## Status

| Phase | Title              | Status         | Started    | Completed  | Checkpoint                                       |
| ----- | ------------------ | -------------- | ---------- | ---------- | ------------------------------------------------ |
| A     | Repo foundation    | ✅ Complete    | 2026-05-11 | 2026-05-11 | [Phase A](../checkpoints/01-vertical-slice-A.md) |
| B     | First API contract | 🟡 In progress | 2026-05-11 | —          | —                                                |
| C     | First UI flow      | ⬜ Pending     | —          | —          | —                                                |
| D     | Tests and docs     | ⬜ Pending     | —          | —          | —                                                |
| E     | Final review pass  | ⬜ Pending     | —          | —          | —                                                |

Legend: `⬜ Pending` · `🟡 In progress` · `✅ Complete` · `⏸ Paused` · `❌ Cancelled`.

## Goal

Deliver the smallest end-to-end workflow that proves the product architecture.

## Definition Of Done

- [ ] A user can complete the primary MVP action.
- [ ] The workflow is covered by automated tests.
- [ ] Setup docs explain how to run it locally.
- [ ] `docs/COORDINATION.md` is updated or cleared for any active parallel work this plan created.

## Out Of Scope

- Advanced configuration.
- Multi-user administration.

## Phases

### Phase A — Repo Foundation

**Goal.** Establish the app skeleton, local setup, and baseline checks.

**Files.**

- `README.md` — quickstart.
- `docs/setup/local-development.md` — local setup.

**Acceptance.** Baseline format/typecheck/test commands pass.

### Phase B — First API Contract

**Goal.** Define and implement the first backend/API contract needed by the vertical slice.

**Files.**

- `src/api/` — API contract and route.
- `tests/api/` — contract tests.

**Acceptance.** API contract test passes and the response shape is documented for UI work.

### Phase C — First UI Flow

**Goal.** Implement the first useful user-facing path against the API contract or documented mock strategy.

**Files.**

- `src/ui/` — user-facing flow.
- `tests/ui/` — UI workflow tests.

**Acceptance.** A user can complete the primary MVP action from a fresh local setup.

### Phase D — Tests And Docs

**Goal.** Fill coverage and update docs based on implementation details.

**Acceptance.** Docs match the implemented behavior; tests cover success and failure paths.

### Phase E — Final Review Pass

**Goal.** Verify the whole plan after all phases have accumulated.

**Files.** No planned production files. Fix only defects found by review.

**Acceptance.** Re-run plan acceptance, format, typecheck, test, build, and manual QA where applicable.

## Risk Notes

- **Scope creep.** Keep the first workflow intentionally narrow.
- **Docs drift.** Update docs in the same turn as behavior changes.
- **Parallel work drift.** If another session, branch, or worktree depends on this plan, keep `docs/COORDINATION.md`
  current and create checkpoints before others rely on completed phases.
