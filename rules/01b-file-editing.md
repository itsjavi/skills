### 01b - File editing

- Prefer the harness's dedicated file-editing tools for ordinary text edits.
  - In Codex, prefer `apply_patch`.
  - In Claude Code, prefer `Write` for creation and `Edit` for modification.
- Read the target file, or the relevant range, before editing it.
- Change only the lines necessary for the task; do not rewrite an entire file to alter a small section.
- Avoid `sed`, `perl`, `awk`, shell redirection, and temporary scripts for ordinary file edits.
- Avoid Python or other scripts for routine edits to Markdown, source code, JSON, YAML, or configuration files unless
  programmatic processing provides a clear benefit.
- Use TypeScript/JavaScript, Python, or another appropriate language when the task genuinely benefits from programmatic
  transformation, generation, or large mechanical changes.
- Prefer the simplest appropriate tool for the task.
