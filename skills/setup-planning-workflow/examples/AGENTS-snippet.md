# Agent Workflow Snippet

Planning docs root: `docs/`.

If this project uses a different planning docs root, replace `docs/` paths below with that root.

## Bootstrap a fresh session

1. Read this file.
2. Confirm the planning docs root.
3. Read `docs/PRODUCT.md`.
4. Skim `docs/decisions/README.md`.
5. Read decisions related to the current task.
6. Read `docs/MILESTONES.md`.
7. Read `docs/COORDINATION.md` if it exists.
8. Read the active plan and its latest checkpoints.
9. For UI work, read `docs/DESIGN.md` if present.

## Working with docs

- Product requirements live in `docs/PRODUCT.md`.
- Durable roadmap and phase state live in `docs/MILESTONES.md`.
- Active parallel-work coordination lives in `docs/COORDINATION.md`.
- Durable decisions live in `docs/decisions/`.
- Implementation plans live in `docs/plans/`.
- Phase checkpoints live in `docs/checkpoints/`.
- Research notes live in `docs/research/` and may become stale.

## Working with plans

- Implement plans phase-by-phase.
- When starting a phase, mark it `🟡 In progress` in the plan status table.
- When finishing a phase, run its acceptance checks, create a checkpoint, then mark it `✅ Complete`.
- The final phase is always **Final review pass**.
- If implementation work is requested but no relevant plan exists, create or update a plan before coding unless the user
  explicitly asks for a quick unplanned change.

## Context discipline

- Start with high-signal workflow docs: `PRODUCT.md`, `MILESTONES.md`, `COORDINATION.md`, relevant README/index files,
  the active plan, and latest checkpoints.
- Expand context deliberately when the task is ambiguous, risky, cross-cutting, or the initial docs do not answer the
  question.
- Use whatever search and file-reading tools are available; targeted reads are preferred when they are enough, but
  broader reads are appropriate when they reduce risk.
- Summarize relevant state before implementing so the reasoning is visible without pasting large doc sections.
- When creating or updating docs, keep entries concise and link to details instead of duplicating long explanations.
- Prefer updating index tables and latest checkpoints over pasting full plan contents into new files.
- In final responses, summarize changed docs and checks run; do not paste full generated docs unless asked.

## Keep implementation and docs in sync

- When changing behavior, architecture, configuration, APIs, operational flows, or user-facing workflows, update
  relevant docs as a final step.
- If working inside an active plan, follow its status/checkpoint workflow.
- If not working inside a plan, add a dated section to the closest relevant existing plan/doc, for example
  `## Implementation update (2026-05-11)`.
- Use implementation updates to explain what changed, why it differs from the original plan if applicable, and any
  follow-ups.
- Do not update docs for purely mechanical refactors that do not change behavior or intent.
- Before finishing, briefly check whether the code change makes existing docs stale.

## Using git

- Never alter the git index or status unless explicitly asked.
- This includes staging, unstaging, committing, amending, resetting, or switching files between staged and unstaged.
- Commit messages must use Conventional Commit format: `<type>(optional-scope): <imperative summary>`.
- Allowed types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`.

## Cross-session awareness for parallel agents

When multiple agents or humans work in parallel sessions, branches, or worktrees, keep these kinds of state separate:

- `docs/MILESTONES.md` is the durable roadmap and phase state: milestones, sub-milestones/phases, plan order,
  dependencies, and what is next.
- `docs/COORDINATION.md` is the active parallel-work board: who/what is currently working, in which session, branch, or
  worktree, with which blockers and handoff links.
- `docs/checkpoints/` is the durable "save game": completed phase handoffs that another agent or human can resume from
  without relying on chat history.

At the start of every session:

- Read `docs/MILESTONES.md` before choosing implementation work.
- Read `docs/COORDINATION.md` if it exists to see active sessions, branches, worktrees, and current blockers.
- Check the active plan and latest checkpoints for your assigned area.
- If your work depends on another session, branch, or worktree, confirm whether that dependency is complete before
  integrating against it.
- If the dependency is not ready, continue with the fallback or mocking strategy documented in the plan.

To inspect parallel progress without changing work context:

- Read `docs/COORDINATION.md` in the current workspace first.
- Use `git branch` or `git worktree list` to discover related active work when available.
- Use `git show <branch>:docs/MILESTONES.md` to read committed milestone state from another branch.
- Use `git show <branch>:docs/COORDINATION.md` to read committed coordination state from another branch.
- Use `git show <branch>:docs/checkpoints/<checkpoint-file>.md` to read committed checkpoints from another branch.
- Treat uncommitted work in another isolated workspace as invisible unless it has been summarized in
  `docs/COORDINATION.md`, captured in a checkpoint, committed to a branch, or explicitly provided by the user.
- If another agent's uncommitted work must become visible, ask the human to publish it, provide the relevant files, or
  grant explicit permission for any needed git action. Follow the git rules above.

Keep the shared record useful:

- Update `docs/COORDINATION.md` when active work starts, pauses, blocks, resumes, or completes.
- Update `docs/MILESTONES.md` only when durable roadmap, phase, ordering, or dependency state changes.
- Create checkpoints that clearly state what changed, what other agents can now rely on, and what remains unsafe to
  assume.
- Prefer coordination rows, milestone updates, and checkpoints over ad hoc chat memory.
- If multiple agents share the same working directory, coordinate file or area ownership in `docs/COORDINATION.md`
  before editing to avoid overlapping changes.

## Fetching documentation

- Use `npx ctx7@latest library <name> "<user question>"` before answering or implementing against
  library/framework/SDK/API/CLI/cloud details.
- Pick the best `/org/project` match, then run `npx ctx7@latest docs <libraryId> "<user question>"`.
- Do not use Context7 for business-logic debugging, reviews, refactors, or general programming concepts.
- Do not include secrets in Context7 queries.
- If Context7 quota fails, tell the user how to raise limits. If network/DNS fails in a sandbox, retry outside the
  sandbox when the environment supports it.
