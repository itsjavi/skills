import { readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { parseSkillFrontmatterBlock } from "./utils"

type SkillRegistryEntry = {
  name: string
  path: string
  description: string
}

type Registry = {
  name: string
  repository: string
  generatedAt: string
  skills: SkillRegistryEntry[]
}

const rootDir = process.cwd()
const skillsDir = join(rootDir, "skills")
const registryPath = join(rootDir, "registry.json")

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)

  if (!match) {
    throw new Error("Missing frontmatter block")
  }

  return parseSkillFrontmatterBlock(match[1])
}

async function main() {
  const entries = await readdir(skillsDir, { withFileTypes: true })

  const skills: SkillRegistryEntry[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const skillName = entry.name
    const skillMdPath = join(skillsDir, skillName, "SKILL.md")

    const skillContent = await readFile(skillMdPath, "utf8")
    const frontmatter = parseFrontmatter(skillContent)

    if (!frontmatter.name) {
      throw new Error(`${skillMdPath} is missing "name" in frontmatter`)
    }

    if (!frontmatter.description) {
      throw new Error(`${skillMdPath} is missing "description" in frontmatter`)
    }

    if (frontmatter.name !== skillName) {
      throw new Error(`${skillMdPath} has name "${frontmatter.name}", but folder is "${skillName}"`)
    }

    skills.push({
      name: frontmatter.name,
      path: `skills/${skillName}`,
      description: frontmatter.description,
    })
  }

  skills.sort((a, b) => a.name.localeCompare(b.name))

  const registry: Registry = {
    name: "itsjavi/skills",
    repository: "https://github.com/itsjavi/skills",
    generatedAt: new Date().toISOString(),
    skills,
  }

  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`)

  console.log(`Generated registry.json with ${skills.length} skills.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
