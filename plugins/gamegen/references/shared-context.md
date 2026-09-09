# Shared project context

Every GameGen skill reads `.agents/gamegen-prefs.json` from the active game repository. Resolve paths from that
repository, never from the installed plugin or the agent's home directory. The plugin root is the directory containing
this reference's parent `references/` and `.codex-plugin/`.

Run `python3 <plugin-root>/scripts/prefs.py read --project <game-repository>`. Read the returned `prefs`, `ready` and
`setup.revision`. This helper uses the Python standard library and discovers an existing preferences file from nested
game directories up to the repository boundary. It refuses to initialize a game inside the plugin package. Resolve each
asset or output path under `paths` from the returned project location.

For production, if preferences are absent or `ready` is false, use `game-bootstrap` and finish its question-tool intake
before dependent work. A read-only review can inspect existing evidence and state which missing preferences limit the
conclusion. Existing answers in the conversation count as resolved decisions and must not be asked again.

Within the user's authorized task, current explicit instructions override saved preferences, which override GameGen
suggestions and provider defaults. An instruction to use a specific image model is an explicit model choice even when a
provider skill ordinarily recommends another model. Tool availability, authentication and host permissions are still
real constraints. Follow the chosen fallback list without silently choosing a new provider or model.

Only the coordinating agent changes preferences. Use `apply` with a JSON answers file, `--expected-revision` and
`--confirm` for sections the user has actually resolved. Updates reset changed sections to unconfirmed unless
reconfirmed. `finalize` makes the file ready only after all sections and conditional requirements are resolved.
Recommendations, preselected choices, unanswered questions and elapsed time are not submitted answers. Routine
implementation decisions inside approved scope do not require another intake.

Configuration contains stable choices. Store detailed art direction in `art.direction_doc`, generation IDs and output
hashes in `paths.manifest`, and progress, spend reservations and job status in `paths.state` or the existing tracker. Do
not put credentials, encoded images or long logs in preferences. Read back updates. Unknown schema versions must be
reported without rewriting the file. Migrations belong in the shared helper, not in individual skills.

## Tool and cost rules

Use the provider configured for the relevant `generation.routes` purpose. Read [providers.md](providers.md) for its
execution route, including local CLI and `bpy` for Blender. Use the route's available MCP, API or CLI capabilities; use
computer control when `generation.computer_use` permits it and direct visual manipulation or a missing tool operation
makes it useful. Read the computer-use API documentation returned by the tool. Do not preserve screen coordinates as a
cross-machine recipe.

Before a paid batch, read the current provider balance and cost where exposed. The coordinator reserves the estimated
cost against the project-wide cash and provider-credit limits, counting outstanding jobs. Cash and prepaid credits are
different limits. Enforce both applicable limits, the attempt count and `max_parallel_paid_jobs`; a new task does not
reset the project's budget. Record actual use and reconcile reservations on completion. Do not submit a second
generation after an ambiguous timeout until checking the original job's status. If an estimate is unavailable or the
approved limit is exhausted, follow `fallback_on_unknown_cost` or `on_limit` and continue useful unpaid work. Do not
purchase credits automatically.

Follow `workflow.concept_review` and `workflow.asset_review`. User review requires a concrete visible artifact; agent
review requires comparison against the saved art direction and evidence. Approval applies only to the selected revision.
User-requested revisions update the decision rather than reopening unrelated questions.

## Shared completion evidence

Report what changed, where the editable and runtime outputs live, what was checked, and material remaining limits.
Distinguish concept images, Blender renders, actual engine captures and real-time performance measurements. A successful
file export does not establish visual quality or gameplay correctness.

Keep language direct. Never use en dashes or em dashes to connect clauses or sentences.
