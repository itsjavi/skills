# UX Design

Critique designs, audit accessibility, manage design systems, write UX copy, plan and synthesize user research and
prepare developer handoff specs.

Install this plugin in Codex, Claude Desktop or Claude Code using the
[repository setup instructions](../../README.md#plugins-setup). Its identifier is `uxdesign`. Both platform manifests
load the same bundled skills.

Every skill works from what you share in the conversation: screenshots, exported frames, files, URLs, code, research
notes or plain descriptions. The plugin bundles no MCP servers or external connectors.

## Included skills

- [accessibility-review](skills/accessibility-review/SKILL.md)
- [design-critique](skills/design-critique/SKILL.md)
- [design-handoff](skills/design-handoff/SKILL.md)
- [design-system](skills/design-system/SKILL.md)
- [research-synthesis](skills/research-synthesis/SKILL.md)
- [user-research](skills/user-research/SKILL.md)
- [ux-copy](skills/ux-copy/SKILL.md)

`accessibility-review` reports audit findings on designs and pages; use Webcraft's `fix-web-accessibility` to fix code.
`design-system` audits, documents and extends components; use Webcraft's `design-guide-authoring` for a project-wide
`DESIGN.md`.

## Attribution

Adapted from the `design` plugin in
[anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/da38ec1ee89d41e5380e652a97382695003396e7/design)
(commit `da38ec1`), licensed under the Apache License 2.0. A copy of the license is in [LICENSE](LICENSE).

Changes from upstream: removed the bundled MCP connector configuration and every connector-dependent instruction,
replaced Claude-specific slash-command usage with platform-neutral instructions, added a Codex manifest and icon, and
renamed the plugin to `uxdesign`.

## Maintenance

Keep each skill and its supporting files together. Versions and marketplace metadata follow the
[shared repository release workflow](../../README.md#maintaining-plugins-and-releases).

The icon is rendered from [icon.svg](assets/icon.svg) in the same visual family as the other plugin icons. Its
provenance is recorded in [icon-generation.json](assets/icon-generation.json).
