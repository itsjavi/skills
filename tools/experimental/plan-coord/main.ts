import { Database } from "bun:sqlite"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs"
import { hostname, homedir } from "node:os"
import { dirname, isAbsolute, join, relative, resolve } from "node:path"

type Status = "active" | "blocked" | "paused" | "complete"
type ClaimMode = "exclusive" | "shared"
type BindMap = Record<string, string | number | boolean | bigint | Uint8Array | null>

interface ProjectContext {
  key: string
  name: string
  planningRoot: string
  originUrl: string | null
  repoRoot: string
  branch: string
  gitCommonDir: string
}

interface ProjectIdentity {
  repoRoot: string
  branch: string
  gitCommonDir: string
  configProjectId: string | null
  originUrl: string | null
  nameConfig: string | null
  projectKey: string
}

interface SessionRow {
  id: string
  agent: string
  task: string
  status: Status
  handoff: string | null
  blocker: string | null
  branch: string
  project_dir: string
  last_seen_at: string
}

interface ClaimRow {
  id: number
  session_id: string
  agent: string
  area: string
  task: string
  mode: ClaimMode
  status: string
  branch: string
  project_dir: string
  updated_at: string
}

interface BlockerRow {
  agent: string
  waiting_for: string
  fallback: string | null
  next_check: string | null
  status: string
}

interface DocRow {
  path: string
  kind: string
  title: string
  status: string | null
  hash: string
  last_seen_at: string
}

const STATUS_LABELS: Record<Status, string> = {
  active: "🚧 Active",
  blocked: "⛔ Blocked",
  paused: "⏸️ Paused",
  complete: "✅ Complete",
}

const args = process.argv.slice(2)
const command = args.shift()

main()

function main(): void {
  try {
    if (!command || command === "-h" || command === "--help") {
      printUsage()
      return
    }

    const db = openDb()
    ensureSchema(db)

    switch (command) {
      case "init":
        cmdInit(db, parseOptions(args))
        break
      case "sync-docs":
        cmdSyncDocs(db, parseOptions(args))
        break
      case "status":
        cmdStatus(db)
        break
      case "register":
        cmdRegister(db, parseOptions(args))
        break
      case "claim":
        cmdClaim(db, parseOptions(args))
        break
      case "update":
        cmdUpdate(db, parseOptions(args))
        break
      case "release":
        cmdRelease(db, parseOptions(args))
        break
      case "list":
        cmdList(db)
        break
      case "export-md":
        cmdExportMd(db, parseOptions(args))
        break
      default:
        die(`Unknown command: ${command}`)
    }

    db.close()
  } catch (error) {
    die(error instanceof Error ? error.message : String(error))
  }
}

function printUsage(): void {
  console.log(`Usage:
  plan-coord init [--planning-root DIR] [--project-id ID] [--name NAME]
  plan-coord sync-docs [--planning-root DIR]
  plan-coord status
  plan-coord register --agent NAME --task TEXT [--session ID]
  plan-coord claim --area AREA --task TEXT [--shared] [--force] [--session ID]
  plan-coord update --status active|paused|complete [--task TEXT] [--handoff PATH] [--session ID]
  plan-coord update --status blocked --blocker TEXT [--task TEXT] [--fallback TEXT] [--session ID]
  plan-coord release --area AREA [--session ID]
  plan-coord list
  plan-coord export-md --out PATH

Environment:
  PLAN_COORD_DB  Override SQLite database path.

Default database:
  $XDG_STATE_HOME/plan-coord/coord.sqlite, or ~/.local/state/plan-coord/coord.sqlite when XDG_STATE_HOME is unset.
`)
}

function parseOptions(input: string[]): Map<string, string | boolean> {
  const options = new Map<string, string | boolean>()

  for (let i = 0; i < input.length; i++) {
    const arg = input[i]

    if (arg === "--shared" || arg === "--force") {
      options.set(arg.slice(2), true)
      continue
    }

    if (!arg.startsWith("--")) {
      die(`Unexpected argument: ${arg}`)
    }

    const eq = arg.indexOf("=")
    if (eq !== -1) {
      options.set(arg.slice(2, eq), arg.slice(eq + 1))
      continue
    }

    const value = input[i + 1]
    if (!value || value.startsWith("--")) {
      die(`Missing value for ${arg}`)
    }

    options.set(arg.slice(2), value)
    i += 1
  }

  return options
}

