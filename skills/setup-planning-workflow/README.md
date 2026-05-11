# Setup Planning Workflow Rationale

This skill exists to reduce "agent chaos": the failure mode where coding agents start implementing before the product
shape, architecture, dependencies, and acceptance checks are clear.

The workflow is docs-first because docs are the shared memory that survives across agents, humans, branches, worktrees,
and sessions. Instead of depending on chat history or one long-running agent, the project keeps its load-bearing state
in files that can be inspected, reviewed, and handed off.

## What It Creates

The workflow creates a lightweight project memory system:

- `PRODUCT.md` explains what the product is trying to become and why.
- `decisions/` captures durable choices and tradeoffs.
- `MILESTONES.md` tracks the stable roadmap, sub-milestones/phases, ordering, status, and durable dependencies.
- `COORDINATION.md` tracks active parallel work: who or what is moving right now, where, and with what blockers.
- `plans/` describes how a specific chunk of work should be implemented.
- `checkpoints/` captures completed phase handoffs.
- `research/` holds useful exploration that may become stale.

The default root is `docs/`, but the same model works under another planning docs directory when a project wants a
different layout.

## Why It Helps

The workflow makes specification work practical for agents:

- **Durable state.** `MILESTONES.md` and `checkpoints/` act like a project save game. A new agent or human can resume
  from the latest documented state without reconstructing context from chat history.
- **Explicit verification.** Phase-based plans make acceptance checks part of the implementation loop, not background
  reading that can drift away from the code.
- **Conflict prevention.** Decision records, implementation updates, coordination notes, and checkpoints reduce silent
  changes: important choices made in code without being broadcast to future agents or parallel work.
- **Proportional context.** The document set gives agents high-signal entry points first, while still leaving room to
  expand into more context when the work is risky, ambiguous, or cross-cutting.

## How The Pieces Fit

`MILESTONES.md` and `COORDINATION.md` intentionally serve different kinds of truth.

`MILESTONES.md` is durable project state. It should stay stable enough to act as the execution map: what milestones
exist, what depends on what, what is active, and what comes next.

`COORDINATION.md` is intentionally more volatile. It is the live board for active sessions, branches, worktrees,
blockers, ownership, and handoff links. Keeping this separate prevents the roadmap from turning into a noisy live ops
board.

`checkpoints/` are the handoff layer between the two. A checkpoint says what was actually completed, what was checked,
what changed, and what another agent can safely rely on. This is the "save game" that lets work resume without replaying
the previous conversation.

Together, these files give agents enough structure to move quickly without pretending that chat memory, branch state, or
uncommitted work in another workspace is magically visible.
