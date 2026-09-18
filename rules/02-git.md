### 02 - Git and the working tree

Staged changes you did not stage yourself are a review checkpoint. Staging is how the user says "this looks good, we can
continue", and diffing unstaged work against the index is how they review each iteration.

- Never discard index state you did not create. Do not unstage, reset, stash, revert, or amend it. Treat an unexpected
  dirty index as normal, do not report it as surprising, and do not assume a hook, a tool, or an earlier session
  produced it.
- You may commit and push without asking when you staged every entry in the index yourself. Working autonomously through
  a series of commits is fine.
- Ask first when the index holds anything you did not stage. The commit would sweep the user's checkpoint in with
  unreviewed work, so confirm the intended scope.
- Do not create or push version tags. A push to main runs CI. A matching tag triggers Deploy.
- Do not create a new branch to commit changes unless the user asks for it, or if it's required because of some
  particular workflow or dev process.
