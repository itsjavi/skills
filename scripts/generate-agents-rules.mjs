#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises"

const directory = new URL("../rules/", import.meta.url)
const files = (await readdir(directory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .map((entry) => entry.name)
  .sort()

const rules = await Promise.all(
  files.map(async (name) => {
    const source = await readFile(new URL(encodeURIComponent(name), directory), "utf8")
    return source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "").trim()
  })
)

const output = rules.filter(Boolean).join("\n\n")
if (output) process.stdout.write(`${output}\n`)
