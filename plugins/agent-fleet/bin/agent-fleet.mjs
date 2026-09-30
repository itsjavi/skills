#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import { access, readFile, realpath } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = fileURLToPath(new URL("../", import.meta.url))
const installer = join(packageRoot, "skills/setup-agent-workspace/scripts")
const args = process.argv.slice(2)
const help = `Agent Fleet — portable agent workspace tools

Usage: agent-fleet COMMAND [options]

  init       Preview or initialize a project; see init --help
  update     Check, preview or apply a versioned update; see update --help
  status     Show the current project's registered sessions
  start      Register a scoped session; see start --help
  ...        Other commands use the project's pinned coordination CLI

  --help     Show this help
  --version  Show the launcher version

Coordination finds agent-workspace.json above the current directory, including
from a nested repository. Use --root PATH to select a workspace explicitly.
The project's own scripts execute coordination commands. Updating this global
launcher does not update projects; run update explicitly. No background service.
`

async function exists(path) {
  try {
    await access(path)
    return true
  } catch (error) {
    if (error.code === "ENOENT") return false
    throw error
  }
}

async function workspaceRoot() {
  const divider = args.indexOf("--")
  const controls = divider < 0 ? args : args.slice(0, divider)
  const roots = []
  for (let index = 0; index < controls.length; index++) {
    if (controls[index] === "--root") {
      if (!controls[index + 1] || controls[index + 1].startsWith("--")) throw Error("--root requires a path.")
      roots.push(controls[++index])
    } else if (controls[index].startsWith("--root=")) roots.push(controls[index].slice(7))
  }
  if (roots.length > 1) throw Error("Specify --root only once.")
  if (roots.length) {
    const root = await realpath(resolve(roots[0]))
    if (!(await exists(join(root, "agent-workspace.json")))) throw Error(`No agent-workspace.json in ${root}`)
    return root
  }
  let root = await realpath(process.cwd())
  while (!(await exists(join(root, "agent-workspace.json")))) {
    const parent = dirname(root)
    if (parent === root) throw Error("No agent-workspace.json found. Run agent-fleet init or pass --root PATH.")
    root = parent
  }
  return root
}

function execute(script, forwarded, cwd = process.cwd()) {
  const result = spawnSync(process.execPath, [script, ...forwarded], { cwd, stdio: "inherit" })
  if (result.error) throw result.error
  if (result.signal) process.kill(process.pid, result.signal)
  else process.exitCode = result.status ?? 1
}

async function main() {
  if (Number(process.versions.node.split(".")[0]) < 22) throw Error("Agent Fleet requires Node.js 22 or later.")
  if (!args.length || ["--help", "-h", "help"].includes(args[0])) {
    process.stdout.write(help)
    return
  }
  if (args[0] === "--version") {
    process.stdout.write(`${JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8")).version}\n`)
    return
  }
  if (["init", "update"].includes(args[0])) {
    execute(join(installer, `${args[0]}.mjs`), args.slice(1))
    return
  }
  const root = await workspaceRoot()
  const script = join(root, ".agents/agent-workspace/scripts/agents.mjs")
  if (!(await exists(script))) throw Error(`Workspace CLI missing: ${script}. Inspect setup before continuing.`)
  execute(script, args)
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
