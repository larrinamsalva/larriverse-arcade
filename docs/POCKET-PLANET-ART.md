# Pocket Planet artwork and motion

All 60 grow, build and food projects now have finished-project pictures. All 236 authored supply names have explicit picture mappings, including useful supplies and decoys. The same supply picture is shown on the selection card and workbench. Names, selection state, project goals and making instructions remain native text.

The illustrations distinguish objects that previously shared an emoji: a water bottle, glue, milk, hummus, dry beans, whole fruit, cut fruit, food ingredients and craft materials each use the named object. Aliases share art only for the same kind of object. All mappings are reviewable in `games/pocket-planet/project-pictures.js`.

The new art uses 181 local WebP files (about 3.44 MiB), including 176 object/result pictures, four 832 × 468 settings and a 640 × 320 two-pose maker. Thirty-five existing original pictures are reused by reference from completed worlds. Individual object pictures are 256 × 256; only the current project's pictures load. The pinwheel in `assets/world-motion/objects/planet-pinwheel.webp` also serves its project result. Other new objects are in `games/pocket-planet/art/`.

Growing projects use a community garden, building projects a maker workshop, and food projects a community kitchen. A separate open courtyard grounds the maker and pinwheel in the introduction.

## Interaction and learning information

Adding a supply briefly animates only the newly selected object. Correct making steps give the goal picture a brief response, and completing a project shows its finished creation. Site and device reduced-motion preferences stop these effects while keeping the pictures fully visible. The pinwheel sways in the shared introduction.

Keyboard focus stays on a supply after its card rerenders. Starting the making phase focuses an available step, and completed steps move focus to an available action. The original three-supply limit, wrong-supply and step-order feedback, authored steps, six chapters, checkpoint format, completion reward and confirmed replay continue to work.

The bridge planning project combines the paper photograph with a small native SVG bridge sketch. Measurements and lesson instructions remain native; the generated art supplies no numerical measurement data. Existing adult-help, food preparation and allergy wording is retained.

Phone layouts let supply cards, project copy and workbench items reflow. Dark mode and high contrast retain the text labels; the focused checks verify the high-contrast project copy reaches 7:1 contrast.

## Verification

Focused desktop and phone coverage checks keyboard selection, deselection and retained focus; full-kit and wrong-supply recovery; matching workbench pictures; actual selection and making movement; both reduced-motion preferences; completion checkpoint; contrast modes; and 320 pixels with 200% text.

The short selection and making reactions are checked by sampling their rendered transforms at fixed points in the actual CSS animation, then restoring the animation's original time and playback state. The making check waits for natural completion before sampling, covering a runner that observes the brief reaction late. Reduced motion must still remove the animation and leave the picture visible. This avoids relying on a difference between two adjacent browser frames.

The campaign checks complete every one of the 60 projects, decode pictures for all 236 supply names and 60 goals, verify all three project settings, check saved chapters and replay, and reload partway through the journey. Existing shared-scene and four-world surface checks remain relevant to this world.

## Original prompts

Generated with the built-in image generation tool. Production files use atlas cropping, transparent padding, resizing and WebP encoding only. The generated alpha is preserved. The normalized oats cell is cropped to (0, 0, 246, 256), and the smoothie cell to (0, 0, 256, 241), then padded transparently back to 256 pixels to exclude stray atlas-edge fragments. Reused images remain in their original locations. The following atlas key order is also the crop order: four columns by three rows, row first.

### settings

Use case: stylized-concept. Asset type: production 2 by 2 background atlas for LarriVerse Pocket Planet, a children's grow/build/food project game. FOUR equal wide landscape panels, edge to edge without gutters or borders. Beautiful detailed cinematic 3D animated-feature environments, believable materials, natural daylight, welcoming coherent spaces. TOP LEFT GROW: community vegetable garden with raised timber beds, a sunny potting shed and an EMPTY waist-height potting bench, leafy plants and flowers. TOP RIGHT BUILD: a bright welcoming craft workshop with timber shelving, clean storage cubbies, an EMPTY wooden workbench, afternoon light through windows. BOTTOM LEFT EAT: a clean friendly community kitchen with pale sage cabinetry, an EMPTY food-preparation table, a sink in the background, soft morning daylight. BOTTOM RIGHT WELCOME: a broad level garden courtyard path filling the lower TWO THIRDS, a little community makerspace building and flower planters along the upper third, clear ground for a separate full-body helper and pinwheel sprite. Keep all important items away from panel edges. No people, animals, food, supplies on tables, exposed knives, power tools, flames, text, letters, signs, labels, UI, logos, borders or watermark. Each panel should work at 832 by 468 pixels.

