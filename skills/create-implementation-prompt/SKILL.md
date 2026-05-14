---
name: create-implementation-prompt
description:
  Use when the user asks for a prompt to start a fresh chat/agent for implementing an existing project plan, e.g. "write
  a prompt for Plan 16", "create the next plan implementation prompt", or "handoff prompt for docs/plans/NN-*.md". Also
  useful to continue a plan implementation that was stopped and is still in progress. After generating the prompt, ask
  whether implementation should start now.
---

# Create Implementation / Plan Handoff Prompt

Create a concise copy-paste prompt for a new coding-agent chat to implement an existing plan.

## Workflow

1. Identify the target plan:
   - If the user gives a number, resolve `docs/plans/NN-*.md`.
   - If the user says "next", read `docs/plans/README.md` and pick the first non-complete implementation plan in roadmap
     order.
2. Read:
   - `AGENTS.md`
   - `docs/plans/README.md`
   - the target plan
   - the latest checkpoint for each important dependency, especially final `*-G.md` / last-phase checkpoints.
3. If plan status/index looks stale, mention that in the prompt as context rather than silently correcting it.
4. Generate one fenced `text` block. Keep it directly usable.
5. Ask whether the user wants implementation to start now.

## Prompt Shape

Include these sections, trimmed to what matters:

- Workspace path.
- "Please implement `<plan path>` end to end."
- Bootstrap reading checklist from `AGENTS.md`.
- Current context from completed dependency checkpoints.
- Important goals from the target plan.
- Workflow:
  - update plan status table per phase
  - write checkpoints
  - run typecheck after each phase
  - run format/test/build/e2e after every 2 phases and final review unless acceptance requires more
  - do not stage/unstage/commit/reset
- Implementation cautions:
  - repo-specific route naming, docs sync, secrets, desired-state ownership, etc. only when relevant
- Final review checks and manual QA expectations.

## Style

- Be specific enough that a fresh agent can start without asking for context.
- Do not paste the whole plan.
- Prefer exact file paths over vague references.
- Keep the prompt under about 120 lines.

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
