import { readdir, readFile, writeFile } from "node:fs/promises"

import { format } from "oxfmt"
import { parse } from "yaml"

const root = new URL("../", import.meta.url)
const read = (path) => readFile(new URL(path, root), "utf8")
const { printWidth, proseWrap } = JSON.parse(await read(".oxfmtrc.json"))

function parseSkill(source) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!frontmatter) throw new Error("Missing skill frontmatter")
  return parse(frontmatter[1])
}

async function catalog(directory, metadataPath, parseMetadata) {
  const entries = []
  for (const entry of await readdir(new URL(`${directory}/`, root), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const path = `${directory}/${encodeURIComponent(entry.name)}`
    let source
    try {
      source = await read(`${path}/${metadataPath}`)
    } catch (error) {
      if (error.code === "ENOENT") continue
      throw error
    }

    const { name, description } = parseMetadata(source)
    if (typeof name !== "string" || !name.trim() || typeof description !== "string" || !description.trim()) {
      throw new Error(`Missing name or description in ${path}/${metadataPath}`)
    }
    const summary = description
      .trim()
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)[0]
    const link = directory === "skills" ? `${path}/SKILL.md` : path
    entries.push({ name, line: `- [${name}](${link}): ${summary.replace(/\s*[\u2013\u2014]\s*/g, ", ")}` })
  }

  entries.sort((a, b) => a.name.localeCompare(b.name, "en"))
  const { code, errors } = await format("catalog.md", entries.map(({ line }) => line).join("\n"), {
    printWidth,
    proseWrap,
  })
  if (errors.length) throw new Error(`Could not format ${directory} catalog`)
  return code.trimEnd()
}

const original = await read("README.md")
let updated = original
for (const [section, metadataPath, parseMetadata] of [
  ["skills", "SKILL.md", parseSkill],
  ["plugins", ".codex-plugin/plugin.json", JSON.parse],
]) {
  const start = `<!-- catalog:${section}:start -->`
  const end = `<!-- catalog:${section}:end -->`
  const startIndex = updated.indexOf(start)
  const endIndex = updated.indexOf(end)
  if (updated.split(start).length !== 2 || updated.split(end).length !== 2 || endIndex < startIndex) {
    throw new Error(`README.md must contain exactly one ordered pair of ${section} catalog markers`)
  }
  const content = await catalog(section, metadataPath, parseMetadata)
  updated = `${updated.slice(0, startIndex + start.length)}\n\n${content}\n\n${updated.slice(endIndex)}`
}

if (updated !== original) await writeFile(new URL("README.md", root), updated)
console.log(updated === original ? "README.md catalog is up to date." : "Updated README.md catalog.")