### maker

Use case: stylized-concept. Asset type: transparent two-pose full-body community maker character sheet for LarriVerse Pocket Planet. One wide image with TWO equal square cells side by side. The SAME friendly adult woman in both: warm medium brown skin, kind natural face, short curly dark hair, purple plaid long-sleeve shirt, hunter-green work apron, blue jeans, sensible brown boots. LEFT: standing with a relaxed welcoming smile, hands comfortably at her sides. RIGHT: same body center, scale, head size, stance and feet baseline, right hand giving a gentle open-palm welcoming gesture, natural five fingers. Empty hands. Realistic normal proportions and detailed cinematic 3D animated-feature rendering, fabric seams and apron pockets, warm neutral light. Complete head and shoes inside each square with generous transparent margins, feet aligned near 86 percent height. Keep torso and head at the same position within each cell for stable animation. True transparent alpha, no checkerboard, no colored haze or background shadow. No objects, tools, food, hats, scenery, floor, text, letters, logo, frame, watermark or stretched face.

### atlas-01

Objects: `seed-packets`, `empty-pot`, `wide-planter`, `soil-bag`, `soil-jar`, `dry-beans`, `strawberry-plant`, `food-scraps`, `dry-leaves`, `compost-bin`, `clear-jar`, `paper-towel`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: Two plain tan seed packets, one open showing a few tiny dark seeds, a simple green leaf illustration on the front, no variety label or lettering.
ROW 1, COLUMN 2: One EMPTY terracotta plant pot with a visible drainage opening and simple saucer, no soil or plant.
ROW 1, COLUMN 3: An EMPTY low wide rectangular terracotta planter, no plant or soil.
ROW 1, COLUMN 4: A plain open bag filled with dark potting soil, no lettering.
ROW 2, COLUMN 1: A clear glass jar partly filled with dark soil, no lid.
ROW 2, COLUMN 2: A small open dish of DRY raw bean seeds, cream and brown mottled beans, no sauce.
ROW 2, COLUMN 3: A small rooted strawberry plant with green leaves and two visible red strawberries, soil root ball below.
ROW 2, COLUMN 4: A small loose pile of apple peel, vegetable ends and banana peel, plant food scraps only.
ROW 3, COLUMN 1: A little pile of dry brown autumn leaves, recognizable leaf shapes.
ROW 3, COLUMN 2: A small green compost bin with partly open hinged lid and plant scraps inside, no text.
ROW 3, COLUMN 3: An EMPTY clear glass jar with smooth open rim, no lid, no liquid.
ROW 3, COLUMN 4: A folded slightly damp white paper towel, visible paper texture, no roll.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-02

Objects: `fertilizer`, `onion-bases`, `two-soil-pots`, `water-bottle`, `clear-bottle`, `three-cups`, `sorting-tray`, `water-basin`, `planks`, `beams`, `bridge-base`, `roof-piece`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A plain small resealable garden fertilizer pouch and a few pale round fertilizer granules beside it, tiny leaf symbol only, no text.
ROW 1, COLUMN 2: Three cut green onion bases with short green shoots and visible white roots, no soil.
ROW 1, COLUMN 3: Exactly TWO matching small terracotta pots filled with soil, one soil surface partly covered with dry leaf mulch.
ROW 1, COLUMN 4: A clear reusable bottle containing clean water with a blue lid, no writing.
ROW 2, COLUMN 1: An EMPTY smooth clear plastic bottle without a label, no cap.
ROW 2, COLUMN 2: Exactly THREE separate small plain cream cups, arranged as one grouped supply.
ROW 2, COLUMN 3: An EMPTY shallow rectangular wooden sorting tray with three separate compartments.
ROW 2, COLUMN 4: An oval shallow blue plastic basin containing a little clear water, no other objects.
ROW 3, COLUMN 1: A small stack of three short rectangular timber planks, visible wood grain.
ROW 3, COLUMN 2: Two sturdy rectangular wooden support beams crossed neatly, toy-model scale.
ROW 3, COLUMN 3: Two short rectangular wooden riverbank bases separated by a small gap, an unassembled model base only.
ROW 3, COLUMN 4: A separate small plain wooden pitched roof piece for a birdhouse, no walls.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-03

