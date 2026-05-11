import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { parseSkillFrontmatterBlock } from "./utils"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const skillsDir = join(repoRoot, "skills")
const registryPath = join(repoRoot, "registry.json")

type Registry = {
  name: string
  repository?: string
  skills: Array<{ name: string; path: string; description: string }>
}

const errors: string[] = []
const discoveredSkills = new Map<string, { path: string; description: string }>()

function parseFrontmatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null

  return parseSkillFrontmatterBlock(match[1])
}

if (!existsSync(skillsDir)) {
  errors.push("Missing skills/ directory")
} else {
  const skills = readdirSync(skillsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())

  for (const skill of skills) {
    const skillPath = join(skillsDir, skill.name)
    const skillMdPath = join(skillPath, "SKILL.md")

    if (!existsSync(skillMdPath)) {
      errors.push(`${skill.name}: missing SKILL.md`)
      continue
    }

    const content = readFileSync(skillMdPath, "utf8")
    const frontmatter = parseFrontmatter(content)

    if (!frontmatter) {
      errors.push(`${skill.name}: missing frontmatter`)
      continue
    }

    if (!frontmatter.name) errors.push(`${skill.name}: missing frontmatter field "name"`)
    if (!frontmatter.description) errors.push(`${skill.name}: missing frontmatter field "description"`)
    if (frontmatter.name && frontmatter.name !== skill.name) {
      errors.push(`${skill.name}: frontmatter name must match folder name`)
    }
    if (frontmatter.description && frontmatter.description.length < 40) {
      errors.push(`${skill.name}: description is too short to be useful for auto-selection`)
    }

    if (frontmatter.name && frontmatter.description) {
      discoveredSkills.set(frontmatter.name, {
        path: `skills/${skill.name}`,
        description: frontmatter.description,
      })
    }
  }
}

if (!existsSync(registryPath)) {
  errors.push("Missing registry.json")
} else {
  const registry = JSON.parse(readFileSync(registryPath, "utf8")) as Registry

  for (const skill of registry.skills ?? []) {
    const expectedPath = join(repoRoot, skill.path)
    if (!existsSync(expectedPath)) errors.push(`registry: missing path for ${skill.name}: ${skill.path}`)
    if (!existsSync(join(expectedPath, "SKILL.md"))) errors.push(`registry: missing SKILL.md for ${skill.name}`)

    const discovered = discoveredSkills.get(skill.name)
    if (!discovered) {
      errors.push(`registry: extra or unknown skill "${skill.name}"`)
      continue
    }

    if (skill.path !== discovered.path) {
      errors.push(`registry: ${skill.name} path is "${skill.path}", expected "${discovered.path}"`)
    }

    if (skill.description !== discovered.description) {
      errors.push(`registry: ${skill.name} description is out of sync with SKILL.md`)
    }
  }

  for (const [skillName] of discoveredSkills) {
    const registryEntry = registry.skills?.find((skill) => skill.name === skillName)
    if (!registryEntry) errors.push(`registry: missing skill "${skillName}"`)
  }
}

if (errors.length > 0) {
  console.error("Skill validation failed:\n")
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log("All skills are valid.")
