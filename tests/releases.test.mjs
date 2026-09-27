import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const source = fileURLToPath(new URL("../", import.meta.url))
const names = ["coolify", "devscout", "gamegen", "safeguard", "uxdesign", "webcraft"]
const manifests = names.flatMap((name) =>
  ["codex", "claude"].map((platform) => `plugins/${name}/.${platform}-plugin/plugin.json`)
)

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), "skills release test "))
  t.after(() => rm(directory, { recursive: true, force: true }))
  for (const path of [
    "scripts",
    "plugins",
    "package.json",
    "README.md",
    ".oxfmtrc.json",
    ".gitignore",
    ".agents/plugins/marketplace.json",
    ".claude-plugin/marketplace.json",
  ]) {
    await mkdir(dirname(join(directory, path)), { recursive: true })
    await cp(join(source, path), join(directory, path), { recursive: true })
  }
  await symlink(join(source, "node_modules"), join(directory, "node_modules"), "dir")
  const run = (command, args, { succeeds = true } = {}) => {
    const result = spawnSync(command, args, {
      cwd: directory,
      encoding: "utf8",
      timeout: 30_000,
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_NOSYSTEM: "1",
        npm_config_ignore_scripts: "false",
        npm_config_git_tag_version: "true",
        npm_config_sign_git_tag: "false",
        npm_config_commit_hooks: "false",
      },
    })
    assert.ifError(result.error)
    const output = `${result.stdout}${result.stderr}`
    if (succeeds) assert.equal(result.status, 0, output)
    else assert.notEqual(result.status, 0, output)
    return output.trim()
  }
  const git = (...args) => run("git", args)
  const npm = (...args) => run("npm", args)
  const read = (path) => readFile(join(directory, path), "utf8")
  const json = async (path) => JSON.parse(await read(path))
  const writeJson = (path, value) => writeFile(join(directory, path), `${JSON.stringify(value, null, 2)}\n`)
  git("init", "-b", "main")
  git("config", "user.name", "Release Test")
  git("config", "user.email", "release-test@example.invalid")
  git("config", "commit.gpgsign", "false")
  git("add", ".")
  git("commit", "-m", "Fixture baseline")
  return { directory, run, git, npm, read, json, writeJson }
}

test("version:sync repairs both platforms without bumping, staging, committing or tagging", async (t) => {
  const f = await fixture(t)
  const version = (await f.json("package.json")).version
  const head = f.git("rev-parse", "HEAD")
  for (const path of manifests) await f.writeJson(path, { ...(await f.json(path)), version: "0.0.0" })
  f.npm("run", "version:sync")
  for (const path of manifests) assert.equal((await f.json(path)).version, version)
  assert.equal((await f.json("package.json")).version, version)
  assert.equal(f.git("rev-parse", "HEAD"), head)
  assert.equal(f.git("tag", "--list"), "")
  assert.equal(f.git("diff", "--cached", "--name-only"), "")
  assert.equal(f.git("status", "--porcelain"), "")
  f.npm("run", "version:sync")
  assert.equal(f.git("status", "--porcelain"), "")
})

test("npm version includes every synchronized manifest in the release commit and tag", async (t) => {
  const f = await fixture(t)
  const before = (await f.json("package.json")).version
  const [major, minor, patch] = before.split(".").map(Number)
  const expected = `${major}.${minor}.${patch + 1}`
  f.npm("version", "patch", "-m", "chore(release): %s")
  assert.equal((await f.json("package.json")).version, expected)
  for (const path of manifests) {
    assert.equal((await f.json(path)).version, expected)
    assert.equal(JSON.parse(f.git("show", `v${expected}:${path}`)).version, expected)
  }
  assert.equal(f.git("rev-parse", `v${expected}^{commit}`), f.git("rev-parse", "HEAD"))
  assert.equal(f.git("rev-list", "--count", "HEAD"), "2")
  assert.equal(f.git("status", "--porcelain"), "")
  assert.deepEqual(
    f.git("diff", "--name-only", "HEAD^", "HEAD").split("\n").sort(),
    ["package.json", ...manifests].sort()
  )
  f.npm("run", "check")
})

test("--no-git-tag-version synchronizes versions and leaves all changes unstaged", async (t) => {
  const f = await fixture(t)
  const head = f.git("rev-parse", "HEAD")
  f.npm("version", "patch", "--no-git-tag-version")
  const version = (await f.json("package.json")).version
  for (const path of manifests) assert.equal((await f.json(path)).version, version)
  assert.equal(f.git("rev-parse", "HEAD"), head)
  assert.equal(f.git("tag", "--list"), "")
  assert.equal(f.git("diff", "--cached", "--name-only"), "")
  assert.deepEqual(f.git("diff", "--name-only").split("\n").sort(), ["package.json", ...manifests].sort())
  f.npm("run", "check")
})

test("a dirty tree prevents a release and preserves existing staged work", async (t) => {
  const f = await fixture(t)
  const original = await f.read("package.json")
  await writeFile(join(f.directory, "README.md"), `${await f.read("README.md")}\nWork in progress.\n`)
  f.git("add", "README.md")
  const staged = f.git("diff", "--cached")
  assert.match(f.run("npm", ["version", "patch"], { succeeds: false }), /not clean/i)
  assert.equal(await f.read("package.json"), original)
  assert.equal(f.git("diff", "--cached"), staged)
  assert.equal(f.git("tag", "--list"), "")
})

test("checks reject committed version drift before bumping and never repair it implicitly", async (t) => {
  const f = await fixture(t)
  const path = manifests[0]
  await f.writeJson(path, { ...(await f.json(path)), version: "0.0.0" })
  f.git("add", path)
  f.git("commit", "-m", "Stale generated version")
  const original = await f.read("package.json")
  assert.match(f.run("npm", ["run", "check"], { succeeds: false }), /out of date/i)
  f.run("npm", ["version", "patch"], { succeeds: false })
  assert.equal(await f.read("package.json"), original)
  assert.equal((await f.json(path)).version, "0.0.0")
  assert.equal(f.git("status", "--porcelain"), "")
  assert.equal(f.git("tag", "--list"), "")
})

test("checks reject broken bundled links and missing icons", async (t) => {
  const f = await fixture(t)
  const path = "plugins/webcraft/skills/react-development/SKILL.md"
  const original = await f.read(path)
  await writeFile(join(f.directory, path), `${original}\n[Missing reference](references/absent.md)\n`)
  assert.match(f.run("npm", ["run", "check"], { succeeds: false }), /absent\.md/)
  await writeFile(join(f.directory, path), original)
  await rm(join(f.directory, "plugins/webcraft/assets/icon.png"))
  assert.match(f.run("npm", ["run", "check"], { succeeds: false }), /icon\.png/)
})
