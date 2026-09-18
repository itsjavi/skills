## 02 - Git and the working tree

Treat staged changes you did not stage yourself as a user review checkpoint.

- Never discard index state you did not create.
- Do not unstage, reset, stash, revert, amend, or otherwise alter staged changes you did not stage yourself.
- Treat an unexpected dirty index as normal; do not assume it was produced by a hook, tool, or earlier agent.
- You may commit and push without asking when every staged entry was staged by you and the requested workflow permits
  it.
- Ask before committing when the index contains anything you did not stage, because the commit would include the user's
  reviewed/checkpointed work.
- Do not create or push version tags unless the user explicitly asks.
- Do not create a new branch unless the user asks, or the repository/workflow requires it.
- Do not rewrite history unless explicitly requested.

Repository-specific CI, deployment, tagging, release, and branch rules belong in that repository's own `AGENTS.md`.
