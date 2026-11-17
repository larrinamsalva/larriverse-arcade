import { gardenChoiceSvg } from "../../assets/arcade-scenes.js";

const artwork = name => new URL(`./art/${name}.webp`, import.meta.url).href;
const background = name => new URL(`../../assets/world-motion/backgrounds/garden-${name}.webp`, import.meta.url).href;
const wateringCan = new URL("../../assets/world-motion/objects/garden-grow-watering-can.webp", import.meta.url).href;

// Each authored scene keeps its own object and action within the four garden settings.
const lessons = new Map([
  ["sunny-bed", ["planting", "raised-bed", "tomato-plant", "still"]],
  ["rake", ["planting", "rake", "raised-bed", "tool"]],
  ["raised-bed", ["planting", "raised-bed", "rake", "still"]],
  ["compost", ["planting", "compost", "rake", "still"]],
  ["garden-path", ["planting", "raised-bed", null, "still"]],
  ["plant-label", ["potting", "plant-label", "seed-packet", "still"]],
  ["seed-depth", ["potting", "seed-packet", "seedlings", "still"]],
  ["spacing", ["potting", "seedlings", "seed-packet", "plant"]],
  ["carrot-row", ["growing", "carrot-row", null, "plant"]],
  ["tomato-transplant", ["potting", "tomato-transplant", "seed-packet", "plant"]],
  ["trellis", ["growing", "trellis", "tomato-plant", "still"]],
  ["watering-can", ["growing", "watering-can", "seedlings", "water"]],
  ["soil-test", ["growing", "seedlings", "watering-can", "plant"]],
  ["root-watering", ["growing", "watering-can", "tomato-plant", "water"]],
  ["weed-check", ["growing", "carrot-row", null, "plant"]],
  ["mulch", ["growing", "mulch", "tomato-plant", "still"]],
  ["tomato-support", ["growing", "tomato-plant", "trellis", "plant"]],
  ["leaf-check", ["growing", "tomato-plant", null, "plant"]],
  ["ripe-tomato", ["growing", "tomato-plant", "tomato", "plant"]],
  ["carrot-harvest", ["kitchen", "carrots", "basket", "still"]],
  ["lettuce-harvest", ["kitchen", "lettuce", "basket", "still"]],
  ["clean-basket", ["kitchen", "basket", "harvest-crate", "still"]],
  ["berry-storage", ["kitchen", "berries", null, "still"]],
  ["cut-tomato", ["kitchen", "cut-tomato", null, "still"]]
]);

// Diagram overlays continue to show the differences between the answer pictures.
const choiceObjects = new Map([
  ["sunny-bed", "raised-bed"],
  ["shade-bed", "raised-bed"],
  ["raised-bed", "raised-bed"],
  ["rake", "rake"],
  ["paint-brush", "paint-brush"],
  ["fork", "fork"],
  ["compost", "compost"],
  ["plastic-trash", "plastic-trash"],
  ["salt", "salt"],
  ["plant-label", "plant-label"],
  ["rock", "rock"],
  ["toy", "toy"],
  ["trellis", "trellis"],
  ["box", "box"],
  ["watering-can", "watering-can"],
  ["mulch", "mulch"],
  ["ripe-tomato", "tomato"],
  ["moldy-fruit", "tomato"],
  ["carrot-harvest", "carrots"],
  ["rotten-carrot", "carrots"],
  ["lettuce-harvest", "lettuce"],
  ["clean-basket", "basket"],
  ["berry-storage", "berries"],
  ["cut-tomato", "cut-tomato"]
]);

const objectImage = name => name === "watering-can" ? wateringCan : artwork(name);

export function gardenSeasonScene(item) {
  const lesson = lessons.get(item.scene);
  if (!lesson) return "";
  const [setting, primary, secondary, movement] = lesson;
  return `<div class="learning-scene-art garden-learning-art garden-season-scene"
    data-garden-setting="${setting}" data-garden-lesson="${item.scene}"
    role="img" aria-label="Illustrated garden lesson about ${item.scene.replaceAll("-", " ")}">
    <img class="garden-season-background" src="${background(setting)}" width="832" height="468" alt="">
    <div class="garden-season-objects" aria-hidden="true">
      <img class="garden-season-primary garden-season-${movement}" src="${objectImage(primary)}" alt="">
      ${secondary ? `<img class="garden-season-secondary" src="${objectImage(secondary)}" alt="">` : ""}
    </div>
  </div>`;
}

export function gardenSeasonChoice(kind) {
  const object = choiceObjects.get(kind);
  return gardenChoiceSvg(kind, object ? objectImage(object) : undefined);
}
