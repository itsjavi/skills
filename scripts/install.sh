#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-codex}"
SKILL_NAME="${2:-}"

if command -v pnpm >/dev/null 2>&1; then
  if [ -n "$SKILL_NAME" ]; then
    pnpm --dir "$ROOT" tsx scripts/install.ts "$TARGET" "$SKILL_NAME"
  else
    pnpm --dir "$ROOT" tsx scripts/install.ts "$TARGET"
  fi
elif command -v npx >/dev/null 2>&1; then
  if [ -n "$SKILL_NAME" ]; then
    npx --yes tsx "$ROOT/scripts/install.ts" "$TARGET" "$SKILL_NAME"
  else
    npx --yes tsx "$ROOT/scripts/install.ts" "$TARGET"
  fi
else
  echo "Missing pnpm or npx. Install Node.js tooling first."
  exit 1
fi