Objects: `fasteners`, `soft-mat`, `wheels`, `axles`, `car-chassis`, `hollow-stems`, `wood-frame`, `kite-frame`, `string`, `paper-blades`, `paper-fastener`, `sticks`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A small grouped set of metal screws, washers and nuts, clearly recognizable fasteners.
ROW 1, COLUMN 2: One folded soft colorful foam floor mat with simple interlocking edges.
ROW 1, COLUMN 3: Exactly FOUR small black toy wheels grouped together, no vehicle.
ROW 1, COLUMN 4: Two short smooth metal toy-car axle rods, no wheels.
ROW 2, COLUMN 1: A simple rectangular wooden toy-car chassis with holes for axles, no wheels.
ROW 2, COLUMN 2: A bundle of short hollow bamboo-like plant stems with visible open ends.
ROW 2, COLUMN 3: A small EMPTY rectangular wooden frame with open center.
ROW 2, COLUMN 4: A bare cross-shaped lightweight wooden kite frame, no paper sail.
ROW 3, COLUMN 1: A little coil of natural cotton string with one loose end.
ROW 3, COLUMN 2: Four bright folded paper pinwheel blades grouped together, unassembled, no stick.
ROW 3, COLUMN 3: Three blunt brass split-pin paper fasteners arranged neatly, no sharp exposed points.
ROW 3, COLUMN 4: A small group of plain straight wooden craft sticks and one thin garden stake.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-04

Objects: `corks`, `light-platform`, `brick`, `sandbag`, `foil`, `cardboard-circle`, `cardboard-tubes`, `blocks`, `toy-wheelchair`, `paper`, `poster`, `calendar`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A group of four short light brown cork floats, recognizable cork texture.
ROW 1, COLUMN 2: A small thin flat rectangular balsa-wood raft platform, no other parts.
ROW 1, COLUMN 3: One heavy red rectangular clay brick with small holes.
ROW 1, COLUMN 4: A tied tan fabric sandbag, squat and heavy-looking.
ROW 2, COLUMN 1: A shiny rectangular aluminum foil sheet with slightly crinkled edges.
ROW 2, COLUMN 2: A flat plain round cardboard disc, no markings.
ROW 2, COLUMN 3: Two EMPTY clean cardboard tubes of different heights.
ROW 2, COLUMN 4: A small group of colorful square wooden toy blocks.
ROW 3, COLUMN 1: A small model wheelchair for a toy doll, visible two large wheels, smaller front casters and blue seat, no person.
ROW 3, COLUMN 2: A short stack of clean blank paper sheets, one square sheet on top, no writing.
ROW 3, COLUMN 3: One rolled and partly unrolled blank cream poster sheet, no text.
ROW 3, COLUMN 4: A plain paper calendar with blank square spaces and a small hanging loop, no dates or writing.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-05

Objects: `grid-paper`, `garden-map`, `flower-guide`, `bird-guide`, `comic-book`, `pencil`, `colored-pencils`, `markers`, `crayons`, `paint`, `glue`, `glue-stick`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A sheet of pale graph paper with a faint square grid, no drawings, text or numbers.
ROW 1, COLUMN 2: A folded cream planning paper with very faint simple garden-bed shapes, an illustrative unfinished sketch with no route, words or measurements.
ROW 1, COLUMN 3: A closed small guidebook with a simple flower photograph on its cover, no lettering.
ROW 1, COLUMN 4: A closed small guidebook with a recognizable bird photograph on the cover, no lettering.
ROW 2, COLUMN 1: A colorful comic book with a simple friendly fictional animal illustration on its cover, no letters.
ROW 2, COLUMN 2: One plain yellow wooden pencil with pink eraser.
ROW 2, COLUMN 3: A small neat fan of colored pencils with visible colored tips.
ROW 2, COLUMN 4: Four capped bright art markers arranged neatly, no writing on barrels.
ROW 3, COLUMN 1: A small box of colorful wax crayons, no lettering.
ROW 3, COLUMN 2: A small watercolor paint set with six bright paint wells, no lettering.
ROW 3, COLUMN 3: A clearly recognizable white craft glue squeeze bottle with orange pointed cap, no text, no food styling.
ROW 3, COLUMN 4: One plain purple and white capped craft glue stick, no writing.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-06

