#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CALLER_CWD="$PWD"

if command -v pnpm >/dev/null 2>&1; then
  SKILLS_INSTALL_CWD="$CALLER_CWD" pnpm --dir "$ROOT" exec tsx scripts/install-skills.ts "$@"
elif command -v npx >/dev/null 2>&1; then
  SKILLS_INSTALL_CWD="$CALLER_CWD" npx --yes tsx "$ROOT/scripts/install-skills.ts" "$@"
else
  echo "Missing pnpm or npx. Install Node.js tooling first."
  exit 1
fi
