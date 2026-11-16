# LarriVerse Real World Visual Mission

**Scope:** Every one of the 40 LarriVerse Arcade worlds.  
**Art direction:** **Beautiful modern anime / animated-feature illustrations that look like recognizable real people, animals, objects and environments**, not circles with eyes, blobs, stick figures, emojis standing in for creatures, or generic icon cards.

This master plan is a production roadmap, not a declaration that all 40 worlds have already been redrawn.

## Reference quality

The visual standard is a fully illustrated teaching scene similar to a warm, cinematic anime children's show: anatomically readable people with faces, hair, proper hands, clothing and leg poses; objects that look like what children would see in life; natural directional daylight, contact shadows, foreground / middleground / background, atmospheric depth and polished textures. More **real and cinematic** is the goal; **disturbing**, frightening or medically graphic is not.

### Every picture must pass these questions

1. **Recognition:** Could an unfamiliar child identify the object or action without the written label?
2. **Physical anatomy:** Are faces, noses, fingers, feet, joints and creatures convincingly shaped? Are objects complete rather than approximated by a circle or line?
3. **Scene context:** Does the floor, environment and proximity of objects tell a coherent story?
4. **Educational truth:** Are spider markings, wildlife habitats, first-aid actions, dinosaurs and road signs scientifically / professionally appropriate for the lesson? Where uncertain, label interpretation; never claim visual identification as a diagnosis.
5. **Mobile:** Are essential details recognizable on a phone, not only at 1600px?
6. **Accessibility:** All actions remain keyboard accessible with visible readable labels and text equivalents, dark mode, high contrast and reduced motion.
7. **Privacy:** Use local illustrations; no image tracking calls, login walls, extra personal data or third-party ad services.

## How the art gets shipped

- **Phase 1 — Visual foundation (this PR).** Add a cinematic world-entry shelf to the homepage using **existing, locally bundled 3D environment paintings**. Add a shared, documented visual standard, inventory of all 40 worlds, and a consistent painting-first card treatment. This is a *real homepage improvement* and technical foundation, but does **not** yet redraw the play scenes in every cabinet. The preview art is explicitly identified as interpretive artwork rather than a game screenshot.
- **Wave 1 — People and creature fidelity (7 worlds).** Helping Hands, Spider Scout, Dino Discovery World, Street Safety Scout, Kindness Quest, Critter Council and Creature Catcher. Replace icon anatomy and generic faces with detailed bespoke scene illustrations. Prioritize the user's already-raised problems, especially nosebleeds and dinosaurs.
- **Wave 2 — Real everyday places, objects and scenes (10 worlds).** Scam Sleuth, Traffic Town, Road Trip Quest, Road Trip Quest GPS, Garden Grow & Harvest, Repair Café, Bridge Buddies, Garden Guardians, Robot Rover and Harbor Helpers. Upgrade believable tools, vehicles, building materials, trees, foliage and environmental lighting.
- **Wave 3 — Nature and everyday activities (12 worlds).** Water Works, Pantry Picnic, Compass Cove, Pocket Planet, Energy Island, Reuse Rally, Lemonade Lab, Weather Watchers, Trade Town, KidsCoin Family, Time Trail and Creative Calm Cove.
- **Wave 4 — Remaining worlds (11 worlds).** Cipher Club, Fact Finder, Beat Builder, Brain Sweat Expanded, Brain Sweat Life Skills, Bubble Resonance, Chill Brain Rewards, Kids Sudoku, Word Search World, Crossword World and Date Detective. Upgrade scenes and ambient art without compromising puzzle readability.

The machine-readable inventory is `docs/REAL-WORLD-VISUAL-ROLL-OUT.json`. Each art phase changes actual gameplay art where necessary, with its own focused PR and original visual review.

## Shared foundation

`assets/larriverse-visual-foundation.js` declares the visual standard, upgrade ledger conventions and three real playable world spotlights. `assets/larriverse-real-world.css` applies art-oriented framing to all 40 homepage cards without touching the answer data or browser saves.

The first three featured art scenes reuse **existing 3D image atlases**, not new AI artwork, and their links are the actual playable Repair Café, Garden Guardians and Robot Rover cabinets. It is misleading to call them in-game screenshots; the homepage says they are imaginative previews.

## Safe rollout rules

- Develop one focused art PR at a time per world, never bulk overwrite all scene renderers or invent visual content that contradicts an answer.
- Keep existing game mission identifiers, saved progress, reward ledger and public demo access.
- New image assets must be local, properly sized for mobile, legally reusable/original, and visibly relevant to the corresponding lesson.
- Preserve human safety and educational review gates, browser QA on desktop and mobile, contrast sweeps and gallery review.
- Don't automatically merge or change release status. After both CI pipelines pass, manually inspect actual playable scenes and check every pictured object.

## Next recommended PRs after this foundation

1. Finish the open **Helping Hands expressive anime character** PR #140 (separate branch), and inspect whether the actual on-screen faces and hands meet the reference look. Don't assume tests prove aesthetic quality.
2. Create new, high-resolution illustrated **Dino Discovery World** creature scenes with real dinosaur anatomy / habitat and readable kid-friendly close-ups.
3. Revisit **Spider Scout** with natural creature detail where current SVG drawings remain too simplified.
4. Continue across all 40 worlds using the audited wave sequence.

**Definition of done for the whole mission:** all 40 worlds have reviewed, age-appropriate, professional-looking illustrated scenes and object/character assets, not merely a better-looking homepage.