Objects: `stickers`, `glitter`, `ribbon-bow`, `envelopes`, `ruler`, `toy-car`, `toy-truck`, `sunglasses`, `balloon`, `toy-drum`, `toy-rocket`, `pillow`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A small sheet of bright colorful star-shaped stickers, no lettering.
ROW 1, COLUMN 2: A small clear jar filled with sparkly craft glitter, no label.
ROW 1, COLUMN 3: A red satin ribbon tied into a bow.
ROW 1, COLUMN 4: Three plain cream envelopes, one with open flap, no writing.
ROW 2, COLUMN 1: A simple blue plastic ruler with small tick marks but NO numbers, no exact scale claims.
ROW 2, COLUMN 2: A small bright red toy racing car with chunky wheels and toy proportions, no branding.
ROW 2, COLUMN 3: A small yellow toy dump truck with chunky wheels and toy proportions.
ROW 2, COLUMN 4: A complete pair of simple dark sunglasses with blue frame.
ROW 3, COLUMN 1: One red inflated balloon with tied end and curling white string.
ROW 3, COLUMN 2: A little red toy drum with two blunt wooden drumsticks.
ROW 3, COLUMN 3: A small colorful toy rocket with rounded nose and tiny fins, no lettering.
ROW 3, COLUMN 4: A soft square blue pillow.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-07

Objects: `flashlight`, `playing-cards`, `toy-dinosaur`, `skateboard`, `toy-boat`, `party-hat`, `soccer-ball`, `toy-guitar`, `marbles`, `bottle-caps`, `battery`, `plastic-bag`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A simple yellow hand flashlight, dark lens housing and handle.
ROW 1, COLUMN 2: A small fan of playing cards with colorful geometric backs, no printed faces or numbers.
ROW 1, COLUMN 3: A small friendly green plastic toy dinosaur with visible molded toy joints, not a real animal.
ROW 1, COLUMN 4: A small complete skateboard with wooden deck and four wheels.
ROW 2, COLUMN 1: A simple little blue plastic toy sailboat, obviously a toy.
ROW 2, COLUMN 2: A bright cone-shaped paper party hat with a pompom, no lettering.
ROW 2, COLUMN 3: A black-and-white soccer ball.
ROW 2, COLUMN 4: A small colorful toy guitar with strings and rounded body, no brand.
ROW 3, COLUMN 1: A small group of five colorful glass toy marbles.
ROW 3, COLUMN 2: A little pile of clean colored plastic bottle caps.
ROW 3, COLUMN 3: Two ordinary AA batteries, metal terminals visible, plain neutral wrapper with no lettering.
ROW 3, COLUMN 4: An EMPTY translucent shopping bag with handles, no logo.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-08

Objects: `game-controller`, `remote-control`, `toy-telescope`, `football`, `blanket`, `beach-towel`, `glass-cup`, `glass-beads`, `toy-coins`, `soap`, `toothbrush`, `sponge`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A simple blue video game controller with thumbsticks and colored buttons, no logos.
ROW 1, COLUMN 2: A plain television remote with small buttons, no writing.
ROW 1, COLUMN 3: A small blue toy telescope on a short stand, obviously a toy.
ROW 1, COLUMN 4: One brown oval American football with white stitching.
ROW 2, COLUMN 1: A folded soft plaid blanket.
ROW 2, COLUMN 2: A rolled striped beach towel with a loose corner.
ROW 2, COLUMN 3: Two EMPTY clear drinking glasses.
ROW 2, COLUMN 4: A small loop of bright craft beads with holes, not food.
ROW 3, COLUMN 1: A small group of bright plastic pretend coins with stars and no numbers.
ROW 3, COLUMN 2: A clean pale rectangular bar of soap with a few bubbles, no writing.
ROW 3, COLUMN 3: A blue toothbrush with clearly visible bristles.
ROW 3, COLUMN 4: One soft rectangular yellow bath sponge with rounded corners.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-09

