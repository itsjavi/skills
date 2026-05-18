#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { basename, dirname, join, relative, resolve } from "node:path"

const requiredFiles = [
  "PRODUCT.md",
  "MILESTONES.md",
  "BUG_FIXES.md",
  "BUSINESS_RULES.md",
  "COORDINATION.md",
  "GUIDE.md",
  "CHECKS.md",
  "MANUAL_QA.md",
  "ENV_VARS.md",
  "SECURITY.md",
  "setup/local-development.md",
  "setup/production-hosting-and-deployment.md",
  "templates/DECISION.md",
  "templates/MILESTONE.md",
  "templates/BUG_FIX.md",
  "templates/BUSINESS_RULE.md",
  "templates/PLAN.md",
  "templates/PLAN_CHECKPOINT.md",
]

const requiredDirs = [
  "templates",
  "decisions",
  "milestones",
  "bug-fixes",
  "business-rules",
  "research",
  "plans",
  "checkpoints",
  "setup",
]

const planRequiredSections = [
  "## Goal",
  "## Definition of Done",
  "## Phase Status",
  "## Test / Validation Plan",
  "## How to QA",
  "## Decision Records",
  "## Documentation Updates",
]

const changelogCategories = new Set([
  "Added",
  "Changed",
  "Fixed",
  "Removed",
  "Security",
  "Operations",
  "QA / Verification",
  "None",
  "TBD",
])

const findings = []

function add(severity, message, path) {
  findings.push({ severity, message, path })
}

function rel(root, path) {
  return relative(root, path) || "."
}

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : null
}

function listMarkdown(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => join(dir, file))
    .sort()
}

