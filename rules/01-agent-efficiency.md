### 01 - Agent efficiency

- Optimize for completing the task with the minimum necessary model and tool work.
- Do not scan the repository broadly when the relevant paths are already known.
- Prefer targeted searches and commands. Avoid returning unbounded logs or command output.
- For successful commands, keep reports concise. For failures, include only the output needed to diagnose them.
- Run the narrowest meaningful validation for the changed surface.
- Once relevant tests pass, do not repeat or broaden them unless subsequent changes, failures, or unresolved concerns
  justify it.
- Do not delegate small or tightly coupled tasks to subagents.
- When delegation is useful, use the fewest independent workers necessary and avoid repeatedly polling healthy
  long-running workers.
- Do not duplicate work already delegated to a healthy worker.
- Keep inter-agent reports concise: decisions, changed files, failures, blockers, and verification results.
- Keep final responses concise unless additional explanation is requested.
