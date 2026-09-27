# Provider routing and tool discovery

Read the project preferences first. These are adapters for the tools selected there, not a requirement to install or use
every service. Discover the current exposed tools and their schemas. A listed skill or user-reported installation is not
proof that its MCP methods are callable in the current session. An unavailable optional service can use only a
configured fallback.

## GPT Image 2.5

Use GPT Image 2.5 for GPT image generation and editing. Unless current instructions or the saved route pin a model,
choose the flavor for the current operation:

| Flavor                                            | GameGen use                                                                                                                                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GPT Image 2.5 Flare (`gpt-image-2.5-flare`)       | Default for concept exploration, rapid prototypes, routine image generation and edits, and batches of asset variations.                                                                        |
| GPT Image 2.5 Sunburst (`gpt-image-2.5-sunburst`) | Use when precise edits must preserve approved identity, proportions or composition across revisions, or for polished final key art and promotional imagery. Allow for longer generation times. |

This applies [OpenAI's Flare and Sunburst guidance](https://openai.com/index/introducing-chatgpt-images-2-5/) to game
production; the [Images API guide](https://developers.openai.com/api/docs/guides/image-generation) documents the model
IDs. Choose per operation, so exploration can use Flare and a later precision edit can use Sunburst when the saved route
permits it. Model flavor and output quality are separate choices; `quality: high` alone does not select Sunburst. Keep
both within the saved budget.

Use the existing `imagegen` skill when available. Built-in image generation is the default proposed concept route and
does not require an API key. Do not build a new API runner merely to choose an output filename. Save the actual returned
image inside the project and retain the original reference, prompt and output hash.

For edits, inspect the local source and pass it using the tool's supported reference mechanism. Keep one accepted
identity across views. Verify the route's exposed model options and supported dimensions before calling it. With
`model: provider-default`, apply the flavor policy when a selector is exposed; otherwise the route accepts the
provider's opaque selection. This does not establish that GPT Image 2.5 or a particular flavor was used. If an exact
family or flavor is required, verify that the route supports it, use an explicitly allowed fallback, or report the
limitation before generation. Putting a model name in the image prompt does not select it. Record the intended flavor
and reason separately from the actual model, which is recorded only when the tool reports it.

Read the [concept reference procedure](concept-references.md) before character or environment generation. Request
transparent backgrounds through the image tool; verify actual alpha instead of relying on a checkerboard shown in the
pixels.

## SpriteCook

Reuse the installed `spritecook-workflow-essentials` skill plus only the task's specialist skills:
`spritecook-generate-sprites`, `spritecook-generate-tilesets`, `spritecook-animate-assets`, `spritecook-upload-assets`,
`spritecook-build-ui-kits`, `spritecook-use-assets-in-godot`, or `spritecook-use-dual-grid-tilesets`. Read their actual
installed paths from the skill catalog. Keep project choices above their ordinary defaults, while respecting genuine API
constraints.

Discover the native MCP methods before making calls. Check credits before generation. Query current model and tileset
options rather than copying a dated model list. When supported, reuse canonical `asset_id`, reference/style IDs and
exact source assets. Upload a local file using the installed upload skill's MCP upload bridge; keep credentials out of
chat and generated files. Follow each returned `poll.tool` and `poll.arguments`, retain the operation/job/run IDs, and
recover terminal outputs using a supplied recovery call. Save the canonical `sprite_url` output and actual frame
metadata in the existing project manifest.

SpriteCook outputs still need in-engine checks for alignment, tile seams, style drift and motion. Frame dimensions can
differ from the input dimensions. Use actual output dimensions when building SpriteFrames. The installed specialist
skills are separate dependencies, not copied into this plugin. If missing, use current official documentation through an
available authenticated integration or the saved fallback; do not invent a tool or silently generate unrelated assets.

Official references: [agent integration](https://www.spritecook.ai/agents), [API](https://www.spritecook.ai/api-docs),
[guides](https://www.spritecook.ai/docs). Recheck service capabilities and costs when using them.

## Higgsfield

Use only if enabled, the configured purpose selects it or allows it as a fallback, the `use_when` reason applies, and
its estimated credit cost fits the approved budget. Prefer a targeted revision or capability that the primary route
cannot provide. Reuse existing media and reference IDs. Discover the actual connected tool and its cost/polling
contract. Do not load a video-production skill for a still-image task merely because the provider name matches. No
unsupported model substitutions or unattended credit purchases.

## Blender

Use local Blender through its command line and bundled `bpy` API. Read the [Blender execution workflow](blender-cli.md)
for discovery, the background Python probe, the verified macOS Metal startup workaround, source isolation and observable
rendering. This route requires no third-party Blender MCP server or bridge add-on.

Use [blender-game-assets](../skills/blender-game-assets/SKILL.md) for reference matching, primitive and procedural
construction, textures, rigs and exports, and [game-animation](../skills/game-animation/SKILL.md) for motion. Read saved
sources with a scoped background script; use computer control only when the project policy and visual task justify it.
Preserve unrelated scenes and unsaved editor work.

## Godot

Use the connected Godot MCP for editor scene state, import refresh, live playtesting, logs and captures when available.
Discover methods from its schema. Follow the [shared verification rules](shared-context.md#shared-verification-rules)
for headless versus graphical runs, test saves and the main scene. Check the installed version and official
documentation for version-dependent properties.

A preflight should open or create one tiny asset, export/import it, run a minimal scene, exercise one input and capture
the result. Check errors from this run separately from historical editor errors.