Objects: `whole-apple`, `banana`, `cucumber`, `shredded-lettuce`, `carrot-ribbons`, `bread`, `toast`, `crackers`, `yogurt`, `oats`, `tortilla`, `milk`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A whole fresh red apple, tiny stem and leaf, no cuts.
ROW 1, COLUMN 2: One whole ripe yellow banana without peeled skin.
ROW 1, COLUMN 3: A whole green cucumber beside one cut round showing the pale seeded center.
ROW 1, COLUMN 4: A small cream bowl of finely shredded fresh green lettuce.
ROW 2, COLUMN 1: Thin curled orange carrot ribbons on a small cream plate, clearly thin peel-like ribbons.
ROW 2, COLUMN 2: Two plain slices of whole-grain bread, no toppings.
ROW 2, COLUMN 3: A single slice of prepared golden toast on a cream plate, no toppings.
ROW 2, COLUMN 4: A few whole-grain square crackers on a small cream plate.
ROW 3, COLUMN 1: A small plain cream bowl of thick smooth white yogurt, no fruit or toppings.
ROW 3, COLUMN 2: A little cream bowl of dry ready-to-eat rolled oat flakes.
ROW 3, COLUMN 3: A single flat soft flour tortilla on a cream plate, unfilled.
ROW 3, COLUMN 4: A plain clear glass of milk beside an unmarked white carton, no lettering.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-10

Objects: `dried-fruit`, `cereal`, `pumpkin-seeds`, `cinnamon`, `cherry-tomatoes`, `blueberries`, `granola`, `hummus`, `peach-slices`, `cottage-cheese`, `spoon`, `spread`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A small cream bowl containing raisins and a few pieces of dried apricot.
ROW 1, COLUMN 2: A small cream bowl of plain whole-grain ring cereal, no milk.
ROW 1, COLUMN 3: A small cream dish of green shelled pumpkin seeds, no pumpkin.
ROW 1, COLUMN 4: A tiny cream bowl of cinnamon powder with two cinnamon sticks beside it.
ROW 2, COLUMN 1: Several small ripe red cherry tomatoes on a cream plate.
ROW 2, COLUMN 2: A small cream bowl of blueberries ONLY, no other berries.
ROW 2, COLUMN 3: A small cream bowl of ready-to-eat golden oat granola clusters.
ROW 2, COLUMN 4: A small cream bowl of smooth beige hummus with a shallow swirl, no writing.
ROW 3, COLUMN 1: Fresh peach slices with pale yellow flesh and pink skin on a cream plate.
ROW 3, COLUMN 2: A small cream bowl of clearly curd-textured white cottage cheese, no fruit.
ROW 3, COLUMN 3: A clean metal spoon, whole and unobstructed.
ROW 3, COLUMN 4: A plain small glass jar of smooth tan food spread with a butter knife beside it, no nuts, peanuts, labels or allergy claims.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-11

Objects: `pepper-pieces`, `cheese-cubes`, `cut-grapes`, `bowl`, `cup`, `plate`, `lunch-box`, `paper-straw`, `raw-egg`, `ice-cream`, `candy`, `candy-wrapper`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A small cream plate of chopped red, orange and green bell pepper pieces.
ROW 1, COLUMN 2: A small cream plate of neatly cut pale yellow cheese cubes.
ROW 1, COLUMN 3: A small cream plate of grapes cut lengthwise into quarters, visibly cut fruit and pale interiors, no whole grapes.
ROW 1, COLUMN 4: One EMPTY clean cream serving bowl.
ROW 2, COLUMN 1: One EMPTY clean plain cream snack cup.
ROW 2, COLUMN 2: One EMPTY clean flat cream serving plate.
ROW 2, COLUMN 3: An open EMPTY blue lunch box with three divided food compartments, no writing.
ROW 2, COLUMN 4: One striped paper drinking straw.
ROW 3, COLUMN 1: One intact raw egg in its shell, no cooked egg.
ROW 3, COLUMN 2: A small cone containing one pale vanilla ice cream scoop.
ROW 3, COLUMN 3: A few bright wrapped candies, no lettering.
ROW 3, COLUMN 4: One EMPTY crumpled candy wrapper, no candy and no writing.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-12

