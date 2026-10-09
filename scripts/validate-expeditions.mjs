import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { expeditions, bridgeLevels, bridgeParts, pipePaths, directions, pantryFoods, pantryChallenges, PANTRY_ROUND_SIZE, compassClues, landmarks, cipherLevels, tradeLevels } from "../assets/expedition-worlds.js";
import { traceWater, checkPantryBox, compassTarget, encode, cheapestShop, townNeeds } from "../assets/expedition-logic.js";
const catalog = JSON.parse(fs.readFileSync("games/catalog.json", "utf8"));
assert.equal(expeditions.length, 8);
assert.equal(bridgeLevels.length, 8);
assert.equal(pipePaths.length, 8);
assert.deepEqual(directions, ["north", "east", "south", "west"]);
assert.equal(compassClues.length, 8);
assert.equal(cipherLevels.length, 8);
assert.equal(tradeLevels.length, 8);
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
assert.equal(new Set(tradeLevels.map(level => level.name)).size, tradeLevels.length);
for (const world of expeditions) {
  assert.equal(catalog.filter(game => game.id === world.id).length, 1);
  const html = fs.readFileSync(`games/${world.id}/index.html`, "utf8");
  assert.ok(html.includes(`data-world="${world.id}"`) && html.includes("expedition-games.css") && html.includes("arcade-expedition.css"));
}
for (const level of bridgeLevels) {
  const minimum = level.loads.reduce((sum, load) => sum + bridgeParts.find(part => part.capacity >= load).cost, 0);
  assert.ok(minimum <= level.budget, "Every bridge has a solution within its budget");
}
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
for (const level of cipherLevels) assert.equal(encode(encode(level.word,level.shift),-level.shift),level.word);
for (const level of tradeLevels) assert.ok(cheapestShop(level) <= level.budget);
assert.deepEqual(townNeeds(["park","bench","ramp","hut",null,null]), [true,true,true,true]);
assert.deepEqual(townNeeds([null,null,null,"park","bench","hut"]), [false,true,false,true]);
for (const path of ["assets/expedition-worlds.js","assets/expedition-logic.js","assets/expedition-games.js","assets/arcade-scenes.js","tests/browser/expeditions.spec.mjs"]) execFileSync(process.execPath,["--check",path]);
for (const path of ["assets/expedition-atlas.webp","assets/worlds-atlas-v2.webp"]) assert.ok(fs.statSync(path).size < 1_000_000);
console.log("Eight expeditions validated: solvable systems, twenty-four rotating Pantry Picnic challenges, distinct treasures, cipher keys, shopping comparisons and inclusive town layouts.");
