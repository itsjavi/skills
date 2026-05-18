#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="$ROOT/tools"
BIN_DIR="${TOOLS_BIN_DIR:-/usr/local/bin}"
DRY_RUN=false
SYMLINK=true

print_usage() {
  cat <<'EOF'
Usage:
  scripts/install-tools.sh [--bin-dir DIR] [--no-symlink] [--dry-run]
  scripts/install-tools.sh DIR

Options:
  --bin-dir DIR   Directory where tools will be installed. Default: /usr/local/bin.
  --no-symlink    Copy tools instead of symlinking them.
  --dry-run       Print the planned installs without creating directories or copying files.
  -h, --help      Show this help.

Symlinks executable tools from ./tools into the selected bin directory by default.
Files ending in .sh are installed without the .sh suffix.
Experimental tools under ./tools/experimental are intentionally ignored.

The default can also be changed with TOOLS_BIN_DIR.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
  -h | --help)
    print_usage
    exit 0
    ;;
  --dry-run)
    DRY_RUN=true
    shift
    ;;
  --no-symlink)
    SYMLINK=false
    shift
    ;;
  --bin-dir=*)
    BIN_DIR="${1#--bin-dir=}"
    shift
    ;;
  --bin-dir)
    if [[ $# -lt 2 || "$2" == -* ]]; then
      printf 'Missing directory after --bin-dir.\n' >&2
      exit 1
    fi

    BIN_DIR="$2"
    shift 2
    ;;
  --)
    shift
    break
    ;;
  -*)
    printf 'Unknown option: %s\n\n' "$1" >&2
    print_usage >&2
    exit 1
    ;;
  *)
    BIN_DIR="$1"
    shift
    ;;
  esac
done

if [[ $# -gt 0 ]]; then
  printf 'Unexpected argument: %s\n\n' "$1" >&2
  print_usage >&2
  exit 1
fi

if [[ -z "${BIN_DIR//[[:space:]]/}" ]]; then
  printf 'Bin directory cannot be empty.\n' >&2
  exit 1
fi

if [[ ! -d "$TOOLS_DIR" ]]; then
  printf 'Missing tools directory: %s\n' "$TOOLS_DIR" >&2
  exit 1
fi

installed=0

if [[ "$DRY_RUN" == false ]]; then
  mkdir -p "$BIN_DIR"
fi

while IFS= read -r tool_path; do
  tool_file="$(basename "$tool_path")"
  tool_name="${tool_file%.sh}"
  target_path="$BIN_DIR/$tool_name"

  if [[ "$DRY_RUN" == true ]]; then
    if [[ "$SYMLINK" == true ]]; then
      printf 'Would symlink %s -> %s\n' "$target_path" "$tool_path"
    else
      printf 'Would copy %s -> %s\n' "$tool_path" "$target_path"
    fi
  else
    if [[ -d "$target_path" && ! -L "$target_path" ]]; then
      printf 'Cannot replace directory: %s\n' "$target_path" >&2
      exit 1
    fi

    if [[ "$SYMLINK" == true ]]; then
      rm -f "$target_path"
      ln -s "$tool_path" "$target_path"
      printf 'Symlinked %s -> %s\n' "$target_path" "$tool_path"
    else
      if [[ -L "$target_path" ]]; then
        rm -f "$target_path"
      fi

      cp "$tool_path" "$target_path"
      chmod 755 "$target_path"
      printf 'Copied %s -> %s\n' "$tool_file" "$target_path"
    fi
  fi

  installed=$((installed + 1))
# Only install stable top-level launchers. Experimental tools stay available in
# ./tools/experimental for manual use, but are never installed by default.
done < <(find "$TOOLS_DIR" -maxdepth 1 -type f ! -name '.*' ! -path "$TOOLS_DIR/experimental/*" | sort)

if [[ "$DRY_RUN" == true ]]; then
  action="Found"
elif [[ "$SYMLINK" == true ]]; then
  action="Symlinked"
else
  action="Copied"
fi

printf 'Done. %s %d tool%s.\n' "$action" "$installed" "$([[ "$installed" -eq 1 ]] && printf '' || printf 's')"
