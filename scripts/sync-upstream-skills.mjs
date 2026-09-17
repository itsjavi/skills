import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { cp, mkdtemp, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

import { catalogOutputs } from "./generate-catalog.mjs"
import { formatted, readJson, rootPath, saveGenerated } from "./plugins.mjs"

export const registryPath = "scripts/upstream-skills.json"

const pluginsRoot = resolve(rootPath, "plugins")
const execute = promisify(execFile)
const git = async (cwd, ...args) => (await execute("git", args, { cwd })).stdout.trim()
const short = (commit) => commit.slice(0, 7)

export async function upstreamSkills() {
  const { skills } = await readJson(registryPath)
  assert.ok(Array.isArray(skills) && skills.length, `${registryPath} must list at least one skill`)
  for (const { path, repository, branch, source, commit } of skills) {
    assert.match(repository ?? "", /^https:\/\/[\w.-]+(?:\/[\w.-]+){2}$/, `${path}: invalid repository`)
    assert.match(branch ?? "", /^\w[\w.-]*(?:\/[\w.-]+)*$/, `${path}: invalid branch`)
    assert.match(source ?? "", /^[\w.-]+(?:\/[\w.-]+)*$/, `${path}: invalid source`)
    assert.ok(!source.split("/").includes(".."), `${path}: source must not escape the upstream repository`)
    assert.ok(resolve(rootPath, path).startsWith(`${pluginsRoot}${sep}`), `${path}: destination must stay in plugins/`)
    if (commit !== undefined) assert.match(commit, /^[0-9a-f]{40}$/, `${path}: invalid commit`)
  }
  return skills
}

async function download({ path, repository, branch, source }) {
  const directory = await mkdtemp(join(tmpdir(), "upstream-skill-"))
  try {
    await git(directory, "init", "-q", "-b", "main")
    await git(directory, "config", "core.autocrlf", "false")
    await git(directory, "remote", "add", "origin", repository)
    await git(directory, "sparse-checkout", "set", "--no-cone", `/${source}/`)
    await git(directory, "fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", branch)
    await git(directory, "checkout", "-q", "FETCH_HEAD")
    const upstream = join(directory, source)
    const entries = await readdir(upstream).catch(() => [])
    assert.ok(entries.length, `${path}: ${source} is missing or empty in ${repository} at ${branch}`)
    const destination = resolve(rootPath, path)
    await rm(destination, { recursive: true, force: true })
    await cp(upstream, destination, { recursive: true })
    return await git(directory, "rev-parse", "FETCH_HEAD")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

export async function syncUpstreamSkills() {
  const skills = await upstreamSkills()
  const report = []
  for (const skill of skills) {
    const commit = await download(skill)
    const previous = skill.commit
    skill.commit = commit
    report.push(
      `${skill.path}: ${previous === commit ? `already at ${short(commit)}` : `updated to ${short(commit)}${previous ? ` from ${short(previous)}` : ""}`}`
    )
  }
  const outputs = await catalogOutputs()
  outputs.set(registryPath, await formatted(registryPath, JSON.stringify({ skills })))
  const written = await saveGenerated(outputs)
  return [...report, ...written.map((path) => `${path}: regenerated`)]
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log((await syncUpstreamSkills()).join("\n"))
}