Objects: `marshmallows`, `teacup`, `fruit-bowl`, `herb-result`, `bean-result`, `strawberry-result`, `lettuce-result`, `sprout-jar-result`, `bridge-result`, `fort-result`, `toy-car-result`, `bug-hotel-result`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: Three soft white marshmallows.
ROW 1, COLUMN 2: A small empty teacup and saucer.
ROW 1, COLUMN 3: A clean cream bowl containing fresh apple pieces, banana slices and berries.
ROW 1, COLUMN 4: A terracotta pot containing fresh green basil-like kitchen herbs, no writing.
ROW 2, COLUMN 1: A small planted patch of bean vines climbing a simple three-stick teepee support, entire miniature visible.
ROW 2, COLUMN 2: A wide terracotta tub containing strawberry plants, green leaves and red strawberries.
ROW 2, COLUMN 3: A tiny rectangular timber garden bed growing several small lettuce heads, entire miniature bed.
ROW 2, COLUMN 4: An open clear observation jar with visible dry bean seeds against a damp paper towel and small green sprouts, no food styling.
ROW 3, COLUMN 1: A small complete sturdy wooden model bridge with visible supports, two riverbank bases and a plank deck.
ROW 3, COLUMN 2: A small play fort built from three clean cardboard boxes on a soft blue mat, no child.
ROW 3, COLUMN 3: A handmade wooden toy car with a simple wooden chassis, two metal axle rods and exactly four black wheels, no paint or branding.
ROW 3, COLUMN 4: A small wooden insect hotel model containing many short hollow stems under a simple pitched rain roof.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-13

Objects: `pinwheel`, `raft-result`, `reused-planter-result`, `picnic-result`, `salad-result`, `parfait-result`, `smoothie-result`, `hike-snack-result`, `apple-crunch-result`, `rainbow-result`, `flower-pot-result`, `onion-result`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: A complete colorful paper pinwheel on a slender cardboard stick, viewed from the front, whole spinner and handle visible.
ROW 1, COLUMN 2: A tiny model raft made of four cork floats tied below a light flat wooden platform, no sail.
ROW 1, COLUMN 3: A reused clean blue plastic bucket with its handle, filled with soil and a small green plant, same plain blue bucket as a classroom supply.
ROW 1, COLUMN 4: A cream picnic snack plate with carrot sticks, apple slices and whole-grain crackers.
ROW 2, COLUMN 1: A cream salad bowl of fresh leafy greens, cucumber rounds and sliced tomatoes.
ROW 2, COLUMN 2: A clear serving cup of layered white yogurt, berries and golden oats, chilled no condensation haze.
ROW 2, COLUMN 3: A clear tumbler filled with pale purple berry smoothie, no brand or decoration.
ROW 2, COLUMN 4: A small open food container of dried fruit, whole-grain cereal and green pumpkin seeds, no nuts.
ROW 3, COLUMN 1: A cream plate of fresh apple slices beside a tiny bowl of yogurt dip and a little cinnamon dust.
ROW 3, COLUMN 2: A cream plate with red strawberries, orange carrot sticks and green cucumber rounds arranged neatly by color.
ROW 3, COLUMN 3: A terracotta flower pot with bright native-style flowers and leafy stems, no insects.
ROW 3, COLUMN 4: A shallow clean cup with three rooted green onion bases visibly sprouting fresh green shoots in a little water.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-14

Objects: `compost-jar-result`, `rain-gauge-result`, `seed-sort-result`, `desk-organizer-result`, `bird-silhouette-result`, `shadow-clock-result`, `kindness-cards-result`, `reading-sign-result`, `foil-boat-result`, `color-wheel-result`, `cucumber-cup-result`, `apple-oat-result`.

