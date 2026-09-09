import { execFileSync } from "node:child_process"

import { checkPlugins } from "./check-plugins.mjs"
import { catalogOutputs } from "./generate-catalog.mjs"
import { rootPath, saveGenerated } from "./plugins.mjs"
import { syncPlugins } from "./sync-plugins.mjs"

if (process.env.npm_lifecycle_event !== "version" || process.env.npm_command !== "version") {
  throw new Error("Run this hook through npm version. Use npm run version:sync to synchronize the current version.")
}

const changed = [...(await syncPlugins()), ...(await saveGenerated(await catalogOutputs()))]
await checkPlugins()
// npm exports a disabled boolean as an empty string in lifecycle scripts.
const tagVersion = process.env.npm_config_git_tag_version
if (tagVersion !== "" && tagVersion !== "false" && changed.length) {
  execFileSync("git", ["add", "--", ...changed], { cwd: rootPath, stdio: "inherit" })
}
