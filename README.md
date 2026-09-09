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

CODEX:

- Put the plugins under `~/.codex/plugins` also with the `marketplace.json` file.
- In the Codex Desktop UI, go to `Plugins / Add / Add Marketplace` and point to the folder where the `markeplace.json`
  is stored.
- Reload the desktop app and you should see the plugins and skills listed.
