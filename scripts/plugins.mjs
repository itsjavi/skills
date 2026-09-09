import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { format } from "oxfmt"
import { parse } from "yaml"

export const root = new URL("../", import.meta.url)
export const rootPath = fileURLToPath(root)
export const read = (path) => readFile(new URL(path, root), "utf8")
export const readJson = async (path) => JSON.parse(await read(path))
export const marketplacePaths = [".agents/plugins/marketplace.json", ".claude-plugin/marketplace.json"]

const identifier = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const versionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/

export async function releaseVersion() {
  const { version } = await readJson("package.json")
  if (typeof version !== "string" || !versionPattern.test(version)) {
    throw new Error("package.json must declare a valid release version")
  }
  return version
}

async function directories(path) {
  return (await readdir(new URL(path, root), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort()
}

export async function plugins() {
  const result = []
  for (const name of await directories("plugins/")) {
    if (!identifier.test(name)) throw new Error(`Invalid plugin directory: ${name}`)
    const path = `plugins/${name}`
    const codexPath = `${path}/.codex-plugin/plugin.json`
    const claudePath = `${path}/.claude-plugin/plugin.json`
    const codex = await readJson(codexPath)
    if (codex.name !== name || !codex.description?.trim()) throw new Error(`Invalid metadata in ${codexPath}`)
    const skills = []
    for (const folder of await directories(`${path}/skills/`)) {
      const skillPath = `${path}/skills/${folder}/SKILL.md`
      const source = await read(skillPath)
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
      if (!frontmatter) throw new Error(`Missing frontmatter in ${skillPath}`)
      const metadata = parse(frontmatter[1])
      if (metadata.name !== folder || typeof metadata.description !== "string" || !metadata.description.trim()) {
        throw new Error(`Invalid skill metadata in ${skillPath}`)
      }
      skills.push({ ...metadata, path: skillPath, source })
    }
    if (!skills.length) throw new Error(`No skills in ${path}`)
    result.push({ name, path, codexPath, claudePath, codex, skills })
  }
  if (!result.length) throw new Error("No plugins found")
  return result
}

export async function formatted(path, source) {
  const { printWidth, proseWrap } = await readJson(".oxfmtrc.json")
  const { code, errors } = await format(path, source, { printWidth, proseWrap })
  if (errors.length) throw new Error(`Could not format ${path}`)
  return code
}

export async function saveGenerated(outputs, { check = false } = {}) {
  const changed = []
  for (const [path, source] of outputs) {
    let original
    try {
      original = await read(path)
    } catch (error) {
      if (error.code !== "ENOENT") throw error
    }
    if (original !== source) changed.push(path)
  }
  if (check && changed.length) throw new Error(`Generated files are out of date: ${changed.join(", ")}`)
  if (!check) {
    for (const path of changed) {
      const destination = fileURLToPath(new URL(path, root))
      await mkdir(dirname(destination), { recursive: true })
      await writeFile(destination, outputs.get(path))
    }
  }
  return changed
}

export async function pluginOutputs() {
  const version = await releaseVersion()
  const packages = await plugins()
  const outputs = new Map()
  for (const plugin of packages) {
    const codex = { ...plugin.codex, version }
    const claude = Object.fromEntries(
      ["name", "version", "description", "author", "homepage", "repository", "license", "skills", "keywords"]
        .filter((key) => codex[key] !== undefined)
        .map((key) => [key, codex[key]])
    )
    for (const [path, manifest] of [
      [plugin.codexPath, codex],
      [plugin.claudePath, claude],
    ]) {
      outputs.set(path, await formatted(path, JSON.stringify(manifest)))
    }
  }
  for (const [index, path] of marketplacePaths.entries()) {
    const catalog = await readJson(path)
    if (!identifier.test(catalog.name)) throw new Error(`Invalid marketplace name in ${path}`)
    const existing = new Map(catalog.plugins.map((entry) => [entry.name, entry]))
    const order = [...existing.keys(), ...packages.map(({ name }) => name)]
    const sorted = [...packages].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
    catalog.plugins = sorted.map(({ name, path: directory, codex }) =>
      index === 0
        ? {
            name,
            source: { source: "local", path: `./${directory}` },
            policy: existing.get(name)?.policy ?? { installation: "AVAILABLE", authentication: "ON_INSTALL" },
            category: codex.interface.category,
          }
        : { name, source: `./${directory}`, description: codex.description }
    )
    outputs.set(path, await formatted(path, JSON.stringify(catalog)))
  }
  return outputs
}
