# Manual QA

Live manual QA coverage map for product and operator workflows. Keep this file current when user-facing behavior, roles,
permissions, configuration, edge cases, acceptance criteria, or supported platforms change.

For workflow rules, see [Guide](GUIDE.md). For automated verification, see [Automated Checks](CHECKS.md). For product
requirements and current domain behavior, see [Product](PRODUCT.md) and [Business Rules](BUSINESS_RULES.md).

Last reviewed: YYYY-MM-DD

## Coverage Status Vocabulary

- `✅ Current`: reviewed recently and believed to match current behavior.
- `🧭 Needs review`: likely useful but may be stale or incomplete.
- `⛔ Blocked`: cannot run until a named dependency is resolved.
- `TBD`: not yet defined.

## QA Setup

- Environment: TBD
- App URL or entrypoint: TBD
- Required accounts/roles: TBD
- Required test data: TBD
- Feature flags/configuration: TBD
- Browsers/devices/accessibility modes: TBD
- Reset or cleanup steps: TBD

## Critical Journeys

| Area | Workflow | Role/persona | Status | Related specs | Last reviewed |
| ---- | -------- | ------------ | ------ | ------------- | ------------- |
| TBD  | TBD      | TBD          | TBD    | TBD           | TBD           |

## Workflow Details

### TBD Workflow

- **Status:** TBD
- **Area:** TBD
- **Role/persona:** TBD
- **Related specs:** TBD
- **Setup/data:** TBD
- **Steps:** Describe the user/operator intent and major path without brittle click-by-click detail.
- **Expected outcome:** TBD
- **Failure signals:** TBD
- **Automated coverage:** TBD
- **Notes:** TBD

## Accessibility And Platform Checks

- Keyboard navigation: TBD
- Screen reader labels and landmarks: TBD
- Focus states and focus order: TBD
- Color contrast and visual states: TBD
- Mobile/responsive behavior: TBD
- Browser/device support: TBD

## Gaps And Follow-Ups

- [ ] TBD

## Update Rules

- Add or revise a workflow when user-facing behavior changes.
- Update role/persona coverage when permissions, tenancy, auth, or onboarding changes.
- Update setup data when seeds, fixtures, feature flags, env vars, or demo accounts change.
- Link relevant plans, checkpoints, business rules, decisions, tests, screenshots, or issue trackers when known.
- Mark stale flows as `🧭 Needs review` instead of deleting useful history without replacement.
