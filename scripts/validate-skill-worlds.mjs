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
  weatherChallenges,
  gardenGrowthChallenges,
} from "../assets/skill-worlds.js";
import { gardenLevels, energyLevels } from "../assets/garden-energy-levels.js";
import { timeTrail, shortestTrailPath } from "../assets/time-trail-level.js";
import {
  iconSvg,
  weatherSceneSvg,
  weatherChoiceSvg,
  gardenLessonSvg,
  gardenChoiceSvg,
} from "../assets/arcade-scenes.js";
const catalog = JSON.parse(fs.readFileSync("games/catalog.json", "utf8"));
const release = JSON.parse(fs.readFileSync("release.json", "utf8"));
const standaloneV3Cabinets = new Set(["street-safety-scout"]);
assert.equal(worlds.length, catalog.filter(game => game.integration === "arcade-sdk-v3" && !standaloneV3Cabinets.has(game.id)).length);
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
for (const [deck, options] of [
  [messages, 3],
  [conversations, 3],
  [newsCards, 4],
]) {
  assert.ok(deck.length >= 20);
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
assert.ok(sorting.length >= 20);
assert.equal(new Set(sorting.map((item) => item.name)).size, sorting.length);
for (const item of sorting) {
  assert.ok(
    Number.isInteger(item.bin) &&
      item.bin >= 0 &&
      item.bin < 4 &&
      item.why.length > 20,
  );
  assert.match(item.art, /^[a-z][A-Za-z]+$/);
  assert.match(iconSvg(item.art), new RegExp(`object-model--${item.art}`));
}
assert.equal(trafficQuestions.length, 60);
assert.equal(new Set(trafficQuestions.map((item) => item.text)).size, trafficQuestions.length);
for (const item of trafficQuestions) {
  assert.equal(item.options.length, 3);
  assert.ok(item.text.length > 20 && item.why.length > 20);
  assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.options.length);
}
assert.ok(repairs.length >= 20);
assert.equal(new Set(repairs.map((item) => item.title)).size, repairs.length);
for (const item of repairs) {
  assert.equal(item.steps.length, 4);
  assert.equal(new Set(item.steps).size, 4);
}
// Both classic resource worlds now contain four ranks and eight independent stages.
for (const [name, levels] of [["Garden Guardians", gardenLevels], ["Energy Island", energyLevels]]) {
  assert.equal(levels.length, 8, `${name} has eight playable levels`);
  assert.equal(new Set(levels.map((level) => level.id)).size, levels.length, `${name} ids are unique`);
  assert.equal(new Set(levels.map((level) => level.rank)).size, 4, `${name} has four advancement ranks`);
  assert.deepEqual([...new Set(levels.map((level) => level.rank))].map((rank) =>
    levels.filter((level) => level.rank === rank).length), [2,2,2,2],
    `${name} has two levels in every rank`);
  for (const level of levels) {
    assert.ok(level.name.length >= 8 && level.lesson.length > 45, `${name} provides meaningful level guidance`);
    assert.match(level.zone, /^[a-z]+$/);
  }
}
for (const level of gardenLevels) {
  assert.equal(level.carrot + level.bean + level.flower, 6, `${level.id} fills six plots`);
  assert.ok(["carrot","bean","flower"].every((type) => level[type] > 0), `${level.id} includes all crops`);
  assert.ok(level.target >= 5 && level.target <= 6, `${level.id} requires a sensible harvest`);
  assert.ok(level.water >= level.target * 2, `${level.id} has enough water for its target`);
  assert.ok(level.water <= 12, `${level.id} still teaches conservation`);
}
const sourceCost = { solar:2, wind:3, battery:2 };
function feasibleEnergyBuild(level) {
  for (let solar = 0; solar <= Math.floor(level.tokens / sourceCost.solar); solar++)
    for (let wind = 0; wind <= Math.floor(level.tokens / sourceCost.wind); wind++)
      for (let battery = 0; battery <= Math.floor(level.tokens / sourceCost.battery); battery++) {
        if (solar + wind === 0 || solar * 2 + wind * 3 + battery * 2 > level.tokens) continue;
        let stored = 0;
        let supplied = true;
        for (const day of level.weather) {
          const available = day.solar * solar + day.wind * wind + stored;
          supplied &&= available >= level.demand;
          stored = Math.min(battery * 4, Math.max(0, available - level.demand));
        }
        if (supplied) return true;
      }
  return false;
}
for (const level of energyLevels) {
  assert.equal(level.weather.length, 4, `${level.id} has four weather steps`);
  assert.ok(level.weather.some((day) => day.name === "Night"), `${level.id} includes darkness`);
  assert.ok(level.demand >= 6 && level.demand <= 8);
  assert.ok(level.tokens >= 12 && level.tokens <= 18);
  assert.ok(level.weather.every((day) =>
    day.icon && day.name && Number.isInteger(day.solar) && Number.isInteger(day.wind)));
  assert.ok(feasibleEnergyBuild(level), `${level.id} has a valid, affordable power mix`);
}
for (const id of ["garden-guardians","energy-island"]) {
  const world = worlds.find((item) => item.id === id);
  const entry = catalog.find((item) => item.id === id);
  assert.match(world.mission, /eight .* levels/i, `${id} describes its new journey`);
  assert.equal(entry.mission, world.mission, `${id} game card matches the game itself`);
}
// Time Trail: kids should reach all flags and the picnic in eight moves,
// with four spare moves rather than the old twelve-move detour and sixteen-move cap.
assert.equal(timeTrail.width, 5);
assert.equal(timeTrail.start, 20);
assert.equal(timeTrail.finish, 4);
assert.equal(timeTrail.stepLimit, 12);
assert.equal(timeTrail.flags.length, 3);
assert.equal(new Set(timeTrail.flags).size, 3);
assert.equal(new Set(timeTrail.rocks).size, timeTrail.rocks.length);
assert.ok([...timeTrail.flags, timeTrail.start, timeTrail.finish]
  .every((tile) => !timeTrail.rocks.includes(tile)));