function stringOption(options: Map<string, string | boolean>, key: string, fallback?: string): string {
  const value = options.get(key)
  if (typeof value === "string" && value.trim()) return value
  if (fallback !== undefined) return fallback
  die(`Missing required option: --${key}`)
}

function boolOption(options: Map<string, string | boolean>, key: string): boolean {
  return options.get(key) === true
}

function dbPath(): string {
  if (process.env.PLAN_COORD_DB) return resolve(process.env.PLAN_COORD_DB)

  const stateHome = process.env.XDG_STATE_HOME || join(homedir(), ".local", "state")
  return join(stateHome, "plan-coord", "coord.sqlite")
}

function openDb(): Database {
  const path = dbPath()
  mkdirSync(dirname(path), { recursive: true })
  const db = new Database(path, { create: true, readwrite: true })
  db.run("PRAGMA journal_mode = WAL;")
  db.run("PRAGMA busy_timeout = 5000;")
  db.run("PRAGMA foreign_keys = ON;")
  return db
}

function ensureSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      planning_root TEXT,
      origin_url TEXT,
      git_common_dir TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS worktrees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      project_dir TEXT NOT NULL,
      branch TEXT NOT NULL,
      git_common_dir TEXT NOT NULL,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_id, project_dir),
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      worktree_id INTEGER NOT NULL,
      agent TEXT NOT NULL,
      task TEXT NOT NULL,
      status TEXT NOT NULL,
      handoff TEXT,
      blocker TEXT,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(project_id, id),
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY(worktree_id) REFERENCES worktrees(id) ON DELETE CASCADE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      session_id TEXT NOT NULL,
      area TEXT NOT NULL,
      task TEXT NOT NULL,
      mode TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY(project_id, session_id) REFERENCES sessions(project_id, id) ON DELETE CASCADE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS blockers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      session_id TEXT NOT NULL,
      waiting_for TEXT NOT NULL,
      fallback TEXT,
      next_check TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY(project_id, session_id) REFERENCES sessions(project_id, id) ON DELETE CASCADE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS doc_index (
      project_id INTEGER NOT NULL,
      path TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT,
      hash TEXT NOT NULL,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(project_id, path),
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      event_type TEXT NOT NULL,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

function cmdInit(db: Database, options: Map<string, string | boolean>): void {
  const planningRoot = stringOption(options, "planning-root", detectPlanningRoot())
  const projectId = options.get("project-id")
  const name = options.get("name")

  if (typeof projectId === "string" && projectId.trim()) {
    git(["config", "planningWorkflow.projectId", projectId.trim()])
  }

  if (typeof name === "string" && name.trim()) {
    git(["config", "planningWorkflow.projectName", name.trim()])
  }

  const ctx = detectProjectContext(planningRoot)
  const projectDbId = upsertProject(db, ctx)
  const worktreeDbId = upsertWorktree(db, projectDbId, ctx)
  recordEvent(db, projectDbId, "init", { planningRoot, projectDir: ctx.repoRoot, worktreeDbId })

  console.log(`Initialized ${ctx.name}`)
  console.log(`Project key: ${ctx.key}`)
  console.log(`Planning root: ${ctx.planningRoot}`)
  console.log(`Project dir: ${ctx.repoRoot}`)
  console.log(`DB: ${dbPath()}`)
}

function cmdSyncDocs(db: Database, options: Map<string, string | boolean>): void {
  const ctx = detectProjectContext(
    stringOption(options, "planning-root", findStoredPlanningRoot(db) || detectPlanningRoot())
  )
  const projectDbId = upsertProject(db, ctx)
  upsertWorktree(db, projectDbId, ctx)
  const docs = readDocs(ctx.planningRoot)
  const warnings = docWarnings(ctx.planningRoot, docs)
  const tx = db.transaction((rows: DocRow[]) => {
    db.run("DELETE FROM doc_index WHERE project_id = ?", [projectDbId])
    const insert = db.query(`
      INSERT INTO doc_index (project_id, path, kind, title, status, hash)
      VALUES ($project_id, $path, $kind, $title, $status, $hash)
    `)
    for (const row of rows) {
      insert.run({
        $project_id: projectDbId,
        $path: row.path,
        $kind: row.kind,
        $title: row.title,
        $status: row.status,
        $hash: row.hash,
      })
    }
  })
  tx.immediate(docs)
  recordEvent(db, projectDbId, "sync-docs", { planningRoot: ctx.planningRoot, docs: docs.length })
  for (const warning of warnings) {
    console.error(`Warning: ${warning}`)
  }
  console.log(`Indexed ${docs.length} workflow doc${docs.length === 1 ? "" : "s"} from ${ctx.planningRoot}`)
}

function cmdStatus(db: Database): void {
  const ctx = detectProjectContext(findStoredPlanningRoot(db) || detectPlanningRoot())
  const projectDbId = upsertProject(db, ctx)
  upsertWorktree(db, projectDbId, ctx)
  const session = currentSession(db, projectDbId)
  const stale = staleDocs(db, projectDbId, ctx.planningRoot)

  console.log(`Project: ${ctx.name}`)
  console.log(`Project key: ${ctx.key}`)
  console.log(`Planning root: ${ctx.planningRoot}`)
  console.log(`Project dir: ${ctx.repoRoot}`)
  console.log(`Branch: ${ctx.branch}`)
  console.log(`DB: ${dbPath()}`)
  console.log(`Session: ${session?.id ?? "none"}`)
  console.log(`Doc cache: ${stale.length ? `stale (${stale.length})` : "current or empty"}`)
}

function cmdRegister(db: Database, options: Map<string, string | boolean>): void {
  const ctx = detectProjectContext(findStoredPlanningRoot(db) || detectPlanningRoot())
  const projectDbId = upsertProject(db, ctx)
  const worktreeDbId = upsertWorktree(db, projectDbId, ctx)
  const sessionId = stringOption(options, "session", defaultSessionId(ctx.repoRoot))
  const agent = stringOption(options, "agent")
  const task = stringOption(options, "task")

  db.query(`
    INSERT INTO sessions (id, project_id, worktree_id, agent, task, status)
    VALUES ($id, $project_id, $worktree_id, $agent, $task, 'active')
    ON CONFLICT(project_id, id) DO UPDATE SET
      worktree_id = excluded.worktree_id,
      agent = excluded.agent,
      task = excluded.task,
      status = 'active',
      last_seen_at = CURRENT_TIMESTAMP
  `).run({ $id: sessionId, $project_id: projectDbId, $worktree_id: worktreeDbId, $agent: agent, $task: task })
  recordEvent(db, projectDbId, "register", { sessionId, agent, task, projectDir: ctx.repoRoot })
  console.log(`Registered ${agent} (${sessionId})`)
}

function cmdClaim(db: Database, options: Map<string, string | boolean>): void {
  const ctx = detectProjectContext(findStoredPlanningRoot(db) || detectPlanningRoot())
  const projectDbId = upsertProject(db, ctx)
  const sessionId = ensureSession(db, projectDbId, ctx, options)
  const area = stringOption(options, "area")
  const task = stringOption(options, "task")
  const mode: ClaimMode = boolOption(options, "shared") ? "shared" : "exclusive"

  if (!boolOption(options, "force")) {
    const conflict = db
      .query<ClaimRow, [number, string]>(`
      SELECT c.*, c.session_id, s.agent, w.branch, w.project_dir
      FROM claims c
      JOIN sessions s ON s.project_id = c.project_id AND s.id = c.session_id
      JOIN worktrees w ON w.id = s.worktree_id
      WHERE c.project_id = ? AND c.status = 'active' AND c.session_id != ?
    `)
      .all(projectDbId, sessionId)
      .find((claim) => overlaps(claim.area, area) && (claim.mode === "exclusive" || mode === "exclusive"))
    if (conflict) {
      die(`Claim conflict with ${conflict.agent} on ${conflict.area} (${conflict.project_dir})`)
    }
  }

  db.query(`
    INSERT INTO claims (project_id, session_id, area, task, mode, status)
    VALUES ($project_id, $session_id, $area, $task, $mode, 'active')
  `).run({ $project_id: projectDbId, $session_id: sessionId, $area: area, $task: task, $mode: mode })
  recordEvent(db, projectDbId, "claim", { sessionId, area, task, mode })
  console.log(`Claimed ${area} (${mode})`)
}

function cmdUpdate(db: Database, options: Map<string, string | boolean>): void {
  const ctx = detectProjectContext(findStoredPlanningRoot(db) || detectPlanningRoot())
  const projectDbId = upsertProject(db, ctx)
  const sessionId = ensureSession(db, projectDbId, ctx, options)
  const status = stringOption(options, "status") as Status
  if (!Object.hasOwn(STATUS_LABELS, status)) die(`Invalid status: ${status}`)

  const task = options.get("task")
  const handoff = options.get("handoff")
  const blocker = options.get("blocker")
  const blockerText = stringOrNull(blocker)?.trim() || null
  if (status === "blocked" && !blockerText) die("Missing required option: --blocker when --status blocked")

  db.query(`
    UPDATE sessions
    SET status = $status,
        task = COALESCE($task, task),
        handoff = COALESCE($handoff, handoff),
        blocker = $blocker,
        last_seen_at = CURRENT_TIMESTAMP
    WHERE id = $id AND project_id = $project_id
  `).run({
    $status: status,
    $task: typeof task === "string" ? task : null,
    $handoff: typeof handoff === "string" ? handoff : null,
    $blocker: status === "blocked" ? blockerText : null,
    $id: sessionId,
    $project_id: projectDbId,
  })

  if (status === "complete") {
    db.run(
      "UPDATE claims SET status = 'released', updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND session_id = ?",
      [projectDbId, sessionId]
    )
  }

  if (status !== "blocked" || blockerText) {
    db.run(
      "UPDATE blockers SET status = 'resolved', updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND session_id = ? AND status = 'active'",
      [projectDbId, sessionId]
    )
  }

  if (status === "blocked" && blockerText) {
    db.query<unknown, BindMap>(`
      INSERT INTO blockers (project_id, session_id, waiting_for, fallback, status)
      VALUES ($project_id, $session_id, $waiting_for, $fallback, 'active')
    `).run({
      $project_id: projectDbId,
      $session_id: sessionId,
      $waiting_for: blockerText,
      $fallback: stringOrNull(options.get("fallback")),
    })
  }

  recordEvent(db, projectDbId, "update", { sessionId, status, handoff, blocker })
  console.log(`Updated ${sessionId} -> ${status}`)
}

function cmdRelease(db: Database, options: Map<string, string | boolean>): void {
  const ctx = detectProjectContext(findStoredPlanningRoot(db) || detectPlanningRoot())
  const projectDbId = upsertProject(db, ctx)
  const sessionId = ensureSession(db, projectDbId, ctx, options)
  const area = stringOption(options, "area")
  const result = db.run(
    "UPDATE claims SET status = 'released', updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND session_id = ? AND area = ? AND status = 'active'",
    [projectDbId, sessionId, area]
  )
  recordEvent(db, projectDbId, "release", { sessionId, area })
  console.log(`Released ${result.changes} claim${result.changes === 1 ? "" : "s"}`)
}

function cmdList(db: Database): void {
  const ctx = detectProjectContext(findStoredPlanningRoot(db) || detectPlanningRoot())
  const projectDbId = upsertProject(db, ctx)
  upsertWorktree(db, projectDbId, ctx)
  const sessions = listSessions(db, projectDbId)
  const claims = listClaims(db, projectDbId)
  const blockers = listBlockers(db, projectDbId)

  console.log(`# ${ctx.name}`)
  console.log(`Project dir: ${ctx.repoRoot}`)
  console.log("")
  console.log("Active sessions:")
  printRows(sessions.map((row) => [row.agent, row.status, row.branch, row.project_dir, row.task, row.handoff ?? ""]))
  console.log("")
  console.log("Claims:")
  printRows(claims.map((row) => [row.agent, row.mode, row.area, row.status, row.branch, row.project_dir, row.task]))
  console.log("")
  console.log("Blockers:")
  printRows(blockers.map((row) => [row.agent, row.waiting_for, row.fallback ?? "", row.next_check ?? "", row.status]))
}

function cmdExportMd(db: Database, options: Map<string, string | boolean>): void {
  const out = resolve(stringOption(options, "out"))
  const ctx = detectProjectContext(findStoredPlanningRoot(db) || detectPlanningRoot(dirname(out)))
  const projectDbId = upsertProject(db, ctx)
  upsertWorktree(db, projectDbId, ctx)
  const sessions = listSessions(db, projectDbId).filter((row) => row.status !== "complete")
  const claims = listClaims(db, projectDbId)
  const blockers = listBlockers(db, projectDbId)
  const content = renderCoordinationMarkdown(ctx, sessions, claims, blockers)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, content)
  recordEvent(db, projectDbId, "export-md", { out })
  console.log(`Exported ${out}`)
}

