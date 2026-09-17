import assert from "node:assert/strict"
import test from "node:test"

import { plugins } from "../scripts/plugins.mjs"
import { upstreamSkills } from "../scripts/sync-upstream-skills.mjs"

test("every vendored skill is packaged and pinned to an upstream commit", async () => {
  const skills = await upstreamSkills()
  const packaged = new Set((await plugins()).flatMap((plugin) => plugin.skills.map(({ path }) => path)))
  assert.ok(skills.length)
  for (const { path, commit } of skills) {
    assert.ok(packaged.has(`${path}/SKILL.md`), `${path} is not a packaged skill`)
    assert.match(commit ?? "", /^[0-9a-f]{40}$/, `${path} has no recorded upstream commit`)
  }
})
