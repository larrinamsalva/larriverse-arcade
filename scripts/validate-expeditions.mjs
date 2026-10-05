import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { expeditions, bridgeLevels, bridgeParts, pipePaths, compassClues, landmarks, cipherLevels, tradeLevels } from "../assets/expedition-worlds.js";
import { traceWater, compassTarget, encode, cheapestShop, townNeeds } from "../assets/expedition-logic.js";
const catalog = JSON.parse(fs.readFileSync("games/catalog.json", "utf8"));
assert.equal(expeditions.length, 8);
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
const targets = compassClues.map(clue => compassTarget(landmarks[clue.landmark], clue));
assert.equal(new Set(targets).size, 5);
assert.ok(targets.every(target => target >= 0 && target < 36));
for (const level of cipherLevels) assert.equal(encode(encode(level.word,level.shift),-level.shift),level.word);
for (const level of tradeLevels) assert.ok(cheapestShop(level) <= level.budget);
assert.deepEqual(townNeeds(["park","bench","ramp","hut",null,null]), [true,true,true,true]);
assert.deepEqual(townNeeds([null,null,null,"park","bench","hut"]), [false,true,false,true]);
for (const path of ["assets/expedition-worlds.js","assets/expedition-logic.js","assets/expedition-games.js","assets/arcade-scenes.js","tests/browser/expeditions.spec.mjs"]) execFileSync(process.execPath,["--check",path]);
for (const path of ["assets/expedition-atlas.webp","assets/worlds-atlas-v2.webp"]) assert.ok(fs.statSync(path).size < 1_000_000);
console.log("Eight expeditions validated: solvable bridges, complete water paths, distinct treasures, cipher keys, affordable shopping and inclusive town layouts.");
