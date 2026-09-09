import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { formatted, plugins, read, saveGenerated } from "./plugins.mjs"

const summary = (description) =>
  description
    .trim()
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)[0]
    .replace(/[\u2013\u2014]/g, ",")

export async function catalogOutputs() {
  const packages = await plugins()
  const skills = packages.flatMap((plugin) => plugin.skills).sort((a, b) => a.name.localeCompare(b.name, "en"))
  const sections = {
    skills: skills.map(({ name, path, description }) => `- [${name}](${path}): ${summary(description)}`).join("\n"),
    plugins: packages
      .map(
        ({ path, codex }) =>
          `- <img src="${path}/assets/icon.png" width="40" height="40" alt=""> [${codex.interface.displayName}](${path}): ${summary(codex.description)}`
      )
      .join("\n"),
  }
  let updated = await read("README.md")
  for (const [section, content] of Object.entries(sections)) {
    const start = `<!-- catalog:${section}:start -->`
    const end = `<!-- catalog:${section}:end -->`
    const startIndex = updated.indexOf(start)
    const endIndex = updated.indexOf(end)
    if (updated.split(start).length !== 2 || updated.split(end).length !== 2 || endIndex < startIndex) {
      throw new Error(`README.md must contain exactly one ordered pair of ${section} catalog markers`)
    }
    updated = `${updated.slice(0, startIndex + start.length)}\n\n${content}\n\n${updated.slice(endIndex)}`
  }
  return new Map([["README.md", await formatted("README.md", updated)]])
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const changed = await saveGenerated(await catalogOutputs(), { check: process.argv.includes("--check") })
  console.log(changed.length ? "Updated README.md catalog." : "README.md catalog is up to date.")
}
