import { bridgeParts, bridgeLevels, pipePaths, directions, islands, cargo, pantryFoods, landmarks, compassClues, cipherLevels, tradeLevels, townParts } from "./expedition-worlds.js";
import { alphabet, wrap, encode, compassTarget, townNeeds, traceWater, cheapestShop } from "./expedition-logic.js";
import { iconSvg, iconDrawing } from "./arcade-scenes.js";

export function createExpedition(world, a) {
  let s;
  const total = object => Object.values(object).reduce((sum, value) => sum + value, 0);
  const resetCount = items => Object.fromEntries(items.map(item => [item.id, item.count]));
  const part = id => bridgeParts.find(item => item.id === id);
  const tool = (item, selected) => `<button type="button" class="build-tool ${selected === item.id ? "selected" : ""}" data-tool="${item.id}" data-focus="tool-${item.id}" aria-pressed="${selected === item.id}">${iconSvg(item.icon || (item.id === "triangle" ? "ramp" : "wood"))}<b>${a.esc(item.name)}</b><small>${item.cost} tokens${item.capacity ? ` · holds ${item.capacity}` : ""}</small></button>`;
  function render() {
    const focused = document.activeElement?.dataset.focus;
    painters[world.mode]();
    if (focused) (a.board.querySelector(`[data-focus="${CSS.escape(focused)}"]`) || a.actions.querySelector("button"))?.focus({ preventScroll: true });
  }
  function resetLevel() {
    s.passed = false;
    if (world.mode === "bridge") Object.assign(s, { parts: Array(4).fill(null), tool: "plank", failed: [] });
    if (world.mode === "pipes") {
      const path = pipePaths[s.level];
      const dir = (from, to) => [-5,1,5,-1].indexOf(to - from);
      s.cells = Array(25).fill(null);
      path.forEach((tile, index) => {
        const pair = [index ? dir(tile, path[index - 1]) : 3, index < path.length - 1 ? dir(tile, path[index + 1]) : 1];
        s.cells[tile] = pair.map(value => (value + 1 + (index + s.level) % 3) % 4);
      });
      s.flow = []; s.leak = -1;
    }
    if (world.mode === "cipher") Object.assign(s, { shift: 0, tokens: [] });
    if (world.mode === "trade") s.cart = [0,0,0];
  }
  function nextLevel(count, message) {
    a.button(s.level === count - 1 ? "Celebrate my discoveries" : "Next challenge", () => {
      if (s.level === count - 1) {
        const score = s.quality.length ? s.quality.reduce((sum, value) => sum + value, 0) / s.quality.length : 100;
        a.finish(message, score);
      } else { s.level++; resetLevel(); render(); a.say("A new challenge! Try your plan and see what happens."); }
    });
  }
  function toolBindings() {
    a.bind("[data-tool]", node => { s.tool = node.dataset.tool; render(); });
  }
  function bridge() {
    const level = bridgeLevels[s.level];
    const spent = s.parts.reduce((sum, id) => sum + (part(id)?.cost || 0), 0);
    a.stage(`${level.name} · ${s.level + 1} of 3`); a.progress(s.level, 3); a.score(s.level * 33);
    a.board.innerHTML = `<div class="expedition-stats">${a.chip("Builder tokens", level.budget - spent)}${a.chip("Crossings", `${s.level}/3`)}</div><p class="board-intro">Choose a support, then tap a span. Each span must hold the cart load shown above it.</p><div class="tool-shelf">${bridgeParts.map(item => tool(item, s.tool)).join("")}<button type="button" class="build-tool" data-tool="erase" data-focus="tool-erase" aria-pressed="${s.tool === "erase"}">Clear a span<small>Tokens return to you</small></button></div><div class="bridge-landscape ${s.passed ? "crossed" : ""}"><div class="bridge-cart" aria-hidden="true">${iconSvg("wood")}<i></i><i></i></div><div class="bridge-spans">${s.parts.map((id, index) => `<button type="button" class="bridge-span ${id || "empty"} ${s.failed.includes(index) ? "weak" : ""}" data-span="${index}" data-focus="span-${index}" ${s.passed ? "disabled" : ""} aria-label="Span ${index + 1}, load ${level.loads[index]}, ${part(id)?.name || "empty"}"><span class="load-label">Load ${level.loads[index]}</span><svg viewBox="0 0 140 90" aria-hidden="true"><path d="M5 21h130" stroke="#c79d75" stroke-width="13" stroke-linecap="round"/>${id === "triangle" ? '<path d="M9 65L70 24 131 65z" fill="#ffd885" stroke="#d8ac5b" stroke-width="7"/>' : id === "beam" ? '<path d="M15 31v49M125 31v49M15 54h110" stroke="#a0a2d4" stroke-width="12"/>' : id === "plank" ? '<path d="M15 36h110" stroke="#e7b887" stroke-width="8"/>' : '<path d="M30 56h80" stroke="#bbe2dc" stroke-width="4" stroke-dasharray="6 8"/>'}</svg><b>${part(id)?.name || "Add a support"}</b><small>${id ? `Holds ${part(id).capacity}` : "Choose a tool first"}</small></button>`).join("")}</div></div>`;
    toolBindings();
    a.bind("[data-span]", node => {
      if (s.passed) return;
      const index = Number(node.dataset.span), next = s.tool === "erase" ? null : s.tool;
      const cost = spent - (part(s.parts[index])?.cost || 0) + (part(next)?.cost || 0);
      if (cost > level.budget) { a.say("That support needs more tokens. Clear or change another span first.", "try"); return; }
      s.parts[index] = next; s.failed = []; render();
    });
    if (s.passed) nextLevel(3, "You tested three bridges and improved the supports. Testing a model helps you find the weak spots before you build.");
    else a.button("Test the crossing", () => {
      s.failed = s.parts.flatMap((id, index) => (part(id)?.capacity || 0) < level.loads[index] ? [index] : []);
      s.passed = s.failed.length === 0; render();
      a.say(s.passed ? "The cart crossed! Your supports held every load." : `The cart needs stronger support at span${s.failed.length > 1 ? "s" : ""} ${s.failed.map(index => index + 1).join(", ")}. Try changing those supports.`, s.passed ? "good" : "try");
      if (s.passed) a.tone(1);
    });
  }
  function pipes() {
    a.stage(`Water network ${s.level + 1} of 3`); a.progress(s.level, 3); a.score(s.level * 33);
    const endpoint = [[50,5],[95,50],[50,95],[5,50]];
    a.board.innerHTML = `<p class="board-intro">Reservoir → pipe 11 → toy filter (pipe 13) → pipe 15 → town. Tap a pipe to turn it clockwise.</p><div class="pipe-labels"><span>${iconSvg("drop")} Reservoir, left</span><span>${iconSvg("hut")} Town, right</span></div><div class="pipe-grid">${s.cells.map((pair, index) => pair ? `<button type="button" class="pipe-tile ${index === 12 ? "filter" : ""} ${s.flow.includes(index) ? "flowing" : ""} ${s.leak === index ? "leak" : ""}" data-pipe="${index}" data-focus="pipe-${index}" ${s.passed ? "disabled" : ""} aria-label="Pipe ${index + 1}: ${pair.map(value => directions[value]).join(" and ")}${index === 12 ? "; toy filter" : ""}. Rotate clockwise."><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M${endpoint[pair[0]].join(" ")}L50 50 ${endpoint[pair[1]].join(" ")}" fill="none" stroke="#9cd1df" stroke-width="25" stroke-linejoin="round"/><path class="pipe-flow" d="M${endpoint[pair[0]].join(" ")}L50 50 ${endpoint[pair[1]].join(" ")}" fill="none" stroke="#e3f8ff" stroke-width="11" stroke-linejoin="round"/>${index === 12 ? '<circle cx="50" cy="50" r="20" fill="#d2baed"/><text x="50" y="58" text-anchor="middle" fill="#4e466d" font-size="23" font-weight="bold">F</text>' : ""}</svg><span class="tile-number">${index + 1}</span></button>` : `<div class="pipe-ground" aria-hidden="true">${iconSvg(index % 3 ? "seed" : "tree")}</div>`).join("")}</div><p class="small-note">F = toy filter. Real water safety needs real treatment and testing.</p>`;
    a.bind("[data-pipe]", node => { const index = Number(node.dataset.pipe); s.cells[index] = s.cells[index].map(value => (value + 1) % 4); s.flow = []; s.leak = -1; render(); });
    if (s.passed) nextLevel(3, "You connected three water networks. Following the flow helped you find and fix each connection.");
    else a.button("Send the water", () => { const flow = traceWater(s.cells); s.flow = flow.seen; s.leak = flow.ok ? -1 : flow.tile; s.passed = flow.ok; render(); a.say(flow.reason, flow.ok ? "good" : "try"); if (flow.ok) a.tone(1); });
  }
  function harbor() {
    const remaining = islands.map((island, index) => Object.fromEntries(Object.entries(island.needs).map(([id, count]) => [id, count - (s.delivered[index][id] || 0)])));
    const delivered = s.delivered.reduce((sum, island) => sum + total(island), 0);
    a.stage("The islands are counting on you"); a.progress(delivered, 9); a.score(delivered / 9 * 100);
    a.board.innerHTML = `<div class="expedition-stats">${a.chip("Fuel tokens", s.fuel)}${a.chip("Boat load", `${total(s.load)}/3`)}${a.chip("Crates delivered", `${delivered}/9`)}</div><div class="harbor-map" aria-hidden="true"><svg viewBox="0 0 620 160"><rect width="620" height="160" rx="24" fill="#c8ecea"/><path d="M0 107q100-28 200 0t200 0 220 0" stroke="#a1d9e4" stroke-width="8" fill="none"/>${islands.map((_,index) => `<g transform="translate(${40+index*215} 20) scale(.8)"><ellipse cx="50" cy="95" rx="76" ry="17" fill="#a5d3a7"/>${iconDrawing(index === 0 ? "tree" : index === 1 ? "hut" : "lighthouse")}</g>`).join("")}<g class="harbor-boat" transform="translate(${80+s.island*190} 76) scale(.6)">${iconDrawing("boat")}</g></svg></div><div class="island-requests">${islands.map((island, index) => `<button type="button" class="island-request ${s.island === index ? "selected" : ""}" data-island="${index}" data-focus="island-${index}" aria-pressed="${s.island === index}"><b>${island.name}</b><small>${island.fuel} fuel per trip</small><span>${Object.entries(remaining[index]).map(([id,count]) => `${count} ${id}`).join(" · ")}</span></button>`).join("")}</div><p class="board-intro">Choose an island, then load only the crates it still needs.</p><div class="cargo-shelf">${cargo.map(item => `<button type="button" class="supply-card" data-cargo="${item.id}" data-focus="cargo-${item.id}" ${s.stock[item.id] - (s.load[item.id] || 0) <= 0 ? "disabled" : ""}>${iconSvg(item.icon)}<b>${item.name}</b><small>${s.stock[item.id] - (s.load[item.id] || 0)} at harbor · ${s.load[item.id] || 0} on boat</small></button>`).join("")}</div>`;
    a.bind("[data-island]", node => { s.island = Number(node.dataset.island); render(); });
    a.bind("[data-cargo]", node => { if (total(s.load) >= 3) { a.say("The boat holds three crates. Unload if you want to change the plan.", "try"); return; } const id = node.dataset.cargo; s.load[id] = (s.load[id] || 0) + 1; render(); });
    a.button("Sail to this island", () => {
      if (!total(s.load)) { a.say("Load a crate before you sail.", "try"); return; }
      if (Object.entries(s.load).some(([id,count]) => count > (remaining[s.island][id] || 0))) { a.say("This island did not ask for that load. Check its request and replan at the harbor.", "try"); return; }
      if (s.fuel < islands[s.island].fuel) { a.say("You need more fuel for this trip. Refill and try a new plan.", "try"); return; }
      const islandName = islands[s.island].name;
      Object.entries(s.load).forEach(([id,count]) => { s.stock[id] -= count; s.delivered[s.island][id] = (s.delivered[s.island][id] || 0) + count; });
      s.fuel -= islands[s.island].fuel; s.load = {}; render();
      if (total(s.stock) === 0) a.finish(`All nine crates arrived! You used ${12-s.fuel} fuel tokens by planning deliveries around each island's request.`, Math.min(100, 60 + Math.round(s.fuel / 6 * 40)));
      else a.say(`Delivery arrived at ${islandName}. Back at the harbor, ready for the next load.`, "good");
    });
    a.button("Unload the boat", () => { s.load = {}; render(); a.say("Crates are back at the harbor. Try a different load."); }, "secondary");
    a.button("Refill & replan", start, "secondary");
  }
  function pantry() {
    a.stage(`Picnic box ${s.packed + 1} of 3`); a.progress(s.packed, 3); a.score(s.packed / 3 * 100);
    const packedItems = pantryFoods.flatMap(item => Array(s.box[item.id] || 0).fill(item));
    a.board.innerHTML = `<p class="board-intro">One main + two fruit or vegetable portions. Use marked leftovers first.</p><div class="picnic-basket">${[0,1,2].map(index => `<div class="picnic-slot">${packedItems[index] ? `${iconSvg(packedItems[index].icon)}<b>${packedItems[index].name}</b>` : `<span>${index === 0 ? "A main" : "Fruit or veg"}</span>`}</div>`).join("")}</div><div class="cargo-shelf">${pantryFoods.map(item => `<button type="button" class="supply-card" data-food="${item.id}" data-focus="food-${item.id}" ${s.stock[item.id] - (s.box[item.id] || 0) <= 0 ? "disabled" : ""}>${iconSvg(item.icon)}<b>${item.name}</b><small>${s.stock[item.id] - (s.box[item.id] || 0)} left · ${item.group === "main" ? "main" : "fruit / veg"}</small>${item.leftover ? '<span class="leftover-tag">Use first</span>' : ""}</button>`).join("")}</div><p class="small-note">Pretend portions for play. An adult can help with real food, allergies, and preparation.</p>`;
    a.bind("[data-food]", node => { if (total(s.box) >= 3) { a.say("This box holds three portions. Empty it to try another mix.", "try"); return; } const id = node.dataset.food; s.box[id] = (s.box[id] || 0) + 1; render(); });
    a.button("Pack this picnic", () => {
      const main = pantryFoods.filter(item => item.group === "main").reduce((sum,item) => sum + (s.box[item.id] || 0), 0);
      const colors = total(s.box) - main;
      if (main !== 1 || colors !== 2) { a.say("Try one main and two fruit or vegetable portions.", "try"); return; }
      if (s.stock.bread > 0 && !s.box.bread) { a.say("Use the leftover bread first before choosing the beans.", "try"); return; }
      if ((s.box.carrot || 0) < Math.min(2, s.stock.carrot)) { a.say("Use the marked carrot leftovers first. They can fill the fruit or vegetable spaces.", "try"); return; }
      Object.entries(s.box).forEach(([id,count]) => { s.stock[id] -= count; }); s.box = {}; s.packed++; render();
      if (s.packed === 3) a.finish("Three colorful picnics packed, and the pantry is empty! You used leftovers before getting more food.", 100);
      else a.say("Picnic packed! Let's make the next box with what is still here.", "good");
    });
    a.button("Empty this box", () => { s.box = {}; render(); a.say("Your pretend food is back in the pantry."); }, "secondary");
  }
  function compass() {
    const clue = compassClues[s.level], landmark = landmarks[clue.landmark];
    const moves = [clue.east ? `${Math.abs(clue.east)} ${clue.east > 0 ? "east (right)" : "west (left)"}` : "", clue.south ? `${Math.abs(clue.south)} ${clue.south > 0 ? "south (down)" : "north (up)"}` : ""].filter(Boolean).join(", then ");
    a.stage(`Treasure ${s.level + 1} of 5`); a.progress(s.found.length, 5); a.score(s.found.length * 20);
    a.board.innerHTML = `<div class="map-clue"><span class="compass-rose" aria-hidden="true">N ↑<br>W ← ✦ → E<br>S ↓</span><p>Start at the <b>${landmark.name}</b>. Go <b>${moves}</b>. Tap the treasure tile.</p></div><div class="compass-grid">${Array.from({length:36}, (_,index) => {
      const place = landmarks.find(item => item.id === index), found = s.found.includes(index);
      return `<button type="button" class="map-tile ${place ? "landmark" : ""} ${found ? "found" : ""}" data-map="${index}" data-focus="map-${index}" ${s.passed ? "disabled" : ""} aria-label="Row ${Math.floor(index / 6) + 1}, column ${index % 6 + 1}${place ? `, ${place.name}` : ""}${found ? ", treasure found" : ""}">${place ? iconSvg(place.icon, "object-icon landmark-icon") : found ? iconSvg("coin") : '<span class="map-dot" aria-hidden="true"></span>'}${found && place ? iconSvg("coin", "treasure-marker") : ""}<small>${index + 1}</small></button>`;
    }).join("")}</div><div class="map-legend">${landmarks.map(item => `<span>${iconSvg(item.icon)} ${item.name}</span>`).join("")}</div>`;
    a.bind("[data-map]", node => {
      if (s.passed) return;
      const target = compassTarget(landmark, clue), selected = Number(node.dataset.map);
      if (selected !== target) { a.say(`Try again from the ${landmark.name}. Count one tile for each step in the clue.`, "try"); return; }
      s.found.push(target); s.passed = true; render(); a.say("Treasure found! Your directions led to the right tile.", "good"); a.tone(1);
    });
    if (s.passed) nextLevel(5, "Five treasures found! You used landmarks and compass directions to explain your route.");
  }
  function cipher() {
    const level = cipherLevels[s.level], message = level.encode ? level.word : encode(level.word, level.shift);
    a.stage(`Clubhouse message ${s.level + 1} of 5`); a.progress(s.level, 5); a.score(s.level * 20);
    a.board.innerHTML = `<div class="cipher-workshop"><div class="cipher-dial">${iconSvg("key")}<b>Shared key: ${level.shift}</b><span>Wheel now: ${s.shift}</span><div class="stepper"><button type="button" data-key="-1" data-focus="key-minus" aria-label="Turn key back">−</button><button type="button" data-key="1" data-focus="key-plus" aria-label="Turn key forward">+</button></div></div><div class="cipher-message"><span>${level.encode ? "Encode this message" : "Decode this message"}</span><strong>${message}</strong><p>${level.encode ? "Read from plain letters to code letters." : "Read from code letters back to plain letters."}</p></div></div><div class="cipher-key">${[...alphabet].map(letter => `<span><b>${letter}</b><i>↓</i><b>${encode(letter, s.shift)}</b></span>`).join("")}</div><div class="cipher-answer" aria-label="Your answer">${[0,1,2].map(index => `<span>${s.tokens[index] || "·"}</span>`).join("")}</div><div class="letter-keys">${[...alphabet].map(letter => `<button type="button" data-letter="${letter}" data-focus="letter-${letter}" ${s.passed ? "disabled" : ""}>${letter}</button>`).join("")}</div><p class="small-note">A toy code for exploring patterns. It cannot protect real secrets.</p>`;
    a.bind("[data-key]", node => { if (!s.passed) { s.shift = wrap(s.shift, Number(node.dataset.key)); render(); } });
    a.bind("[data-letter]", node => { if (s.tokens.length < 3) { s.tokens.push(node.dataset.letter); render(); } });
    if (s.passed) nextLevel(5, "Five clubhouse messages solved! A shared key helps you turn a pattern into meaning.");
    else {
      a.button("Check my message", () => {
        if (s.shift !== level.shift) { a.say(`Turn the wheel to the shared key ${level.shift} first.`, "try"); return; }
        const answer = level.encode ? encode(level.word, level.shift) : level.word;
        if (s.tokens.join("") !== answer) { a.say("Check one letter at a time using the key chart. Clear your answer and try again.", "try"); return; }
        s.passed = true; render(); a.say("Message solved! Your shared key worked.", "good");
      });
      a.button("Clear my answer", () => { s.tokens = []; render(); }, "secondary");
    }
  }
  function trade() {
    const level = tradeLevels[s.level], quantity = s.cart.reduce((sum,count,index) => sum + count * level.deals[index].quantity, 0), cost = s.cart.reduce((sum,count,index) => sum + count * (level.deals[index].price + level.deals[index].fee), 0);
    a.stage(`${level.name} · ${s.level + 1} of 3`); a.progress(s.level, 3);
    a.board.innerHTML = `<div class="expedition-stats">${a.chip("Need", level.need)}${a.chip("Budget", level.budget)}${a.chip("In basket", quantity)}${a.chip("Whole cost", cost)}</div><p class="board-intro">Compare the price for each item, then choose enough for the request. Every bundle's fee is included.</p><div class="market-stalls">${level.deals.map((deal,index) => `<article class="market-stall">${iconSvg(level.icon)}<h3>${deal.name}</h3><p>${deal.quantity} items · ${deal.price} coins${deal.fee ? ` + ${deal.fee} fee` : " · no fee"}</p><strong>${deal.price + deal.fee} coins total</strong><small>${((deal.price+deal.fee)/deal.quantity).toFixed(2)} per item, with fee</small><div class="stepper"><button type="button" data-shop="${index},-1" data-focus="shop-${index}-minus" aria-label="Return ${deal.name}" ${!s.cart[index] || s.passed ? "disabled" : ""}>−</button><b>${s.cart[index]}</b><button type="button" data-shop="${index},1" data-focus="shop-${index}-plus" aria-label="Add ${deal.name}" ${s.cart[index] >= 12 || s.passed ? "disabled" : ""}>+</button></div></article>`).join("")}</div>`;
    a.bind("[data-shop]", node => { const [index,delta] = node.dataset.shop.split(",").map(Number); s.cart[index] = Math.max(0,Math.min(12,s.cart[index]+delta)); render(); });
    if (s.passed) nextLevel(3, "You compared three whole deals, including delivery fees. Check how much you need before choosing a bigger pack.");
    else a.button("Check out", () => {
      if (quantity < level.need) { a.say(`You need ${level.need} items. Add enough to cover the request.`, "try"); return; }
      if (cost > level.budget) { a.say("That basket is over budget. Return a bundle and compare the whole deal again.", "try"); return; }
      const best = cheapestShop(level), quality = Math.round(best / cost * 100); s.quality.push(quality); s.passed = true; a.score(quality); render();
      a.say(cost === best ? "Great comparison! This basket meets the request for the lowest whole cost." : `Your basket fits! A ${best}-coin plan would also cover the request. Compare the unit prices next time.`, "good");
    });
  }
  function town() {
    const spent = s.plots.reduce((sum,id) => sum + (townParts.find(item => item.id === id)?.cost || 0), 0), needs = townNeeds(s.plots);
    const requests = ["Moss: a park in the shaded top row", "Pip: a reading hut in the quiet bottom row", "Tess: a step-free ramp beside the river, right column", "Bram: a bench directly beside the park"];
    a.stage("A woodland town for everyone"); a.progress(needs.filter(Boolean).length,4); a.score(needs.filter(Boolean).length*25);
    a.board.innerHTML = `<div class="expedition-stats">${a.chip("Builder tokens", 12-spent)}${a.chip("Neighbors included", `${needs.filter(Boolean).length}/4`)}</div><div class="neighbor-requests">${requests.map((request,index) => `<p class="${needs[index] ? "met" : ""}"><span aria-hidden="true">${needs[index] ? "✓" : "○"}</span> ${request}</p>`).join("")}</div><div class="tool-shelf">${townParts.map(item => tool(item,s.tool)).join("")}<button type="button" class="build-tool" data-tool="erase" data-focus="tool-erase" aria-pressed="${s.tool === "erase"}">Clear a plot<small>Return builder tokens</small></button></div><div class="town-map"><span class="town-shade">Top row: shade</span><div class="town-plots">${s.plots.map((id,index) => `<button type="button" class="town-plot ${id || "empty"}" data-plot="${index}" data-focus="plot-${index}" aria-label="Plot ${index+1}, ${index < 3 ? "shaded top" : "quiet bottom"} row${index%3===2 ? ", beside river" : ""}, ${townParts.find(item => item.id===id)?.name || "empty"}">${id ? iconSvg(townParts.find(item => item.id===id).icon) : iconSvg("seed")}<b>${townParts.find(item => item.id===id)?.name || "Build here"}</b><small>Plot ${index+1}${index%3===2 ? " · river side" : ""}</small></button>`).join("")}</div><span class="town-quiet">Bottom row: quiet corner</span></div>`;
    toolBindings();
    a.bind("[data-plot]", node => {
      const index = Number(node.dataset.plot), next = [...s.plots];
      if (s.tool !== "erase") { const previous = next.indexOf(s.tool); if (previous >= 0) next[previous] = null; }
      next[index] = s.tool === "erase" ? null : s.tool;
      const cost = next.reduce((sum,id) => sum + (townParts.find(item => item.id===id)?.cost || 0),0);
      if (cost > 12) { a.say("That plan needs more tokens. Clear a plot or move a building.", "try"); return; }
      s.plots = next; render();
    });
    a.button("Invite the neighbors", () => {
      if (!needs.every(Boolean)) { a.say("Some neighbors still need a change. Read their requests and move one building at a time.", "try"); return; }
      a.finish("All four neighbors feel included! You listened to different needs and changed the town to make room for everyone.",100);
    });
  }
  const painters = { bridge, pipes, harbor, pantry, compass, cipher, trade, town };
  function start() {
    s = { level: 0, quality: [], found: [], tool: "park", plots: Array(6).fill(null), stock: resetCount(world.mode === "pantry" ? pantryFoods : cargo), load: {}, delivered: islands.map(() => ({})), island: 0, fuel: 12, box: {}, packed: 0 };
    resetLevel(); render();
  }
  return { start };
}