function detectProjectContext(planningRootInput?: string): ProjectContext {
  const identity = detectProjectIdentity()
  const planningRoot = resolve(
    identity.repoRoot,
    planningRootInput ||
      gitMaybe(["config", "--get", "planningWorkflow.planningRoot"]) ||
      detectPlanningRoot(identity.repoRoot)
  )
  const name =
    identity.nameConfig ||
    packageName(identity.repoRoot) ||
    basenameFromOrigin(identity.originUrl) ||
    identity.repoRoot.split("/").pop() ||
    "project"
  return {
    key: identity.projectKey,
    name,
    planningRoot,
    originUrl: identity.originUrl,
    repoRoot: identity.repoRoot,
    branch: identity.branch,
    gitCommonDir: identity.gitCommonDir,
  }
}

function detectProjectIdentity(): ProjectIdentity {
  const repoRoot = realpathSync(git(["rev-parse", "--show-toplevel"]))
  const branch = git(["branch", "--show-current"]) || "detached"
  const commonRaw = git(["rev-parse", "--git-common-dir"])
  const gitCommonDir = realpathSync(resolve(repoRoot, commonRaw))
  const configProjectId = gitMaybe(["config", "--get", "planningWorkflow.projectId"])
  const originUrl = gitMaybe(["config", "--get", "remote.origin.url"])
  const nameConfig = gitMaybe(["config", "--get", "planningWorkflow.projectName"])
  const projectKey =
    configProjectId || (originUrl ? `git:${normalizeOrigin(originUrl)}` : `gitdir:${sha(gitCommonDir)}`)
  return { repoRoot, branch, gitCommonDir, configProjectId, originUrl, nameConfig, projectKey }
}

