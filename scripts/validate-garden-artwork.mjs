import assert from "node:assert/strict";
import { gardenGrowthChallenges } from "../assets/skill-worlds.js";
import { gardenChoiceSvg, gardenLessonSvg } from "../assets/arcade-scenes.js";

assert.equal(gardenGrowthChallenges.length, 60, "The 60 garden challenges must remain available");
const art = new Set();
const scene = new Set();
for (const challenge of gardenGrowthChallenges) {
  assert.equal(challenge.options.length, 3, challenge.id + " must retain 3 choices");
  assert.ok(challenge.answer >= 0 && challenge.answer < 3, challenge.id + " answer must remain valid");
  scene.add(challenge.scene);
  const output = gardenLessonSvg(challenge.scene);
  assert.match(output, /<svg[^>]+role="img"/, "Scene needs an accessible image label");
  assert.ok(output.includes("gardenBed") === false || output.includes("path"), "Scene should have SVG geometry");
  assert.ok((output.match(/<path /g) || []).length >= 5, challenge.id + " needs illustrated geometry");
  assert.ok(!output.includes("undefined") && !output.includes("NaN"), challenge.id + " should render clean SVG");
  for (const option of challenge.options) {
    art.add(option.art);
    const picture = gardenChoiceSvg(option.art);
    assert.match(picture, /aria-hidden="true"/, "Text label should be the accessible answer");
    assert.match(picture, /viewBox="0 0 120 108"/);
    assert.ok(picture.includes("<path ") || picture.includes("<ellipse ") || picture.includes("<circle "),
      option.art + " needs rendered artwork");
    assert.ok(!picture.includes("undefined") && !picture.includes("NaN"),
      option.art + " should render clean SVG");
  }
}
for (const visual of ["raised-bed","watering-can","ripe-tomato","carrot-harvest","lettuce-harvest","berry-storage"]) {
  assert.ok(art.has(visual) || scene.has(visual), visual + " must have a garden illustration");
}
const bed = gardenChoiceSvg("raised-bed");
const can = gardenChoiceSvg("watering-can");
assert.notEqual(bed, can, "Wooden garden bed and metal watering can must differ");
assert.match(bed, /#f4cc8c/, "Wooden planter must have a highlighted rim");
assert.match(can, /#95eced/, "Watering can must retain its shiny metal surface");
console.log("Garden artwork validation passed: " + gardenGrowthChallenges.length +
  " challenges; " + scene.size + " scene types; " + art.size + " answer illustrations.");
