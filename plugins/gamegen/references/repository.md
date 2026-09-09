# Repository and asset contracts

Inspect the existing repository before adopting paths. Use `paths` in project preferences as the source of location
choices. A new Godot repository can start with this layout:

```text
.agents/gamegen-prefs.json
AGENTS.md
docs/                       Game brief and art direction
concepts/                   References and selected concepts
art_source/                 Editable models, sprite masters and audio
game/
  project.godot
  assets/                   Runtime exports
  features/                 Gameplay scenes with their scripts/resources
  shared/                   Shared systems
  review/                   Small asset and presentation scenes
  tests/                    Engine-side checks
tools/                      Project-specific repeatable builders
artifacts/                  Captures, profiles and test results
```

Keep reusable plugin instructions and helpers in the plugin. Keep game-specific code, builders and creative decisions in
the game repository. Optional Backlog.md coordination follows the project's existing MCP/CLI workflow; do not introduce
a tracker merely to run GameGen. Use one scoped task when it is enough.

Keep heavy editable source assets, renders and videos outside Godot's import tree. Version source files and import
settings, preserve Godot resource IDs, and ignore engine caches such as `.godot/`. Adopt Git LFS only when suitable for
the repository and binary sizes. Generated outputs must have a known source or reproducible export recipe. No
credentials or local account settings belong in the plugin or game manifest.

## Per-asset record

Use the existing manifest or [manifest template](../templates/asset-manifest.json). Each entry needs an asset ID,
source/reference paths, chosen concept revision, output paths and hashes, and a review state. Generated services add
provider asset IDs, actual reported model, prompt path and job ID. Keep a full SHA-256 for local validation; also keep
SpriteCook's `sha12` if its installed workflow uses it.

3D records specify scale, forward/up axes, origin/ground contact, bounds, collision ownership, skeleton and animation
paths, clip names, durations, looping and root-motion ownership. 2D records specify frame dimensions, layout/columns,
frame count, rate, loop behavior, pivot, direction, filtering, alpha and trim offsets. Tiles add grid type, piece
layout/masks, cell dimensions, terrain rules and collision/navigation layers. Use actual exported metadata, not intended
values.

Asset progression is `draft`, `concept-approved`, `asset-review`, then `integrated`, with the reviewing actor and
revision recorded. Follow the selected approval policy. A folder name such as `approved` is not proof of review.

## Parallel handoff

Before parallel work, define file ownership and the import/controller contract. One coordinator owns shared preferences,
manifests, spend reservations and shared scenes. Workers own disjoint source/output paths and return readiness, changed
files, measured metadata and evidence. Agree who controls each live Blender/Godot session; independent agents must not
mutate the same editor scene concurrently. Resolve contract changes before integrating a new export.

Do not rewrite an existing main scene, saves or unrelated sources for an art review. A reusable review harness accepts
the model or sprite path and reads movement/camera settings from the project contract.
