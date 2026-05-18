---
name: create-implementation-prompt
description:
  Use when the user asks for a prompt to start a fresh chat/agent for implementing an existing project plan, e.g. "write
  a prompt for Plan 003-001", "create the next plan implementation prompt", or "handoff prompt for
  .specs/plans/MMM-PPP-*.md". Also useful to continue a plan implementation that was stopped and is still in progress.
  After generating the prompt, ask whether implementation should start now.
---

# Create Implementation / Plan Handoff Prompt

Create a concise copy-paste prompt for a fresh coding-agent chat to implement an existing plan.

The handoff prompt should make the next agent stateless but informed: it must point to the project specs, current task
state, verification contract, manual QA expectations, and stop conditions without pasting entire source documents.

## Workflow

1. Resolve the target planning root:
   - Use the root named by the user when provided.
   - Otherwise prefer a directory with `GUIDE.md` and `MILESTONES.md`.
   - Check common roots in this order: `.specs/`, `docs/`, `project-specs/`, `.agents/specs/`, `ai/`.
   - If multiple plausible roots exist, choose the one whose `GUIDE.md` describes the active workflow or ask when the
     answer is not clear.
2. Identify the target plan:
   - If the user gives a path, use that plan.
   - If the user gives a milestone-scoped number such as `003-001`, resolve `<planning-root>/plans/003-001-*.md`.
   - If the user gives only a plan title or partial slug, search `<planning-root>/plans/`.
   - If the user says "next", read `<planning-root>/MILESTONES.md`, the active milestone record, and
     `<planning-root>/COORDINATION.md`; pick the first non-complete plan in recommended order.
3. Read context in tiers:
   - Always read only the root agent guide if present, `<planning-root>/GUIDE.md`, `MILESTONES.md`, `COORDINATION.md`,
     `CHECKS.md`, `MANUAL_QA.md`, and the target plan.
   - Read the active milestone record and latest checkpoint for the target plan when present.
   - Read `BUG_FIXES.md`, `BUSINESS_RULES.md`, bug-fix records, decisions, setup docs, security docs, env docs, design
     docs, and implementation files only when the target plan or checkpoint links to them or they materially affect the
     handoff.
   - Use `rg`, filename scans, and index rows before opening full records.
   - Do not paste or load entire source documents just to create the prompt.
4. Minimum context sources:
   - root `AGENTS.md`, `CLAUDE.md`, or `.cursor/rules` if present
   - `<planning-root>/GUIDE.md`
   - `<planning-root>/MILESTONES.md`
   - the active milestone record
   - `<planning-root>/COORDINATION.md`
   - `<planning-root>/CHECKS.md`
   - `<planning-root>/MANUAL_QA.md`
   - the target plan
   - latest relevant checkpoint for the target plan, if present
5. If plan status, milestone state, coordination state, checks, or manual QA coverage looks stale, mention that in the
   prompt as context. Do not silently rewrite docs unless the user asked to update them.
6. Generate one fenced `text` block. Keep it directly usable.
7. Ask whether the user wants implementation to start now.

## Prompt Shape

Include these sections, trimmed to what matters:

- Workspace path.
- Planning root and target plan path.
- "Please implement `<plan path>` end to end."
- Bootstrap reading checklist from the project agent guide and `<planning-root>/GUIDE.md`.
- Current context from milestone state, related bug-fix records, coordination state, business rules, decisions, and
  completed checkpoints.
- Important goals, out-of-scope items, and definition of done from the target plan.
- Workflow:
  - update plan status table per phase
  - keep specs updated before implementation continues when scope or behavior changes
  - write checkpoints after completed phases
  - use `<planning-root>/CHECKS.md` for canonical verification commands, reliability notes, and fallbacks
  - use `<planning-root>/MANUAL_QA.md` for manual QA coverage and update it when meaningful changes affect important
    user-facing or operator-facing flows
  - keep plan, checkpoint, and bug-fix `Changelog Impact` fields current when work becomes release-visible
  - do not stage, unstage, commit, amend, reset, or discard files unless explicitly asked
- Circuit breakers:
  - stop after two repeated failures of the same check with no new evidence or changed approach
  - stop when requirements, business rules, decisions, or implementation constraints conflict
  - stop when required verification cannot run and no documented fallback exists
  - stop when the work expands beyond the active plan's scope
  - stop before changing public behavior, security posture, data model, deployment flow, or manual QA coverage unless
    the relevant spec update is included
- Implementation cautions:
  - repo-specific route naming, docs sync, secrets, desired-state ownership, migrations, generated artifacts, or
    deployment concerns only when relevant
- Final review checks and manual QA expectations.

## Style

- Be specific enough that a fresh agent can start without asking for context.
- Do not paste the whole plan.
- Prefer exact file paths over vague references.
- Keep the prompt under about 140 lines.
- Make stop conditions explicit; do not encourage the next agent to keep retrying blindly.

## Implementation Offer

After generating the implementation prompt, ask the user whether they want to start implementing it now.

Prefer a native choice UI when the host makes one available:

- In Codex, if a `request_user_input` style tool is available, use it before ending the turn. Ask: "Start implementing
  this plan now?" with choices:
  - `Start implementation` - begin implementing the plan in this thread using the generated prompt as the execution
    brief.
  - `Keep prompt only` - stop after producing the handoff prompt.
- In Cursor or another host with an equivalent native quick-pick/choice UI, use the closest equivalent.

If no native choice UI is available, end the final response with a concise plain-text question:

```text
Start implementing this plan now?
- Start implementation
- Keep prompt only
```

Do not begin implementation until the user chooses or clearly says yes. If the user chooses implementation, continue in
this thread from the generated prompt and follow the target project's plan/checkpoint workflow. If the user wants a
fresh agent/chat instead, leave the prompt as the handoff artifact.
