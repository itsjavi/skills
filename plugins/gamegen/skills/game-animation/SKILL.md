---
name: game-animation
description:
  "For GameGen projects, author and verify skeletal, cutout or frame animations for game assets, including locomotion
  cadence, action timing, transitions and expressive motion."
---

# Animate game assets

Read [shared context](../../references/shared-context.md), ready preferences and the asset contract. Use the approved
identity, pose references and required clips. Choose skeletal 3D, 2D cutout or frame animation based on the source. Do
not force an RPG-specific five-clip set on every game.

## Motion contract

Define clip names, duration, loop behavior, root-motion ownership, action events and transitions. Decide which system
moves the actor. Match stride distance and cadence to real game travel speed. Use root motion only when the controller
explicitly consumes it; otherwise keep the root stable and move through gameplay physics.

For locomotion, establish contact, passing and flight/extreme poses as appropriate. Check planted feet and weight
transfer before secondary ear, tail, cloth or leaf motion. Idle should support the character's personality without
constant distracting movement. Attack/jump/dodge motions need readable anticipation, contact/apex and recovery.
Expressions and blinking must be deliberate, visible and free from clipping.

## Asset-specific implementation

- 3D: use [blender-game-assets](../blender-game-assets/SKILL.md) for the editable rig and the
  [local Blender workflow](../../references/blender-cli.md) for `bpy` authoring, rendering and export. Skin visible
  geometry to the intended chains, normalize nonzero weights within the export limit, and inspect the final mesh through
  extreme poses. Use IK/FK and facial controls appropriate to the motion, and bake evaluated constraints and driven
  morphs when needed for export. Verify named actions, skin and facial animation after fresh import, including duration
  and loop endpoints.
- Cutout: maintain consistent layer order, joint pivots and overlap through extreme poses. Test facing changes and
  attached props.
- Frame animation: animate the exact accepted source at stable scale and pivot. Use explicit frame metadata and inspect
  identity consistency between frames.
- SpriteCook: use workflow-essentials and animate-assets, uploading local sources through the upload skill first. Retain
  the source asset ID, returned operation IDs and actual output frame size. Do not regenerate a new character for each
  clip.

## Runtime verification

Render a short playable preview from the actual Blender model when reviewing 3D animation. Check anticipation, contacts,
head/eye expression, limb intersections and secondary motion in continuous playback. Verify the encoded frame count, fps
and duration. A successful render or bone animation does not establish that exported skin and facial controls work.

Inspect continuous playback, not only a pose sheet. Measure displacement over real elapsed time separately from
animation playback rate. Test acceleration, stopping, blocked movement, direction changes, action interruption and
transitions back to idle. If movement feels slow, distinguish speed settings, animation cadence, input response and
actual frame time.

Check that action effects and hit windows align with the animated contact moment. Test pause/resume and repeated action
input. Keep motion previews and real movement footage distinguishable. Record verified clip names, lengths, rig/frame
metadata and remaining expression limits in the manifest.
