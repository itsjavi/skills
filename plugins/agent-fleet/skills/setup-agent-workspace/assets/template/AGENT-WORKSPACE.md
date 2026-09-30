# Agent workspace

This project owns `agent-workspace.json`: agent names/roles, execution defaults, repository boundaries, read-only references, and required checks. It uses provider-independent Node tooling and native Backlog records. Start sessions from this root. If launched inside a child repository, explicitly read the root instructions and relevant child instructions first.

## Files and prerequisites

- Root `agent-workspace.json` references `.agents/agent-workspace/schema.json` for IDE completion.
- `.agents/agent-workspace/scripts/` and `tests/` are tracked tooling. No project node_modules is required.
- `.agents/agent-workspace/runtime/` is ignored **durable** state, history, task provenance, commit journals, and locks. Never remove it as scratch cleanup.
- `.agents/agent-workspace/install-manifest.json` records the installed tooling release and managed file/block hashes. Configuration, Backlog, and runtime remain project-owned.
- Skills may be local (`.agents/skills/`, shared with Claude through `.claude/skills`) or supplied by an installed plugin/user skill directory. Check the manifest's `skillsMode`; resolve operating skills by name through the host. No `.codex/skills` duplicate is needed.
- Backlog owns task intent, decisions, status, evidence, and handoffs. Use the native CLI for all record edits.
- `.local/` is ignored scratch for research, raw screenshots, and disposable trials. Promote useful evidence to Backlog.

Requirements: Node.js 22+, Git, and Backlog CLI 1.51.0. npm/npx validates the configuration through an external package cache; it creates no project package manifest, lockfile, or node_modules. Optional screenshot comparison uses Python, Pillow 10.1+, and WebP support. No agent launcher, scheduler, permission bypass, or global dependency installation is bundled.

```sh
npx --yes --prefer-offline --package=ajv-cli@5.0.0 ajv validate \
  --spec=draft7 --strict=true --all-errors --errors=text \
  -s .agents/agent-workspace/schema.json -d agent-workspace.json
node .agents/agent-workspace/scripts/agents.mjs status
node .agents/agent-workspace/scripts/check-installation.mjs
backlog doctor
```

Use `--offline` instead of `--prefer-offline` to require a populated npm cache. A failed check is not permission to skip validation. Add the project's actual application/build checks to repository configuration before unattended implementation; sample coordination checks are not application verification.

`check-installation.mjs` checks copied files and managed instruction blocks against this project's tracked installation manifest without a global plugin or network. It leaves custom text outside managed blocks alone. For a newer template release, use the setup skill's `update.mjs --target PATH --dry-run`, then apply after all sessions stop. Local modifications conflict and require deliberate integration. Preserve project configuration, Backlog and durable runtime during updates; plugin updates alone do not change project tooling.

## Start, own, and finish work

Resolve a requested nickname case-insensitively from the roster, otherwise use defaultAgent. Names do not choose a provider/model. Several sessions may use one nickname, but every session must obtain its own unique identity. Inspect relevant Git status and CLI status before changes; preserve user edits and staged checkpoints.

```sh
node .agents/agent-workspace/scripts/agents.mjs --help
node .agents/agent-workspace/scripts/agents.mjs start --provider codex --context 'Current task/chat'
# Claude uses --provider claude. Retain the returned session ID.
backlog instructions overview
backlog instructions task-execution
backlog task list --plain
node .agents/agent-workspace/scripts/agents.mjs claim --session SESSION-ID --task TASK-ID --scope src
node .agents/agent-workspace/scripts/agents.mjs backlog --session SESSION-ID -- task edit TASK-ID --plan 'Researched implementation plan'
```

Search/read tasks, dependencies and decisions before claiming. Read the corresponding native creation/execution/finalization guide before each lifecycle stage. The example scope `src` is replaceable; scopes are literal relative paths, not globs. Claim every writable path; task-record ownership is implicit. Parent/child scope overlap, symlinks, repository metadata, runtime state, and configured read-only paths are protected. An empty scope is read-only work. Work only inside owned scopes. Release/reclaim with the complete scope when expanding it.

Refresh `heartbeat --session SESSION-ID` every ten minutes, before editing blocks, and after long waits. Recovered sessions must stop edits and register/reclaim anew. Plans and results belong in Backlog, not only local state. All tracker writes use the `backlog --session ID -- ...` wrapper; direct interactive tracker writes need a coordinated pause. Do not hand-edit native records. This bundle has no general exception for unsupported native record operations: use an available native operation or report its limitation.

After verification, check only satisfied acceptance/Definition of Done items and record a final summary through the wrapper. Every task needs `visual` evidence or a justified exemption. Then:

```sh
node .agents/agent-workspace/scripts/agents.mjs visual --session SESSION-ID --task TASK-ID --kind no-ui --note 'Concrete reason this change has no rendered UI'
node .agents/agent-workspace/scripts/agents.mjs release --session SESSION-ID --task TASK-ID --outcome done --note 'Actual checks and results'
node .agents/agent-workspace/scripts/agents.mjs stop --session SESSION-ID
```

Use `--outcome paused` for unfinished work or `review` for a released review handoff. Release every task and close sessions before yielding a finished turn. A paused chat is not a live worker. The coordinator must close active workers before stopping. A failed sync retains ownership; inspect and `reconcile`, never delete the reservation to get unstuck.

## Execution, approvals, and commits

Profile precedence: explicit run choice, selected agent's defaultProfile, project executionPolicy.defaultProfile; explicit run controls override profile fields. Runs snapshot their policy, boundaries, and checks. Changing project config does not rewrite active runs. End affected sessions before changing roster or boundaries.