function upsertProject(db: Database, ctx: ProjectContext): number {
  db.query(`
    INSERT INTO projects (project_key, name, planning_root, origin_url, git_common_dir)
    VALUES ($project_key, $name, $planning_root, $origin_url, $git_common_dir)
    ON CONFLICT(project_key) DO UPDATE SET
      name = excluded.name,
      planning_root = COALESCE(excluded.planning_root, projects.planning_root),
      origin_url = excluded.origin_url,
      git_common_dir = excluded.git_common_dir,
      updated_at = CURRENT_TIMESTAMP
  `).run({
    $project_key: ctx.key,
    $name: ctx.name,
    $planning_root: planningRootForStorage(ctx),
    $origin_url: ctx.originUrl,
    $git_common_dir: ctx.gitCommonDir,
  })
  const row = db.query<{ id: number }, [string]>("SELECT id FROM projects WHERE project_key = ?").get(ctx.key)
  if (!row) die("Could not upsert project")
  return row.id
}

function upsertWorktree(db: Database, projectDbId: number, ctx: ProjectContext): number {
  db.query(`
    INSERT INTO worktrees (project_id, project_dir, branch, git_common_dir)
    VALUES ($project_id, $project_dir, $branch, $git_common_dir)
    ON CONFLICT(project_id, project_dir) DO UPDATE SET
      branch = excluded.branch,
      git_common_dir = excluded.git_common_dir,
      last_seen_at = CURRENT_TIMESTAMP
  `).run({
    $project_id: projectDbId,
    $project_dir: ctx.repoRoot,
    $branch: ctx.branch,
    $git_common_dir: ctx.gitCommonDir,
  })
  const row = db
    .query<{ id: number }, [number, string]>("SELECT id FROM worktrees WHERE project_id = ? AND project_dir = ?")
    .get(projectDbId, ctx.repoRoot)
  if (!row) die("Could not upsert worktree")
  return row.id
}

