---
name: validate-specs-workflow
description:
  Use when the user asks to validate, audit, check, lint, or inspect a .specs planning workflow for structural
  consistency, missing required files, broken links, stale placeholders, invalid statuses, malformed plan/checkpoint
  names, missing changelog impact fields, or incomplete CHECKS.md and MANUAL_QA.md setup. Includes a bundled
  deterministic validator script.
---

# Specs Workflow Validator

Validate a project planning workflow without judging product strategy or implementation quality.

## Workflow

1. Preserve git index state. Do not stage, unstage, commit, amend, reset, or discard files unless explicitly asked.
2. Resolve the planning root:
   - Use the path named by the user when provided.
   - Otherwise prefer a directory with `GUIDE.md` and `MILESTONES.md`.
   - Check common roots in this order: `.specs/`, `docs/`, `project-specs/`, `.agents/specs/`, `ai/`.
   - If no planning root exists, report that setup is missing and recommend `setup-planning-workflow`.
3. Run the bundled validator script from this skill folder:

   ```bash
   node skills/validate-specs-workflow/scripts/validate-specs-workflow.mjs <planning-root>
   ```

   If running from outside this skills repository, use the absolute path to the script.

4. Read only files named in validator findings when extra explanation is needed.
5. Report findings grouped by severity:
   - `FAIL`: broken contract that should be fixed before relying on the workflow
   - `WARN`: incomplete or likely-stale workflow content
   - `INFO`: useful follow-up or optional improvement

## What The Script Checks

- Required files and directories exist.
- Core templates exist.
- Plan filenames use `MMM-PPP-slug.md`.
- Checkpoint filenames use `MMM-PPP-slug-LETTER.md` and link to an existing plan.
- Plan files include required sections, including `Changelog Impact`.
- Bug-fix and checkpoint templates/records include `Changelog Impact`.
- `Changelog Impact` values use allowed categories.
- `MILESTONES.md` and `BUG_FIXES.md` links point to existing local files when they target workflow records.
- `CHECKS.md` has at least one concrete command.
- `MANUAL_QA.md` has at least one non-placeholder workflow row or workflow detail.
- Required docs are not mostly empty blueprint placeholders.
- Generated workflow docs do not reintroduce `plan-coord` recommendations.

## Limits

The validator is intentionally lightweight. It does not decide whether a milestone is wise, a plan is complete enough
for the business, or a manual QA flow is semantically correct. It checks structure, obvious omissions, and workflow
hygiene.

## Final Response

Report:

- planning root checked
- command run
- count of fails, warnings, and info findings
- highest-priority fixes with file paths

Keep the response concise. Do not paste the full script output if it is long; summarize and include the command so the
user can rerun it.
