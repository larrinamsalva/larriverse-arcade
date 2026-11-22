# Reuse Rally artwork and motion

All sixty Toy Town sorting questions now have an explicit picture assignment in `games/reuse-rally/reuse-pictures.js`. Thirty-eight object pictures distinguish the materials and states described by the native question. Glass bottles and jars, food tins and drink cans, apple skins and fruit cores, shirts and jackets, intact bags and foil-lined wrappers, and mugs, cups and saucers use recognizable matching pictures. Aliases reuse a picture only when the depicted object is the same kind and condition.

Six chapter settings show a community courtyard, kitchen, garden, workshop, library and park. Each offers an empty wooden display table for the current object. A separate welcome courtyard, two-pose community helper and cloth tote replace the shared introduction's generic art. Four illustrated destination containers sit above native Reuse, Recycle, Compost and Trash button labels. The pictured objects carry no destination hint or generated text.

## Behavior and accessibility

A correct answer gives the object a gentle settling reaction. A mistaken answer gives a small reviewing movement while the correct destination is marked. The destination picture responds to the revealed correct route. Existing native feedback explains each answer; next-action keyboard focus, first-choice scoring, one answer per question, all six chapters, checkpoint saves, reload/resume, completion rewards and replay keep their existing rules. The sixty authored questions and answer keys are unchanged. All sorting advice remains explicitly Toy Town's fictional system, with the existing local-rule caveats and adult-handling wording for sharp broken items.

Both site and operating-system reduced-motion preferences stop the new reactions and the shared introduction without hiding pictures or results. Dark mode and high contrast retain solid native text surfaces. Enlarged labels stay outside images; the destination cards reflow down to 320 pixels at 200% text. The skip link hides according to its actual height until focused, including when its text wraps.

## Assets and provenance

Fifty new local WebP files (about 1.03 MiB) include 38 object pictures, four destination pictures, seven environments and one two-pose helper. Object and destination pictures are 256 × 256. Landscapes are 832 × 468 in `assets/world-motion/backgrounds/reuse-{setting}.webp`; the helper is a 640 × 320 sheet at `assets/world-motion/characters/reuse-helper.webp`. The cloth tote is shared with the introduction at `assets/world-motion/objects/reuse-tote.webp`; all other object and destination pictures are in `games/reuse-rally/art/`.

Seven original sheets/atlases were generated with the built-in image generator using the prompts below. Production processing is deterministic atlas cropping, transparent padding, resizing and WebP encoding. Generated alpha is preserved. To exclude stray atlas-edge fragments, the normalized glass-jar cell is cropped to (0, 0, 230, 256), and the storage-box and foil-tray cells to (0, 0, 256, 220), then padded back to 256 × 256 without moving the objects. No external image services or new dependencies are used at runtime. Code and original artwork use the repository's existing MIT license.

## Verification

`npm run validate` checks the existing repository contracts. Focused desktop and phone browser checks in `tests/browser/reuse-rally-art.spec.mjs` exercise decoded local pictures, native keyboard choices, wrong-answer explanations, disabled duplicate answers, correct-route reveal, actual rendered reaction frames, both reduced-motion settings, saved progress, contrast, image/label separation and enlarged-text reflow. Finite animations are sampled at fixed points and their time/playback state restored to avoid a runner timing race.

The complete Reuse Rally campaign in `tests/browser/skill-worlds.spec.mjs` checks every question name and picture assignment, all 38 distinct object pictures and six environments, all sixty correct routes, a halfway reload from saved chapter 4, completion, replay and saved personal best. Shared world-motion coverage checks the new welcome layers. Functional tests do not establish aesthetic quality; the generated sprites and actual desktop/phone scenes are reviewed separately.

## Original production prompts

### objects-01

Use case: stylized-concept. Asset type: production transparent 4-COLUMN 3-ROW atlas of 12 separate objects for LarriVerse Reuse Rally, a children's fictional sorting game. Detailed cinematic 3D animated-feature renderings with convincing real materials, recognizable complete shapes, neutral warm studio light, elevated front three-quarter view. Each equal square cell contains ONLY its assigned object, centered, entire silhouette inside with at least 12 percent transparent margins. EXACT row-major order:
ROW 1, COLUMN 1: One sound reusable water bottle, opaque teal metal with a screw cap, empty, no label.
ROW 1, COLUMN 2: One clean EMPTY cylindrical metal food tin, open top with smooth rolled rim, no lid or sharp protrusions.
ROW 1, COLUMN 3: One recognizable yellow banana PEEL with brown speckles, empty skin only, no whole banana.
ROW 1, COLUMN 4: One broken cream ceramic mug with a large missing section and two detached ceramic pieces beside it, no liquid.
ROW 2, COLUMN 1: One intact closed hardcover children's storybook, blue cloth cover with simple embossed gold star, no writing.
ROW 2, COLUMN 2: One clean sturdy assembled brown corrugated cardboard storage box, partly open flaps, empty.
ROW 2, COLUMN 3: One bitten red apple CORE showing pale flesh, seeds and stem, no sticker.
ROW 2, COLUMN 4: One crumpled used white tissue with a subtle pale discoloration, discreet, no bodily fluids or graphic detail.
ROW 3, COLUMN 1: One clean folded green short-sleeved cotton T-shirt in good condition, visible collar and sleeves.
ROW 3, COLUMN 2: Three flat clean loose white sheets of office paper, completely blank.
ROW 3, COLUMN 3: One clean empty clear glass jam jar with a silver screw lid set beside it, no labels.
ROW 3, COLUMN 4: One disposable white fluted PAPER plate with visible brown grease stains and a few food crumbs, not ceramic.
True transparent alpha background, no scenery, people, hands, cast background shadows, gradients, labels, readable text, numbers, logos, arrows, color-coded destination hints, UI, borders or watermark. Broken items are still-life recognition pictures only; no injury or action. Keep each item clearly separated inside its own cell.

