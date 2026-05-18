---
name: document-decision
description:
  Use when the user asks to document, capture, record, create, or supersede an architecture/product/security/operational
  decision in an existing project planning workflow, including ADR-style decision records for major durable choices. If
  called with no explicit decision text, infer the latest major durable decision from the current chat; if there are
  multiple plausible decisions or the decision is unclear, ask a concise clarifying question before editing.
---

# Decision Documenter

Document a major, durable project decision inside an already established planning workflow.

Use this skill for requests like:

- "document-decision that we will replace Prisma with Drizzle"
- "write an ADR for choosing X over Y"
- "capture the tradeoff we just discussed"
- "supersede the old decision about auth"
- "should this be a decision record?"

Do not use this skill to bootstrap, upgrade, or repair the workflow itself. If the project has no standalone
`<planning-root>/GUIDE.md`, or the user asks to modernize the workflow, use `setup-specs-workflow` instead.

## No-Argument Mode

When the user invokes this skill without explicit decision text, infer the decision from the latest major durable
decision made in the current chat session.

Before editing:

- If exactly one recent major durable decision is clear, document that decision.
- If several decisions were discussed, ask which one to document.
- If the discussion was exploratory and no durable choice was made, ask for the decision or say it belongs in research,
  a plan, or a checkpoint instead.

Do not invent a decision from vague conversation history.

## Workflow

1. Resolve the target planning root:
   - Use the root named by the user when provided.
   - Otherwise prefer a directory with `GUIDE.md` and `MILESTONES.md`.
   - Check common roots in this order: `.specs/`, `docs/`, `project-specs/`, `.agents/specs/`, `ai/`.
   - If multiple plausible roots exist, choose the one whose `GUIDE.md` describes the active workflow or ask when
     unclear.
2. Read project context in tiers:
   - Always read only the root agent guide if present, `<planning-root>/GUIDE.md`, `PRODUCT.md`, `BUSINESS_RULES.md`,
     and `MILESTONES.md`.
   - Scan `<planning-root>/decisions/` filenames and use `rg` for relevant terms before opening decision records.
   - Open only existing decisions that may be superseded, contradicted, or directly related.
   - Read plans, checkpoints, business-rule records, research notes, setup docs, security docs, env docs, or
     implementation files only when they affect the decision.
   - Do not bulk-read every decision or every planning record.
3. Minimum context sources:
   - root `AGENTS.md`, `CLAUDE.md`, or `.cursor/rules` if present
   - `<planning-root>/GUIDE.md`
   - `<planning-root>/PRODUCT.md`
   - `<planning-root>/BUSINESS_RULES.md`
   - `<planning-root>/MILESTONES.md`
4. Treat `<planning-root>/GUIDE.md` as the workflow source of truth for status vocabulary, numbering, file naming,
   template usage, and supersession rules.
5. Run the decision-worthiness check.
6. Create, supersede, or decline:
   - Create a new decision when there is a major durable choice with meaningful alternatives, consequences, or future
     impact.
   - Supersede an existing accepted decision when the new choice changes or replaces it.
   - Decline to write a decision when the topic is local sequencing, implementation detail with no durable tradeoff, or
     unresolved exploration. Tell the user where it belongs instead.
7. Choose `NNN` for a new decision:
   - Use the user's requested number only when it is exactly three digits and unused.
   - Otherwise pick the next unused three-digit number after scanning `<planning-root>/decisions/*.md`.
   - Never reuse retired, deprecated, or superseded decision numbers.
8. Write `<planning-root>/decisions/NNN-kebab-case-title.md`:
   - Prefer `<planning-root>/templates/DECISION.md` when present.
   - If the template is missing, follow the decision requirements in `<planning-root>/GUIDE.md`.
   - Use `✅ Accepted` when the user states the decision is made. Use `🧭 Proposed` only when the user is asking to
     draft a decision for review.
   - Include context, decision, consequences, alternatives considered, and follow-ups.
   - Link related product requirements, milestones, business rules, plans, checkpoints, research notes,
     setup/security/env docs, and implementation surfaces when known.
9. If superseding an existing decision:
   - Create a new decision record for the replacement.
   - Update the old decision status to `🗄️ Superseded by NNN` unless project guidance says otherwise.
   - Cross-link the old and new records.
10. Update related docs only when needed: update `BUSINESS_RULES.md` or `business-rules/` when current product/domain
    behavior changes, milestone records or plans when roadmap or implementation sequencing changes, and setup, security,
    env, or design docs when operating rules change.
11. Preserve git index state. Do not stage, unstage, commit, amend, reset, or discard files unless explicitly asked.

## Decision-Worthiness Check

A decision record is usually warranted when the choice is important enough for future agents to understand and:

- selects between meaningful alternatives
- makes a big refactor, architecture shift, persistence/auth/security/deployment change, API strategy change, data-model
  direction change, tenancy decision, or long-lived convention
- accepts a tradeoff future agents should not relitigate
- supersedes or contradicts a previous accepted decision
- turns research or a plan discovery result into committed direction
- affects multiple plans, milestones, systems, teams, or operational surfaces

A decision record is usually not warranted when the note is only:

- a routine endpoint, schema, field, UI copy, validation, or configuration change
- a task ordering choice inside one plan
- a temporary implementation detail
- unresolved brainstorming
- a bug fix with no durable tradeoff
- a checkpoint observation that does not change future direction

## Plan Work Rule

When this skill is invoked from plan creation or implementation work, document a decision automatically only for major
choices beyond the local plan. For example, a broad refactor may warrant a decision record; adding a field to one API
endpoint usually belongs in the plan, checkpoint, or business-rule docs instead. Keep local sequencing and phase-level
observations in the plan or checkpoint.

## Final Response

Report:

- decision record created, superseded, or intentionally not created
- decision number, title, and status
- existing decision superseded, if any
- related docs updated or left unchanged
- checks run, if any

Keep the response concise. Do not paste the full decision unless the user asks.
