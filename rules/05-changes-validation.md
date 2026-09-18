## 05 - Validation of changes

- Run the minimum meaningful checks needed to establish correctness unless the user or project instructions require
  broader QA.
- Prefer targeted unit, integration, type, lint, build, or end-to-end checks appropriate to the changed surface.
- Broaden validation when the change is cross-cutting, risky, architectural, migration-related, security-sensitive, or
  when targeted checks expose uncertainty.
- Do not rerun already-passing broad suites unless later changes can affect them.
- Report checks that were run, failures encountered, and anything relevant that could not be verified.
