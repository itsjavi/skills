# Native Apps

Build native desktop and mobile apps, starting with modern macOS apps in Swift, SwiftUI and AppKit, including project
setup, agent-safe test builds, distribution and platform quirks.

Install this plugin in Codex, Claude Desktop or Claude Code using the
[repository setup instructions](../../README.md#plugins-setup). Its identifier is `nativeapps`. Both platform manifests
load the same bundled skills.

## Included skills

- [macos-app-development](skills/macos-app-development/SKILL.md)
- [macos-app-icons](skills/macos-app-icons/SKILL.md)

## Maintenance

Keep each skill and its supporting files together. Versions and marketplace metadata follow the
[shared repository release workflow](../../README.md#maintaining-plugins-and-releases).

The icon uses the same visual style as GameGen. It is drawn in [icon.svg](assets/icon.svg) and rendered to PNG; its
provenance is recorded in [icon-generation.json](assets/icon-generation.json).
