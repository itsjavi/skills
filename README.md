# itsjavi/skills

Reusable Codex/Claude skills and plugins, for:

## Catalog

### Skills

<!-- catalog:skills:start -->

- [app-security-review](skills/app-security-review/SKILL.md): Review repositories, features, or diffs for exploitable
  application security weaknesses, including injection, authentication and authorization failures, exposed APIs, and
  broken trust boundaries.
- [backlog-authoring](skills/backlog-authoring/SKILL.md): Author plans and native records for existing Backlog.md
  projects, using their configured MCP or CLI workflow.
- [changelog-authoring](skills/changelog-authoring/SKILL.md): Generate or update CHANGELOG.md and release notes from
  commit messages in a pull request or the current branch compared with its base, usually main, or from project
  specifications and planning records.
- [coolify-cli](skills/coolify-cli/SKILL.md): Operate Coolify instances through the official coollabsio/coolify-cli.
- [design-guide-authoring](skills/design-guide-authoring/SKILL.md): Create or update a design guide or design system
  specification, usually DESIGN.md, for web or mobile interfaces.
- [find-library-docs](skills/find-library-docs/SKILL.md): Find current documentation, API references, and code examples
  for libraries, frameworks, SDKs, CLI tools, and cloud services.
- [find-skills](skills/find-skills/SKILL.md): Discover and help install reusable agent skills.
- [fix-page-metadata](skills/fix-page-metadata/SKILL.md): Audit and fix HTML metadata including page titles, meta
  descriptions, canonical URLs, Open Graph tags, Twitter cards, favicons, JSON-LD structured data, and robots
  directives.
- [fix-web-accessibility](skills/fix-web-accessibility/SKILL.md): Audit and fix HTML accessibility issues including ARIA
  labels, keyboard navigation, focus management, color contrast, and form errors.
- [fix-web-rendering-performance](skills/fix-web-rendering-performance/SKILL.md): Audit and fix web rendering
  performance, including animations, scrolling, layout thrashing, and expensive visual effects.
- [generate-commit-message](skills/generate-commit-message/SKILL.md): Generate a Conventional Commit message from the
  repository's staged Git changes.
- [react-development](skills/react-development/SKILL.md): Build, debug, refactor, and review React web apps, components,
  and hooks.
- [trust-and-safety-review](skills/trust-and-safety-review/SKILL.md): Review product designs and implementation for
  abuse through user-generated content and interactions, including phishing, scams, harassment, spam, and moderation
  failures.
- [ui-screenshots](skills/ui-screenshots/SKILL.md): Capture screenshots and short clips of any web application's UI for
  visual review, documentation, or pull requests.

<!-- catalog:skills:end -->

> Setup skills by dropping them under `~/.agents/skills` (many LLMs support it including Codex), `~/.codex/skills` or
> `~/.claude/skills`. You can also use local dirs to install them only for specific projects.

### Plugins

<!-- catalog:plugins:start -->

- [gamegen](plugins/gamegen): Create 2D, 2.5D and 3D games with shared project preferences, concept art, Blender, Godot
  and measured validation.

<!-- catalog:plugins:end -->

#### Plugins setup

Add this repository as a marketplace, then install the plugins you want. Each app uses its own catalog and plugin
manifest, while GameGen shares the same `skills/`, scripts and references:

The root `.agents/` and `.claude-plugin/` directories contain marketplace catalogs used directly when an app adds this
repository. Keep them at these discovery paths so Git installation works. They are not project settings to copy into
your game. GameGen's own `.codex-plugin/` and `.claude-plugin/` directories stay inside the plugin package and travel
with it when the package is installed or copied.

| App                            | Marketplace catalog                                                    | GameGen manifest                                                                           |
| ------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Codex                          | [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json) | [`plugins/gamegen/.codex-plugin/plugin.json`](plugins/gamegen/.codex-plugin/plugin.json)   |
| Claude Desktop and Claude Code | [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)   | [`plugins/gamegen/.claude-plugin/plugin.json`](plugins/gamegen/.claude-plugin/plugin.json) |

##### Codex Desktop

1. Open **Plugins → Add → Add Marketplace** and add `https://github.com/itsjavi/skills.git`, or select the root of a
   local checkout of this repository.
2. Browse **Local Plugins** (`local-plugins`), open **GameGen**, and install it. Adding a marketplace makes its catalog
   available; you still need to install each plugin.
3. Start a new task to load the installed skills. Refresh the app if the catalog has not appeared yet.

With the Codex CLI, add the repository and install GameGen:

```sh
codex plugin marketplace add itsjavi/skills
codex plugin add gamegen@local-plugins
```

For a local checkout, replace the first command with `codex plugin marketplace add /path/to/skills`. Keep the checkout
intact: `.agents/plugins/marketplace.json` resolves `./plugins/gamegen` from the repository root. The personal
marketplace at `~/.agents/plugins/marketplace.json` is a separate setup and is discovered automatically.

See the official [Codex plugin guide](https://learn.chatgpt.com/docs/build-plugins).

##### Claude Desktop

1. Open **Customize → Plugins**. For Cowork, open the **Cowork** tab first.
2. Under **Personal plugins**, click **+ → Add marketplace**.
3. Choose **Add from a repository** and enter `https://github.com/itsjavi/skills.git`.
4. Browse the **itsjavi-skills** marketplace and install **GameGen**.
5. Type `/` or use the **+** menu to select a bundled skill, starting with `game-bootstrap` for a new game.

The same marketplace dialog supports **Browse Anthropic sources** for additional curated catalogs. Repeat the flow to
add other GitHub repositories or Git URLs alongside this marketplace.

For local changes before publishing, upload a ZIP containing the contents of `plugins/gamegen/`, including the hidden
`.claude-plugin/` directory. Keep `skills/`, `scripts/` and `references/` at the ZIP root.

Claude Desktop's Chat and Cowork plugin setup is managed through **Customize**. For game production, use an environment
with access to the game repository, Python, Godot, Blender and the selected generation tools; installing GameGen does
not install those dependencies.

Source: [Use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude).

##### Claude Code, including the Desktop Code tab

In a terminal, register this marketplace and install GameGen:

```sh
claude plugin marketplace add itsjavi/skills
claude plugin install gamegen@itsjavi-skills
```

For a local checkout, replace the first command with `claude plugin marketplace add /path/to/skills`. Inside the
interactive CLI, the equivalents are `/plugin marketplace add itsjavi/skills` and
`/plugin install gamegen@itsjavi-skills`. Invoke a skill with `/gamegen:game-bootstrap`.

In a local Desktop Code session, use **+ → Plugins → Add plugin** to browse configured marketplaces, or **Manage
plugins** to manage installed plugins. Cowork uses its own **Customize** configuration rather than the CLI's `~/.claude`
directory. See [Claude Code Desktop](https://code.claude.com/docs/en/desktop#install-plugins).

Claude Code accepts GitHub `owner/repo` names, full Git URLs, local directories and direct marketplace JSON URLs. This
repository uses relative plugin paths, so add the Git repository or local checkout; a raw JSON URL downloads only the
catalog and cannot resolve those paths.

Use `claude plugin marketplace list` to list configured marketplaces and
`claude plugin marketplace update itsjavi-skills` to refresh this catalog. See the official
[installation guide](https://code.claude.com/docs/en/discover-plugins) and
[marketplace format](https://code.claude.com/docs/en/plugin-marketplaces).