function hasConcreteContent(content) {
  const normalized = content
    .replace(/^#.*$/gm, "")
    .replace(/TBD/g, "")
    .replace(/YYYY-MM-DD/g, "")
    .replace(/\|[-:|\s]+\|/g, "")
    .trim()

  return normalized.length >= 80
}

function extractMarkdownLinks(content) {
  const links = []
  const pattern = /\[[^\]]+\]\(([^)]+)\)/g
  let match

  while ((match = pattern.exec(content))) {
    const target = match[1].trim()
    if (!target || /^(https?:|mailto:|#)/.test(target)) continue
    links.push(target.split("#")[0])
  }

  return links.filter(Boolean)
}

function checkLocalLinks(root, file) {
  const content = readIfExists(file)
  if (!content) return

  for (const target of extractMarkdownLinks(content)) {
    const targetPath = resolve(dirname(file), target)
    if (!targetPath.startsWith(root)) continue
    if (!existsSync(targetPath)) add("FAIL", `Broken local link to ${target}`, rel(root, file))
  }
}

function getChangelogImpact(content) {
  const match = content.match(/\*\*Changelog Impact:\*\*\s*`?([^`\n(]+)`?/i)
  return match?.[1]?.trim()
}

function checkChangelogImpact(root, file, content) {
  if (!content.includes("Changelog Impact")) {
    add("WARN", "Missing Changelog Impact field", rel(root, file))
    return
  }

  const impact = getChangelogImpact(content)
  if (!impact) {
    add("WARN", "Changelog Impact field has no parseable value", rel(root, file))
    return
  }

  if (!changelogCategories.has(impact)) {
    add("FAIL", `Invalid Changelog Impact category "${impact}"`, rel(root, file))
  }
}

function checkRequired(root) {
  for (const dir of requiredDirs) {
    const path = join(root, dir)
    if (!existsSync(path) || !statSync(path).isDirectory()) add("FAIL", "Missing required directory", dir)
  }

  for (const file of requiredFiles) {
    const path = join(root, file)
    if (!existsSync(path)) {
      add("FAIL", "Missing required file", file)
      continue
    }

    const content = readIfExists(path) ?? ""
    if (!hasConcreteContent(content)) add("WARN", "File appears mostly empty or placeholder-only", file)
  }
}

function checkPlans(root) {
  for (const file of listMarkdown(join(root, "plans"))) {
    const name = basename(file)
    const content = readIfExists(file) ?? ""

    if (!/^\d{3}-\d{3}-[a-z0-9][a-z0-9-]*\.md$/.test(name)) {
      add("FAIL", "Plan filename should match MMM-PPP-slug.md", rel(root, file))
    }

    for (const section of planRequiredSections) {
      if (!content.includes(section)) add("FAIL", `Missing required plan section ${section}`, rel(root, file))
    }

    checkChangelogImpact(root, file, content)
  }
}

function checkCheckpoints(root) {
  const plans = new Set(listMarkdown(join(root, "plans")).map((file) => basename(file).replace(/\.md$/, "")))

  for (const file of listMarkdown(join(root, "checkpoints"))) {
    const name = basename(file)
    const content = readIfExists(file) ?? ""
    const match = name.match(/^(\d{3}-\d{3}-[a-z0-9][a-z0-9-]*)-[A-Z]\.md$/)

    if (!match) {
      add("FAIL", "Checkpoint filename should match MMM-PPP-slug-LETTER.md", rel(root, file))
    } else if (!plans.has(match[1])) {
      add("FAIL", `Checkpoint does not match an existing plan ${match[1]}.md`, rel(root, file))
    }

    if (!content.includes("**Plan:**")) add("WARN", "Checkpoint does not link a plan", rel(root, file))
    checkChangelogImpact(root, file, content)
  }
}

function checkBugFixes(root) {
  for (const file of listMarkdown(join(root, "bug-fixes"))) {
    const name = basename(file)
    const content = readIfExists(file) ?? ""

    if (!/^\d{3}-[a-z0-9][a-z0-9-]*\.md$/.test(name)) {
      add("FAIL", "Bug-fix filename should match BBB-slug.md", rel(root, file))
    }

    checkChangelogImpact(root, file, content)
  }
}

function checkChecks(root) {
  const path = join(root, "CHECKS.md")
  const content = readIfExists(path)
  if (!content) return

  const commands = [...content.matchAll(/`([^`\n]+)`/g)]
    .map((match) => match[1].trim())
    .filter((command) => command && command !== "TBD" && !/^Y{4}-M{2}-D{2}/.test(command))

  if (commands.length === 0) {
    add("WARN", "CHECKS.md has no concrete command snippets yet", rel(root, path))
  }
}

function checkManualQa(root) {
  const path = join(root, "MANUAL_QA.md")
  const content = readIfExists(path)
  if (!content) return

  const hasWorkflowHeading = /^### (?!TBD\b).+/m.test(content)
  const hasCurrentRow = /\|\s*[^|]*[A-Za-z0-9][^|]*\|\s*[^|]*[A-Za-z0-9][^|]*\|.*✅ Current/.test(content)

  if (!hasWorkflowHeading && !hasCurrentRow) {
    add("WARN", "MANUAL_QA.md has no concrete current workflow yet", rel(root, path))
  }
}

function checkPlanCoord(root) {
  for (const file of ["GUIDE.md", "COORDINATION.md"]) {
    const path = join(root, file)
    const content = readIfExists(path)
    if (!content) continue

    if (/plan-coord/i.test(content)) {
      add("WARN", "Workflow doc still mentions plan-coord", rel(root, path))
    }
  }
}

function checkIndexLinks(root) {
  for (const file of ["MILESTONES.md", "BUG_FIXES.md", "BUSINESS_RULES.md"]) {
    const path = join(root, file)
    if (existsSync(path)) checkLocalLinks(root, path)
  }
}

function main() {
  const input = process.argv[2] ?? ".specs"
  const root = resolve(input)

  if (!existsSync(root) || !statSync(root).isDirectory()) {
    console.error(`FAIL ${input}: planning root does not exist or is not a directory`)
    process.exit(1)
  }

  checkRequired(root)
  checkPlans(root)
  checkCheckpoints(root)
  checkBugFixes(root)
  checkChecks(root)
  checkManualQa(root)
  checkPlanCoord(root)
  checkIndexLinks(root)

  const severityRank = { FAIL: 0, WARN: 1, INFO: 2 }
  findings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || a.path.localeCompare(b.path))

  for (const finding of findings) {
    console.log(`${finding.severity} ${finding.path}: ${finding.message}`)
  }

  const counts = findings.reduce(
    (acc, finding) => {
      acc[finding.severity] += 1
      return acc
    },
    { FAIL: 0, WARN: 0, INFO: 0 }
  )

  console.log(`Summary: ${counts.FAIL} fail, ${counts.WARN} warn, ${counts.INFO} info`)

  if (counts.FAIL > 0) process.exit(1)
}

main()
