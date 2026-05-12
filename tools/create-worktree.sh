#!/usr/bin/env bash
set -euo pipefail

CURRENT_DIRNAME="$(basename "$PWD")"
WORKTREE_PARENT_NAME="$CURRENT_DIRNAME-worktrees"

print_usage() {
  cat <<'EOF'
Usage:
  tools/create-worktree.sh [--dry-run] [--agent[=COMMAND]] <branch>

Options must be passed before the branch.

Options:
  --agent[=COMMAND]
                   Start an agent in a new Ghostty terminal. Default command: codex.
  --dry-run        Print the planned actions without fetching, creating files, or launching apps.
  -h, --help       Show this help.

Creates a git worktree from the current directory for the given branch,
puts it in ../<current-dirname>-worktrees/, copies .env into it, runs the matching
package manager install when a recognized lockfile exists, and opens the worktree
folder in Finder. When --agent is passed, it also starts the agent in Ghostty.
EOF
}

shell_quote() {
  local value="$1"

  printf "'"
  printf '%s' "$value" | sed "s/'/'\\\\''/g"
  printf "'"
}

slugify() {
  local value="$1"
  local slug

  slug="$(
    printf '%s' "$value" |
      tr '[:upper:]' '[:lower:]' |
      sed -E 's/[^a-z0-9._-]+/-/g; s/^-+//; s/-+$//; s/-+/-/g'
  )"

  if [[ -z "$slug" ]]; then
    printf 'Could not create a worktree name from "%s".\n' "$value" >&2
    exit 1
  fi

  printf '%s' "$slug"
}

detect_package_manager() {
  local root="$1"

  if [[ -f "$root/pnpm-lock.yaml" ]]; then
    printf 'pnpm'
  elif [[ -f "$root/package-lock.json" ]]; then
    printf 'npm'
  elif [[ -f "$root/yarn.lock" ]]; then
    printf 'yarn'
  elif [[ -f "$root/bun.lock" || -f "$root/bun.lockb" ]]; then
    printf 'bun'
  fi
}

detect_package_manager_in_git_ref() {
  local repo_root="$1"
  local ref="$2"

  if git -C "$repo_root" cat-file -e "$ref:pnpm-lock.yaml" 2>/dev/null; then
    printf 'pnpm'
  elif git -C "$repo_root" cat-file -e "$ref:package-lock.json" 2>/dev/null; then
    printf 'npm'
  elif git -C "$repo_root" cat-file -e "$ref:yarn.lock" 2>/dev/null; then
    printf 'yarn'
  elif git -C "$repo_root" cat-file -e "$ref:bun.lock" 2>/dev/null ||
    git -C "$repo_root" cat-file -e "$ref:bun.lockb" 2>/dev/null; then
    printf 'bun'
  fi
}

install_action_for_manager() {
  local package_manager="$1"

  if [[ -n "$package_manager" ]]; then
    printf 'Run %s install in the worktree.' "$package_manager"
  else
    printf 'No recognized lockfile found; skip dependency install.'
  fi
}

launch_agent() {
  local worktree_path="$1"
  local agent_command="$2"
  local ghostty_script
  local initial_command

  ghostty_script="$(
    cat <<EOF
set -u

cd $(shell_quote "$worktree_path") || exit 1
agent_command=$(shell_quote "$agent_command")

print -r -- "Worktree: $worktree_path"
print -r -- "Agent: \${agent_command}"
print -r -- ""

eval "exec \${agent_command}"
EOF
  )"
  initial_command="/bin/zsh -lc $(shell_quote "$ghostty_script")"

  if ! open -na "Ghostty.app" --args \
    "--working-directory=$worktree_path" \
    "--wait-after-command=true" \
    "--initial-command=$initial_command"; then
    printf 'Could not open Ghostty. Run this command manually instead:\n' >&2
    printf 'cd %s && %s\n' "$(shell_quote "$worktree_path")" "$agent_command" >&2
    return 1
  fi
}

print_plan() {
  local current_branch="$1"
  local worktree_root="$2"
  local branch_name="$3"
  local worktree_path="$4"
  local agent_command="$5"
  local env_action="$6"
  local install_action="$7"
  local path_status="$8"
  local agent_enabled="$9"

  printf 'Source branch: %s\n' "$current_branch"
  printf 'Worktree root: %s\n' "$worktree_root"
  printf 'Branch: %s\n' "$branch_name"
  printf 'Worktree: %s\n' "$worktree_path"

  if [[ "$agent_enabled" == true ]]; then
    printf 'Agent: %s\n' "$agent_command"
  else
    printf 'Agent: none\n'
  fi

  if [[ -n "$path_status" ]]; then
    printf 'Preflight: %s\n' "$path_status"
  fi

  printf '\n'
  printf 'Planned actions:\n'
  printf '  - Fetch remote branches with prune.\n'
  printf '  - Ensure worktree root exists.\n'
  printf '  - Add git worktree for "%s" at %s.\n' "$branch_name" "$worktree_path"
  printf '  - %s\n' "$env_action"
  printf '  - %s\n' "$install_action"
  printf '  - Open Finder at the worktree.\n'

  if [[ "$agent_enabled" == true ]]; then
    printf '  - Launch Ghostty in the worktree and start: %s\n' "$agent_command"
  else
    printf '  - Skip launching an agent.\n'
  fi
}

