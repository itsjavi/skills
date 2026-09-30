import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const cli = fileURLToPath(new URL("../scripts/agents.mjs", import.meta.url));

test("submodule completion renews reviews for committed child and current parent snapshots", async (t) => {
  const directory = await mkdtemp(resolve(tmpdir(), "workspace-submodule-lifecycle-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = resolve(directory, "project");
  const source = resolve(directory, "source");
  await mkdir(root);
  await mkdir(source);
  const invoke = (cwd, command, args) =>
    spawnSync(command, args, {
      cwd,
      env: { ...process.env, BACKLOG_CWD: cwd },
      encoding: "utf8",
      timeout: 30000,
    });
  const run = (cwd, command, args) => {
    const result = invoke(cwd, command, args);
    assert.equal(
      result.status,
      0,
      `${command} ${args.join(" ")}\n${result.stderr}\n${result.stdout}`,
    );
    return result.stdout;
  };
  const git = (cwd, ...args) => run(cwd, "git", args);
  const native = (...args) => run(root, "backlog", args);
  const agent = (...args) =>
    JSON.parse(run(root, process.execPath, [cli, "--root", root, ...args]));
  const rejected = (...args) => {
    const result = invoke(root, process.execPath, [cli, "--root", root, ...args]);
    assert.equal(result.status, 1, result.stdout);
    return result.stderr;
  };
  for (const cwd of [root, source]) {
    git(cwd, "init", "--quiet");
    git(cwd, "config", "user.name", "Fixture Agent");
    git(cwd, "config", "user.email", "fixture@example.invalid");
    git(cwd, "config", "commit.gpgsign", "false");
  }
  await writeFile(resolve(source, "feature.mjs"), "export const value = 1;\n");
  git(source, "add", "feature.mjs");
  git(source, "commit", "-qm", "Fixture source");
  git(
    root,
    "-c",
    "protocol.file.allow=always",
    "submodule",
    "add",
    "--quiet",
    source,
    "modules/app",
  );
  const child = resolve(root, "modules/app");
  git(child, "config", "user.name", "Fixture Agent");
  git(child, "config", "user.email", "fixture@example.invalid");
  git(child, "config", "commit.gpgsign", "false");
  await mkdir(resolve(root, "backlog"));
  await writeFile(
    resolve(root, "backlog/config.yml"),
    await readFile(new URL("./fixtures/backlog.yml", import.meta.url)),
  );
  await writeFile(resolve(root, ".gitignore"), ".agents/agent-workspace/runtime/\n.local/\n");
  const config = JSON.parse(
    await readFile(new URL("./fixtures/workspace.json", import.meta.url), "utf8"),
  );
  config.repositories = [".", "modules/app"].map((path) => ({
    path,
    readOnly: false,
    checks: [
      {
        name: "export-value",
        command: [
          process.execPath,
          "--input-type=module",
          "-e",
          `import {value} from './${path === "." ? "modules/app/" : ""}feature.mjs'; if(value!==2) throw new Error('Wrong value');`,
        ],
      },
    ],
  }));
  await writeFile(resolve(root, "agent-workspace.json"), JSON.stringify(config));
  native("task", "create", "Submodule feature", "--ac", "Export returns two");
  git(root, "add", ".");
  git(root, "commit", "-qm", "Fixture workspace and task");
  const owner = agent(
    "start",
    "--provider",
    "codex",
    "--context",
    "Submodule fixture",
    "--profile",
    "unattended",
    "--allow-task",
    "TASK-1",
    "--authorization",
    "Synthetic user authorized local fixture commits",
  );
  const reviewer = agent(
    "start",
    "--agent",
    "rowan",
    "--provider",
    "claude",
    "--context",
    "Independent fixture reviewer",
    "--run",
    owner.runId,
  );
  agent("claim", "--session", owner.id, "--task", "TASK-1", "--scope", "modules/app");
  const scope = ["--session", owner.id, "--task", "TASK-1"];
  run(root, process.execPath, [
    cli,
    "--root",
    root,
    "backlog",
    "--session",
    owner.id,
    "--",
    "task",
    "edit",
    "TASK-1",
    "--plan",
    "Change and verify the export",
  ]);
  await writeFile(resolve(child, "feature.mjs"), "export const value = 2;\n");
  const visual = () =>
    agent("visual", ...scope, "--kind", "no-ui", "--note", "Export-only fixture, no rendered UI");
  const review = (fingerprint) =>
    agent(
      "review",
      "--session",
      reviewer.id,
      "--task",
      "TASK-1",
      "--fingerprint",
      fingerprint,
      "--verdict",
      "pass",
      "--note",
      "Reviewed exact fixture content and current evidence",
    );
  const childSnapshot = agent(
    "snapshot",
    ...scope,
    "--repo",
    "modules/app",
    "--file",
    "modules/app/feature.mjs",
  );
  visual();
  agent("verify", ...scope);
  review(childSnapshot.fingerprint);
  run(root, process.execPath, [
    cli,
    "--root",
    root,
    "backlog",
    "--session",
    owner.id,
    "--",
    "task",
    "edit",
    "TASK-1",
    "--check-ac",
    "1",
    "--final-summary",
    "Export behavior verified and independently reviewed before guarded commits",
  ]);
  const childCommit = agent("commit", ...scope, "--message", "feat(TASK-1): return two");
  const parentSnapshot = agent("snapshot", ...scope, "--repo", ".", "--file", "modules/app");
  visual();
  agent("verify", ...scope);
  assert.match(
    rejected(
      "review",
      "--session",
      reviewer.id,
      "--task",
      "TASK-1",
      "--fingerprint",
      "unknown",
      "--verdict",
      "pass",
      "--note",
      "Invalid",
    ),
    /retained final snapshot/,
  );
  review(parentSnapshot.fingerprint);
  await writeFile(resolve(child, "feature.mjs"), "export const value = 3;\n");
  assert.match(
    rejected(
      "review",
      "--session",
      reviewer.id,
      "--task",
      "TASK-1",
      "--fingerprint",
      childSnapshot.fingerprint,
      "--verdict",
      "pass",
      "--note",
      "Must reject changed committed content",
    ),
    /Working file changed/,
  );
  await writeFile(resolve(child, "feature.mjs"), "export const value = 2;\n");
  review(childSnapshot.fingerprint);
  agent("commit", ...scope, "--message", "chore(TASK-1): pin reviewed child commit");
  agent("stop", "--session", reviewer.id);
  agent(
    "release",
    ...scope,
    "--outcome",
    "done",
    "--note",
    "Child and parent snapshots verified and independently reviewed; guarded final bookkeeping succeeds",
  );
  assert.equal(JSON.parse(native("task", "view", "TASK-1", "--json")).task.status, "Done");
  assert.equal(git(root, "ls-tree", "HEAD", "modules/app").split(/\s+/)[2], childCommit.commit);
  assert.equal(git(root, "status", "--porcelain"), "");
  assert.equal(git(child, "status", "--porcelain"), "");
  agent("stop", "--session", owner.id);
  assert.deepEqual(agent("status", "--json").runs, {});
});

// Opt-in integration suite: uses the installed Backlog CLI and a disposable Git
// repository. It never initializes or changes the real project's tracker/index.
test("real Backlog supports approval, reassignment, review handoff, recovery, and verified completion", async (t) => {
  const root = await mkdtemp(resolve(tmpdir(), "workspace-backlog-integration-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const run = (command, args) => {
    const result = spawnSync(command, args, {
      cwd: root,
      env: { ...process.env, BACKLOG_CWD: root },
      encoding: "utf8",
      timeout: 30000,
    });
    assert.equal(
      result.status,
      0,
      `${command} ${args.join(" ")}\n${result.error ?? result.stderr}\n${result.stdout}`,
    );
    return result.stdout;
  };
  const agent = (...args) => run(process.execPath, [cli, "--root", root, ...args]);
  const native = (...args) => run("backlog", args);
  run("git", ["init", "--quiet"]);
  await mkdir(resolve(root, "backlog"));
  await writeFile(
    resolve(root, "backlog/config.yml"),
    await readFile(new URL("./fixtures/backlog.yml", import.meta.url)),
  );
  await writeFile(
    resolve(root, "agent-workspace.json"),
    await readFile(new URL("./fixtures/workspace.json", import.meta.url)),
  );
  native(
    "task",
    "create",
    "Disposable integration task",
    "-a",
    "@elm",
    "-l",
    "keep-me,approval-required",
    "--ac",
    "Roundtrip through the real Backlog CLI succeeds",
    "--plain",
  );
  const task = () => JSON.parse(native("task", "view", "TASK-1", "--json")).task;
  const oak = JSON.parse(
    agent(
      "start",
      "--agent",
      "oak",
      "--provider",
      "codex",
      "--context",
      "disposable integration coordinator",
    ),
  ).id;
  const elm = JSON.parse(
    agent(
      "start",
      "--agent",
      "elm",
      "--provider",
      "claude",
      "--context",
      "disposable provider-neutral worker",
    ),
  ).id;
  agent(
    "approve",
    "--session",
    oak,
    "--task",
    "TASK-1",
    "--note",
    "Synthetic approval in disposable test only",
  );
  agent(
    "assign",
    "--session",
    oak,
    "--task",
    "TASK-1",
    "--agent",
    "oak",
    "--note",
    "Exercise native assignment",
  );
  agent("claim", "--session", oak, "--task", "TASK-1", "--scope", "src");
  assert.equal(task().status, "In Progress");
  assert.ok(task().labels.includes(`working:${oak}`));
  agent(
    "backlog",
    "--session",
    oak,
    "--",
    "task",
    "edit",
    "TASK-1",
    "--plan",
    "Verify native CLI transitions in isolation",
  );
  agent(
    "release",
    "--session",
    oak,
    "--task",
    "TASK-1",
    "--outcome",
    "review",
    "--note",
    "Native review handoff",
  );
  assert.ok(task().labels.includes("needs-review"));
  assert.ok(!task().labels.some((label) => label.startsWith("working:")));
  agent(
    "assign",
    "--session",
    oak,
    "--task",
    "TASK-1",
    "--agent",
    "elm",
    "--note",
    "Exercise cross-provider handoff",
  );
  agent("claim", "--session", elm, "--task", "TASK-1", "--scope", "src");
  assert.ok(!task().labels.includes("needs-review"));
  agent(
    "recover",
    "--session",
    elm,
    "--by",
    oak,
    "--confirm-stopped",
    "--note",
    "Synthetic worker has no live edits; fixture recovery",
  );
  assert.equal(task().status, "To Do");
  agent(
    "assign",
    "--session",
    oak,
    "--task",
    "TASK-1",
    "--agent",
    "oak",
    "--note",
    "Complete recovered work",
  );
  agent("claim", "--session", oak, "--task", "TASK-1", "--scope", "src");
  agent(
    "backlog",
    "--session",
    oak,
    "--",
    "task",
    "edit",
    "TASK-1",
    "--check-ac",
    "1",
    "--final-summary",
    "Native CLI approval, ownership, handoff, recovery, and completion verified",
  );
  agent(
    "visual",
    "--session",
    oak,
    "--task",
    "TASK-1",
    "--kind",
    "no-ui",
    "--note",
    "CLI fixture has no UI",
  );
  agent(
    "release",
    "--session",
    oak,
    "--task",
    "TASK-1",
    "--outcome",
    "done",
    "--note",
    "Real Backlog roundtrip passed",
  );
  assert.equal(task().status, "Done");
  assert.deepEqual(task().labels, ["keep-me"]);
  assert.match(task().implementationNotes, /Human approval recorded/);
  assert.match(task().implementationNotes, /Recovered by/);
  agent("stop", "--session", oak);
  const status = JSON.parse(agent("status", "--json"));
  assert.deepEqual(status.claims, {});
  assert.equal(status.sessions.filter((value) => value.status === "active").length, 0);
  assert.match(native("doctor"), /No duplicate IDs/);
});

for (const commitMode of ["automatic", "never"])
  test(`unattended CLI binds final content to checks and independent review (commits=${commitMode})`, async (t) => {
    const root = await mkdtemp(resolve(tmpdir(), "workspace-unattended-integration-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    const invoke = (command, args) =>
      spawnSync(command, args, {
        cwd: root,
        env: { ...process.env, BACKLOG_CWD: root },
        encoding: "utf8",
        timeout: 30000,
      });
    const run = (command, args) => {
      const result = invoke(command, args);
      assert.equal(result.status, 0, `${result.error ?? result.stderr}\n${result.stdout}`);
      return result.stdout;
    };
    const native = (...args) => run("backlog", args);
    const agent = (...args) => run(process.execPath, [cli, "--root", root, ...args]);
    const rejected = (...args) => {
      const result = invoke(process.execPath, [cli, "--root", root, ...args]);
      assert.equal(result.status, 1, result.stdout);
      return result.stderr;
    };
    const git = (...args) => run("git", args);
    git("init", "--quiet");
    git("config", "user.name", "Fixture Agent");
    git("config", "user.email", "fixture@example.invalid");
    git("config", "commit.gpgsign", "false");
    await mkdir(resolve(root, "backlog"));
    await writeFile(resolve(root, ".gitignore"), ".local/\n.agents/agent-workspace/runtime/\n");
    await writeFile(
      resolve(root, "backlog/config.yml"),
      await readFile(new URL("./fixtures/backlog.yml", import.meta.url)),
    );
    const config = JSON.parse(
      await readFile(new URL("./fixtures/workspace.json", import.meta.url), "utf8"),
    );
    await mkdir(resolve(root, ".local"));
    const trackerWrapper = resolve(root, ".local/backlog.mjs");
    await writeFile(
      trackerWrapper,
      `import {existsSync} from 'node:fs'; import {spawnSync} from 'node:child_process'; const args=process.argv.slice(2); if(args[0]==='doctor'&&existsSync('.local/block-doctor')){console.error('Injected doctor failure');process.exit(1);} const r=spawnSync('backlog',args,{stdio:'inherit'}); process.exit(r.status??1);`,
    );
    config.backlog.command = process.execPath;
    config.backlog.args = [trackerWrapper];
    config.repositories = [
      {
        path: ".",
        readOnly: false,
        checks: [{ name: "syntax", command: [process.execPath, "--check", "src/feature.mjs"] }],
      },
    ];
    await writeFile(resolve(root, "agent-workspace.json"), JSON.stringify(config));
    git("add", ".gitignore", "backlog/config.yml", "agent-workspace.json");
    git("commit", "-qm", "Fixture baseline");
    native("task", "create", "Fixture feature", "--ac", "Feature verified", "--plain");
    const taskPath = JSON.parse(native("task", "view", "TASK-1", "--json")).task.path;
    git("add", taskPath);
    git("commit", "-qm", "Fixture task");
    const owner = JSON.parse(
      agent(
        "start",
        "--provider",
        "codex",
        "--context",
        "authorized fixture",
        "--profile",
        "unattended",
        "--commits",
        commitMode,
        "--allow-task",
        "TASK-1",
        "--authorization",
        "Synthetic user authorized TASK-1 with configured commit mode",
      ),
    );
    const reviewer = JSON.parse(
      agent(
        "start",
        "--agent",
        "rowan",
        "--provider",
        "claude",
        "--context",
        "independent fixture review",
        "--run",
        owner.runId,
      ),
    );
    const visual = () =>
      agent(
        "visual",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--kind",
        "no-ui",
        "--note",
        "Feature fixture has no UI",
      );
    agent(
      "claim",
      "--session",
      owner.id,
      "--task",
      "TASK-1",
      "--scope",
      "src",
      "--scope",
      "backlog/tasks",
    );
    await mkdir(resolve(root, "src"));
    await writeFile(resolve(root, "src/feature.mjs"), "export const feature = 1;\n");
    agent(
      "backlog",
      "--session",
      owner.id,
      "--",
      "task",
      "edit",
      "TASK-1",
      "--check-ac",
      "1",
      "--final-summary",
      "Fixture implementation verified",
    );
    visual();
    assert.match(
      rejected(
        "release",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--outcome",
        "done",
        "--note",
        "No evidence yet",
      ),
      /snapshot/i,
    );
    assert.match(
      rejected(
        "snapshot",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--repo",
        ".",
        "--file",
        taskPath,
      ),
      /live journal/,
    );
    let snapshot = JSON.parse(
      agent(
        "snapshot",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--repo",
        ".",
        "--file",
        "src/feature.mjs",
      ),
    );
    visual();
    assert.match(
      rejected(
        "review",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--fingerprint",
        snapshot.fingerprint,
        "--verdict",
        "pass",
        "--note",
        "self review disallowed",
      ),
      /Independent/,
    );
    agent("verify", "--session", owner.id, "--task", "TASK-1");
    agent(
      "review",
      "--session",
      reviewer.id,
      "--task",
      "TASK-1",
      "--fingerprint",
      snapshot.fingerprint,
      "--verdict",
      "pass",
      "--note",
      "Reviewer inspected feature and syntax evidence",
    );
    agent(
      "backlog",
      "--session",
      owner.id,
      "--",
      "task",
      "edit",
      "TASK-1",
      "--check-ac",
      "1",
      "--final-summary",
      "Fixture implementation verified",
    );
    await writeFile(resolve(root, "src/feature.mjs"), "export const feature = 2;\n");
    if (commitMode === "never")
      assert.match(
        rejected(
          "release",
          "--session",
          owner.id,
          "--task",
          "TASK-1",
          "--outcome",
          "done",
          "--note",
          "Stale evidence",
        ),
        /changed after snapshot/,
      );
    rejected(
      "commit",
      "--session",
      owner.id,
      "--task",
      "TASK-1",
      "--message",
      "feat: verified fixture feature",
    );
    assert.equal(git("rev-list", "--count", "HEAD").trim(), "2");
    snapshot = JSON.parse(
      agent(
        "snapshot",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--repo",
        ".",
        "--file",
        "src/feature.mjs",
      ),
    );
    visual();
    rejected(
      "commit",
      "--session",
      owner.id,
      "--task",
      "TASK-1",
      "--message",
      "feat: verified fixture feature",
    );
    agent("verify", "--session", owner.id, "--task", "TASK-1");
    agent(
      "review",
      "--session",
      reviewer.id,
      "--task",
      "TASK-1",
      "--fingerprint",
      snapshot.fingerprint,
      "--verdict",
      "pass",
      "--note",
      "Reviewed revised content and passing check",
    );
    if (commitMode === "never") {
      agent("stop", "--session", reviewer.id);
      await writeFile(resolve(root, "src/extra.mjs"), "export const extra = 1;\n");
      assert.match(
        rejected(
          "release",
          "--session",
          owner.id,
          "--task",
          "TASK-1",
          "--outcome",
          "done",
          "--note",
          "Unreviewed extra file",
        ),
        /lack current verification/,
      );
      await rm(resolve(root, "src/extra.mjs"));
      agent(
        "release",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--outcome",
        "done",
        "--note",
        "Current changes checked and independently reviewed; intentionally uncommitted",
      );
      assert.equal(JSON.parse(native("task", "view", "TASK-1", "--json")).task.status, "Done");
      assert.equal(git("rev-list", "--count", "HEAD").trim(), "2");
      agent("stop", "--session", owner.id);
      assert.equal(JSON.parse(agent("history", "--session", reviewer.id)).runId, owner.runId);
      return;
    }
    const commit = JSON.parse(
      agent(
        "commit",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--message",
        "feat: verified fixture feature",
      ),
    );
    assert.equal(git("show", `${commit.commit}:src/feature.mjs`), "export const feature = 2;\n");
    assert.deepEqual(
      git("diff-tree", "--no-commit-id", "--name-only", "-r", commit.commit).trim().split("\n"),
      ["src/feature.mjs"],
    );
    const replay = JSON.parse(
      agent(
        "commit",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--message",
        "feat: verified fixture feature",
      ),
    );
    assert.equal(replay.commit, commit.commit);
    assert.equal(git("rev-list", "--count", "HEAD").trim(), "3");
    const journals = JSON.parse(
      agent("commit-status", "--session", owner.id, "--task", "TASK-1"),
    ).journals;
    assert.equal(journals.length, 1);
    assert.equal(journals[0].phase, "committed");
    visual();
    assert.match(
      rejected(
        "release",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--outcome",
        "done",
        "--note",
        "Changed visual declaration",
      ),
      /passing review/,
    );
    agent(
      "review",
      "--session",
      reviewer.id,
      "--task",
      "TASK-1",
      "--fingerprint",
      snapshot.fingerprint,
      "--verdict",
      "pass",
      "--note",
      "Reviewed renewed visual declaration against the existing committed content",
    );
    agent("stop", "--session", reviewer.id);
    await writeFile(resolve(root, "src/extra.mjs"), "export const extra = 1;\n");
    assert.match(
      rejected(
        "release",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--outcome",
        "done",
        "--note",
        "premature",
      ),
      /remain uncommitted/,
    );
    await rm(resolve(root, "src/extra.mjs"));
    // Failed finalization retains ownership even after the native Done write.
    await writeFile(resolve(root, ".local/block-doctor"), "");
    assert.match(
      rejected(
        "release",
        "--session",
        owner.id,
        "--task",
        "TASK-1",
        "--outcome",
        "done",
        "--note",
        "Exact content committed and evidence recorded",
      ),
      /Injected doctor failure/,
    );
    assert.equal(JSON.parse(agent("status", "--json")).claims["TASK-1"].phase, "finalizing");
    const pending = JSON.parse(agent("queue")).pendingFinalizations[0];
    assert.equal(pending.task, "TASK-1");
    assert.match(pending.error.message, /Injected doctor failure/);
    assert.equal(
      JSON.parse(agent("commit-status", "--session", owner.id, "--task", "TASK-1")).phase,
      "finalizing",
    );
    await rm(resolve(root, ".local/block-doctor"));
    const finalBytes = await readFile(resolve(root, taskPath));
    await writeFile(
      resolve(root, taskPath),
      Buffer.concat([finalBytes, Buffer.from("\nUnowned edit\n")]),
    );
    assert.match(rejected("reconcile", "--session", owner.id), /outside the recorded writer/);
    await writeFile(resolve(root, taskPath), finalBytes);
    await writeFile(resolve(root, "human.txt"), "Human checkpoint\n");
    git("add", "human.txt");
    const checkpoint = git("ls-files", "--stage");
    assert.match(rejected("reconcile", "--session", owner.id), /pre-existing staged work/);
    assert.equal(git("ls-files", "--stage"), checkpoint);
    // Remove only the fixture's own test checkpoint, never a real user's index.
    git("reset", "--quiet", "--", "human.txt");
    await rm(resolve(root, "human.txt"));
    const pendingClaim = JSON.parse(agent("status", "--json")).claims["TASK-1"];
    agent("reconcile", "--session", owner.id);
    const task = JSON.parse(native("task", "view", "TASK-1", "--json")).task;
    assert.equal(task.status, "Done");
    assert.match(task.implementationNotes, new RegExp(commit.commit));
    assert.equal(git("rev-list", "--count", "HEAD").trim(), "4");
    assert.deepEqual(
      git("diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD").trim().split("\n"),
      [taskPath],
    );
    assert.equal(git("status", "--porcelain"), "");
    // Simulate process loss after Git saved success but before ownership release.
    const registryPath = resolve(root, ".agents/agent-workspace/runtime/state.json");
    const registry = JSON.parse(await readFile(registryPath, "utf8"));
    const bookkeeping = registry.runs[owner.runId].commits.find(
      (entry) => entry.kind === "bookkeeping",
    );
    const journal = JSON.parse(await readFile(bookkeeping.journalPath, "utf8"));
    pendingClaim.finalization = {
      snapshot: journal.snapshot,
      journalPath: bookkeeping.journalPath,
      message: journal.message,
    };
    registry.claims["TASK-1"] = pendingClaim;
    await writeFile(registryPath, JSON.stringify(registry));
    agent("reconcile", "--session", owner.id);
    assert.equal(git("rev-list", "--count", "HEAD").trim(), "4");
    assert.equal(git("status", "--porcelain"), "");
    agent("stop", "--session", owner.id);
    assert.deepEqual(JSON.parse(agent("status", "--json")).claims, {});
    assert.deepEqual(JSON.parse(agent("status", "--json")).runs, {});
    assert.equal(JSON.parse(agent("history", "--session", reviewer.id)).runId, owner.runId);
    const history = JSON.parse(agent("history", "--run", owner.runId));
    assert.ok(history.commits.some((entry) => entry.kind === "bookkeeping"));
    assert.equal(JSON.parse(agent("provenance", "--task", "TASK-1")).record.pending, false);
  });
