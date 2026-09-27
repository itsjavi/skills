# GameGen

GameGen is a plugin for Codex, Claude Desktop and Claude Code for creating 2D, 2.5D and 3D games with Godot, Blender and
shared project preferences. Its plugin identifier is `gamegen`. Codex uses `.codex-plugin/plugin.json`, and Claude uses
`.claude-plugin/plugin.json`; both load the same `skills/` directory.

This directory is the plugin package. Each game keeps its own `.agents/gamegen-prefs.json`. Installing or updating the
plugin does not replace a game's choices. The package uses local executables and existing service connections; it does
not install Blender, Godot, SpriteCook or Higgsfield, or copy account configuration.

## Installation

Follow the [repository's plugin setup instructions](../../README.md#plugins-setup) for Codex Desktop, Claude Desktop or
Claude Code. Registering a marketplace and installing GameGen are separate steps. For Claude Desktop, add
`https://github.com/itsjavi/skills.git` through **Customize → Plugins → Personal plugins → + → Add marketplace → Add
from a repository**, then install GameGen from **itsjavi-skills**.

Game production requires an environment that can access your game repository and execute the selected tools. Bootstrap
checks those capabilities and resolves available generation providers before production.

## Start or resume a game

Invoke `game-bootstrap` through GameGen for a new game. Bootstrap reuses supplied decisions, inspects the tools and
repository, and uses ask-question tools to resolve the remaining preferences before production. Recommended choices
appear first with a reason when appropriate. A preselected choice is not accepted until the user submits it. The shared
reader provides the same resolved context to all skills.

The required game fields include title, description, player goal and scope. Scope records the deliverable, included
features, content size, playtime and exclusions. Presentation distinguishes rendering from simulation so hybrid games
have a concrete production path. Conditional settings cover sprite directions, tile grids and 3D asset budgets.

A game made only of tiles can leave sprite directions and frame size unset. A tile world that also uses sprites records
both values. A fully 3D game uses 3D simulation; choose 2.5D for a hybrid such as 3D visuals with 2D movement.

Proposed defaults include macOS and iOS, landscape presentation, Godot, GPT Image 2.5 for concepts, and computer use
only when needed. Image model flavors follow the [provider routing rules](references/providers.md#gpt-image-25). Draft
defaults remain unconfirmed. SpriteCook uses its native MCP and installed specialist skills when selected. Higgsfield is
disabled until the intake enables a justified route with a credit allowance. Provider model choices and fallback lists
are saved per purpose. Built-in draft routes retain `provider-default` because some tools do not expose a model
selector; this does not guarantee a particular model or flavor.

Use `game-production` to continue an authorized project through its saved scope and selected review policy. The
remaining skills cover concept art, Blender assets, sprites, tilesets, animation, gameplay, world presentation,
UI/input, audio/VFX, QA, optimization and exports. See [the production routing table](skills/game-production/SKILL.md).

Blender work uses the installed executable and background Python through `bpy`, with no third-party Blender MCP
dependency. Build from primitives and custom geometry to match references, use procedural construction where it helps,
and retain editable materials, textures, rigs and animations. The [Blender workflow](references/blender-cli.md) covers
the verified macOS launch workaround, observable rendering and fresh-import checks.

## Preferences helper

The helper requires Python 3.9 or later and uses only the standard library. Run these examples from this plugin
directory, replacing the example project and answers paths:

```sh
python3 scripts/prefs.py init --project /path/to/game
python3 scripts/prefs.py questions --project /path/to/game
python3 scripts/prefs.py read --project /path/to/game
python3 scripts/prefs.py apply --project /path/to/game --answers /path/to/answers.json --confirm game --expected-revision 0
python3 scripts/prefs.py finalize --project /path/to/game --expected-revision 1
python3 scripts/prefs.py validate --project /path/to/game --ready
```

The finalization example succeeds only after every section and conditional requirement has been resolved. `apply`
accepts a JSON object of preference sections, recursively merges objects, replaces arrays and preserves untouched
values. Repeat `--confirm` for sections resolved by submitted answers or earlier explicit user instructions. Changed
sections become unconfirmed unless reconfirmed. Read the current revision before each write; stale writers fail without
overwriting another agent's changes.

`--defer game.scope.playtime_minutes` or `--defer platforms.memory_budget_mb` records a deliberate upfront choice when a
value is outside the current delivery. Signing can remain deferred for editor work. Critical identity, presentation and
tool choices cannot be silently deferred.

The [JSON schema](schemas/gamegen-prefs.schema.json) describes the structural format. The helper validates the bundled
schema's supported keywords and adds conditional readiness and path checks. It is not a general JSON Schema library.
Unknown versions or unsupported keywords fail. Schema v1 has no legacy migration to run.

Only the coordinating agent writes preferences. Long art briefs, images, generated IDs, prompts, spend reservations and
progress belong in the referenced documents, asset manifest and state/tracker. Credentials stay with the connected
tools. See [shared context](references/shared-context.md), [provider routing](references/providers.md) and
[repository conventions](references/repository.md).

## Asset checks

```sh
python3 scripts/asset_audit.py /path/to/actor.glb
python3 scripts/asset_audit.py /path/to/sheet.png --frame-size 32 32 --frame-count 8 --columns 4
```

The audit reads GLB geometry/material/skin/clip metadata or PNG header and frame-grid metadata. It reports a file hash.
It does not validate anatomy, skin weights, pixel transparency content, full glTF conformance, playback or rendering
performance. Those checks belong in the actual engine workflow.

## Package contents and validation

The package contains 14 skill entrypoints with Codex UI metadata, shared references, question catalog, preferences
schema/defaults, project and manifest templates, standard-library helpers, tests and a generated icon. It keeps
service-specific skills as external dependencies and uses the fallback policy when a selected dependency is unavailable.
It contains no MCP authentication configuration.

Run local helper tests with:

```sh
python3 -m unittest discover -s tests -v
```

The package was also checked with the Codex plugin and skill validators. See [validation.json](validation.json) for the
recorded conditions and results. These checks exercise configuration and asset metadata workflows; they do not simulate
question-tool conversations, purchase service generations or prove every game's production outcome.

From the repository root, validate Claude's marketplace and plugin package with:

```sh
claude plugin validate --strict .claude-plugin/marketplace.json
claude plugin validate --strict plugins/gamegen
```

Use the [shared repository release workflow](../../README.md#maintaining-plugins-and-releases) to synchronize manifest
metadata and versions from the root package version. The repository's `.claude-plugin/marketplace.json` lists plugins;
GameGen's `.claude-plugin/plugin.json` describes the package. Skills and helper files stay outside `.claude-plugin/`, as
documented in [Claude's plugin reference](https://code.claude.com/docs/en/plugins-reference).

The icon was generated with the built-in image-generation tool. Its prompt and provenance are in
[icon-generation.json](assets/icon-generation.json). The same self-contained icon works on light and dark plugin
surfaces.