### objects-02

Use case: stylized-concept. Asset type: production transparent 4-COLUMN 3-ROW atlas of 12 separate objects for LarriVerse Reuse Rally, a children's fictional sorting game. Detailed cinematic 3D animated-feature renderings with convincing real materials, recognizable complete shapes, neutral warm studio light, elevated front three-quarter view. Each equal square cell contains ONLY its assigned object, centered, entire silhouette inside with at least 12 percent transparent margins. EXACT row-major order:
ROW 1, COLUMN 1: One sturdy clean purple PAPER gift bag with intact cord handles, empty and reusable, no text.
ROW 1, COLUMN 2: One large crumpled clean silver ALUMINUM FOIL ball, shiny folded texture, no food.
ROW 1, COLUMN 3: Several curled orange rind PEELS with white pith, no fruit slices or whole oranges.
ROW 1, COLUMN 4: One irregular broken piece of silver reflective MIRROR glass with a clear blue-tinted reflection, no frame or hands.
ROW 2, COLUMN 1: One small durable blue plastic storage box with fitted lid partly open, empty.
ROW 2, COLUMN 2: One clean folded NEWSPAPER, realistic gray columns represented only by unreadable short marks, no readable words.
ROW 2, COLUMN 3: A small loose pile of pale and dark green LETTUCE trimmings with recognizable ruffled leaves and stem ends.
ROW 2, COLUMN 4: One EMPTY crinkled potato chip bag with red outer surface and visible silver inner lining, opened top, no food or writing.
ROW 3, COLUMN 1: One clean EMPTY silver aluminum BEVERAGE can, cylindrical with pull tab and small drinking opening, not a food tin.
ROW 3, COLUMN 2: Several thin curled RED APPLE skin ribbons with a little pale flesh attached, no apple core or whole apple.
ROW 3, COLUMN 3: One otherwise intact cream ceramic drinking CUP with a small chipped section on its rim, no detached shards or liquid.
ROW 3, COLUMN 4: One clean flattened white PAPERBOARD cereal carton with simple pastel blocks of color, no text, not a corrugated shipping box.
True transparent alpha background, no scenery, people, hands, cast background shadows, gradients, labels, readable text, numbers, logos, arrows, color-coded destination hints, UI, borders or watermark. Broken items are still-life recognition pictures only; no injury or action. Keep each item clearly separated inside its own cell.

### objects-03

Use case: stylized-concept. Asset type: production transparent 4-COLUMN 3-ROW atlas of 12 separate objects for LarriVerse Reuse Rally, a children's fictional sorting game. Detailed cinematic 3D animated-feature renderings with convincing real materials, recognizable complete shapes, neutral warm studio light, elevated front three-quarter view. Each equal square cell contains ONLY its assigned object, centered, entire silhouette inside with at least 12 percent transparent margins. EXACT row-major order:
ROW 1, COLUMN 1: One EMPTY small crumpled purple-and-silver candy WRAPPER, twisted ends, no candy, no writing.
ROW 1, COLUMN 2: One clean EMPTY transparent GLASS beverage bottle, slender neck and plain smooth glass, no label or stopper, no liquid.
ROW 1, COLUMN 3: One green PEAR CORE, visibly pear-shaped taper with narrow stem end and pale eaten flesh, brown seeds, no apple.
ROW 1, COLUMN 4: One durable shallow mint plastic SANDWICH container, square with reusable lid open beside it, empty and clean.
ROW 2, COLUMN 1: One clean flattened brown CORRUGATED delivery box, unfolded cross-shaped flaps and visible corrugated edge, no text.
ROW 2, COLUMN 2: A small pile of wilted dark green SPINACH leaves with smooth pointed leaf shapes and slender stems, not lettuce.
ROW 2, COLUMN 3: One EMPTY small flexible standing snack POUCH, teal outside and reflective silver lining visible at open top, no food or writing.
ROW 2, COLUMN 4: One cream CERAMIC SAUCER with a clear crack across its shallow circular surface and a small broken section at edge, no cup.
ROW 3, COLUMN 1: One clean intact natural cream CLOTH shopping TOTE bag with two long fabric handles, empty, soft woven fabric, no logo.
ROW 3, COLUMN 2: One used disposable PAPER beverage CUP, white with visible brown food/drink stains near rim, empty, no lid.
ROW 3, COLUMN 3: One secondhand navy cloth JACKET in good condition, long sleeves, collar and clearly intact working brown buttons, neatly folded.
ROW 3, COLUMN 4: A small pile of fresh vegetable PEEL strips, recognizable orange carrot ribbons and pale brown potato skin, no whole vegetables.
True transparent alpha background, no scenery, people, hands, cast background shadows, gradients, labels, readable text, numbers, logos, arrows, color-coded destination hints, UI, borders or watermark. Broken items are still-life recognition pictures only; no injury or action. Keep each item clearly separated inside its own cell.

