export function parseSkillFrontmatterBlock(block: string): Record<string, string> {
  const result: Record<string, string> = {}
  let currentKey: string | null = null

  for (const line of block.split("\n")) {
    const keyMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/)
    if (keyMatch) {
      currentKey = keyMatch[1]
      const rest = keyMatch[2].trim().replace(/^['"]|['"]$/g, "")
      result[currentKey] = rest
      continue
    }

    if (currentKey !== null && line.length > 0 && /^\s+\S/.test(line)) {
      const continuation = line.trim()
      const prev = result[currentKey]?.trimEnd() ?? ""
      result[currentKey] = prev ? `${prev} ${continuation}` : continuation
    }
  }

  return result
}
