const localArt = name => new URL(`./art/${name}.webp`, import.meta.url).href;
const gardenArt = name => new URL(`../garden-grow-harvest/art/${name}.webp`, import.meta.url).href;
const background = name => new URL(`../../assets/world-motion/backgrounds/repair-${name}.webp`, import.meta.url).href;
const magnifier = new URL("../../assets/world-motion/objects/repair-cafe-magnifier.webp", import.meta.url).href;
const wateringCan = new URL("../../assets/world-motion/objects/garden-grow-watering-can.webp", import.meta.url).href;
const sharedObjects = new Map([
  ["basket", gardenArt("basket")],
  ["paint-brush", gardenArt("paint-brush")],
  ["plant-label", gardenArt("plant-label")],
  ["trellis", gardenArt("trellis")],
  ["watering-can", wateringCan]
]);
const objectArt = name => sharedObjects.get(name) || localArt(name);

// The object, setting, material and optional supply are matched to each authored repair.
const projects = new Map([
  ["Teddy has a dusty patch", ["teddy", "fabric", "Fabric & stitching", ["cloth", "cloth"]]],
  ["A notebook page is loose", ["notebook", "paper", "Paper & cardboard", ["repair-tape", "repair-tape"]]],
  ["The cardboard planter leans", ["planter", "garden", "Paper & cardboard", ["cardboard-support", "cardboard-support"]]],
  ["A board-game box corner is torn", ["game-box", "paper", "Paper & cardboard", ["repair-tape", "repair-tape"]]],
  ["A paperback cover is peeling", ["paperback", "paper", "Paper & cardboard", ["repair-tape", "repair-tape"]]],
  ["A lunch-bag zipper is catching", ["lunch-bag", "fabric", "Fabric & stitching"]],
  ["A puzzle box flap will not stay closed", ["game-box", "paper", "Paper & cardboard", ["cardboard-support", "cardboard-support"]]],
  ["A toy wagon wheel wobbles", ["wagon", "toys", "Wheels & fasteners"]],
  ["A pencil box hinge is loose", ["pencil-box", "toys", "Wood & metal"]],
  ["A cap brim is bent", ["cap", "fabric", "Fabric & stitching"]],
  ["A storage box lid is crushed", ["storage-box", "paper", "Paper & cardboard", ["cardboard-support", "cardboard-support"]]],
  ["A paper kite tail is coming loose", ["kite", "paper", "Paper & string", ["repair-tape", "repair-tape"]]],
  ["A basket handle wrap is slipping", ["basket", "toys", "Wood & fiber"]],
  ["A folder pocket is tearing", ["folder", "paper", "Paper & cardboard", ["repair-tape", "repair-tape"]]],
  ["A paintbrush handle label is peeling", ["paint-brush", "toys", "Wood & fiber", ["cloth", null]]],
  ["A cardboard ruler edge is fraying", ["ruler", "paper", "Paper & cardboard", [null, "repair-tape"]]],
  ["A costume mask strap came loose", ["mask", "fabric", "Fabric & elastic"]],
  ["A cloth pencil pouch seam is opening", ["pencil-pouch", "fabric", "Fabric & stitching"]],
  ["A cardboard model chair rocks", ["model-chair", "paper", "Paper & cardboard", ["cardboard-support", "cardboard-support"]]],
  ["A journal bookmark ribbon is loose", ["notebook", "paper", "Paper & ribbon"]],
  ["Kite string is tangled", ["kite", "paper", "Paper & string"]],
  ["Cap has a loose patch", ["cap", "fabric", "Fabric & stitching"]],
  ["Book's cover is lifting", ["paperback", "paper", "Paper & cardboard", ["repair-tape", "repair-tape"]]],
  ["Winter glove has a loose cuff", ["glove", "fabric", "Fabric & stitching"]],
  ["Stuffed animal's ribbon slips", ["teddy", "fabric", "Fabric & ribbon"]],
  ["Basket handle is wobbling", ["basket", "toys", "Wood & fiber"]],
  ["Plant label fell over", ["plant-label", "garden", "Garden supplies"]],
  ["Backpack strap is twisted", ["backpack", "fabric", "Fabric & buckles"]],
  ["Bucket sticker hides the label", ["bucket", "garden", "Container & label"]],
  ["Paper airplane wing bends", ["paper-plane", "paper", "Folded paper"]],
  ["Binder ring catches paper", ["binder", "paper", "Paper & metal"]],
  ["Puzzle-box lid is torn", ["game-box", "paper", "Paper & cardboard", ["repair-tape", "repair-tape"]]],
  ["Picture frame leans", ["picture-frame", "toys", "Frame & stand"]],
  ["Watering-can label fades", ["watering-can", "garden", "Container & label"]],
  ["Paintbrush bristles are bent", ["paint-brush", "toys", "Wood & fiber"]],
  ["Toy storage box loses its divider", ["storage-box", "toys", "Paper & cardboard", ["cardboard-support", "cardboard-support"]]],
  ["Yarn ball keeps unraveling", ["yarn", "fabric", "Yarn & fiber"]],
  ["Shoelace tip frays", ["shoelaces", "fabric", "Lace & tips"]],
  ["Sponge holder keeps tipping", ["sponge-holder", "toys", "Holder & drainage"]],
  ["Bookmark ribbon comes loose", ["notebook", "paper", "Paper & ribbon"]],
  ["Paper roll holder slips", ["paper-holder", "paper", "Paper & cardboard", ["cardboard-support", "cardboard-support"]]],
  ["Birdhouse sign peels off", ["birdhouse", "garden", "Wood & sign"]],
  ["Seed tray label mixes up", ["seed-tray", "garden", "Garden supplies", ["plant-label", "plant-label"]]],
  ["Recipe card has a food stain", ["recipe-card", "paper", "Paper & protective sleeve"]],
  ["Garden trellis tag loosens", ["trellis", "garden", "Wood & plant tag"]],
  ["Puppet costume seam opens", ["puppet", "fabric", "Fabric & stitching"]],
  ["Board-game box corner splits", ["game-box", "paper", "Paper & cardboard", ["repair-tape", "repair-tape"]]],
  ["Sand-toy handle comes loose", ["bucket", "toys", "Handle & container"]],
  ["Ball storage net tangles", ["ball-net", "toys", "Net & fiber"]],
  ["Reusable lunch bag seam opens", ["lunch-bag", "fabric", "Fabric & lining"]],
  ["Gift wrap ribbon snags", ["ribbon", "paper", "Ribbon & spool"]],
  ["Plant pot saucer wobbles", ["pot-saucer", "garden", "Pot & saucer"]],
  ["Wooden train label falls", ["wooden-train", "toys", "Wood & wheels"]],
  ["Cupcake tray divider bends", ["cupcake-tray", "paper", "Paper & cardboard", ["cardboard-support", "cardboard-support"]]],
  ["Library folder tab tears", ["folder", "paper", "Paper & cardboard", ["repair-tape", "repair-tape"]]],
  ["Pet-toy basket label fades", ["basket", "toys", "Basket & label"]],
  ["Pencil pouch zipper snags", ["pencil-pouch", "fabric", "Fabric & zipper"]],
  ["Model boat sail leans", ["model-boat", "toys", "Wood & paper", ["cardboard-support", "cardboard-support"]]],
  ["Flower press paper wrinkles", ["flower-press", "garden", "Wood & paper"]],
  ["Window decoration loses suction", ["window-flower", "toys", "Decoration & suction cup", [null, "cloth"]]]
]);

const phases = ["Inspect", "Choose", "Repair", "Test", "Checked"];
const escape = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

export function repairWorkshopScene(item, completedSteps = 0) {
  const project = projects.get(item.title);
  if (!project) return "";
  const [object, setting, material, supplies = []] = project;
  const tools = [magnifier, ...supplies.map(name => name && objectArt(name))];
  const tool = tools[completedSteps];
  return `<div class="repair-workshop-visual" data-repair-phase="${completedSteps}">
    <div class="repair-object-scene repair-workshop-scene" data-repair-object="${object}" data-repair-setting="${setting}"
      role="img" aria-label="Illustrated repair scene for ${escape(item.title)}">
      <img class="repair-workshop-background" src="${background(setting)}" width="832" height="468" alt="">
      <div class="repair-project-items" aria-hidden="true">
        <img class="repair-project-object" src="${objectArt(object)}" alt="">
        ${tool ? `<img class="repair-project-supply" src="${tool}" alt="">` : ""}
      </div>
    </div>
    <div class="repair-workshop-caption"><span>${material}</span><span>${phases[completedSteps]}</span></div>
  </div>`;
}
