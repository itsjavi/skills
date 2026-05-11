# Agent Workflow Snippet

## Bootstrap a fresh session

1. Read this file.
2. Read `docs/PRODUCT.md`.
3. Skim `docs/decisions/README.md`.
4. Read decisions related to the current task.
5. Read `docs/MILESTONES.md`.
6. Read the active plan and its latest checkpoints.
7. For UI work, read `docs/DESIGN.md` if present.

## Working with docs

- Product requirements live in `docs/PRODUCT.md`.
- Durable decisions live in `docs/decisions/`.
- Implementation plans live in `docs/plans/`.
- Phase checkpoints live in `docs/checkpoints/`.
- Research notes live in `docs/research/` and may become stale.

## Working with plans

- Implement plans phase-by-phase.
- When starting a phase, mark it `🟡 In progress` in the plan status table.
- When finishing a phase, run its acceptance checks, create a checkpoint, then mark it `✅ Complete`.
- The final phase is always **Final review pass**.

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
- Do not stage, unstage, amend, reset, or otherwise switch files between staged and unstaged.
- Do not create commits unless explicitly asked.
- Commit messages must use Conventional Commit format: `<type>(optional-scope): <imperative summary>`.
- Allowed types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`.

## Fetching documentation

- Use `npx ctx7@latest library <name> "<user question>"` before answering or implementing against
  library/framework/SDK/API/CLI/cloud details.
- Pick the best `/org/project` match, then run `npx ctx7@latest docs <libraryId> "<user question>"`.
- Do not use Context7 for business-logic debugging, reviews, refactors, or general programming concepts.
- Do not include secrets in Context7 queries.
- If Context7 quota fails, tell the user how to raise limits. If network/DNS fails in a sandbox, retry outside the
  sandbox when the environment supports it.
