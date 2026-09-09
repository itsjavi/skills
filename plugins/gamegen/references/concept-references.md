# Concepts that support asset production

Derive style from the game brief, supplied images and approved choices. Separate shape language, material response, lighting, color, camera and detail density. Match the scale at which assets will actually appear. A polished concept is a target; it is not evidence that an exported game asset meets that target.

## Identity and construction views

Choose one canonical design according to `workflow.concept_review`. Reuse that exact image as the identity reference for subsequent views. Record the chosen version and its distinguishing proportions. Generate individual readable views or a small clean sheet, not a crowded poster with tiny details.

For a 3D character, normally request front, side and rear construction views in a neutral pose, orthographic-looking projection, consistent scale, a shared ground line and soft neutral lighting. Include the other side for asymmetric designs, and top/underside when they resolve hidden geometry. Request front and rear three-quarter views, an actual gameplay-camera view, a face/material detail study and relevant expressions separately. Humanoids may need an A or T pose; quadrupeds need separated limbs and a stance that reveals joints. Choose the pose that supports the intended rig.

Compare all views for body length, head size, feature placement, appendage count and silhouette. Generated views are not guaranteed to be geometrically consistent. Resolve disagreements in a short construction note. For difficult designs, render a Blender blockout from fixed cameras using the [local CLI workflow](blender-cli.md) and use those renders as proportion and camera references for image edits. Do not make incompatible views into incompatible geometry.

For props and modular environments, include front/side/top views as needed, a scale reference, grid dimensions, entrance or connection points, material boundaries and a small composition viewed through the intended camera. Plan walkable space and occlusion before decorating it.

## 2D and hybrid references

Resolve side-view, top-down or isometric projection; sprite canvas/frame dimensions; palette and pixel density; grounded pivot; and the required 1, 2, 4, 8 or other viewing directions. Generate each direction from the same accepted identity. Keep frame scale, perspective and lighting fixed. Use mirroring only when asymmetry and gameplay allow it.

For cutout animation, identify overlapping body parts and concealed joint areas before separating layers. For Blender-rendered sprites, lock the camera, orthographic scale, lighting, ground plane and render settings across all directions and frames. Render one representative sheet and test it in Godot before rendering every action.

For tiles, design transitions and edge/corner cases with the actual terrain system. A seamless texture alone is not an autotile set. Establish the tile grid before generating material variations.

## Pose and motion package

Reference locomotion contact, passing and airborne/extreme poses as applicable. For an action, include anticipation, contact/apex and recovery. Show silhouettes without obscuring the body with effects. Specify what stays fixed, what moves, facing, limb contacts and approximate timing. Include facial and secondary motion only when the scoped asset requires them.

An animation reference is not a sprite sheet or a working rig. Validate continuous playback, anatomical consistency and grounded contacts after asset production.

## Review and controlled iteration

Review identity and silhouette before fine detail or full rigging. Compare the asset at the target gameplay size and from the same camera as the concept. Name the specific mismatch, make one focused revision, and reuse accepted work. Respect the attempt and spending limits. Save chosen references and their provenance in the asset manifest; keep large prompt history out of preferences.
