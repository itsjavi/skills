import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ASSISTED,
  resolveSelection,
  newRun,
  joinRun,
  runLimit,
  gateLabels,
  assertCommitPolicy,
  assertEvidence,
} from "../scripts/agent-policy.mjs";

const config = JSON.parse(
  await readFile(new URL("./fixtures/workspace.json", import.meta.url), "utf8"),
);
const unattended = () => resolveSelection(config, { profile: "unattended" });
const scopedRun = (selection = unattended()) =>
  newRun(selection, {
    coordinator: "lead",
    allowedTasks: ["TASK-1", "TASK-2"],
    authorization: "User: implement these tasks unattended, local commits",
    repositories: config.repositories,
  });

test("named-agent and profile precedence is explicit override, agent default, project default", () => {
  const changed = structuredClone(config);
  changed.executionPolicy.defaultProfile = "unattended";
  assert.equal(resolveSelection(changed, { agent: "Goku" }).profileName, "assisted");
  assert.equal(
    resolveSelection(changed, { agent: "GOKU", profile: "unattended" }).profileName,
    "unattended",
  );
  assert.equal(resolveSelection(changed, { agent: "birch" }).profileName, "unattended");
  assert.equal(resolveSelection(config, { agent: "goku" }).policy.commits, "on-request");
  assert.throws(() => resolveSelection(config, { agent: "vegeta" }), /Unknown agent/);
});

test("profiles have independent controls and run snapshots do not mutate other sessions", () => {
  const selection = resolveSelection(config, { profile: "unattended", commits: "never" });
  const run = scopedRun(selection);
  selection.policy.commits = "automatic";
  config.executionPolicy.profiles.unattended.maxTasks = 11;
  assert.equal(run.policy.commits, "never");
  assert.equal(run.policy.maxTasks, 10);
  config.executionPolicy.profiles.unattended.maxTasks = 10;
  const solo = resolveSelection(config, { commits: "automatic", review: "self" });
  assert.equal(solo.policy.delegation, "single");
  assert.equal(solo.policy.commits, "automatic");
  assert.throws(() => resolveSelection(config, { "max-agents": "3" }), /Single-agent/);
  assert.throws(() => resolveSelection(config, { review: "independent" }), /separate reviewer/);
});

test("executionPolicy must be explicitly configured", () => {
  const missing = structuredClone(config);
  delete missing.executionPolicy;
  assert.throws(() => resolveSelection(missing), /Missing or invalid executionPolicy/);
  for (const executionPolicy of [null, [], "assisted"])
    assert.throws(
      () => resolveSelection({ ...config, executionPolicy }),
      /Missing or invalid executionPolicy/,
    );
});

test("automatic runs require explicit authorization and a bounded task set", () => {
  assert.throws(
    () => newRun(unattended(), { coordinator: "lead", allowedTasks: ["TASK-1"] }),
    /authorization/,
  );
  assert.throws(
    () => newRun(unattended(), { coordinator: "lead", authorization: "Run unattended" }),
    /scope/,
  );
  const run = scopedRun();
  assert.equal(runLimit(run, "TASK-99"), "TASK-99 is outside the authorized run scope.");
  run.policy.maxTasks = 1;
  run.touchedTasks.push("TASK-1");
  assert.match(runLimit(run, "TASK-2"), /task limit/);
  assert.equal(runLimit(run, "TASK-1"), null);
  assert.match(
    runLimit(run, "TASK-1", Date.parse(run.startedAt) + run.policy.maxMinutes * 60000),
    /time limit/,
  );
});

test("worker joins inherit policy and enforce counts including coordinator and reviewer", () => {
  const run = scopedRun();
  const sessions = { lead: { id: "lead", runId: run.id, status: "active" } };
  joinRun(run, sessions);
  assert.throws(() => joinRun(run, sessions, { commits: "automatic" }), /inherit/);
  sessions.worker = { id: "worker", runId: run.id, status: "active" };
  sessions.reviewer = { id: "reviewer", runId: run.id, status: "active" };
  assert.throws(() => joinRun(run, sessions), /agent limit/);
  sessions.reviewer.status = "closed";
  joinRun(run, sessions);
  sessions.lead.status = "closed";
  assert.throws(() => joinRun(run, sessions), /coordinator/);
});

test("human labels stay gates regardless of execution profile", () => {
  assert.deepEqual(
    gateLabels({
      labels: [
        "workspace",
        "needs-review",
        "needs-decision",
        "needs-human-review",
        "approval-required",
        "blocked",
      ],
    }),
    ["needs-decision", "needs-human-review", "approval-required", "blocked"],
  );
  const run = scopedRun();
  assertCommitPolicy(run);
  run.policy.commits = "never";
  assert.throws(() => assertCommitPolicy(run, "User asked"), /disabled/);
  run.policy.commits = "on-request";
  assert.throws(() => assertCommitPolicy(run), /explicit/);
  assertCommitPolicy(run, "User explicitly said commit this task");
});

test("evidence must match the exact snapshot and independent author identity", () => {
  const run = scopedRun();
  const snapshot = { fingerprint: "content-v2" };
  const claim = {
    session: "author",
    verification: { fingerprint: "content-v2", passed: true },
    review: { session: "reviewer", fingerprint: "content-v2", verdict: "pass" },
  };
  const sessions = { author: { runId: run.id }, reviewer: { runId: run.id } };
  assertEvidence(run, claim, snapshot, sessions);
  assert.throws(
    () => assertEvidence(run, claim, { fingerprint: "content-v3" }, sessions),
    /exact snapshot/,
  );
  claim.review.session = "author";
  assert.throws(() => assertEvidence(run, claim, snapshot, sessions), /different/);
  claim.review.session = "reviewer";
  sessions.reviewer.runId = "another-run";
  assert.throws(() => assertEvidence(run, claim, snapshot, sessions), /authorized run/);
  run.policy = { ...ASSISTED };
  claim.review.session = "author";
  assertEvidence(run, claim, snapshot, sessions);
});
