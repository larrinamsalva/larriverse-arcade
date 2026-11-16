# Helping Hands — Expressive Anime Characters (PR mission)

**World:** `games/helping-hands/`  
**Baseline:** Helping Hands realism PR #139 merged into `main`.

## Why this update exists

Parents and children need to see recognizable people, not simple circles and stroke-only limbs. This upgrade replaces the shared human drawing system with original **anime-inspired cel-shaded characters**. Realistic first-aid objects from #139 remain in place.

## Appearance

- **Faces:** defined jawline/chin, ears, expressive eyes with irises and highlights, brows, soft cheeks, individual hair locks, subtle nose and mouth shapes, worried vs calm expression.
- **Bodies:** filled sleeves, shaped forearms, hand/finger silhouettes, jacket seams/collar, actual two-legged trousers, knees, shoes and soles. No stick-line arms or legs as character construction.
- **Character variety:** multiple palettes for hair, skin and trousers and different poses; distressed children and concerned helpers have visible expressions. Comforting and signaling characters have different arm positions.
- **Resting scene:** a child with a filled body, on bedding, with a visible pillow and blanket.
- **Nosebleed:** a distinct head and nose, child leaning forward, a hand with fingers pinching the soft nose, a tiny non-graphic blood cue.
- **Environments:** keep clear school, indoor, outdoors, street, water and danger backdrops, with soft cel-shaded light.

These are carefully authored local SVG **illustrations**, not photorealistic anime movie frames or medical photos. Each uses only static geometry and stays offline-friendly. SVG is intentional to preserve fast loads and accessible labels.

## Scope

`assets/helping-hands-anime-characters.js` adds reusable `animeFace`, `animePerson`, `animeResting`, `animeListening` and `animeNosebleedPose`. `assets/helping-hands-realistic-art.js` delegates its human artwork to these functions while keeping all 20 situation maps and 24 illustrated answer objects.

Preserved without any modification: all 80 missions, scoring, answer order, local saved progress, 8 chapters, safety copy, Spider Scout artwork, other game worlds, published release data, and no-login/offline principles.

## Testing

- Compile/import both JS modules; check exported poses and the actual generated SVG shape markers.
- Confirm all twenty existing scenes contain anime people or human character scenes, with valid image/XML structure and no scripts, externally hosted images, fetch calls, or trackers.
- Check the first nosebleed scene at desktop and 390px mobile width, preserving nose-bridge, visible pinching fingers and small non-graphic cue.
- Verify full-bodied figures in friendship/bullying scenarios; inspect clothing folds, fingers, eyes and leg readability, including dark mode/high contrast and saved discoveries.
- Run both GitHub **Validate LarriVerse Arcade** and **Browser QA**. Review screenshot gallery and ask for a human first-aid educator to review the medical teaching images before formal educational approval.

## Never auto-merge

Keep this as a PR for manual review. The goal is a convincing visual uplift without altering the lessons or implying it constitutes certified first-aid instructions.
