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
  trafficQuestions,
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
  [messages, 12, 3],
  [conversations, 12, 3],
  [newsCards, 12, 4],
]) {
  assert.equal(deck.length, count);
  assert.equal(new Set(deck.map((item) => item.text)).size, deck.length);
  for (const item of deck) {
    assert.ok(item.text.length > 20 && item.why.length > 20);
    assert.ok(
      Number.isInteger(item.answer) &&
        item.answer >= 0 &&
        item.answer < options,
    );
  }
}
assert.equal(sorting.length, 12);
assert.equal(new Set(sorting.map((item) => item.name)).size, sorting.length);
for (const item of sorting)
  assert.ok(
    Number.isInteger(item.bin) &&
      item.bin >= 0 &&
      item.bin < 4 &&
      item.why.length > 20,
  );
assert.equal(trafficQuestions.length, 30);
assert.equal(new Set(trafficQuestions.map((item) => item.text)).size, trafficQuestions.length);
for (const item of trafficQuestions) {
  assert.equal(item.options.length, 3);
  assert.ok(item.text.length > 20 && item.why.length > 20);
  assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.options.length);
}
assert.equal(repairs.length, 3);
for (const item of repairs) {
  assert.equal(item.steps.length, 4);
  assert.equal(new Set(item.steps).size, 4);
}
assert.equal(robotLevels.length, 8);
assert.equal(new Set(robotLevels.map((level) => level.name)).size, robotLevels.length);
const roverAdjacent = (a, b) =>
  Math.abs(Math.floor(a / 5) - Math.floor(b / 5)) +
    Math.abs((a % 5) - (b % 5)) ===
  1;
function shortestRoverProgram(level) {
  const moves = [-5, 1, 5, -1];
  const queue = [{ player: level.start, dir: level.dir, length: 0 }];
  const seen = new Set([`${level.start}:${level.dir}`]);
  for (let index = 0; index < queue.length; index++) {
    const state = queue[index];
    if (state.player === level.goal) return state.length;
    const forward = state.player + moves[state.dir];
    if (
      forward >= 0 &&
      forward < 25 &&
      roverAdjacent(forward, state.player) &&
      !level.rocks.includes(forward)
    ) {
      const key = `${forward}:${state.dir}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push({ player: forward, dir: state.dir, length: state.length + 1 });
      }
    }
    for (const dir of [(state.dir + 3) % 4, (state.dir + 1) % 4]) {
      const key = `${state.player}:${dir}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push({ player: state.player, dir, length: state.length + 1 });
      }
    }
  }
  return Infinity;
}
for (const level of robotLevels) {
  assert.ok(
    !level.rocks.includes(level.start) && !level.rocks.includes(level.goal),
  );
  assert.ok(
    level.start >= 0 && level.start < 25 && level.goal >= 0 && level.goal < 25,
  );
  assert.ok(Number.isInteger(level.dir) && level.dir >= 0 && level.dir < 4);
  assert.ok(Number.isInteger(level.par) && level.par > 0 && level.par <= 32);
  assert.ok(level.hint.length > 40);
  assert.equal(new Set(level.rocks).size, level.rocks.length);
  assert.ok(level.rocks.every((rock) => Number.isInteger(rock) && rock >= 0 && rock < 25));
  assert.equal(shortestRoverProgram(level), level.par);
}
for (const file of [
  "assets/expanded-scenarios.js",
  "assets/skill-worlds.js",
  "assets/skill-games.js",
  "tests/browser/skill-worlds.spec.mjs",
])
  execFileSync(process.execPath, ["--check", file]);
console.log(
  "Skill worlds validated: twenty-one unique modes, expanded non-duplicate scenario banks, Traffic Town road-sign practice, complete routes, repair sequences, and eight shortest-path-verified rover grids.",
);
