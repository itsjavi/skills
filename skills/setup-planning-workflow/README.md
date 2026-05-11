# Setup Planning Workflow Rationale

This skill bootstraps a docs-first development workflow for projects where humans and coding agents may work across
parallel sessions, branches, or worktrees.

The core idea is to make project state durable where it should be durable, and intentionally short-lived where it should
be short-lived. Instead of relying on chat history, memory, or a single long-running agent, the project gets written
state that any agent or human can read before acting.

## Why this is useful for spec-first work

This workflow exists to reduce agent chaos: the failure mode where agents start coding before the architecture,
constraints, dependencies, and acceptance checks are clear.

It is useful for spec-first development because it gives agents shared memory and explicit stop points:

- **Durable state.** `MILESTONES.md` and `checkpoints/` act like a project save game. A new agent or human can resume
  from the latest documented state without reconstructing context from chat history.
- **Explicit verification.** Phase-by-phase plans with acceptance checks make the spec something the agent must validate
  against, not background reading it can drift away from.
- **Conflict prevention.** Decision records, implementation updates, `COORDINATION.md`, and checkpoints help prevent
  silent changes: important choices made in code without being broadcast to other agents or future sessions.

The point is not to slow implementation down with ceremony. The point is to make the smallest useful amount of thinking,
state, and verification visible before code starts moving.

## Mental model

Use each document for a different kind of truth:

- `PRODUCT.md`: what the product is trying to become and why.
- `decisions/`: durable choices and tradeoffs that should not be casually rewritten.
- `MILESTONES.md`: the stable project roadmap and execution state: milestones, sub-milestones/phases, plan order,
  durable status, and dependencies.
- `COORDINATION.md`: the current parallel-work board: active agents/humans, sessions, branches, worktrees, tasks,
  blockers, dependency readiness, and handoff links.
- `plans/`: how a specific chunk of work should be implemented.
- `checkpoints/`: durable phase handoffs, like a "save game" for the project.
- `research/`: useful exploration that may become stale.

This split keeps the roadmap from becoming a noisy live ops board, while still giving parallel agents a place to see
what is currently moving.

The default planning docs root is `docs/`, but the workflow can live elsewhere. If a project uses `project-docs/`,
`.agents/docs/`, `ai/`, or another directory, the same document roles apply under that root.

## Why proportional context matters

Spec-first workflows can accidentally become token-heavy if agents read every planning file before every task. They can
also become brittle if agents under-read and miss important decisions. The workflow should make shared state
discoverable while leaving agents free to expand context when the work warrants it.

Agents should usually start with indexes, tables, summaries, the active plan, and latest checkpoints, then expand into
additional product sections, decisions, plans, checkpoints, or research when the task is ambiguous, risky, or
cross-cutting. The docs should make that easy by keeping status tables current, linking to the latest checkpoints, and
avoiding duplicated long explanations.

## Why `MILESTONES.md` matters

`docs/MILESTONES.md` acts like the durable roadmap and implementation state file. It records what is planned, what is
complete, what is blocked at the roadmap level, what depends on what, and which plan or checkpoint should be read next.

Agents are told to read `docs/MILESTONES.md` at the start of every session so they can answer practical coordination
questions before coding:

- Which milestone, sub-milestone, or phase is next?
- Which plan phase is currently active?
- Is a dependency durably ready, or is it still planned/blocked?
- Has another agent already created a checkpoint that changes what I can safely assume?

That makes `MILESTONES.md` the shared execution map, not the place for every short-lived worker status update.

## Why `COORDINATION.md` matters

`docs/COORDINATION.md` is the active board for parallel work. It answers questions that are too volatile for
`MILESTONES.md`:

- Who or what is currently working?
- Which session, branch, or worktree contains that work?
- Is the task in progress, blocked, paused, or ready for another agent to consume?
- Where is the latest handoff checkpoint?
- Should another agent keep using a mock/fallback strategy?

This file can be updated frequently and pruned when work finishes. It should stay brief and point to plans/checkpoints
for details.

## Why checkpoints matter

Checkpoints turn docs into a "save game" for the project. After each phase, a checkpoint captures what changed, which
checks ran, what surprised the agent, and what future agents can rely on.

This lets any agent or human pick up from the latest stable state without reconstructing context from commit messages,
terminal output, or chat transcripts.

## Why cross-session awareness matters

Parallel implementation may mean multiple agents sharing one project directory, separate branches, or separate
worktrees. The workflow should help agents see that work without forcing them to switch branches, merge early, touch the
git index, or assume they can read files outside their workspace.

The generated agent instructions therefore teach agents to:

- read committed milestone and checkpoint state from another branch with `git show`
- read committed coordination state from another branch with `git show`
- treat uncommitted work in another isolated workspace as invisible until it is summarized in `COORDINATION.md`,
  captured in a checkpoint, committed, or explicitly provided by the user
- ask the human to publish isolated uncommitted work, provide the relevant files, or grant permission before any git
  action is used to make that state visible
- fall back to the plan's documented mocking strategy when a dependency is not ready
- update `docs/COORDINATION.md` for active work changes
- update `docs/MILESTONES.md` only for durable roadmap/phase/dependency changes
- write checkpoints when completed work creates a handoff point

The goal is not to over-document every conversation. The goal is to keep the load-bearing coordination state in files
that are easy to inspect, diff, and hand off.

If several agents share one working directory, `COORDINATION.md` should also record file or area ownership before edits
begin. Without branch or worktree isolation, avoiding overlapping edits is part of the coordination contract.

## What belongs in the skill vs this README

`SKILL.md` should stay focused on instructions an agent can execute while bootstrapping the workflow.

This README is for the reasoning behind those instructions: why the documents exist, how they reduce coordination
failure, and why the generated `AGENTS.md` guidance separates milestones, coordination, and checkpoints.
