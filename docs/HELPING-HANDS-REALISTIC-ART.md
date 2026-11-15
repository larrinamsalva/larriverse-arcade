# Helping Hands — Clear Realistic Pictures Upgrade

**Repo:** https://github.com/larrinamsalva/larriverse-arcade  
**Game:** `games/helping-hands/`  
**Goal:** Children should recognize a nosebleed, a real first-aid item, and a safe helping action *from the illustration itself* instead of guessing what a circle or generic icon represents.

## What this update does

- Adds **twenty separate, scenario-specific SVG illustrations** for the existing Helping Hands situations.
- Replaces **twenty-four flat answer symbols** with more tangible, appropriately colored objects and actions: phone showing 911, actual handled first-aid kit, adhesive bandage with center pad, gauze with hands applying pressure, flowing water and faucet, soft flexible cold pack, medicine container, cloth, clock, trusted helper, safe distance, listening, stop signs and others.
- **The first nosebleed teaching picture is a child with a shaped face, visible nose bridge, small non-graphic nosebleed cue and distinct pinching fingers.** It no longer relies on a round head icon. The corresponding answer choice uses the same identifiable treatment action.
- Improves the other scenes using contextual school, living room, outdoor, street, water and fire safety settings; no gore, frightening medical details, shock imagery or risky hero actions.
- Makes Helping Hands phone answer cards **two columns** at narrow widths, rather than three tiny columns, without changing Spider Scout.

The new artwork lives in `assets/helping-hands-realistic-art.js` and is composed entirely of original local SVG. Both the standalone scene and the multiple-choice illustrations are generated with it. There are no images to download, no external scripts, no animation timers and no data requests.

## Preserve

All 80 Helping Hands mission descriptions, answers, chapters and explanations remain unchanged. Existing local progress and saved rewards continue under `larriverse.helping-hands.v1`. The same Arcade SDK, backup behavior, screen-reader descriptions and keyboard controls are retained. Spider Scout and the other thirty-nine worlds continue using their original artwork and progress.

## Testing and review

- Validate the SVG module syntax and verify **all 20 scenarios** and **all 24 answer objects** produce individual SVG drawings without scripts or remote image assets.
- Confirm the nosebleed *scene and correct answer* explicitly contain the visible nose anatomy and a hand pinching the soft part of the nose.
- Verify all 80 original mission choices use valid picture keys.
- Browser-test scene and answer artwork, different chapters, reload persistence, mobile two-column layout, 390px viewport overflow, browser errors, and the existing desktop/mobile contrast sweep.
- Inspect the phone art manually: real fingers/nose should be obvious at 150px and large scene; medical icons should not be mixed up (911 versus poison control, cool running water versus drink, gauze versus adhesive strip).
- A qualified first-aid educator should review scenes before the artwork is described as professionally verified medical teaching. This remains a **practice game**, not a first-aid certification or instructions to handle an active emergency.

## Safety boundaries

The pictures are stylized realistic educational illustrations, not photographs. There is no graphic blood. They do not add or alter any first-aid claims, nor prompt a child to undertake dangerous procedures; call emergency services and seek a trusted adult where appropriate.
