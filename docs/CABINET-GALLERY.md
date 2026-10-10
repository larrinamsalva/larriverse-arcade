# LarriVerse Arcade — Cabinet Gallery

Automated Chromium creates **candidate evidence** for the lobby and all 35 cabinets at desktop and mobile sizes: **72 images**. They remain temporary until a person reviews the offline gallery bundle and exports a human approval record.

| Cabinet | Launch path | Candidate evidence | Public gallery |
| --- | --- | --- | --- |
| Bridge Buddies | `games/bridge-buddies/index.html` | generated automatically | pending human approval |
| Water Works | `games/water-works/index.html` | generated automatically | pending human approval |
| Harbor Helpers | `games/harbor-helpers/index.html` | generated automatically | pending human approval |
| Pantry Picnic | `games/pantry-picnic/index.html` | generated automatically | pending human approval |
| Compass Cove | `games/compass-cove/index.html` | generated automatically | pending human approval |
| Cipher Club | `games/cipher-club/index.html` | generated automatically | pending human approval |
| Trade Town | `games/trade-town/index.html` | generated automatically | pending human approval |
| Critter Council | `games/critter-council/index.html` | generated automatically | pending human approval |
| Traffic Town | `games/traffic-town/index.html` | generated automatically | pending human approval |
| Street Safety Scout | `games/street-safety-scout/index.html` | generated automatically | pending human approval |
| Pocket Planet | `games/pocket-planet/index.html` | generated automatically | pending human approval |
| Scam Sleuth | `games/scam-sleuth/index.html` | generated automatically | pending human approval |
| Kindness Quest | `games/kindness-quest/index.html` | generated automatically | pending human approval |
| Fact Finder | `games/fact-finder/index.html` | generated automatically | pending human approval |
| Repair Café | `games/repair-cafe/index.html` | generated automatically | pending human approval |
| Time Trail | `games/time-trail/index.html` | generated automatically | pending human approval |
| Garden Guardians | `games/garden-guardians/index.html` | generated automatically | pending human approval |
| Energy Island | `games/energy-island/index.html` | generated automatically | pending human approval |
| Reuse Rally | `games/reuse-rally/index.html` | generated automatically | pending human approval |
| Robot Rover | `games/robot-rover/index.html` | generated automatically | pending human approval |
| Lemonade Lab | `games/lemonade-lab/index.html` | generated automatically | pending human approval |
| Beat Builder | `games/beat-builder/index.html` | generated automatically | pending human approval |
| KidsCoin Family App | `games/kidscoin-family/index.html` | generated automatically | pending human approval |
| Brain Sweat Expanded | `games/brain-sweat-expanded/index.html` | generated automatically | pending human approval |
| Brain Sweat Life Skills | `games/brain-sweat-life-skills/index.html` | generated automatically | pending human approval |
| Bubble Resonance Φ369 | `games/bubble-resonance-phi369/index.html` | generated automatically | pending human approval |
| Chill Brain Rewards | `games/chill-brain-rewards/index.html` | generated automatically | pending human approval |
| Creature Catcher | `games/creature-catcher/index.html` | generated automatically | pending human approval |
| Road Trip Quest | `games/road-trip-quest/index.html` | generated automatically | pending human approval |
| Road Trip Quest GPS | `games/road-trip-quest-gps/index.html` | generated automatically | pending human approval |
| Weather Watchers | `games/weather-watchers/index.html` | generated automatically | pending human approval |
| Garden Grow & Harvest | `games/garden-grow-harvest/index.html` | generated automatically | pending human approval |
| Kids Sudoku World | `games/kids-sudoku/index.html` | generated automatically | pending human approval |
| Word Search World | `games/word-search-world/index.html` | generated automatically | pending human approval |
| Crossword World | `games/crossword-world/index.html` | generated automatically | pending human approval |

Run `npm run test:browser`, `npm run gallery:build`, and `npm run gallery:verify` to generate and verify the complete review pack. The builder uses explicit descriptions in `scripts/gallery-metadata.mjs`; missing subject metadata fails instead of inserting an undefined value. Verification checks coverage, title/alt text, viewports, dimensions, byte counts, and image hashes.

Download the successful `larriverse-gallery-review-<run>` artifact, unzip it, and open `index.html` to approve or reject every image and review its proposed alt text.

## Approval rules

Use only clean demo data. Reject any image showing personal profile names, family messages, private progress, coordinates, location permission prompts, or real nearby-place data. **Road Trip Quest GPS must be captured in Demo Mode.** Check that controls and safety messages are readable and that alt text describes the visible interface rather than repeating a filename.

Approved images are eventually committed under `docs/screenshots/<project>/<subject>.png` together with `docs/release-approval.json`. Until those exact files and hashes are present, this document does not claim a finished public gallery.

See [GALLERY-APPROVAL.md](GALLERY-APPROVAL.md) for the full human review, physical-device, and release-decision workflow.

- **Traffic Town** — Read traffic signs & choose safe actions with ten-question rounds drawn from a 40-question non-repeating bank.
- **Street Safety Scout** — Identify signals, caution and emergency signs, vehicle lights, roadside warnings, and hazards through balanced fifteen-stop routes drawn from a 60-scenario bank.
- **Weather Watchers** — Complete 25 illustrated sky, cloud, weather-preparation, and forecast-reading challenges across four advancement levels.
- **Garden Grow & Harvest** — Complete 24 illustrated bed-building, planting, care, harvest, and food-freshness challenges across four advancement levels.

- **Kids Sudoku World** — Six chapters covering 60 original and uniquely solvable 4×4, 6×6 and 9×9 boards. Verify visible outlined boxes, numeric/picture entry, difficulty progression, accessibility, saved local checkpoints and no pressure timer.

- **Word Search World** — Review illustrated sixty-level introduction and the six-theme chapter rail; test visible letters, word list, keyboard/touch guidance, contrast, and readable 12×12 grid at phone width.

- **Crossword World** — Review the numbered crossword grid and legible Across/Down clues, on-screen alphabet, six chapter progression, keyboard/touch controls, stars and kid-friendly illustrations. Human screenshot approval is required.
