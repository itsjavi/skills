# Local Blender execution

Use the installed Blender executable and its bundled Python `bpy` API for modeling, materials, rigging, animation,
inspection, rendering and export. The current Blender route does not require a third-party MCP server or bridge add-on.
Revisit that choice only when the user requests a different integration.

## Establish a working launch

Resolve the executable from the environment or an explicit project setting and record its version. On macOS, check the
application bundle as well as the shell path; a common location is `/Applications/Blender.app/Contents/MacOS/Blender`.
Keep executable and asset paths configurable. Run scripts inside Blender rather than assuming the shell's Python can
import `bpy`.

After setting `BLENDER_BIN` to the actual executable, verify that background Python executes:

```sh
"$BLENDER_BIN" --background --factory-startup --python-exit-code 1 \
  --python-expr 'import bpy; print(bpy.app.version_string, bpy.app.background)'
```

`--version` alone does not prove that scene initialization or rendering works. Follow the probe with a small saved scene
and a representative render when establishing a new environment. Inspect installed API properties or the matching
official documentation for version-dependent modifiers, render devices, animation and exporter settings.

### macOS Metal startup failure

In the validated macOS run, Blender 5.1.2 exited with code 139 inside the Codex sandbox before Python ran. The stack
included `supports_barycentric_whitelist`, `MTLBackend::metal_is_supported` and `GPU_backend_type_selection_detect`. The
identical background Python command succeeded with approved execution outside the sandbox, and subsequent modeling and
rendering completed there.

If this startup signature recurs, inspect the crash log and use the host's approval mechanism for the necessary
execution outside the sandbox. Reuse the authorized launch method within its approved scope. Explain the startup failure
when it happens. Repeated script edits or selecting CPU rendering do not address a crash before Python executes. This
observation is specific to the tested environment; check the installed version and actual failure before applying the
workaround elsewhere.

## Build and inspect saved sources

Create an isolated source file or own a clearly named collection in an existing file. A background process reads the
saved `.blend`; it cannot inspect unsaved edits in a running editor. Preserve those edits and unrelated objects. Use
computer control for visual inspection or direct editing only when the project policy and task justify it.

For a new asset, use an explicit builder and output directory:

```sh
"$BLENDER_BIN" --background --factory-startup --python-exit-code 1 \
  --python /path/to/build_asset.py -- --output /path/to/asset-output
```

The builder owns argument parsing after `--`. Keep reusable shape functions small, with explicit names, dimensions,
transforms and materials. Use `bpy.data` and mesh operations where convenient, and establish the active object,
selection and mode before context-sensitive `bpy.ops` calls. Apply scale deliberately before operations whose result
depends on it, such as dimensioned bevels. Parameterize repetition and random seeds when using procedural construction.

Use `bpy.ops.wm.save_as_mainfile(...)` for the editable source and `bpy.ops.render.render(write_still=True)` for review
images. Save the source before long renders. For an existing source, load the file before the script that inspects or
edits it:

```sh
"$BLENDER_BIN" --background --factory-startup /path/to/asset.blend \
  --python-exit-code 1 --python /path/to/inspect_or_export.py
```

Keep source, runtime export and review stage objects separate. Save external texture and simulation dependencies with
the asset using portable paths or packed data where supported. Preserve procedural nodes and modifiers in the source
even when the export needs baked or realized results.

## Procedural work and rendering

Use parameterized meshes, curves, modifiers, Geometry Nodes, instancing or supported particle/simulation systems when
they suit repeated structures, foliage, scatter, fur, trails or effects. Choose mechanisms available in the installed
version. Treat Blender simulation caches and node graphs as source dependencies, and decide separately how the result
will render or run in the target engine.

Review a small representative result before a large scatter, simulation or animation batch. Save and bake stateful
simulations before rendering frames out of order or across independent workers. Preserve the cache and its frame range
so a fresh process reproduces the motion. Pure keyed animation and stateless procedural geometry do not need a
simulation bake.

Choose Eevee or Cycles, samples, resolution, lighting and color management for the intended look. Verify device
availability and a small render before a long batch; do not assume a configured GPU is usable or faster for this scene.
Keep comparison cameras and exposure stable while judging geometry, textures and material response.

Render long clips as numbered image sequences when useful for recovery, then encode a playable video with a verified
encoder such as FFmpeg. Record fps, frame range, resolution and output paths. Resume only frames from the same source
and render configuration; a matching filename alone does not establish a reusable frame. Keep old iterations separate.

Record process/session ID, source revision, renderer, current frame and completion or failure. A timeout does not prove
that Blender stopped. Check the running process and progress before retrying. Independent render workers need disjoint
frame ranges and their own logs/status files. Check exit status, expected files and full video decoding, then inspect
actual playback before delivery.

## Skin and animation export checks

Check actual deforming vertices, normalized nonzero weights and the target influence limit. When pruning weights through
`bpy`, copy numeric group IDs and weights before removing memberships, then normalize and read back the result. Mutating
Blender's live collection while retaining its element wrappers can leave incorrect weights.

Keep authoring controls and deform bones distinct. Bake evaluated IK, constraints and driven shape keys into an export
mode that preserves the intended named clips. Inspect the installed export options; do not assume their names or
defaults across Blender versions. Confirm facial morph animation as well as the bone transforms.

A video containing N frames at fps F lasts N/F seconds, while an exported clip spans its first and last sample times.
Add a closing animation key when needed to preserve the intended loop duration, and avoid rendering a duplicate
endpoint. After fresh import, inspect actual action ranges and times rather than assuming a zero-based or one-based
offset.

Import the export into a fresh scene and verify skin, textures, morphs, named clips, duration and representative
deformed poses. A fresh Blender import is a useful exchange check; the game delivery still needs its intended engine
import and visual review. Keep these verification boundaries explicit.

## References

Use the installed version's
[command line documentation](https://docs.blender.org/manual/en/latest/advanced/command_line/index.html),
[Geometry Nodes simulation guidance](https://docs.blender.org/manual/en/latest/physics/simulation_nodes.html) and
[glTF documentation](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html) for
version-sensitive details.

The
[community discussion supplied by the user](https://community.openai.com/t/how-does-gpt-6-actually-generate-3d-models-in-release-demo-via-codex-local-blender-or-mcps-apis/1395391)
illustrates background `bpy` scripts and parameterized primitive builders. Treat it as a workflow example; it does not
independently establish how the release demonstration was implemented. The [validation record](../validation.json)
distinguishes the local modeling, rigging, rendering and fresh-import proof from instruction-only checks.
