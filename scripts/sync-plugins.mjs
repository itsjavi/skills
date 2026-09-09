import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { pluginOutputs, saveGenerated } from "./plugins.mjs"

export async function syncPlugins(options) {
  return saveGenerated(await pluginOutputs(), options)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const changed = await syncPlugins({ check: process.argv.includes("--check") })
  console.log(changed.length ? `Updated ${changed.length} plugin metadata files.` : "Plugin metadata is up to date.")
}