function ensureSession(
  db: Database,
  projectDbId: number,
  ctx: ProjectContext,
  options: Map<string, string | boolean>
): string {
  const sessionId = stringOption(options, "session", defaultSessionId(ctx.repoRoot))
  const row = db
    .query<{ id: string }, [string, number]>("SELECT id FROM sessions WHERE id = ? AND project_id = ?")
    .get(sessionId, projectDbId)
  if (row) {
    db.run("UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE project_id = ? AND id = ?", [
      projectDbId,
      sessionId,
    ])
    return sessionId
  }

  const worktreeDbId = upsertWorktree(db, projectDbId, ctx)
  db.query(`
    INSERT INTO sessions (id, project_id, worktree_id, agent, task, status)
    VALUES ($id, $project_id, $worktree_id, $agent, $task, 'active')
  `).run({
    $id: sessionId,
    $project_id: projectDbId,
    $worktree_id: worktreeDbId,
    $agent: process.env.USER || "agent",
    $task: "TBD",
  })
  return sessionId
}

function currentSession(db: Database, projectDbId: number): { id: string } | undefined {
  return (
    db
      .query<{ id: string }, [number]>(
        "SELECT id FROM sessions WHERE project_id = ? ORDER BY last_seen_at DESC LIMIT 1"
      )
      .get(projectDbId) ?? undefined
  )
}