### objects-04

Use case: stylized-concept. Asset type: production transparent 3-COLUMN 2-ROW atlas of 6 separate objects for LarriVerse Reuse Rally, a children's fictional sorting game. Detailed cinematic 3D animated-feature renderings with convincing real materials, recognizable complete shapes, neutral warm studio light, elevated front three-quarter view. Each equal square cell contains ONLY its assigned object, centered, entire silhouette inside with at least 12 percent transparent margins. EXACT row-major order:
ROW 1, COLUMN 1: One clean EMPTY rectangular ALUMINUM baking tray, silver crinkled foil walls, smooth rolled rim, no food.
ROW 1, COLUMN 2: Several loose broken reflective MIRROR shards contained on a shallow neutral gray display tray, no hands or blood.
ROW 1, COLUMN 3: One open wooden community donation CRATE, empty, two handle cutouts, warm natural wood, no writing or symbols.
ROW 2, COLUMN 1: One BLUE wheeled recycling collection BIN with closed hinged lid, no writing, symbols or objects inside.
ROW 2, COLUMN 2: One BROWN kitchen compost CADDY with handle and hinged lid slightly ajar, empty, no writing or symbols.
ROW 2, COLUMN 3: One GRAY household trash BIN with a closed fitted lid and handle, no writing, symbols or contents.
True transparent alpha background, no scenery, people, hands, cast background shadows, gradients, labels, readable text, numbers, logos, arrows, color-coded destination hints, UI, borders or watermark. Broken items are still-life recognition pictures only; no injury or action. Keep each item clearly separated inside its own cell.

### settings-01

Use case: stylized-concept. Asset type: production 2 by 2 atlas of FOUR equal wide environment paintings for LarriVerse Reuse Rally. Each panel cinematic detailed 3D animated-feature style, believable materials and perspective, natural warm daylight. Each has a large EMPTY clean wooden display table in the LOWER HALF, viewed from elevated front three-quarter angle, with an unobstructed surface for a separate object sprite. Background details stay mostly in upper third. TOP LEFT: welcoming community cleanup courtyard, reuse center building, flower planters, leafy trees and garden paths. TOP RIGHT: bright community kitchen with sage cabinets, a background sink and sunlight through windows. BOTTOM LEFT: community garden with raised beds and a potting shed in the distance. BOTTOM RIGHT: community repair workshop with tidy shelves and a broad open window. Four full-bleed landscape panels, edge to edge, no gutters, equal size, each works at 832 by 468. No objects on display tables, people, animals, tools, food, bins, trash, electrical equipment, writing, signs, labels, UI, logos, borders or watermark.

### settings-02

Use case: stylized-concept. Asset type: production 2 by 2 atlas FOUR equal wide environment paintings for LarriVerse Reuse Rally. Detailed cinematic 3D animated-feature style, warm natural daylight, convincing materials and depth. TOP LEFT: community library donation corner with distant shelves of plain unlettered book spines, sunny window, large EMPTY wooden display table across lower half for a separate object sprite. TOP RIGHT: leafy park picnic shelter, meadow and trees behind, large EMPTY wooden display table in lower half, elevated front three-quarter view. BOTTOM LEFT: welcoming community reuse center COURTYARD, leafy trees, flowers, friendly timber building in upper third, level EMPTY paved ground fills lower TWO THIRDS for a separate full-body character and cloth tote sprite; NO foreground table in this panel. BOTTOM RIGHT: quiet community donation hall with plain shelves along back wall and large EMPTY wooden display table across lower half. Each panel a full-bleed landscape, edge to edge, no gutters, same size, each works at 832 by 468. No people, animals, objects on tables, sorting bins, waste, food, tools, readable writing, letters, signs, labels, UI, logos, borders or watermark.

### helper

Use case: stylized-concept. Asset type: transparent TWO-POSE full-body community reuse helper sheet for LarriVerse Reuse Rally. One friendly adult woman with warm medium skin, dark hair in a low ponytail, expressive natural face, purple long-sleeved shirt, hunter-green canvas work apron, blue jeans and tan sensible shoes. Polished detailed cinematic 3D animated-feature look, believable hands and normal proportions. Wide sheet with TWO equal square cells side by side, true alpha transparency. LEFT: relaxed friendly standing pose, empty hands down. RIGHT: SAME character, camera, body center, scale, face size and feet baseline, small welcoming wave with right hand and natural five fingers. Complete head and shoes visible with generous transparent margins, feet at 86 percent cell height. No objects, bins, tools, bags, scenery, floor, background shadows, writing, labels, logos, frame or watermark.

