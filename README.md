# itsjavi/skills

Reusable Codex/Claude skills and plugins, for:

## Catalog

### Skills

- `coolify`: Coolify CLI usage.
- `trust-and-safety-review`: User-generated content, harmful interactions, product abuse, and moderation reviews.
- `web-security-review`: Application security, OWASP risks, API protection, and exploit reviews adapted to the project.

> Setup skills by dropping them under `~/.agents/skills` (many LLMs support it including Codex), `~/.codex/skills` or
> `~/.claude/skills`. You can also use local dirs to install them only for specific projects.

### Plugins

- `gamegen`: sets of skills for Game Development with Godot, Blender, GPT Image, SpriteCook and Higgsfield.

#### Plugins setup

CODEX:

- Put the plugins under `~/.codex/plugins` also with the `marketplace.json` file.
- In the Codex Desktop UI, go to `Plugins / Add / Add Marketplace` and point to the folder where the `markeplace.json`
  is stored.
- Reload the desktop app and you should see the plugins and skills listed.
