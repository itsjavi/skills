# itsjavi/skills

Reusable Codex/Claude skills and plugins, for:

## Catalog

### Skills

<!-- catalog:skills:start -->

- [backlog-authoring](skills/backlog-authoring/SKILL.md): Author plans and native records for existing Backlog.md
  projects, using their configured MCP or CLI workflow.
- [changelog-authoring](skills/changelog-authoring/SKILL.md): Use when the user asks to generate, update, draft, or
  compare a CHANGELOG.md or release notes from docs dirs, planning docs, milestones, checkpoints, bug-fix records,
  decisions, business rules, manual QA, checks, security, env, setup, or other spec-based project records.
- [conventional-commits](skills/conventional-commits/SKILL.md): Generate a Conventional Commit message for the
  repository's current staged changes.
- [coolify](skills/coolify/SKILL.md): Operate Coolify instances through the official coollabsio/coolify-cli.
- [trust-and-safety-review](skills/trust-and-safety-review/SKILL.md): Review how user-generated content and user
  interactions can enable harm, phishing, scams, harassment, spam, or moderation failures in the current project.
- [ui-screenshots](skills/ui-screenshots/SKILL.md): Capture screenshots and short clips of any web application's UI for
  visual review, documentation, or pull requests.
- [web-design-spec](skills/web-design-spec/SKILL.md): Create a design guide / design system spec document (typically
  DESIGN.md) for a web or mobile UI project.
- [web-security-review](skills/web-security-review/SKILL.md): Review the current project for exploitable application
  security weaknesses, common OWASP mistakes, unprotected APIs, and broken trust boundaries.

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
