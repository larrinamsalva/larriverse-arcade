export const alphabet = "ABCDEFGH";
export const wrap = (value, amount = 0) => ((value + amount) % 8 + 8) % 8;
export const encode = (word, shift) => [...word].map(letter => alphabet[wrap(alphabet.indexOf(letter), shift)]).join("");
export const compassTarget = (landmark, clue) => landmark.id + clue.east + clue.south * 6;
export const adjacent = (left, right, width = 3) => Math.abs(left % width - right % width) + Math.abs(Math.floor(left / width) - Math.floor(right / width)) === 1;
export function townNeeds(plots) {
  const park = plots.indexOf("park"), hut = plots.indexOf("hut"), ramp = plots.indexOf("ramp"), bench = plots.indexOf("bench");
  return [park >= 0 && park < 3, hut >= 3, ramp === 2 || ramp === 5, bench >= 0 && park >= 0 && adjacent(bench, park)];
}
export function traceWater(cells) {
  let tile = 10, incoming = 3;
  const seen = [];
  for (let step = 0; step < 26; step++) {
    if (seen.includes(tile)) return { ok: false, seen, tile, reason: "The water loops back. Try turning this pipe." };
    const pipe = cells[tile];
    if (!pipe?.includes(incoming)) return { ok: false, seen, tile, reason: `Pipe ${tile + 1} does not connect to the incoming water.` };
    seen.push(tile);
    const outgoing = pipe.find(value => value !== incoming);
    if (tile === 14 && outgoing === 1) return { ok: seen.includes(12), seen, tile, reason: seen.includes(12) ? "The water reached town through the toy filter!" : "The town needs water to pass through the toy filter first." };
    if ((outgoing === 0 && tile < 5) || (outgoing === 1 && tile % 5 === 4) || (outgoing === 2 && tile >= 20) || (outgoing === 3 && tile % 5 === 0)) return { ok: false, seen, tile, reason: `Pipe ${tile + 1} sends the water off the map.` };
    tile += [-5, 1, 5, -1][outgoing];
    incoming = (outgoing + 2) % 4;
  }
  return { ok: false, seen, tile, reason: "Follow the water and check each connection." };
}
export function checkPantryBox(challenge, box, foods) {
  const foodById = new Map(foods.map(food => [food.id, food]));
  const entries = Object.entries(box).filter(([, count]) => Number.isInteger(count) && count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  if (total !== 3) return { ok: false, reason: "Pack exactly three portions: one main and two fruits or vegetables." };

  const groupCount = group => entries.reduce((sum, [id, count]) => sum + (foodById.get(id)?.group === group ? count : 0), 0);
  const mains = groupCount("main"), fruits = groupCount("fruit"), vegetables = groupCount("vegetable");
  if (mains !== 1 || fruits + vegetables !== 2) return { ok: false, reason: "This picnic needs one main and two produce portions." };

  if (challenge.produce && (fruits !== challenge.produce.fruit || vegetables !== challenge.produce.vegetable)) {
    const fruitWords = `${challenge.produce.fruit} fruit portion${challenge.produce.fruit === 1 ? "" : "s"}`;
    const vegetableWords = `${challenge.produce.vegetable} vegetable portion${challenge.produce.vegetable === 1 ? "" : "s"}`;
    return { ok: false, reason: `Check the request again: it needs ${fruitWords} and ${vegetableWords}.` };
  }

  for (const [id, required] of Object.entries(challenge.mustUse || {})) {
    if ((box[id] || 0) < required) return { ok: false, reason: `Use the marked ${foodById.get(id)?.name || "leftover"} before opening something new.` };
  }

  if (challenge.differentProduce) {
    const produceKinds = entries.filter(([id]) => foodById.get(id)?.group !== "main").length;
    if (produceKinds < 2) return { ok: false, reason: "Choose two different produce items for this picnic request." };
  }

  return { ok: true, reason: challenge.why };
}
export function cheapestShop(level) {
  let best = Infinity;
  for (let a = 0; a <= level.need; a++) for (let b = 0; b <= level.need; b++) for (let c = 0; c <= level.need; c++) {
    const counts = [a, b, c];
    const quantity = counts.reduce((sum, count, index) => sum + count * level.deals[index].quantity, 0);
    if (quantity >= level.need) best = Math.min(best, counts.reduce((sum, count, index) => sum + count * (level.deals[index].price + level.deals[index].fee), 0));
  }
  return best;
}
