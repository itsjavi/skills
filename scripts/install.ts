import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const skillsDir = join(repoRoot, "skills")

type Target = "codex" | "claude" | "cursor" | "repo-codex" | "repo-claude" | "repo-cursor"

const target = (process.argv[2] ?? "codex") as Target
const cwd = process.env.SKILLS_INSTALL_CWD ?? process.cwd()

function usage(): never {
  console.error(
    "Usage: pnpm tsx scripts/install.ts [codex|claude|cursor|repo-codex|repo-claude|repo-cursor] [skill-name]"
  )
  process.exit(1)
}

function homeDir(): string {
  const home = process.env.HOME
  if (!home) throw new Error("HOME is not set")
  return home
}

function getDestination(target: Target): string {
  switch (target) {
    case "codex":
      return join(homeDir(), ".agents", "skills")
    case "claude":
      return join(homeDir(), ".claude", "skills")
    case "cursor":
      return join(homeDir(), ".cursor", "skills")
    case "repo-codex":
      return join(cwd, ".agents", "skills")
    case "repo-claude":
      return join(cwd, ".claude", "skills")
    case "repo-cursor":
      return join(cwd, ".cursor", "skills")
    default:
      usage()
  }
}

function parseSkillName(skillPath: string): string | null {
  const skillMd = join(skillPath, "SKILL.md")
  if (!existsSync(skillMd)) return null

  const content = readFileSync(skillMd, "utf8")
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null

  const name = match[1].match(/^name:\s*([a-z0-9][a-z0-9-]*)\s*$/m)?.[1]
  return name ?? null
}

if (!existsSync(skillsDir)) {
  throw new Error(`Missing skills directory: ${skillsDir}`)
}

const requestedSkill = process.argv[3]
const destination = getDestination(target)
mkdirSync(destination, { recursive: true })

const skillFolders = readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(skillsDir, entry.name))
  .filter((skillPath) => existsSync(join(skillPath, "SKILL.md")))

let installed = 0

for (const skillPath of skillFolders) {
  const folderName = skillPath.split(/[\\/]/).at(-1)!
  const skillName = parseSkillName(skillPath) ?? folderName

  if (requestedSkill && requestedSkill !== skillName && requestedSkill !== folderName) {
    continue
  }

  const targetPath = join(destination, skillName)
  rmSync(targetPath, { recursive: true, force: true })
  cpSync(skillPath, targetPath, { recursive: true })
  console.log(`Installed ${skillName} -> ${targetPath}`)
  installed += 1
}

if (requestedSkill && installed === 0) {
  throw new Error(`Skill not found: ${requestedSkill}`)
}

console.log(`Done. Installed ${installed} skill${installed === 1 ? "" : "s"}.`)
