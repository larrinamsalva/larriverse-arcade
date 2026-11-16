# LarriVerse — From Stretched Vector Faces to Cinematic Anime Rendering

## Why this change is necessary
The initial Helping Hands characters were drawn from hand-built SVG curves. Their heads were too tall, their bodies lacked believable posing and several situations showed a generic standing person rather than the actual symptom. **This PR corrects face proportions and stages a more grounded, story-led artwork system.** It is not a genuine Unreal Engine or Godot runtime and must not be presented as such.

## Implemented in this PR

- Redraw shared anime head shape with broader cheeks, shorter jaw, smaller nose, more natural hair volume and expressive open-mouth distress. Preserve skin-tone variety, full-body people, soft non-graphic presentation, keyboard/screenreader text and offline operation.
- Modify full-body arms for the **choking** pose: two filled forearms and individual fingers visibly placed at the throat. Forward lean, worried eyes/open mouth and nearby lunch context indicate the **symptoms**, not an instruction for a child to perform a choking rescue.
- Shorten the stretched nosebleed face without moving its fingers away from the soft nose. Keep a small non-graphic cue and the correct lesson wording.
- Preserve all existing **80 missions, correct answers, mission keys, progress, awards and dark mode**.
- Add DOM and browser tests that assert real visible gesture geometry and a face bounding box of believable proportions.

## The real-engine path

The artist-quality visual example shown in ChatGPT is the target for **pre-rendered 3D anime teaching scenes**. An SVG curve replacement on its own cannot reproduce cinematic hair, fabric, skin, lighting and perspective. Future art production should:

1. Author an original **3D character/style bible**: head-to-body proportions, recognizable eyes/ears/noses, proper fingers/joints, expressive poses, ethnic/age variety, costumes and a consistent visual palette. Preserve continuity across all twenty cases.
2. Produce and review each safety scene in a **3D creation/rendering tool** such as Blender or Unreal. Use grounded lighting, detailed hair and clothing materials, a carefully posed camera and an intelligible main action. A choking scene must immediately read as *cannot breathe or speak, hands at throat*, without frightening the child.
3. Export **locally hosted WebP/AVIF still frames** (and later optimized small motion clips) from that tool. Pair them with visible text labels; retain local SVG as offline/fallback art. This gets a dramatic quality increase while staying fast on phones and compatible with the current static GitHub Pages arcade.
4. For genuine interactive 3D inside the existing browser app, prototype a **WebGL viewer (e.g. Three.js + GLB/glTF)** in one separate optional world. Include 2D fallback for devices with limited GPU / WebGL availability, benchmarks and accessibility.
5. If full **Unreal Engine** live experiences are required in the browser, plan separately for **Pixel Streaming** infrastructure and GPU server expense; this is not a drop-in GitHub Pages replacement. Godot Web export is a different option for lightweight WebGL2-based interactive games.
6. Keep educational review: confirm each scene and answer reflect the exact question, are age-appropriate and medically safe. All 20 situations should receive an independent visual approval, not just structural validation.

## First major render candidates
- **Choking:** leaning forward; hands at the throat; scared expression; lunch context; adult helper alerted. Never suggest placing fingers blindly inside a mouth.
- **Nosebleed:** full recognizable nose and fingers pinching its soft area, forward lean, calm room.
- **Scrape/burn:** visible non-graphic knee scrape or small burn with a clear environmental cause.
- **Seizure/unresponsive:** different recognizable safe body positions, without showing unsafe interventions.
- **Traffic/lost child/bullying:** recognizable locations, relationships and danger cues.

## Quality gate
A completed automatic test proves **code structure, route preservation and geometric cues**; it does not prove cinematic visual quality. Check screenshots at 320px, 390px and desktop, in light/dark/high contrast; have real people assess visual recognition before a game-art PR is merged. Do not auto-merge.
