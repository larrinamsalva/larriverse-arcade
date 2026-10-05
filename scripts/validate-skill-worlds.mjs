import fs from "node:fs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  worlds,
  messages,
  conversations,
  newsCards,
  repairs,
  sorting,
  robotLevels,
} from "../assets/skill-worlds.js";
const catalog = JSON.parse(fs.readFileSync("games/catalog.json", "utf8"));
const release = JSON.parse(fs.readFileSync("release.json", "utf8"));
assert.equal(worlds.length, catalog.filter(game => game.integration === "arcade-sdk-v3").length);
assert.equal(new Set(worlds.map((w) => w.id)).size, worlds.length);
assert.equal(new Set(worlds.map((w) => w.mode)).size, worlds.length);
assert.equal(new Set(worlds.map((w) => `${w.artSet || "original"}:${w.art}`)).size, worlds.length);
for (const world of worlds) {
  assert.match(world.id, /^[a-z]+(?:-[a-z]+)*$/);
  assert.ok(world.mission.length > 40);
  assert.ok(world.take.length > 40);
  assert.ok(Number.isInteger(world.art) && world.art >= 0 && world.art < (world.artSet === "expedition" ? 8 : 12));
  const match = catalog.find((game) => game.id === world.id);
  assert.equal(match?.title, world.title);
  assert.equal(match?.available, true);
  assert.ok(release.cabinets.some((game) => game.id === world.id));
  const html = fs.readFileSync(`games/${world.id}/index.html`, "utf8");
  assert.ok(html.includes(`data-world="${world.id}"`));
  assert.ok(html.includes('type="module" src="../../assets/skill-games.js"'));
}
for (const [deck, count, options] of [
  [messages, 6, 3],
  [conversations, 5, 3],
  [newsCards, 8, 4],
]) {
  assert.equal(deck.length, count);
  for (const item of deck) {
    assert.ok(item.text.length > 20 && item.why.length > 20);
    assert.ok(
      Number.isInteger(item.answer) &&
        item.answer >= 0 &&
        item.answer < options,
    );
  }
}
assert.equal(sorting.length, 10);
for (const item of sorting)
  assert.ok(
    Number.isInteger(item.bin) &&
      item.bin >= 0 &&
      item.bin < 4 &&
      item.why.length > 20,
  );
assert.equal(repairs.length, 3);
for (const item of repairs) {
  assert.equal(item.steps.length, 4);
  assert.equal(new Set(item.steps).size, 4);
}
assert.equal(robotLevels.length, 3);
for (const level of robotLevels) {
  assert.ok(
    !level.rocks.includes(level.start) && !level.rocks.includes(level.goal),
  );
  assert.ok(
    level.start >= 0 && level.start < 25 && level.goal >= 0 && level.goal < 25,
  );
}
for (const file of [
  "assets/skill-worlds.js",
  "assets/skill-games.js",
  "tests/browser/skill-worlds.spec.mjs",
])
  execFileSync(process.execPath, ["--check", file]);
console.log(
  "Skill worlds validated: twenty unique modes, complete routes, scenario indexes, repair sequences, and rover grids.",
);
