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
- `BUG_FIXES.md` is the index of scoped defect reports and fixes.
- `bug-fixes/` captures report, impact, reproduction, evidence, root cause, proposed fix, validation, and outcome for
  defects that do not need roadmap plan sequencing.
- `BUSINESS_RULES.md` is the index of current product/domain rules.
- `business-rules/` captures current rules the system must obey, separate from decision history.
- `COORDINATION.md` tracks active parallel work: who or what is moving right now, where, and with what blockers.
- `GUIDE.md` centralizes conventions, indexes, and directory roles instead of scattering README files across
  directories.
- `CHECKS.md` defines the canonical automated verification contract: which commands prove the work, when to run them,
  and what to do when they fail or cannot run. It should stay low-maintenance and change mostly when commands,
  environments, required services, reliability notes, or fallbacks change.
- `MANUAL_QA.md` keeps live manual QA coverage visible for important product workflows that still need human judgment.
  Agents are expected to update it when meaningful fixes, refactors, or feature changes alter how those flows should be
  verified.
- `Changelog Impact` fields in plans, checkpoints, and bug-fix records mark release-visible changes so root
  `CHANGELOG.md` can be generated later from spec evidence.
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

In skill instructions, `blueprint/...` means the bundled files in this skill directory. Target project docs are always
referenced as `<planning-root>/...`.

For projects that already have an older version of this workflow, use [UPGRADING.md](UPGRADING.md). It explains which
files can be replaced from the blueprint and which project-truth files must be merged.

## Why It Helps

The workflow makes specification work practical for agents:

- **Durable state.** `MILESTONES.md` and `checkpoints/` act like a project save game. A new agent or human can resume
  from the latest documented state without reconstructing context from chat history.
- **Explicit verification.** Phase-based plans make acceptance checks part of the implementation loop, not background
  reading that can drift away from the code. `CHECKS.md` makes the canonical commands and their reliability notes
  inspectable before work starts.
- **Conflict prevention.** Decision records, implementation updates, coordination notes, and checkpoints reduce silent
  changes: important choices made in code without being broadcast to future agents or parallel work.
- **Bug-fix separation.** `BUG_FIXES.md` keeps reported defects and scoped fixes visible without forcing every bug into
  roadmap milestones or phase checkpoints.
- **Proportional context.** The document set gives agents high-signal entry points first, while still leaving room to
  expand into more context when the work is risky, ambiguous, or cross-cutting.
- **Manual judgment preserved.** `MANUAL_QA.md` gives humans a maintained review surface for flows where screenshots,
  accessibility, permissions, data state, or product taste still require inspection.

## How The Pieces Fit

`MILESTONES.md` and `COORDINATION.md` intentionally serve different kinds of truth.

`MILESTONES.md` is durable project state. It should stay stable enough to act as the cross-milestone map: what
milestones exist, which milestone is active, what plan is recommended next, and which detailed milestone record has the
deeper context.

`BUG_FIXES.md` is durable defect state. It should stay focused on active defect records, status, priority, report/fix
dates, and links to `bug-fixes/` records. Use a bug-fix record for scoped defect work; promote the work into a plan when
the fix becomes broad feature work, architecture-changing, migration-heavy, cross-domain, or multi-phase.

`BUSINESS_RULES.md` and `business-rules/` are current product truth. They state what the system must currently do in
domain language, with examples, edge cases, implementation links, and test links when known. This keeps product rules
out of ADRs while still making them durable enough for agents and humans to implement against.

`decisions/` is the rationale layer. A decision explains why a choice was made, what alternatives were rejected, and
what consequences the team accepted. If a rule changes because of a meaningful tradeoff, update the rule and add or
supersede the related decision.

`COORDINATION.md` is intentionally more volatile. It is the live board for active sessions, branches, worktrees,
blockers, ownership, and handoff links. Keeping this separate prevents the roadmap from turning into a noisy live ops
board.

`COORDINATION.md` is the coordination source of truth for active sessions. Agents and humans update it manually when
work starts, pauses, blocks, resumes, or completes, keeping the live coordination state inspectable without depending on
local runtime state outside the repository.

`checkpoints/` are the handoff layer between the two. A checkpoint says what was actually completed, what was checked,
what changed, and what another agent can safely rely on. This is the "save game" that lets work resume without replaying
the previous conversation.

`CHECKS.md` and `MANUAL_QA.md` are the feedback-loop layer. `CHECKS.md` is usually low-maintenance: it names the
commands, environments, reliability notes, and fallbacks that agents need before they run automated verification.
`MANUAL_QA.md` needs more active care because it preserves human review knowledge for important user and operator flows.
Agents should update it when behavior, roles, permissions, setup data, edge cases, acceptance criteria, supported
platforms, or release-critical flows change. If either layer changes, update the relevant plan or checkpoint so future
agents know what was proven and what still needs judgment.

Root `CHANGELOG.md` is the release communication layer when a project wants one. It is not part of the required planning
root, but plans, checkpoints, and bug-fix records can carry `Changelog Impact` notes. The `generate-changelog` skill
uses those notes plus `.specs` diffs to prepend dated changelog blocks without rewriting older entries.

Together, these files give agents enough structure to move quickly without pretending that chat memory, branch state, or
uncommitted work in another workspace is magically visible.
