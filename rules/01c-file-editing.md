#### 01c - File editing

- Create and modify text files with the agent's dedicated file-editing tool, or the closest equivalent the harness
  provides. In Codex that is `apply_patch` for every operation. In Claude Code, `Write` creates and `Edit` modifies.
- Read the target file, or just the relevant range, before editing it, and change only the lines that need to change. Do
  not rewrite a whole file to alter a few lines.
- Avoid `sed`, `perl`, `awk`, shell redirection, and temporary scripts for ordinary file edits.
- Avoid using Python or other scripts to edit Markdown, source code, JSON, YAML, or configuration files unless there is
  a clear benefit to doing so.
- Prefer the simplest appropriate tool for the task.
- Use a programming language such as TypeScript/JavaScript or Python when the task genuinely benefits from programmatic
  processing, such as mechanical changes across many files or generated output.
