import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const skillsDir = join(repoRoot, "skills")

type Target = "codex" | "claude" | "cursor" | "repo-codex" | "repo-claude" | "repo-cursor"

const cwd = process.env.SKILLS_INSTALL_CWD ?? process.cwd()

interface Options {
  dryRun: boolean
  requestedSkill?: string
  symlink: boolean
  target: Target
}

function homeDir(): string {
  const home = process.env.HOME
  if (!home) throw new Error("HOME is not set")
  return home
}

function printUsage(): void {
  console.log(`Usage:
  pnpm tsx scripts/install-skills.ts [options] [codex|claude|cursor|repo-codex|repo-claude|repo-cursor] [skill-name]

Options:
  --no-symlink  Copy skills instead of symlinking them.
  --dry-run     Print the planned installs without creating directories, symlinks, or copies.
  -h, --help    Show this help.

Symlinks skill directories from ./skills into the selected destination by default.
`)
}

function usage(message?: string): never {
  if (message) {
    console.error(`${message}\n`)
  }

  printUsage()
  process.exit(message ? 1 : 0)
}

function parseArgs(args: string[]): Options {
  const positional: string[] = []
  let dryRun = false
  let symlink = true

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    switch (arg) {
      case "-h":
      case "--help":
        usage()
        break
      case "--dry-run":
        dryRun = true
        break
      case "--no-symlink":
        symlink = false
        break
      case "--":
        positional.push(...args.slice(index + 1))
        return positionalsToOptions(positional, { dryRun, symlink })
      default:
        if (arg.startsWith("-")) {
          usage(`Unknown option: ${arg}`)
        }

        positional.push(arg)
    }
  }

  return positionalsToOptions(positional, { dryRun, symlink })
}

function positionalsToOptions(positional: string[], options: Pick<Options, "dryRun" | "symlink">): Options {
  if (positional.length > 2) {
    usage(`Unexpected argument: ${positional[2]}`)
  }

  const target = (positional[0] ?? "codex") as Target
  return {
    ...options,
    requestedSkill: positional[1],
    target,
  }
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
      usage(`Unknown target: ${target}`)
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

const { dryRun, requestedSkill, symlink, target } = parseArgs(process.argv.slice(2))
const destination = getDestination(target)

if (!dryRun) {
  mkdirSync(destination, { recursive: true })
}

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

  if (dryRun) {
    if (symlink) {
      console.log(`Would symlink ${targetPath} -> ${skillPath}`)
    } else {
      console.log(`Would copy ${skillPath} -> ${targetPath}`)
    }
  } else {
    rmSync(targetPath, { recursive: true, force: true })

    if (symlink) {
      symlinkSync(skillPath, targetPath, "dir")
      console.log(`Symlinked ${targetPath} -> ${skillPath}`)
    } else {
      cpSync(skillPath, targetPath, { recursive: true })
      console.log(`Copied ${skillPath} -> ${targetPath}`)
    }
  }

  installed += 1
}

if (requestedSkill && installed === 0) {
  throw new Error(`Skill not found: ${requestedSkill}`)
}

const action = dryRun ? "Found" : symlink ? "Symlinked" : "Copied"
console.log(`Done. ${action} ${installed} skill${installed === 1 ? "" : "s"}.`)
