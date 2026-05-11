# Plan 01 — Vertical Slice

**Status:** Proposed **Owner:** TBD **Last updated:** 2026-05-11

## Status

| Phase | Title             | Status     | Started | Completed | Checkpoint |
| ----- | ----------------- | ---------- | ------- | --------- | ---------- |
| A     | Repo foundation   | ⬜ Pending | —       | —         | —          |
| B     | First workflow    | ⬜ Pending | —       | —         | —          |
| C     | Tests and docs    | ⬜ Pending | —       | —         | —          |
| D     | Final review pass | ⬜ Pending | —       | —         | —          |

Legend: `⬜ Pending` · `🟡 In progress` · `✅ Complete` · `⏸ Paused` · `❌ Cancelled`.

## Goal

Deliver the smallest end-to-end workflow that proves the product architecture.

## Definition Of Done

- [ ] A user can complete the primary MVP action.
- [ ] The workflow is covered by automated tests.
- [ ] Setup docs explain how to run it locally.

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

### Phase B — First Workflow

**Goal.** Implement the first useful end-to-end action.

**Files.**

- `src/` — product code.
- `tests/` — workflow tests.

**Acceptance.** Workflow test passes from a fresh local setup.

### Phase C — Tests And Docs

**Goal.** Fill coverage and update docs based on implementation details.

**Acceptance.** Docs match the implemented behavior; tests cover success and failure paths.

### Phase D — Final Review Pass

**Goal.** Verify the whole plan after all phases have accumulated.

**Files.** No planned production files. Fix only defects found by review.

**Acceptance.** Re-run plan acceptance, format, typecheck, test, build, and manual QA where applicable.

## Risk Notes

- **Scope creep.** Keep the first workflow intentionally narrow.
- **Docs drift.** Update docs in the same turn as behavior changes.
