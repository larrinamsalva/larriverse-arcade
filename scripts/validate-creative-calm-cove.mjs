import assert from "node:assert/strict";
import fs from "node:fs";
import { CREATIVE_CHAPTERS, CREATIVE_PROMPTS } from "../games/creative-calm-cove/prompts.js";

assert.equal(CREATIVE_CHAPTERS.length, 8, "Creative Calm Cove has eight creative chapters");
assert.equal(CREATIVE_PROMPTS.length, 80, "Creative Calm Cove has eighty optional creative cards");
assert.equal(new Set(CREATIVE_PROMPTS.map((x) => x.id)).size, 80, "Creative card ids are unique");
assert.equal(new Set(CREATIVE_PROMPTS.map((x) => x.prompt)).size, 80, "Creative prompts are unique");

for (const [i, prompt] of CREATIVE_PROMPTS.entries()) {
  assert.equal(prompt.id, i + 1);
  assert.equal(prompt.chapter, Math.floor(i / 10));
  assert.ok(prompt.prompt.length >= 35, "Creative prompts are substantive");
}
assert.ok(CREATIVE_CHAPTERS.every((chapter, i) =>
  chapter.prompts.length === 10 &&
  chapter.id &&
  chapter.name &&
  chapter.icon &&
  CREATIVE_PROMPTS.filter((prompt) => prompt.chapter === i).length === 10
));

const html = fs.readFileSync("games/creative-calm-cove/index.html", "utf8");
const engine = fs.readFileSync("games/creative-calm-cove/game.js", "utf8");
const css = fs.readFileSync("games/creative-calm-cove/game.css", "utf8");

for (const id of [
  "artCanvas","promptSelect","previousPrompt","nextPrompt","completePrompt","symmetryMode",
  "colorPicker","brushSize","spiroButton","creatureButton","undoButton","redoButton",
  "clearButton","saveButton","exportButton","newCanvasButton"
]) {
  assert.ok(html.includes('id="' + id + '"'), "Creative Calm Cove exposes " + id);
}
for (const feature of [
  "pointerdown","pointermove","localStorage","toDataURL","radial6","radial8",
  "Creature Spark","Spiro Garden","LarriVerseArcade?.award"
]) {
  assert.ok(engine.includes(feature), "Creative engine includes " + feature);
}
assert.ok(css.includes("html.larriverse-dark"));
assert.ok(css.includes("html.larriverse-high-contrast"));
assert.ok(css.includes("html.larriverse-reduced-motion"));

const catalog = JSON.parse(fs.readFileSync("games/catalog.json", "utf8"));
const release = JSON.parse(fs.readFileSync("release.json", "utf8"));
const row = catalog.find((x) => x.id === "creative-calm-cove");
assert.ok(row?.available && row.featured && row.integration === "arcade-sdk-v3");
assert.match(row.mission, /80 optional creative cards/i);
assert.ok(release.cabinets.some((x) => x.id === "creative-calm-cove"));
assert.equal(release.cabinetCount, catalog.length);
assert.equal(release.galleryReview.expectedImages, (catalog.length + 1) * 2);

console.log("Creative Calm Cove validation passed: 80 no-pressure prompts, drawing, symmetry, generators, local save, export, and comfort modes.");
