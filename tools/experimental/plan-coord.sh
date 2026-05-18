#!/usr/bin/env bash
set -euo pipefail

resolve_link() {
  local target="$1"
  local dir

  while [[ -L "$target" ]]; do
    dir="$(cd "$(dirname "$target")" && pwd)"
    target="$(readlink "$target")"
    [[ "$target" != /* ]] && target="$dir/$target"
  done

  cd "$(dirname "$target")" && pwd
}

SCRIPT_DIR="$(resolve_link "${BASH_SOURCE[0]}")"
MAIN="$SCRIPT_DIR/plan-coord/main.ts"

if ! command -v bun >/dev/null 2>&1; then
  printf 'Missing bun. Install Bun to use plan-coord: https://bun.sh\n' >&2
  exit 1
fi

exec bun "$MAIN" "$@"
