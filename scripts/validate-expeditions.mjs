import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { expeditions, bridgeLevels, bridgeParts, pipePaths, directions, cargo, harborLevels, pantryFoods, pantryChallenges, PANTRY_ROUND_SIZE, compassClues, landmarks, cipherLevels, tradeLevels, townParts, townLevels } from "../assets/expedition-worlds.js";
import { traceWater, checkPantryBox, compassTarget, encode, cheapestShop, townNeeds, checkTownLevel } from "../assets/expedition-logic.js";
const catalog = JSON.parse(fs.readFileSync("games/catalog.json", "utf8"));
assert.equal(expeditions.length, 8);
assert.equal(bridgeLevels.length, 20);
assert.equal(pipePaths.length, 20);
assert.equal(harborLevels.length, 20);
assert.deepEqual(directions, ["north", "east", "south", "west"]);
assert.equal(compassClues.length, 20);
assert.equal(cipherLevels.length, 20);
assert.equal(tradeLevels.length, 8);
assert.equal(townLevels.length, 20);
assert.equal(PANTRY_ROUND_SIZE, 8);
assert.equal(pantryChallenges.length, 24);
assert.equal(new Set(pantryChallenges.map(challenge => challenge.id)).size, pantryChallenges.length);
assert.equal(new Set(pantryChallenges.map(challenge => challenge.name)).size, pantryChallenges.length);
assert.ok(pantryFoods.length >= 12);
assert.equal(new Set(pantryFoods.map(food => food.id)).size, pantryFoods.length);
assert.ok(pantryFoods.every(food => ["main", "fruit", "vegetable"].includes(food.group)));
assert.equal(new Set(bridgeLevels.map(level => level.name)).size, bridgeLevels.length);
assert.equal(new Set(bridgeLevels.map(level => level.scene)).size, bridgeLevels.length);
assert.equal(new Set(bridgeLevels.map(level => level.vehicle)).size, bridgeLevels.length);
assert.equal(new Set(bridgeLevels.map(level => level.cargo)).size, bridgeLevels.length);
assert.ok(bridgeLevels.every(level => level.landmark && level.cargo.length >= 10));
assert.equal(new Set(harborLevels.map(level => level.name)).size, harborLevels.length);
const cargoIds = new Set(cargo.map(item => item.id));
const cargoUsage = new Set();
for (const level of harborLevels) {
  const crateCount = Object.values(level.needs).reduce((sum, count) => sum + count, 0);
  assert.ok(crateCount >= 2 && crateCount <= level.capacity, `${level.name} fits its boat`);
  assert.ok(level.capacity >= 3 && level.capacity <= 4, `${level.name} has a focused boat capacity`);
  assert.ok(Number.isInteger(level.fuel) && level.fuel >= 1, `${level.name} has route fuel`);
  for (const [id, count] of Object.entries(level.needs)) {
    assert.ok(cargoIds.has(id), `${level.name} uses known cargo`);
    assert.ok(Number.isInteger(count) && count > 0 && count <= 4, `${level.name} has valid crate counts`);
    cargoUsage.add(id);
  }
}
assert.equal(cargoUsage.size, cargo.length, "every cargo type appears in the harbor route");
assert.equal(new Set(tradeLevels.map(level => level.name)).size, tradeLevels.length);
for (const world of expeditions) {
  assert.equal(catalog.filter(game => game.id === world.id).length, 1);
  const html = fs.readFileSync(`games/${world.id}/index.html`, "utf8");
  assert.ok(html.includes(`data-world="${world.id}"`) && html.includes("expedition-games.css") && html.includes("arcade-expedition.css"));
}
// The lesson is structural load planning, not spending pretend money.
assert.equal(bridgeParts.length, 3);
assert.deepEqual(bridgeParts.map(part => part.capacity), [3,6,9]);
assert.ok(bridgeParts.every(part => !("cost" in part)), "No bridge material has a token price");
for (const level of bridgeLevels) {
  assert.ok(!("budget" in level), `${level.name}: no token budget`);
  assert.equal(level.loads.length, 4, `${level.name}: four spans`);
  assert.ok(level.loads.every(load => Number.isInteger(load) && load > 0 &&
    bridgeParts.some(part => part.capacity >= load)), `${level.name}: each span has a strong support`);
}
const bridgeSource = fs.readFileSync("assets/expedition-games.js","utf8");
const bridgeGame = bridgeSource.slice(bridgeSource.indexOf("function bridge()"),bridgeSource.indexOf("function pipes()"));
assert.ok(!/Builder tokens|more tokens|Tokens return|cost > level\.budget|spent/.test(bridgeGame),
  "Bridge Buddies must not have hidden token limits");
