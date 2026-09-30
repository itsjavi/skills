# Agent Fleet

Portable project setup, coordinated agent work, and visual evidence review for Codex and Claude. Project-specific agent
names, execution policy and repository boundaries stay in `agent-workspace.json`.

## Skills and CLI

- [setup-agent-workspace](skills/setup-agent-workspace/SKILL.md): install and update the project's versioned workflow
  tooling.
- [unattended-work](skills/unattended-work/SKILL.md): complete an authorized task queue with ownership, review and
  guarded commits.
- [visual-evidence-review](skills/visual-evidence-review/SKILL.md): inspect and record significant before/after UI
  changes.

The plugin and the `@itsjavi/agent-fleet` npm package use the same implementation. The plugin makes the skills
discoverable; the optional npm package supplies the `agent-fleet` command. Neither launches models or grants unattended
execution permission.

Install the plugin from `itsjavi-skills` using the [marketplace instructions](../../README.md#plugins-setup). Source
changes must first be released to the marketplace used by the client; a configured marketplace does not automatically
install this new plugin.

Before npm publication, create a local tarball with `npm pack` in this directory. Install that tarball globally with
`npm install --global /path/to/itsjavi-agent-fleet-VERSION.tgz`, or run `node /path/to/agent-fleet/bin/agent-fleet.mjs`
directly. After publication, `npm install --global @itsjavi/agent-fleet` provides the same executable. No project
`node_modules` is needed. Node.js 22+, Git and the separately installed Backlog CLI are required for setup; screenshot
comparison optionally requires Python and Pillow.

```sh
agent-fleet --help
agent-fleet init --example monorepo > /tmp/workspace.json
# Customize names, repository boundaries, policy and application checks.
agent-fleet init --target /path/to/project --config /tmp/workspace.json --dry-run
agent-fleet init --target /path/to/project --config /tmp/workspace.json --apply
agent-fleet status
agent-fleet update --target /path/to/project --check
agent-fleet update --target /path/to/project --dry-run
agent-fleet update --target /path/to/project --apply
```

Coordination commands discover the nearest workspace configuration above the current directory, or accept `--root PATH`,
then invoke that project's pinned local CLI. Upgrading the global package does not silently switch a project's runtime.
Commands and root discovery also work from initialized submodules. Setup and updates are explicit and leave
staging/commits to the project's authorized workflow.

See [configuration and update guidance](skills/setup-agent-workspace/references/configuration.md) for local versus
external skills, safe adoption, file conflicts, maintenance locks and validation. Configuration, task records and
durable runtime are project-owned. The plugin owns the generic source; project copies are updated from it.

## Development

Develop reusable scripts/schema/tests in `skills/setup-agent-workspace/assets/template`, and operating skills in their
sibling directories under `skills/`. Use the setup skill's bundle check and update workflow instead of maintaining
independent project copies. Installer development tests belong here, not in consuming projects. Test the npm tarball and
an isolated copied-skill update before releasing. Package and host manifest versions follow the
[monorepo release workflow](../../README.md#maintaining-plugins-and-releases).

The icon is the original vector in [assets/icon.svg](assets/icon.svg), rendered to PNG with ImageMagick. No external
artwork is included.