function listSessions(db: Database, projectDbId: number): SessionRow[] {
  return db
    .query<SessionRow, [number]>(`
    SELECT s.id, s.agent, s.task, s.status AS status, s.handoff, s.blocker, w.branch, w.project_dir, s.last_seen_at
    FROM sessions s
    JOIN worktrees w ON w.id = s.worktree_id
    WHERE s.project_id = ?
    ORDER BY s.last_seen_at DESC
  `)
    .all(projectDbId)
}

function listClaims(db: Database, projectDbId: number): ClaimRow[] {
  return db
    .query<ClaimRow, [number]>(`
    SELECT c.id, c.session_id, s.agent, c.area, c.task, c.mode AS mode, c.status, w.branch, w.project_dir, c.updated_at
    FROM claims c
    JOIN sessions s ON s.project_id = c.project_id AND s.id = c.session_id
    JOIN worktrees w ON w.id = s.worktree_id
    WHERE c.project_id = ? AND c.status = 'active'
    ORDER BY c.updated_at DESC
  `)
    .all(projectDbId)
}

function listBlockers(db: Database, projectDbId: number): BlockerRow[] {
  return db
    .query<BlockerRow, [number]>(`
    SELECT s.agent, b.waiting_for, b.fallback, b.next_check, b.status
    FROM blockers b
    JOIN sessions s ON s.project_id = b.project_id AND s.id = b.session_id
    WHERE b.project_id = ? AND b.status = 'active'
    ORDER BY b.updated_at DESC
  `)
    .all(projectDbId)
}

function readDocs(planningRoot: string): DocRow[] {
  const specs: Array<[string, string]> = [
    ["MILESTONES.md", "milestone-index"],
    ["BUSINESS_RULES.md", "business-rule-index"],
    ["COORDINATION.md", "coordination"],
    ["milestones", "milestone"],
    ["plans", "plan"],
    ["checkpoints", "checkpoint"],
    ["business-rules", "business-rule"],
    ["decisions", "decision"],
  ]
  const rows: DocRow[] = []
  for (const [entry, kind] of specs) {
    const full = join(planningRoot, entry)
    if (!existsSync(full)) continue
    if (entry.endsWith(".md")) {
      rows.push(readDocRow(planningRoot, full, kind))
    } else {
      for (const file of readdirSync(full)
        .filter((name) => name.endsWith(".md"))
        .sort()) {
        rows.push(readDocRow(planningRoot, join(full, file), kind))
      }
    }
  }
  return rows
}