dry_run=false
agent_enabled=false
agent_command="codex"

while [[ $# -gt 0 ]]; do
  case "$1" in
  -h | --help)
    print_usage
    exit 0
    ;;
  --dry-run)
    dry_run=true
    shift
    ;;
  --agent=*)
    agent_enabled=true
    agent_command="${1#--agent=}"
    shift
    ;;
  --agent)
    agent_enabled=true
    shift
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
    break
    ;;
  esac
done

if [[ "$agent_enabled" == true && -z "${agent_command//[[:space:]]/}" ]]; then
  printf 'Agent command cannot be empty.\n' >&2
  exit 1
fi

if [[ $# -ne 1 ]]; then
  print_usage >&2
  exit 1
fi

branch_name="$1"
repo_root="$(git rev-parse --show-toplevel)"
repo_parent="$(dirname "$repo_root")"
current_branch="$(git -C "$repo_root" branch --show-current)"

if [[ -z "$current_branch" ]]; then
  printf 'The current checkout is detached. Run this script from a named branch.\n' >&2
  exit 1
fi

current_branch_slug="$(slugify "$current_branch")"
worktree_name="$(slugify "$branch_name")"
worktree_root="$repo_parent/$WORKTREE_PARENT_NAME/$current_branch_slug"
worktree_path="$worktree_root/$worktree_name"
env_action="No .env found in $repo_root; skip .env copy."
package_manager=""
path_status=""
install_action="Detect package manager from the created worktree lockfile; run install if found."

if [[ -e "$worktree_path" ]]; then
  if [[ "$dry_run" == true ]]; then
    path_status="worktree path already exists; git worktree add would fail."
  else
    printf 'Worktree path already exists: %s\n' "$worktree_path" >&2
    exit 1
  fi
fi

if [[ -f "$repo_root/.env" ]]; then
  env_action="Copy .env into the worktree."
fi

if git -C "$repo_root" rev-parse --verify --quiet "$branch_name^{commit}" >/dev/null; then
  package_manager="$(detect_package_manager_in_git_ref "$repo_root" "$branch_name")"
  install_action="$(install_action_for_manager "$package_manager")"
fi

if [[ "$dry_run" == true ]]; then
  printf 'Dry run. No fetches will be run, and no worktrees, files, installs, Finder windows, or Ghostty sessions will be created.\n\n'
  print_plan "$current_branch" "$worktree_root" "$branch_name" "$worktree_path" "$agent_command" "$env_action" "$install_action" "$path_status" "$agent_enabled"
  exit 0
fi

if [[ -e "$worktree_path" ]]; then
  printf 'Worktree path already exists: %s\n' "$worktree_path" >&2
  exit 1
fi

print_plan "$current_branch" "$worktree_root" "$branch_name" "$worktree_path" "$agent_command" "$env_action" "$install_action" "$path_status" "$agent_enabled"
printf '\n'

printf 'Fetching remote branches...\n'
git -C "$repo_root" fetch --all --prune
printf '\n'

mkdir -p "$worktree_root"
git -C "$repo_root" worktree add "$worktree_path" "$branch_name"
package_manager="$(detect_package_manager "$worktree_path")"

if [[ -f "$repo_root/.env" ]]; then
  printf '\nCopying .env into %s\n' "$worktree_path"
  cp "$repo_root/.env" "$worktree_path/.env"
else
  printf '\nNo .env found in %s; skipping .env copy.\n' "$repo_root"
fi

if [[ -n "$package_manager" ]]; then
  printf '\nRunning %s install in %s\n' "$package_manager" "$worktree_path"
  (
    cd "$worktree_path"
    "$package_manager" install
  )
else
  printf '\nNo recognized lockfile found in %s; skipping dependency install.\n' "$repo_root"
fi

printf '\nOpening Finder at %s\n' "$worktree_path"
open "$worktree_path"

if [[ "$agent_enabled" == true ]]; then
  printf '\nOpening Ghostty at %s\n' "$worktree_path"
  launch_agent "$worktree_path" "$agent_command"
fi

printf 'Done.\n'