assert.match(bridgeGame, /Supports placed/);
for (const path of pipePaths) {
  assert.equal(path[0], 10); assert.equal(path.at(-1), 14); assert.ok(path.includes(12));
  assert.equal(new Set(path).size, path.length);
  const cells = Array(25).fill(null), dir = (from, to) => [-5,1,5,-1].indexOf(to-from);
  path.forEach((tile,index) => {
    assert.ok(tile >= 0 && tile < 25);
    cells[tile] = [index ? dir(tile,path[index-1]) : 3, index < path.length-1 ? dir(tile,path[index+1]) : 1];
    assert.ok(cells[tile].every(value => value >= 0));
  });
  assert.equal(traceWater(cells).ok, true);
  cells[10] = [0,1]; assert.equal(traceWater(cells).ok, false);
}
const foodIds = new Set(pantryFoods.map(food => food.id));
const pantryUsage = new Set();
for (const challenge of pantryChallenges) {
  assert.ok(challenge.prompt.length > 45);
  assert.ok(challenge.why.length > 45);
  assert.ok(Object.keys(challenge.stock).length >= 5);
  for (const [id, count] of Object.entries(challenge.stock)) {
    assert.ok(foodIds.has(id));
    assert.ok(Number.isInteger(count) && count > 0 && count <= 2);
    pantryUsage.add(id);
  }
  for (const [id, count] of Object.entries(challenge.mustUse || {})) {
    assert.ok(foodIds.has(id));
    assert.ok(Number.isInteger(count) && count > 0 && count <= challenge.stock[id]);
  }
  if (challenge.produce) assert.equal(challenge.produce.fruit + challenge.produce.vegetable, 2);

  const stockedIds = Object.keys(challenge.stock);
  const solutions = [];
  const search = (index, remaining, box) => {
    if (index === stockedIds.length) {
      if (!remaining && checkPantryBox(challenge, box, pantryFoods).ok) solutions.push({ ...box });
      return;
    }
    const id = stockedIds[index];
    for (let count = 0; count <= Math.min(challenge.stock[id], remaining); count++) {
      if (count) box[id] = count; else delete box[id];
      search(index + 1, remaining - count, box);
    }
    delete box[id];
  };
  search(0, 3, {});
  assert.ok(solutions.length > 0, `${challenge.id} needs at least one valid picnic solution`);
}
assert.equal(pantryUsage.size, pantryFoods.length);
const targets = compassClues.map(clue => compassTarget(landmarks[clue.landmark], clue));
assert.equal(new Set(targets).size, compassClues.length);
assert.ok(targets.every(target => target >= 0 && target < 36));
for (const level of cipherLevels) {
  assert.ok(/^[A-H]{3,5}$/.test(level.word), `${level.word} fits the toy alphabet and difficulty range`);
  assert.equal(encode(encode(level.word,level.shift),-level.shift),level.word);
}
for (const level of tradeLevels) assert.ok(cheapestShop(level) <= level.budget);
assert.deepEqual(townNeeds(["park","bench","ramp","hut",null,null]), [true,true,true,true]);
assert.deepEqual(townNeeds([null,null,null,"park","bench","hut"]), [false,true,false,true]);
assert.equal(new Set(townLevels.map(level => level.id)).size, townLevels.length);
assert.equal(new Set(townLevels.map(level => level.name)).size, townLevels.length);
assert.ok(new Set(townLevels.flatMap(level => level.requests.map(request => request.text))).size >= 40);
assert.equal(new Set(townLevels.flatMap(level => level.requests.map(request => `${request.neighbor}: ${request.text}`))).size, 80);
assert.equal(new Set(townLevels.flatMap(level => level.requests.map(request => request.neighbor))).size, 80);
const townPartIds = townParts.map(part => part.id), townRules = new Set(["plot","row","column","adjacent","sameRow","differentRow"]);
for (const level of townLevels) {
  assert.equal(level.requests.length, 4, `${level.name} has four neighbor requests`);
  assert.ok(level.requests.every(request => townPartIds.includes(request.part) && townRules.has(request.rule.type)), `${level.name} uses supported request rules`);
  assert.ok(townParts.reduce((sum, part) => sum + part.cost, 0) <= level.budget, `${level.name} can include every building`);
  let solution = null;
  outer: for (let park = 0; park < 6; park++) for (let hut = 0; hut < 6; hut++) for (let ramp = 0; ramp < 6; ramp++) for (let bench = 0; bench < 6; bench++) {
    if (new Set([park,hut,ramp,bench]).size < 4) continue;
    const plots = Array(6).fill(null);
    [park,hut,ramp,bench].forEach((plot,index) => { plots[plot] = townPartIds[index]; });
    if (checkTownLevel(level, plots).every(Boolean)) { solution = plots; break outer; }
  }
  assert.ok(solution, `${level.name} has at least one plan satisfying every neighbor`);
}
for (const path of ["assets/expedition-worlds.js","assets/expedition-logic.js","assets/expedition-games.js","assets/arcade-scenes.js","tests/browser/expeditions.spec.mjs"]) execFileSync(process.execPath,["--check",path]);
for (const path of ["assets/expedition-atlas.webp","assets/worlds-atlas-v2.webp"]) assert.ok(fs.statSync(path).size < 1_000_000);
console.log("Eight expeditions validated: six twenty-level adventures, twenty-four rotating Pantry Picnic challenges, eighty solvable town requests, distinct treasures, cipher keys and shopping comparisons.");