function readDocRow(root: string, file: string, kind: string): DocRow {
  const content = readFileSync(file, "utf8")
  return {
    path: relative(root, file),
    kind,
    title: firstHeading(content) || file.split("/").pop() || file,
    status: extractStatus(content),
    hash: sha(content),
    last_seen_at: new Date().toISOString(),
  }
}

function docWarnings(planningRoot: string, docs: DocRow[]): string[] {
  const warnings: string[] = []
  for (const file of ["GUIDE.md", "MILESTONES.md", "BUSINESS_RULES.md", "COORDINATION.md"]) {
    if (!existsSync(join(planningRoot, file))) {
      warnings.push(`missing ${file}`)
    }
  }
  for (const doc of docs) {
    if (!doc.title || doc.title === "TBD") {
      warnings.push(`${doc.path} has no concrete title`)
    }
    if (
      ["milestone", "plan", "business-rule", "decision"].includes(doc.kind) &&
      (!doc.status || doc.status === "TBD")
    ) {
      warnings.push(`${doc.path} has no status`)
    }
  }
  return warnings
}

function staleDocs(db: Database, projectDbId: number, planningRoot: string): DocRow[] {
  const rows = db.query<DocRow, [number]>("SELECT * FROM doc_index WHERE project_id = ?").all(projectDbId)
  return rows.filter((row) => {
    const full = join(planningRoot, row.path)
    return !existsSync(full) || sha(readFileSync(full, "utf8")) !== row.hash
  })
}

function renderCoordinationMarkdown(
  ctx: ProjectContext,
  sessions: SessionRow[],
  claims: ClaimRow[],
  blockers: BlockerRow[]
): string {
  const claimBySession = new Map<string, string>()
  for (const claim of claims) {
    const existing = claimBySession.get(claim.session_id)
    claimBySession.set(claim.session_id, existing ? `${existing}, ${claim.area}` : claim.area)
  }

  return `# Coordination

Active parallel-work board for humans and agents.

Planning root: ${inline(relative(ctx.repoRoot, ctx.planningRoot) || ".")}.

This file is a human-readable coordination snapshot. It may be edited manually, or generated from \`plan-coord\` when the local live coordinator is available. Keep durable roadmap state in [Milestones](MILESTONES.md), current product/domain rules in [Business Rules](BUSINESS_RULES.md), workflow rules in [Guide](GUIDE.md), and completed phase handoffs in \`checkpoints/\`.

Last reviewed: ${new Date().toISOString()}

## Active Work

| Owner / agent | Branch | Project dir / worktree | Workspace / session | Task | Files / area owned | Depends on | Status | Last update | Handoff |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${
  sessions.length
    ? sessions
        .map((row) => {
          return `| ${cell(row.agent)} | ${cell(row.branch)} | ${cell(row.project_dir)} | ${cell(row.id)} | ${cell(row.task)} | ${cell(claimBySession.get(row.id) || "TBD")} | ${cell(row.blocker || "TBD")} | ${cell(STATUS_LABELS[row.status])} | ${cell(row.last_seen_at)} | ${cell(row.handoff || "TBD")} |`
        })
        .join("\n")
    : "| TBD | TBD | TBD | TBD | TBD | TBD | TBD | 🧭 Proposed | YYYY-MM-DD HH:mm | TBD |"
}

## Blocked Or Waiting

| Owner / agent | Waiting for | Current fallback | Next check |
| --- | --- | --- | --- |
${blockers.length ? blockers.map((row) => `| ${cell(row.agent)} | ${cell(row.waiting_for)} | ${cell(row.fallback || "TBD")} | ${cell(row.next_check || "TBD")} |`).join("\n") : "| TBD | TBD | TBD | TBD |"}

## Coordination Rules

- Add or update your row when starting, pausing, blocking, resuming, or completing active work.
- If \`plan-coord\` is available, use it for live register, claim, update, release, and export operations.
- If multiple agents share the same working directory, claim file or area ownership before editing.
- Keep rows brief; link to plans and checkpoints for details.
- Remove or archive stale rows after the work has a checkpoint and no longer needs active coordination.
- Durable completion details belong in checkpoints, not in this board.
- Branch/worktree inspection rules live in [Guide](GUIDE.md).
`
}

