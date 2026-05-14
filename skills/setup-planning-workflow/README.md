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
- `MILESTONES.md` is the stable milestone index: cross-milestone order, status, active milestone, recommended next plan,
  latest checkpoint, and record links.
- `milestones/` holds detailed milestone records, including drafted-plan registries, phase maps, risks, and checkpoint
  rollups.
- `BUSINESS_RULES.md` is the index of current product/domain rules.
- `business-rules/` captures current rules the system must obey, separate from decision history.
- `COORDINATION.md` tracks active parallel work: who or what is moving right now, where, and with what blockers.
- `GUIDE.md` centralizes conventions, indexes, and directory roles instead of scattering README files across
  directories.
- `plans/` describes how a specific chunk of work should be implemented.
- `checkpoints/` captures completed phase handoffs.
- `research/` holds useful exploration that may become stale.
- `setup/` holds local development, production hosting/deployment, self-hosting, and operational setup guides.
- `ENV_VARS.md` makes configuration visible: what the project needs, where values come from, and which values are
  sensitive.
- `SECURITY.md` explains how the whole application is meant to stay secure, and how those claims are verified.

The default root is `.specs/`, which avoids colliding with `docs/` directories used for published project documentation.
The same model works under another planning directory when a project wants a different layout.

`SKILL.md` defines the exact required file contract. The files under `blueprint/` are canonical scaffold sources to
adapt for those required outputs, not optional layout suggestions.

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

`MILESTONES.md` is durable project state. It should stay stable enough to act as the cross-milestone map: what
milestones exist, which milestone is active, what plan is recommended next, and which detailed milestone record has the
deeper context.

`BUSINESS_RULES.md` and `business-rules/` are current product truth. They state what the system must currently do in
domain language, with examples, edge cases, implementation links, and test links when known. This keeps product rules
out of ADRs while still making them durable enough for agents and humans to implement against.

`decisions/` is the rationale layer. A decision explains why a choice was made, what alternatives were rejected, and
what consequences the team accepted. If a rule changes because of a meaningful tradeoff, update the rule and add or
supersede the related decision.

`COORDINATION.md` is intentionally more volatile. It is the live board for active sessions, branches, worktrees,
blockers, ownership, and handoff links. Keeping this separate prevents the roadmap from turning into a noisy live ops
board.

`checkpoints/` are the handoff layer between the two. A checkpoint says what was actually completed, what was checked,
what changed, and what another agent can safely rely on. This is the "save game" that lets work resume without replaying
the previous conversation.

Together, these files give agents enough structure to move quickly without pretending that chat memory, branch state, or
uncommitted work in another workspace is magically visible.