assert.ok([...timeTrail.rocks, ...timeTrail.flags, timeTrail.start, timeTrail.finish]
  .every((tile) => Number.isInteger(tile) && tile >= 0 && tile < 25));
const shortestTimeTrail = shortestTrailPath(timeTrail);
assert.deepEqual(shortestTimeTrail, [20, 15, 10, 5, 0, 1, 2, 3, 4]);
assert.equal(shortestTimeTrail.length - 1, 8);
assert.ok(shortestTimeTrail.length - 1 < timeTrail.stepLimit, "give players room for detours");
assert.ok(timeTrail.flags.every((flag) => shortestTimeTrail.includes(flag)));
for (let index = 1; index < shortestTimeTrail.length; index++) {
  const a = shortestTimeTrail[index - 1], b = shortestTimeTrail[index];
  assert.equal(Math.abs(Math.floor(a / 5) - Math.floor(b / 5)) +
    Math.abs((a % 5) - (b % 5)), 1, "every move is to an adjacent tile");
}
const trailWorld = worlds.find((world) => world.id === "time-trail");
assert.match(trailWorld.mission, /8 moves/);
assert.match(trailWorld.mission, /12 moves allowed/);
assert.equal(catalog.find((world) => world.id === "time-trail").mission, trailWorld.mission);
const trailGame = fs.readFileSync("assets/skill-games.js", "utf8");
assert.ok(trailGame.includes("tile.route-reachable") || trailGame.includes("route-reachable"),
  "Time Trail highlights legal adjacent moves");
assert.ok(trailGame.includes("state.moves >= ROUTE_STEP_LIMIT"),
  "Time Trail stops after its strict move limit");
assert.equal(robotLevels.length, 20);
assert.equal(new Set(robotLevels.map((level) => level.name)).size, robotLevels.length);
assert.equal(
  new Set(
    robotLevels.map(
      (level) =>
        `${level.start}:${level.goal}:${level.dir}:${[...level.rocks].sort((a, b) => a - b).join(",")}`,
    ),
  ).size,
  robotLevels.length,
  "every rover world has a distinct board",
);
const roverRanks = [...new Set(robotLevels.map((level) => level.rank))];
assert.deepEqual(roverRanks, [
  "Rover Rookie",
  "Trail Coder",
  "Maze Navigator",
  "Rover Commander",
]);
assert.ok(
  roverRanks.every(
    (rank) => robotLevels.filter((level) => level.rank === rank).length === 5,
  ),
  "every rover rank has five worlds",
);
assert.deepEqual([...new Set(robotLevels.map((level) => level.zone))], [
  "meadow",
  "canyon",
  "crystal",
  "cosmic",
]);
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
for (const [name, deck, expected, sceneArt, choiceArt] of [
  ["Weather Watchers", weatherChallenges, 25, weatherSceneSvg, weatherChoiceSvg],
  ["Garden Grow & Harvest", gardenGrowthChallenges, 24, gardenLessonSvg, gardenChoiceSvg],
]) {
  assert.equal(deck.length, expected, `${name} has its complete challenge bank`);
  assert.equal(new Set(deck.map((item) => item.id)).size, deck.length, `${name} challenge ids are unique`);
  const ranks = [...new Set(deck.map((item) => item.rank))];
  assert.equal(ranks.length, 4, `${name} has four advancement ranks`);
  assert.ok(ranks.every((rank) => deck.filter((item) => item.rank === rank).length >= 6), `${name} has at least six challenges per rank`);
  for (const item of deck) {
    assert.ok(item.title.length > 8 && item.prompt.length > 20 && item.why.length > 40, `${name}/${item.id} has useful learning copy`);
    assert.equal(item.clues.length, 3, `${name}/${item.id} has three visual clues`);
    assert.equal(item.options.length, 3, `${name}/${item.id} has three picture choices`);
    assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.options.length, `${name}/${item.id} has a valid answer`);
    assert.match(sceneArt(item.scene), /<svg[^>]+role="img"/, `${name}/${item.id} has accessible scene art`);
    for (const option of item.options) {
      assert.ok(option.label.length > 2 && option.art.length > 2, `${name}/${item.id} picture choice is labeled`);
      assert.match(choiceArt(option.art), /<svg class="learning-choice-art/, `${name}/${item.id} choice art renders`);
    }
  }
}
for (const file of [
  "assets/garden-energy-levels.js",
  "assets/time-trail-level.js",
  "assets/expanded-scenarios.js",
  "assets/skill-worlds.js",
  "assets/skill-games.js",
  "tests/browser/skill-worlds.spec.mjs",
])
  execFileSync(process.execPath, ["--check", file]);
console.log(
  `Skill worlds validated: ${worlds.length} unique modes, eight-level garden and energy campaigns, complete 25-question weather and 24-question garden paths, replay banks, Traffic Town road-sign practice, repair sequences, and twenty shortest-path-verified rover grids, and an eight-move Time Trail with a twelve-move limit.`,
);