function firstHeading(content: string): string | null {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null
}

function extractStatus(content: string): string | null {
  return (
    content.match(/^\|\s*Status\s*\|\s*([^|]+?)\s*\|/m)?.[1]?.trim() ??
    content.match(/^- \*\*Status:\*\*\s*(.+)$/m)?.[1]?.trim() ??
    null
  )
}

function findStoredPlanningRoot(db: Database): string | null {
  const identity = detectProjectIdentity()
  const rows = db
    .query<{ planning_root: string | null; project_dir: string | null }, [string]>(`
      SELECT p.planning_root, w.project_dir
      FROM projects p
      LEFT JOIN worktrees w ON w.project_id = p.id
      WHERE p.project_key = ?
      ORDER BY w.last_seen_at DESC
    `)
    .all(identity.projectKey)
  const stored = rows[0]?.planning_root
  if (!stored) return null
  if (!isAbsolute(stored)) return stored
  if (isWithin(identity.repoRoot, stored)) return stored
  for (const row of rows) {
    if (row.project_dir && isWithin(row.project_dir, stored)) {
      const rebased = relative(row.project_dir, stored)
      return rebased || "."
    }
  }
  return stored
}

function detectPlanningRoot(base = gitMaybe(["rev-parse", "--show-toplevel"]) || process.cwd()): string {
  const candidates = ["docs", ".specs"]
  for (const candidate of candidates) {
    if (existsSync(join(base, candidate, "GUIDE.md"))) return join(base, candidate)
  }
  for (const candidate of candidates) {
    if (existsSync(join(base, candidate))) return join(base, candidate)
  }
  return join(base, ".specs")
}

function defaultSessionId(repoRoot: string): string {
  return `${hostname()}:${sha(repoRoot).slice(0, 10)}`
}

function planningRootForStorage(ctx: ProjectContext): string {
  const rel = relative(ctx.repoRoot, ctx.planningRoot)
  if (!rel) return "."
  return rel.startsWith("..") || isAbsolute(rel) ? ctx.planningRoot : rel
}

function isWithin(parent: string, child: string): boolean {
  const rel = relative(parent, child)
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))
}

function overlaps(left: string, right: string): boolean {
  const a = left.replace(/\/+$/, "")
  const b = right.replace(/\/+$/, "")
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`)
}

function packageName(repoRoot: string): string | null {
  const file = join(repoRoot, "package.json")
  if (!existsSync(file)) return null
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as { name?: string }
    return parsed.name ?? null
  } catch {
    return null
  }
}

function basenameFromOrigin(origin: string | null): string | null {
  if (!origin) return null
  return normalizeOrigin(origin).split("/").pop() ?? null
}

function normalizeOrigin(origin: string): string {
  return origin
    .trim()
    .replace(/^git@([^:]+):/, "https://$1/")
    .replace(/^ssh:\/\/git@/, "https://")
    .replace(/\.git$/, "")
    .replace(/\/+$/, "")
    .toLowerCase()
}

function sha(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim()
}

function gitMaybe(args: string[]): string | null {
  try {
    const value = git(args)
    return value || null
  } catch {
    return null
  }
}

function recordEvent(db: Database, projectId: number, eventType: string, details: unknown): void {
  db.query("INSERT INTO events (project_id, event_type, details) VALUES (?, ?, ?)").run(
    projectId,
    eventType,
    JSON.stringify(details)
  )
}

function printRows(rows: string[][]): void {
  if (!rows.length) {
    console.log("  none")
    return
  }
  for (const row of rows) {
    console.log(`  - ${row.join(" | ")}`)
  }
}

function inline(value: string): string {
  return `\`${value.replace(/`/g, "\\`")}\``
}

function cell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ")
}

function stringOrNull(value: string | boolean | undefined): string | null {
  return typeof value === "string" ? value : null
}

function die(message: string): never {
  console.error(message)
  process.exit(1)
}
