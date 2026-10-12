import assert from "node:assert/strict";
import { bridgeMiniaturePart, bridgeMiniatureLandscape } from "../assets/bridge-miniatures.js";
import { bridgeLevels, bridgeParts } from "../assets/expedition-worlds.js";

assert.equal(bridgeLevels.length, 60, "Bridge Buddies must keep all 60 crossings");
assert.deepEqual(bridgeParts.map(part => [part.id, part.capacity]),
  [["plank", 3], ["beam", 6], ["triangle", 9]],
  "Artwork cannot change support capacities");

const drawings = bridgeParts.map(part => bridgeMiniaturePart(part.id));
assert.equal(new Set(drawings).size, 3, "Supports must each have a distinct miniature");
for (const [index, drawing] of drawings.entries()) {
  assert.match(drawing, /class="bridge-wood-deck"/, "Support should have planked deck");
  assert.match(drawing, /class="wood-grain"/, "Every support needs actual timber grain artwork");
  assert.match(drawing, /wood|bridge-part/, "Support should show timber structure");
  assert.ok((drawing.match(/<path /g) || []).length > 10, "Support needs dimensional geometry");
  assert.equal((drawing.match(/<g\b/g) || []).length,
    (drawing.match(/<\/g>/g) || []).length, "SVG groups must balance for " + bridgeParts[index].id);
  assert.ok(!/undefined|NaN/.test(drawing), "No blank geometry allowed");
}
assert.match(drawings[0], /bridge-part-plank/);
assert.match(drawings[1], /bridge-part-beam/);
assert.match(drawings[2], /bridge-part-truss/);
assert.match(bridgeMiniaturePart(null), /bridge-part-empty/);
for (const level of bridgeLevels) {
  assert.equal(level.loads.length, 4, level.name + " must keep four spans");
  assert.ok(level.loads.every(load => bridgeParts.some(part => part.capacity >= load)),
    level.name + " must remain winnable with free materials");
  const scene = bridgeMiniatureLandscape(level.scene);
  assert.match(scene, /class="bridge-backdrop"/);
  assert.match(scene, /aria-hidden="true"/);
  assert.ok(!/undefined|NaN/.test(scene), level.name + " scenery must render");
  assert.equal((scene.match(/<g\b/g) || []).length,
    (scene.match(/<\/g>/g) || []).length, level.name + " scenery groups must balance");
}
console.log("Bridge miniatures validated: 3 support models and " + bridgeLevels.length + " complete crossings.");
