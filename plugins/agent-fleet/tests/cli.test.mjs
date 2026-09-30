import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const plugin = fileURLToPath(new URL("../", import.meta.url))
const bin = join(plugin, "bin/agent-fleet.mjs")
const invoke = (cwd, args, executable = process.execPath) =>
  spawnSync(executable, executable === process.execPath ? [bin, ...args] : args, {
    cwd,
    encoding: "utf8",
    timeout: 30000,
  })
function okay(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout)
  return result.stdout
}
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), "agent-fleet cli "))
  t.after(() => rm(dir, { recursive: true, force: true }))
  return dir
}

test("launcher help, version and setup examples need no project", async (t) => {
  const dir = await fixture(t)
  assert.match(okay(invoke(dir, ["--help"])), /project's pinned/)
  assert.equal(
    okay(invoke(dir, ["--version"])).trim(),
    JSON.parse(await readFile(join(plugin, "package.json"), "utf8")).version
  )
  assert.equal(JSON.parse(okay(invoke(dir, ["init", "--example", "monorepo"]))).repositories[0].path, ".")
  assert.match(okay(invoke(dir, ["update", "--help"])), /--check/)
  const missing = invoke(dir, ["status"])
  assert.equal(missing.status, 1)
  assert.match(missing.stderr, /No agent-workspace.json/)
})

test("coordination runs the nearest project's pinned CLI and preserves cwd and arguments", async (t) => {
  const dir = await fixture(t)
  const project = join(dir, "project")
  const nested = join(project, "modules", "app")
  await mkdir(join(project, ".agents/agent-workspace/scripts"), { recursive: true })
  await mkdir(nested, { recursive: true })
  await writeFile(join(project, "agent-workspace.json"), "{}")
  await writeFile(
    join(project, ".agents/agent-workspace/scripts/agents.mjs"),
    "console.log(JSON.stringify({pinned:true,cwd:process.cwd(),args:process.argv.slice(2)}));\n"
  )
  const result = JSON.parse(okay(invoke(nested, ["status"])))
  assert.equal(result.pinned, true)
  assert.equal(result.cwd, await realpath(nested))
  assert.deepEqual(result.args, ["status"])
  const explicit = ["status", "--root", "../.."]
  assert.deepEqual(JSON.parse(okay(invoke(nested, explicit))).args, explicit)
  assert.equal(invoke(nested, ["status", "--root", project, "--root", project]).status, 1)
  const forwarded = ["backlog", "--session", "test", "--", "task", "edit", "TASK-1", "--root", "tracker-value"]
  assert.deepEqual(JSON.parse(okay(invoke(nested, forwarded))).args, forwarded)
})

test("npm tarball installs an executable in an isolated prefix with no project dependencies", async (t) => {
  const dir = await fixture(t)
  const packed = JSON.parse(okay(invoke(plugin, ["pack", "--json", "--pack-destination", dir], "npm")))[0]
  assert.ok(packed.files.some((file) => file.path === "skills/setup-agent-workspace/scripts/update.mjs"))
  assert.equal(
    packed.files.some((file) => file.path.includes("/runtime/") || file.path.includes("node_modules")),
    false
  )
  const prefix = join(dir, "prefix")
  okay(
    invoke(
      dir,
      [
        "install",
        "--global",
        "--prefix",
        prefix,
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--offline",
        join(dir, packed.filename),
      ],
      "npm"
    )
  )
  assert.equal(packed.name, "@itsjavi/agent-fleet")
  const installed = join(prefix, "bin/agent-fleet")
  assert.match(okay(invoke(dir, ["--help"], installed)), /portable agent workspace/)
  assert.equal(JSON.parse(okay(invoke(dir, ["init", "--example", "submodules"], installed))).repositories.length, 3)
  assert.match(okay(invoke(dir, ["update", "--help"], installed)), /--check/)
})
