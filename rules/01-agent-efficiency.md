## 01 - Agent efficiency

- Optimize for completing the task with the minimum necessary model, context, tool, and orchestration work.
- Do not scan the repository broadly when the relevant paths are already known.
- Prefer targeted searches, file reads, commands, diffs, and tests over broad or unbounded operations.
- Keep successful command reports concise. For failures, include only the output needed to diagnose the problem.
- Run the narrowest meaningful validation for the changed surface.
- Once relevant checks pass, do not repeat or broaden them unless subsequent changes, failures, risk, or unresolved
  concerns justify it.
- Do not delegate small, tightly coupled, or ordinary work that the current agent can handle efficiently.
- Use subagents when a different model/reasoning profile, context isolation, parallel independent work, or specialist
  expertise provides a clear benefit.
- When delegation is useful, use the fewest independent workers necessary.
- Avoid repeatedly polling healthy long-running workers.
- Do not duplicate work already delegated to a healthy worker.
- Avoid multiple agents editing overlapping code unless coordination is explicitly required.
- Keep inter-agent reports concise: decisions, changed files, failures, blockers, and verification results.
- For reusable multi-step workflows, prefer the relevant installed skill instead of reproducing the workflow in general
  instructions.
