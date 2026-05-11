# Coordination

Active parallel-work board for humans and agents.

Planning docs root: `docs/`.

This file is intentionally more volatile than `MILESTONES.md`. Keep durable roadmap state in
[Milestones](MILESTONES.md), detailed implementation steps in `plans/`, and completed phase handoffs in `checkpoints/`.

Last reviewed: YYYY-MM-DD HH:mm TZ

## Mental Model

- `MILESTONES.md`: what the project is trying to complete next, in durable roadmap order.
- `COORDINATION.md`: who/what is moving right now, in which session, branch, or worktree, and whether others can rely on
  it.
- `checkpoints/`: what has been completed and can be resumed from without chat history.

## Active Work

| Owner / agent  | Branch                 | Workspace / session | Task               | Files / area owned | Depends on         | Status      | Last update      | Handoff |
| -------------- | ---------------------- | ------------------- | ------------------ | ------------------ | ------------------ | ----------- | ---------------- | ------- |
| backend-agent  | feat/api-contract      | project-api session | First API contract | `src/api/**`       | Repo foundation    | In progress | YYYY-MM-DD HH:mm | TBD     |
| frontend-agent | feat/ui-vertical-slice | project-ui session  | First UI flow      | `src/ui/**`        | First API contract | Mocking     | YYYY-MM-DD HH:mm | TBD     |
| human          | main                   | .                   | Review milestones  | `docs/**`          | None               | Active      | YYYY-MM-DD HH:mm | TBD     |

## Blocked Or Waiting

| Owner / agent  | Waiting for             | Current fallback              | Next check                     |
| -------------- | ----------------------- | ----------------------------- | ------------------------------ |
| frontend-agent | API contract checkpoint | Use Plan 01 mock API strategy | After backend checkpoint lands |

## Coordination Rules

- Read this file after `docs/MILESTONES.md` at the start of each session.
- Add or update your row when starting, pausing, blocking, resuming, or completing active work.
- If multiple agents share the same working directory, claim file or area ownership before editing.
- Keep rows brief; link to plans and checkpoints for details.
- Remove or archive stale rows after the work has a checkpoint and no longer needs active coordination.
- Update `docs/MILESTONES.md` only when durable roadmap, phase, ordering, or dependency state changes.
- Create checkpoints for completed phases so future agents have a durable handoff.

## Checking Parallel Progress

Start with the coordination state visible in this workspace.

Committed state from another branch can be inspected without switching branches:

```bash
git show <branch>:docs/COORDINATION.md
git show <branch>:docs/MILESTONES.md
git show <branch>:docs/checkpoints/<checkpoint-file>.md
```

Uncommitted state in another isolated workspace is usually invisible. Treat it as unavailable unless it has been
summarized in this file, captured in a checkpoint, committed to a branch, or explicitly provided by the user.

If another workspace's uncommitted state must become visible, ask the human to publish it, provide the relevant files,
or grant explicit permission for any needed git action. Follow the project's agent-guide git rules.