Use case: stylized-concept. Asset type: a production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet, a children's grow/build/food project game. Cinematic detailed 3D animated-feature rendering, recognizable real materials and complete objects, warm neutral light, elevated front three-quarter view. All twelve cells equal sized, arranged in EXACT row-major order. Each item centered and fully inside its own cell with at least 12 percent transparent margins, no overlaps or clipping. Consistent miniature product scale, true transparent alpha background, no checkerboard, color haze, ground plane or cast background shadows. The cells must contain these objects in this EXACT order:
ROW 1, COLUMN 1: An OPEN clear glass observation jar with alternating dark soil and dry brown leaf layers, no lid, no label.
ROW 1, COLUMN 2: A smooth-edged clear rain collection bottle with a little water and pebbles for stability, a simple ruler beside it with ticks and NO numbers, no precise measurement claim.
ROW 1, COLUMN 3: A shallow wooden tray holding exactly three small cups with sorted dry bean seeds of different pale colors.
ROW 1, COLUMN 4: A tidy desk organizer made from clean cardboard tubes and a cardboard base, holding pencils.
ROW 2, COLUMN 1: A flat colored-paper bird silhouette cutout beside a small blank card, clearly a classroom paper craft.
ROW 2, COLUMN 2: A simple classroom shadow-clock model made from a flat round cardboard base and one upright wooden stick, a soft visible shadow, NO dial numbers or time claims.
ROW 2, COLUMN 3: Three handmade colorful greeting cards with simple hearts and flowers, cream envelopes beside them, no letters or words.
ROW 2, COLUMN 4: A blank cream reading-corner sign on reused poster board with a small book illustration, no letters, no writing.
ROW 3, COLUMN 1: A miniature shallow aluminum foil boat floating in a small shallow blue basin, a few dry beans inside, entire basin visible.
ROW 3, COLUMN 2: A flat cardboard color wheel spinner divided into equal bright colored sections with a blunt central brass fastener, no letters, no labels.
ROW 3, COLUMN 3: A clear snack cup of plain white yogurt with safely prepared green cucumber pieces on top.
ROW 3, COLUMN 4: A clear snack cup layered with white yogurt, ready-to-eat oat flakes and fresh apple pieces.
No people, hands, extra props, writing, legible text, letters, brand logos, watermarks, borders or gutters. Plates, bowls and containers are plain cream unless specified. Food must look edible and craft supplies unmistakably separate from food. Keep each whole silhouette inside its assigned cell.

### atlas-15

Objects: `hummus-plate-result`, `peach-cheese-result`, `toast-face-result`, `rainbow-veg-result`, `lunch-box-result`, `soap-flakes`, `bouncy-ball`, `pencil-marks`.

Use case: stylized-concept. Asset type: production transparent 4-COLUMN 3-ROW atlas of TWELVE separate props for LarriVerse Pocket Planet. Beautiful detailed cinematic 3D animated-feature products, warm neutral light, elevated front three-quarter view. Twelve EQUAL square cells, exact row-major order, each whole object centered with generous transparent margins and no clipping or overlap. True transparent alpha, no checkerboard, haze, background shadows, text, brands, labels or watermarks.
ROW 1, COLUMN 1: A cream plate of prepared carrot sticks beside a small portion of beige hummus.
ROW 1, COLUMN 2: A cream serving bowl of curd-textured white cottage cheese topped with prepared peach slices.
ROW 1, COLUMN 3: A single prepared toast slice with smooth tan spread and banana slices arranged into a simple friendly smiling face, no nuts.
ROW 1, COLUMN 4: A clean flat cream plate with prepared red, orange and green bell pepper pieces and cherry tomato pieces arranged in a rainbow pattern, NO skewers.
ROW 2, COLUMN 1: An open blue lunch box with safely quartered grape pieces in one compartment and yellow cheese cubes in another.
ROW 2, COLUMN 2: An unmarked translucent paper packet spilling thin white soap flakes beside a small rectangular bar of soap, NO food bowl.
ROW 2, COLUMN 3: A small solid blue rubber bouncy ball with a faint realistic molded seam, NO beach-ball stripes.
ROW 2, COLUMN 4: A small cream cardboard square with a few simple graphite pencil marks and a short yellow pencil beside it, no words or numbers.
ROW 3, COLUMN 1: EMPTY fully transparent cell.
ROW 3, COLUMN 2: EMPTY fully transparent cell.
ROW 3, COLUMN 3: EMPTY fully transparent cell.
ROW 3, COLUMN 4: EMPTY fully transparent cell.
Plates and bowls are plain cream unless specified. Keep food and craft supplies clearly distinct, with all complete silhouettes inside their cells.

