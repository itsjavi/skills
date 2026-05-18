# Automated Checks

Canonical automated verification contract for this project. This should stay relatively low-maintenance: keep it current
when commands, test infrastructure, CI gates, generated artifacts, required services, known reliability issues, or safe
fallbacks change.

For workflow rules, see [Guide](GUIDE.md). For local setup, see [Local Development Setup](setup/local-development.md).
For secrets and configuration, see [Environment Variables](ENV_VARS.md) and [Security](SECURITY.md).

Last reviewed: YYYY-MM-DD

## Environments Covered

- Local development: TBD
- Test/CI: TBD
- Preview/staging: TBD
- Production/release: TBD
- Containers/self-hosting: TBD

## Canonical Commands

| Check                | Command | When to run                                          | Expected runtime | Deterministic? | Requires | Success signal | Notes / fallback                                        |
| -------------------- | ------- | ---------------------------------------------------- | ---------------- | -------------- | -------- | -------------- | ------------------------------------------------------- |
| Install/bootstrap    | `TBD`   | Fresh checkout or dependency changes                 | TBD              | TBD            | TBD      | TBD            | TBD                                                     |
| Format               | `TBD`   | Before final handoff when formatted files changed    | TBD              | TBD            | TBD      | TBD            | TBD                                                     |
| Lint                 | `TBD`   | Before checkpoint/final review when code changed     | TBD              | TBD            | TBD      | TBD            | TBD                                                     |
| Typecheck            | `TBD`   | After typed code changes and before final review     | TBD              | TBD            | TBD      | TBD            | TBD                                                     |
| Unit tests           | `TBD`   | For touched logic                                    | TBD              | TBD            | TBD      | TBD            | TBD                                                     |
| Integration tests    | `TBD`   | For cross-module or service behavior                 | TBD              | TBD            | TBD      | TBD            | TBD                                                     |
| E2E / browser tests  | `TBD`   | For user-facing flows                                | TBD              | TBD            | TBD      | TBD            | TBD                                                     |
| Build                | `TBD`   | Before final review when buildable artifacts changed | TBD              | TBD            | TBD      | TBD            | TBD                                                     |
| Smoke / health check | `TBD`   | After starting the app or deployment-like flow       | TBD              | TBD            | TBD      | TBD            | TBD                                                     |
| Specs workflow       | `TBD`   | When auditing `.specs` structure                     | TBD              | Yes            | TBD      | TBD            | Use the `validate-specs-workflow` skill when available. |

## CI Gates

| Gate | Source | Required for merge/release? | Local equivalent | Notes |
| ---- | ------ | --------------------------- | ---------------- | ----- |
| TBD  | TBD    | TBD                         | TBD              | TBD   |

## Known Flakes Or Slow Checks

| Check | Symptom | Current handling | Owner / follow-up |
| ----- | ------- | ---------------- | ----------------- |
| TBD   | TBD     | TBD              | TBD               |

## Circuit Breakers

Stop and ask for direction instead of looping when:

- The same check fails twice with the same error and no new evidence or changed approach.
- A required check cannot run and this file does not document a safe fallback.
- A failure appears flaky but no retry or isolation strategy is documented.
- The fix would expand beyond the active plan's scope.
- Verification requires secrets, production data, private URLs, or credentials that are not available through the
  documented setup.

When skipping a check, record the command, reason, fallback, and residual risk in the plan checkpoint or final response.

## Output Locations

| Artifact           | Location | Produced by | Notes |
| ------------------ | -------- | ----------- | ----- |
| Logs               | TBD      | TBD         | TBD   |
| Coverage report    | TBD      | TBD         | TBD   |
| Screenshots/videos | TBD      | TBD         | TBD   |
| Build artifacts    | TBD      | TBD         | TBD   |