Assisted defaults to one agent, self-review, commits only on explicit request, and asking for material input. Keep routine work uncommitted. Finish with a suggested Conventional Commit: `<type>(TASK-ID): <imperative summary>` using the exact task ID; omit the scope without a task. A suggestion never authorizes staging or committing. If committed, report the actual message and SHA.

Use the `unattended-work` skill only for authorized unattended tasks. Start with actual user authorization, a concrete allowed task list/milestone, and bounded limits; workers join the same run. Use only as many independent workers as help. Independent review remains required even with commits disabled. The CLI does not launch models or work in the background. Push, merge, tags, and deployment require separate authorization and are not implemented by this helper.

Human gates `approval-required`, `needs-decision`, `needs-human-review`, and `blocked` prevent claims. After actual user approval, `approve` records that decision; dependencies still apply. Use `defer` to preserve a structured question/evidence and release ownership. `queue` collects human handoffs; `resolve` records actual answers; `ready` reports eligible work. Resolve no gate based on inactivity or time. `needs-review` means released review work, not active ownership. Use `assign` to record an authorized nickname handoff before claiming an unowned task assigned elsewhere.

Authorized commits require `snapshot` → `visual` → `verify` → `review` → `commit` using exact owned files, configured repository checks, and the same reviewed content. Existing staged entries and inherited dirt are checkpoints: never alter/commit them without explicit permission or bypass the guard with direct Git/alternate indexes. Existing Git hooks/config are preserved. Automatic or explicitly requested completion also commits the owned final task record; failed bookkeeping retains ownership and is resumed with `reconcile` after its blocker is resolved. Assisted work without commit authorization leaves task and implementation changes uncommitted.

Each configured repository has its own Git history. For initialized submodules, commit child source in the child repository. Updating an existing parent gitlink is a separate owned snapshot in the parent repository, recording the exact child commit. The child must be clean and initialized, and parent checks/current review must pass. Own the pointer from a clean baseline before child changes; inherited pointer changes require an inspected handoff. Read-only child pointers are protected. Never initialize, fetch, publish, modify .gitmodules, or recursively commit as a side effect of ordinary completion; remote availability is separate from local verification.

Adding another repository snapshot requires refreshing the task's visual evidence, which clears earlier reviews. Use `review --fingerprint FINGERPRINT` for each retained final snapshot, including an already committed child, against the updated evidence. Reviewing a retained snapshot leaves the latest snapshot selected for the next commit. Completion checks all repository snapshots and their reviews.

## Visual evidence

Use the `visual-evidence-review` skill before significant UI/design edits. Capture matching before/after states, inspect onion overlays, and retain at most three combined WebP images per task in `backlog/assets/<task-id>/`, embedded with relative image links in its record. Claim the asset path. Raw screenshots and overlays stay in `.local/`. Text-only or inspected no-visible-change work may be exempt; missing capture tooling/OS permission is a blocker, not visual proof.

## Recovery and retained state

The registry is authoritative for current ownership; Backlog is authoritative for durable task intent/status. Coordination is cooperative on one shared local filesystem. Separate clones/worktrees/machines do not share the registry; arbitrary editor writes can bypass it. Never use a stale timestamp alone to infer the owner stopped.

`status` flags stale sessions without releasing anything. Inspect the actual chat/process and changes, confirm no live writer, then use `recover --session OLD-ID --by YOUR-ID --confirm-stopped --note 'Evidence and remaining work'`. Recovery preserves changes and does not give the recovering session ownership; claim separately afterward.

`runtime/locks/write.lock/owner.json` identifies a short-lived CLI writer, not the agent session. Timeouts retain locks because child Backlog writers may still be alive. Quiesce all writers, inspect owner PID/host and children, then preserve/move a proven orphan lock to a unique recovery path inside runtime. Never recover by deleting state, task provenance, journals, or Git locks. If provenance reports pending=true, inspect exact task bytes and writer outcome before clearing anything; a moved lock alone does not resolve uncertain ownership. Preserve evidence and consult the implementation/reviewer when the intended transition is unclear.

Completed runs/sessions archive automatically under runtime/history; closed reviewers remain until their run finishes. Per-task provenance is lazy-loaded from runtime/tasks. `history --run ID` or `history --session ID` reads one record; `provenance --task ID` locates ownership evidence. `compact` retries interrupted archival under the writer lock. No age-based cleanup deletes live or retained recovery data. Routine operations do not scan the entire history. A save persists terminal state, publishes complete archives, then removes archived entries from active state, so retry can replay safely.

`runtime/maintenance.json` means a setup/update transaction is incomplete. Mutation commands refuse to use a partially installed runtime. Inspect the failure and resume the exact release, skill mode, and adoption baseline; keep the marker until the updater finishes successfully. Never delete it to enable old processes. A generated build identity binds each loaded entrypoint to its helper scripts and installed manifest, and a process that crossed an upgrade must retry with the installed entrypoint. Legacy runtimes without these guards must be explicitly quiesced before first adoption.

Backlog/Git locks and the repository commit guard live in Git metadata, shared across workspace invocations targeting that checkout. Host sandboxes may require normal tool approval to write `.agents` or Git metadata. Request the needed permission through the host; never move durable state into scratch or bypass protections. A lock failure is not permission to weaken tracker integrity or hand-edit records. Run focused bundled tests for changed tooling and real `agents.integration.test.mjs` after synchronization/completion changes; report actual checks and limitations.
