import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { access, readFile } from "node:fs/promises"
import { dirname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

import { catalogOutputs } from "./generate-catalog.mjs"
import { pluginOutputs, plugins, rootPath, saveGenerated } from "./plugins.mjs"

export async function checkPlugins() {
  await saveGenerated(await pluginOutputs(), { check: true })
  await saveGenerated(await catalogOutputs(), { check: true })
  const packages = await plugins()
  const names = new Set()
  for (const { name, path, codex, skills } of packages) {
    assert.equal(codex.skills, "./skills/", `${name}: skills must be packaged locally`)
    const pluginRoot = resolve(rootPath, path)
    let hasWorkspaceRelease = false
    try {
      await access(resolve(pluginRoot, "skills/setup-agent-workspace/release.json"))
      hasWorkspaceRelease = true
    } catch (error) {
      if (error.code !== "ENOENT") throw error
    }
    if (hasWorkspaceRelease) {
      execFileSync(
        process.execPath,
        [resolve(pluginRoot, "skills/setup-agent-workspace/scripts/bundle.mjs"), "--check"],
        {
          cwd: rootPath,
          stdio: "pipe",
        }
      )
    }
    for (const field of ["composerIcon", "logo", "logoDark"]) {
      const relative = codex.interface[field]
      assert.equal(typeof relative, "string", `${name}: missing ${field}`)
      const iconPath = resolve(pluginRoot, relative)
      assert.ok(iconPath.startsWith(`${pluginRoot}${sep}`), `${name}: icon must be inside the package`)
      const icon = await readFile(iconPath)
      assert.equal(icon.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${name}: invalid PNG icon`)
      assert.equal(icon.readUInt32BE(16), icon.readUInt32BE(20), `${name}: icon must be square`)
    }
    for (const skill of skills) {
      assert.ok(!names.has(skill.name), `Duplicate skill: ${skill.name}`)
      names.add(skill.name)
      const prose = skill.source.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, "").replace(/`[^`\n]*`/g, "")
      for (const [, target] of prose.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
        if (/^[a-z]+:|^#/i.test(target)) continue
        const destination = resolve(rootPath, dirname(skill.path), decodeURIComponent(target.split("#")[0]))
        assert.ok(destination.startsWith(`${pluginRoot}${sep}`), `${skill.path}: link escapes the package: ${target}`)
        await access(destination)
      }
    }
  }
  console.log(
    `Validated ${packages.length} plugins and ${names.size} skills, including versions, catalogs, icons and skill links.`
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await checkPlugins()
