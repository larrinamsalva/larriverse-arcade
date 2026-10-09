import { bridgeParts, bridgeLevels, pipePaths, directions, harborLevels, cargo, pantryFoods, pantryChallenges, PANTRY_ROUND_SIZE, landmarks, compassClues, cipherLevels, tradeLevels, townParts, townLevels } from "./expedition-worlds.js";
import { alphabet, wrap, encode, compassTarget, checkTownLevel, traceWater, checkPantryBox, cheapestShop } from "./expedition-logic.js";
import {
  iconSvg,
  iconDrawing,
  bridgePartDrawing,
  bridgeCartSvg,
} from "./arcade-scenes.js";

export function createExpedition(world, a) {
  let s;
  const total = object => Object.values(object).reduce((sum, value) => sum + value, 0);
  const part = id => bridgeParts.find(item => item.id === id);
  const tool = (item, selected, disabled = false) => `<button type="button" class="build-tool ${selected === item.id ? "selected" : ""}" data-tool="${item.id}" data-focus="tool-${item.id}" aria-pressed="${selected === item.id}" ${disabled ? "disabled" : ""}>${item.capacity ? `<svg class="bridge-tool-art" viewBox="0 0 140 96" aria-hidden="true">${bridgePartDrawing(item.id)}</svg>` : iconSvg(item.icon || "wood")}<b>${a.esc(item.name)}</b><small>${item.cost} tokens${item.capacity ? ` · holds ${item.capacity}` : ""}</small></button>`;
  const rankNames = {
    bridge: ["Trail Builder", "Town Builder", "River Engineer", "Master Bridge Maker"],
    pipes: ["Flow Finder", "Pipe Planner", "Network Engineer", "Waterworks Master"],
    harbor: ["Dock Helper", "Route Planner", "Harbor Captain", "Community Admiral"],
    compass: ["Shore Scout", "Trail Finder", "Cove Navigator", "Master Navigator"],
    cipher: ["Code Rookie", "Pattern Solver", "Cipher Detective", "Code Master"],
    town: ["Kind Listener", "Neighborhood Helper", "Access Planner", "Council Champion"],
  };
  const rankName = () => (rankNames[world.mode] || ["Explorer"])[Math.min((rankNames[world.mode] || ["Explorer"]).length - 1, Math.floor(s.level / 5))];
  const advancement = count => {
    const done = s.level + (s.passed ? 1 : 0);
    return `<section class="adventure-advancement" data-rank="${a.esc(rankName())}" data-level="${s.level + 1}" aria-label="${a.esc(rankName())}, level ${s.level + 1} of ${count}"><span>${a.esc(rankName())}</span><b>Level ${s.level + 1} of ${count}</b><div class="adventure-rank-track" role="progressbar" aria-label="World advancement" aria-valuemin="0" aria-valuemax="${count}" aria-valuenow="${done}"><i style="width:${done / count * 100}%"></i></div></section>`;
  };
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
    if (world.mode === "harbor") s.load = {};
    if (world.mode === "cipher") Object.assign(s, { shift: 0, tokens: [] });
    if (world.mode === "trade") s.cart = [0,0,0];
    if (world.mode === "pantry") s.box = {};
    if (world.mode === "town") Object.assign(s, { plots: Array(6).fill(null), tool: "park" });
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
    a.stage(`${level.name} · ${s.level + 1} of ${bridgeLevels.length}`); a.progress(s.level + (s.passed ? 1 : 0), bridgeLevels.length); a.score((s.level + (s.passed ? 1 : 0)) / bridgeLevels.length * 100);
    a.board.innerHTML = `${advancement(bridgeLevels.length)}<div class="expedition-stats">${a.chip("Builder tokens", level.budget - spent)}${a.chip("Crossings", `${s.level + (s.passed ? 1 : 0)}/${bridgeLevels.length}`)}</div><p class="board-intro">Choose a support, then tap a span. Each span must hold the vehicle load shown above it.</p><div class="tool-shelf bridge-tool-shelf">${bridgeParts.map(item => tool(item, s.tool)).join("")}<button type="button" class="build-tool" data-tool="erase" data-focus="tool-erase" aria-pressed="${s.tool === "erase"}"><span class="erase-tool" aria-hidden="true"></span><b>Clear a span</b><small>Tokens return to you</small></button></div><div class="bridge-landscape bridge-crossing--${level.scene} ${s.passed ? "crossed" : ""}"><div class="bridge-scenery" aria-hidden="true"><span class="bridge-tree tree-left">${iconSvg("tree")}</span><span class="bridge-tree tree-right">${iconSvg("tree")}</span><span class="bridge-landmark">${iconSvg(level.landmark)}</span><span class="bridge-flowers flowers-left"></span><span class="bridge-flowers flowers-right"></span><span class="bridge-load-plaque"><b>${a.esc(level.name)}</b><small>${a.esc(level.cargo)}</small></span></div><div class="bridge-cart" aria-hidden="true">${bridgeCartSvg(level.vehicle)}</div><div class="bridge-abutment abutment-left" aria-hidden="true"></div><div class="bridge-abutment abutment-right" aria-hidden="true"></div><div class="bridge-piers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="bridge-spans">${s.parts.map((id, index) => `<button type="button" class="bridge-span ${id || "empty"} ${s.failed.includes(index) ? "weak" : ""}" data-span="${index}" data-focus="span-${index}" ${s.passed ? "disabled" : ""} aria-label="Span ${index + 1}, load ${level.loads[index]}, ${part(id)?.name || "empty"}"><span class="load-label">Load ${level.loads[index]}</span><svg class="bridge-structure" viewBox="0 0 140 96" aria-hidden="true">${bridgePartDrawing(id)}</svg><b>${part(id)?.name || "Add a support"}</b><small>${id ? `Holds ${part(id).capacity}` : "Choose a tool first"}</small></button>`).join("")}</div><div class="bridge-river" aria-hidden="true"><i></i><i></i><i></i></div></div>`;
    toolBindings();
    a.bind("[data-span]", node => {
      if (s.passed) return;
      const index = Number(node.dataset.span), next = s.tool === "erase" ? null : s.tool;
      const cost = spent - (part(s.parts[index])?.cost || 0) + (part(next)?.cost || 0);
      if (cost > level.budget) { a.say("That support needs more tokens. Clear or change another span first.", "try"); return; }
      s.parts[index] = next; s.failed = []; render();
    });
    if (s.passed) nextLevel(bridgeLevels.length, `You tested ${bridgeLevels.length} bridges and improved the supports. Testing a model helps you find weak spots before you build.`);
    else a.button("Test the crossing", () => {
      s.failed = s.parts.flatMap((id, index) => (part(id)?.capacity || 0) < level.loads[index] ? [index] : []);
      s.passed = s.failed.length === 0; render();
      a.say(s.passed ? "The cart crossed! Your supports held every load." : `The cart needs stronger support at span${s.failed.length > 1 ? "s" : ""} ${s.failed.map(index => index + 1).join(", ")}. Try changing those supports.`, s.passed ? "good" : "try");
      if (s.passed) a.tone(1);
    });
  }
  function pipes() {
    a.stage(`Water network ${s.level + 1} of ${pipePaths.length}`); a.progress(s.level + (s.passed ? 1 : 0), pipePaths.length); a.score((s.level + (s.passed ? 1 : 0)) / pipePaths.length * 100);
    const endpoint = [[50,5],[95,50],[50,95],[5,50]];
    a.board.innerHTML = `${advancement(pipePaths.length)}<p class="board-intro">Reservoir → pipe 11 → toy filter (pipe 13) → pipe 15 → town. Tap a pipe to turn it clockwise.</p><div class="pipe-labels"><span>${iconSvg("drop")} Reservoir, left</span><span>${iconSvg("hut")} Town, right</span></div><div class="pipe-grid">${s.cells.map((pair, index) => pair ? `<button type="button" class="pipe-tile ${index === 12 ? "filter" : ""} ${s.flow.includes(index) ? "flowing" : ""} ${s.leak === index ? "leak" : ""}" data-pipe="${index}" data-focus="pipe-${index}" ${s.passed ? "disabled" : ""} aria-label="Pipe ${index + 1}: ${pair.map(value => directions[value]).join(" and ")}${index === 12 ? "; toy filter" : ""}. Rotate clockwise."><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M${endpoint[pair[0]].join(" ")}L50 50 ${endpoint[pair[1]].join(" ")}" fill="none" stroke="#9cd1df" stroke-width="25" stroke-linejoin="round"/><path class="pipe-flow" d="M${endpoint[pair[0]].join(" ")}L50 50 ${endpoint[pair[1]].join(" ")}" fill="none" stroke="#e3f8ff" stroke-width="11" stroke-linejoin="round"/>${index === 12 ? '<circle cx="50" cy="50" r="20" fill="#d2baed"/><text x="50" y="58" text-anchor="middle" fill="#4e466d" font-size="23" font-weight="bold">F</text>' : ""}</svg><span class="tile-number">${index + 1}</span></button>` : `<div class="pipe-ground" aria-hidden="true">${iconSvg(index % 3 ? "seed" : "tree")}</div>`).join("")}</div><p class="small-note">F = toy filter. Real water safety needs real treatment and testing.</p>`;
    a.bind("[data-pipe]", node => { const index = Number(node.dataset.pipe); s.cells[index] = s.cells[index].map(value => (value + 1) % 4); s.flow = []; s.leak = -1; render(); });
    if (s.passed) nextLevel(pipePaths.length, `You connected ${pipePaths.length} water networks. Following the flow helped you find and fix each connection.`);
    else a.button("Send the water", () => { const flow = traceWater(s.cells); s.flow = flow.seen; s.leak = flow.ok ? -1 : flow.tile; s.passed = flow.ok; render(); a.say(flow.reason, flow.ok ? "good" : "try"); if (flow.ok) a.tone(1); });
  }
  function harbor() {
    const level = harborLevels[s.level];
    const cargoById = new Map(cargo.map(item => [item.id, item]));
    const request = Object.entries(level.needs).map(([id, count]) => `${count} ${cargoById.get(id).name.toLowerCase()}`).join(" · ");
    a.stage(`${level.name} · ${s.level + 1} of ${harborLevels.length}`); a.progress(s.level + (s.passed ? 1 : 0), harborLevels.length); a.score((s.level + (s.passed ? 1 : 0)) / harborLevels.length * 100);
    a.board.innerHTML = `${advancement(harborLevels.length)}<div class="expedition-stats">${a.chip("Route fuel", level.fuel)}${a.chip("Boat load", `${total(s.load)}/${level.capacity}`)}${a.chip("Deliveries", `${s.level + (s.passed ? 1 : 0)}/${harborLevels.length}`)}</div><div class="harbor-map harbor-route--${s.level + 1}" aria-hidden="true"><svg viewBox="0 0 620 190"><defs><linearGradient id="harbor-water" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b9edf0"/><stop offset="1" stop-color="#49b5ca"/></linearGradient></defs><rect width="620" height="190" rx="24" fill="url(#harbor-water)"/><circle cx="532" cy="42" r="24" fill="#ffe07a"/><path d="M0 128q100-28 200 0t200 0 220 0" stroke="#d9ffff" stroke-width="8" fill="none" opacity=".72"/><g transform="translate(405 35) scale(1.12)"><ellipse cx="50" cy="95" rx="82" ry="18" fill="#8fc98a"/>${iconDrawing(level.icon)}</g><g class="harbor-boat" transform="translate(105 85) scale(.8)">${iconDrawing("boat")}</g><path d="M194 139q88-42 190-24" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="10 12" opacity=".72"/></svg></div><article class="harbor-request-card"><p class="eyebrow">Island request</p><h2>${a.esc(level.name)}</h2><p>Load exactly <b>${a.esc(request)}</b>. The boat holds ${level.capacity} crates for this route.</p></article><div class="cargo-shelf">${cargo.map(item => `<button type="button" class="supply-card" data-cargo="${item.id}" data-focus="cargo-${item.id}" ${(s.load[item.id] || 0) >= item.count || s.passed ? "disabled" : ""}>${iconSvg(item.icon)}<b>${a.esc(item.name)}</b><small>${s.load[item.id] || 0} on boat · tap to load</small></button>`).join("")}</div>`;
    a.bind("[data-cargo]", node => {
      if (total(s.load) >= level.capacity) { a.say(`This boat holds ${level.capacity} crates. Unload if you want to change the plan.`, "try"); return; }
      const id = node.dataset.cargo; s.load[id] = (s.load[id] || 0) + 1; render();
    });
    if (s.passed) nextLevel(harborLevels.length, `You completed ${harborLevels.length} island deliveries and matched every community request. Listening before loading makes help more useful.`);
    else {
      a.button(`Sail to ${level.name}`, () => {
        if (!total(s.load)) { a.say("Load the requested crates before you sail.", "try"); return; }
        const cargoIds = new Set([...Object.keys(level.needs), ...Object.keys(s.load)]);
        if ([...cargoIds].some(id => (s.load[id] || 0) !== (level.needs[id] || 0))) { a.say("The load does not match the island request yet. Check every crate and replan at the harbor.", "try"); return; }
        s.passed = true; s.quality.push(100); render(); a.say(`Delivery arrived at ${level.name}! Every requested crate is aboard.`, "good"); a.tone(1);
      });
      a.button("Unload the boat", () => { s.load = {}; render(); a.say("The crates are back at the harbor. Try a different load."); }, "secondary");
    }
  }
  function pantry() {
    const challenge = s.pantryDeck[s.level];
    const availableFoods = pantryFoods.filter(item => challenge.stock[item.id]);
    const packedItems = pantryFoods.flatMap(item => Array(s.box[item.id] || 0).fill(item));
    const groupLabel = item => item.group === "main" ? "main" : item.group;
    const produceRule = challenge.produce
      ? `${challenge.produce.fruit} fruit · ${challenge.produce.vegetable} vegetable`
      : "2 fruits or vegetables";
    a.stage(`${challenge.name} · ${s.level + 1} of ${PANTRY_ROUND_SIZE}`);
    a.progress(s.level + (s.passed ? 1 : 0), PANTRY_ROUND_SIZE, `${s.level + (s.passed ? 1 : 0)} of ${PANTRY_ROUND_SIZE} picnic challenges solved`);
    a.score((s.level + (s.passed ? 1 : 0)) / PANTRY_ROUND_SIZE * 100);
    a.board.innerHTML = `<article class="pantry-challenge" data-pantry-challenge="${challenge.id}"><p class="eyebrow">From a 24-challenge pantry</p><h2>${a.esc(challenge.name)}</h2><p>${a.esc(challenge.prompt)}</p><div class="pantry-rules" aria-label="Picnic request"><span>1 main</span><span>${produceRule}</span>${challenge.differentProduce ? "<span>2 different produce choices</span>" : ""}<span>Use marked leftovers first</span></div></article><div class="picnic-basket">${[0,1,2].map(index => packedItems[index] ? `<button type="button" class="picnic-slot filled" data-unpack="${packedItems[index].id}" data-focus="packed-${index}" ${s.passed ? "disabled" : ""} aria-label="Remove ${a.esc(packedItems[index].name)} from the picnic box">${iconSvg(packedItems[index].icon)}<b>${a.esc(packedItems[index].name)}</b><small>Tap to put back</small></button>` : `<div class="picnic-slot"><span>${index === 0 ? "A main" : "Fruit or vegetable"}</span></div>`).join("")}</div><div class="cargo-shelf">${availableFoods.map(item => {
      const remaining = challenge.stock[item.id] - (s.box[item.id] || 0);
      const required = challenge.mustUse?.[item.id] || 0;
      return `<button type="button" class="supply-card" data-food="${item.id}" data-focus="food-${item.id}" ${remaining <= 0 || s.passed ? "disabled" : ""}>${iconSvg(item.icon)}<b>${a.esc(item.name)}</b><small>${remaining} available · ${groupLabel(item)}</small>${required ? `<span class="leftover-tag">Use first${required > 1 ? ` · ${required}` : ""}</span>` : ""}</button>`;
    }).join("")}</div><p class="small-note">Pretend portions for play. Ask an adult about allergies, real food preparation, and safe storage.</p>`;
    a.bind("[data-food]", node => {
      if (total(s.box) >= 3) { a.say("This box holds three portions. Put one back or clear the box to change your plan.", "try"); return; }
      const id = node.dataset.food;
      if ((s.box[id] || 0) >= challenge.stock[id]) return;
      s.box[id] = (s.box[id] || 0) + 1;
      render();
    });
    a.bind("[data-unpack]", node => {
      const id = node.dataset.unpack;
      s.box[id]--;
      if (!s.box[id]) delete s.box[id];
      render();
    });
    if (s.passed) {
      nextLevel(PANTRY_ROUND_SIZE, `You solved ${PANTRY_ROUND_SIZE} picnic challenges from a twenty-four-plan pantry. The next round rotates in new requests before any repeat.`);
    } else {
      a.button("Check this picnic", () => {
        const result = checkPantryBox(challenge, s.box, pantryFoods);
        if (!result.ok) { a.say(result.reason, "try"); return; }
        s.passed = true;
        s.quality.push(100);
        render();
        a.say(result.reason, "good");
        a.tone(1);
      });
      a.button("Clear my box", () => { s.box = {}; render(); a.say("Everything is back on the pretend shelf. Try a new plan."); }, "secondary");
    }
  }
  function compass() {
    const clue = compassClues[s.level], landmark = landmarks[clue.landmark];
    const moves = [clue.east ? `${Math.abs(clue.east)} ${clue.east > 0 ? "east (right)" : "west (left)"}` : "", clue.south ? `${Math.abs(clue.south)} ${clue.south > 0 ? "south (down)" : "north (up)"}` : ""].filter(Boolean).join(", then ");
    a.stage(`Treasure ${s.level + 1} of ${compassClues.length}`); a.progress(s.found.length, compassClues.length); a.score(s.found.length / compassClues.length * 100);
    a.board.innerHTML = `${advancement(compassClues.length)}<div class="map-clue"><span class="compass-rose" aria-hidden="true">N ↑<br>W ← ✦ → E<br>S ↓</span><p>Start at the <b>${landmark.name}</b>. Go <b>${moves}</b>. Tap the treasure tile.</p></div><div class="compass-grid">${Array.from({length:36}, (_,index) => {
      const place = landmarks.find(item => item.id === index), found = s.found.includes(index);
      return `<button type="button" class="map-tile ${place ? "landmark" : ""} ${found ? "found" : ""}" data-map="${index}" data-focus="map-${index}" ${s.passed ? "disabled" : ""} aria-label="Row ${Math.floor(index / 6) + 1}, column ${index % 6 + 1}${place ? `, ${place.name}` : ""}${found ? ", treasure found" : ""}">${place ? iconSvg(place.icon, "object-icon landmark-icon") : found ? iconSvg("coin") : '<span class="map-dot" aria-hidden="true"></span>'}${found && place ? iconSvg("coin", "treasure-marker") : ""}<small>${index + 1}</small></button>`;
    }).join("")}</div><div class="map-legend">${landmarks.map(item => `<span>${iconSvg(item.icon)} ${item.name}</span>`).join("")}</div>`;
    a.bind("[data-map]", node => {
      if (s.passed) return;
      const target = compassTarget(landmark, clue), selected = Number(node.dataset.map);
      if (selected !== target) { a.say(`Try again from the ${landmark.name}. Count one tile for each step in the clue.`, "try"); return; }
      s.found.push(target); s.passed = true; render(); a.say("Treasure found! Your directions led to the right tile.", "good"); a.tone(1);
    });
    if (s.passed) nextLevel(compassClues.length, `${compassClues.length} treasures found! You used landmarks and compass directions to explain your route.`);
  }
  function cipher() {
    const level = cipherLevels[s.level], message = level.encode ? level.word : encode(level.word, level.shift);
    a.stage(`Clubhouse message ${s.level + 1} of ${cipherLevels.length}`); a.progress(s.level + (s.passed ? 1 : 0), cipherLevels.length); a.score((s.level + (s.passed ? 1 : 0)) / cipherLevels.length * 100);
    a.board.innerHTML = `${advancement(cipherLevels.length)}<div class="cipher-workshop"><div class="cipher-dial">${iconSvg("key")}<b>Shared key: ${level.shift}</b><span>Wheel now: ${s.shift}</span><div class="stepper"><button type="button" data-key="-1" data-focus="key-minus" aria-label="Turn key back">−</button><button type="button" data-key="1" data-focus="key-plus" aria-label="Turn key forward">+</button></div></div><div class="cipher-message"><span>${level.encode ? "Encode this message" : "Decode this message"}</span><strong>${message}</strong><p>${level.encode ? "Read from plain letters to code letters." : "Read from code letters back to plain letters."}</p></div></div><div class="cipher-key">${[...alphabet].map(letter => `<span><b>${letter}</b><i>↓</i><b>${encode(letter, s.shift)}</b></span>`).join("")}</div><div class="cipher-answer" aria-label="Your answer">${Array.from({length:level.word.length}, (_, index) => `<span>${s.tokens[index] || "·"}</span>`).join("")}</div><div class="letter-keys">${[...alphabet].map(letter => `<button type="button" data-letter="${letter}" data-focus="letter-${letter}" ${s.passed ? "disabled" : ""}>${letter}</button>`).join("")}</div><p class="small-note">A toy code for exploring patterns. It cannot protect real secrets.</p>`;
    a.bind("[data-key]", node => { if (!s.passed) { s.shift = wrap(s.shift, Number(node.dataset.key)); render(); } });
    a.bind("[data-letter]", node => { if (s.tokens.length < level.word.length) { s.tokens.push(node.dataset.letter); render(); } });
    if (s.passed) nextLevel(cipherLevels.length, `${cipherLevels.length} clubhouse messages solved! A shared key helps you turn a pattern into meaning.`);
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
    a.stage(`${level.name} · ${s.level + 1} of ${tradeLevels.length}`); a.progress(s.level, tradeLevels.length);
    a.board.innerHTML = `<div class="expedition-stats">${a.chip("Need", level.need)}${a.chip("Budget", level.budget)}${a.chip("In basket", quantity)}${a.chip("Whole cost", cost)}</div><p class="board-intro">Compare the price for each item, then choose enough for the request. Every bundle's fee is included.</p><div class="market-stalls">${level.deals.map((deal,index) => `<article class="market-stall">${iconSvg(level.icon)}<h3>${deal.name}</h3><p>${deal.quantity} items · ${deal.price} coins${deal.fee ? ` + ${deal.fee} fee` : " · no fee"}</p><strong>${deal.price + deal.fee} coins total</strong><small>${((deal.price+deal.fee)/deal.quantity).toFixed(2)} per item, with fee</small><div class="stepper"><button type="button" data-shop="${index},-1" data-focus="shop-${index}-minus" aria-label="Return ${deal.name}" ${!s.cart[index] || s.passed ? "disabled" : ""}>−</button><b>${s.cart[index]}</b><button type="button" data-shop="${index},1" data-focus="shop-${index}-plus" aria-label="Add ${deal.name}" ${s.cart[index] >= 12 || s.passed ? "disabled" : ""}>+</button></div></article>`).join("")}</div>`;
    a.bind("[data-shop]", node => { const [index,delta] = node.dataset.shop.split(",").map(Number); s.cart[index] = Math.max(0,Math.min(12,s.cart[index]+delta)); render(); });
    if (s.passed) nextLevel(tradeLevels.length, `You compared ${tradeLevels.length} shopping challenges, including delivery fees. Check how much you need before choosing a bigger pack.`);
    else a.button("Check out", () => {
      if (quantity < level.need) { a.say(`You need ${level.need} items. Add enough to cover the request.`, "try"); return; }
      if (cost > level.budget) { a.say("That basket is over budget. Return a bundle and compare the whole deal again.", "try"); return; }
      const best = cheapestShop(level), quality = Math.round(best / cost * 100); s.quality.push(quality); s.passed = true; a.score(quality); render();
      a.say(cost === best ? "Great comparison! This basket meets the request for the lowest whole cost." : `Your basket fits! A ${best}-coin plan would also cover the request. Compare the unit prices next time.`, "good");
    });
  }
  function town() {
    const level = townLevels[s.level];
    const spent = s.plots.reduce((sum,id) => sum + (townParts.find(item => item.id === id)?.cost || 0), 0), needs = checkTownLevel(level, s.plots), included = needs.filter(Boolean).length;
    a.stage(`${level.name} · ${s.level + 1} of ${townLevels.length}`); a.progress(s.level + (s.passed ? 1 : 0), townLevels.length); a.score((s.level + (s.passed ? 1 : included / 4)) / townLevels.length * 100);
    a.board.innerHTML = `${advancement(townLevels.length)}<article class="town-challenge-card"><p class="eyebrow">Four neighbor requests</p><h2>${a.esc(level.name)}</h2><p>${a.esc(level.intro)}</p></article><div class="expedition-stats">${a.chip("Builder tokens", level.budget-spent)}${a.chip("Requests met", `${included}/4`)}${a.chip("Neighborhoods", `${s.level + (s.passed ? 1 : 0)}/${townLevels.length}`)}</div><div class="neighbor-requests">${level.requests.map((request,index) => `<p class="${needs[index] ? "met" : ""}"><span aria-hidden="true">${needs[index] ? "✓" : "○"}</span><b>${a.esc(request.neighbor)}</b><small>${a.esc(request.text)}</small></p>`).join("")}</div><div class="tool-shelf town-tool-shelf">${townParts.map(item => tool(item,s.tool,s.passed)).join("")}<button type="button" class="build-tool" data-tool="erase" data-focus="tool-erase" aria-pressed="${s.tool === "erase"}" ${s.passed ? "disabled" : ""}><span class="erase-tool" aria-hidden="true"></span><b>Clear a plot</b><small>Return builder tokens</small></button></div><div class="town-map"><span class="town-shade">Top row · plots 1–3 · shaded side</span><div class="town-plots">${s.plots.map((id,index) => `<button type="button" class="town-plot ${id || "empty"}" data-plot="${index}" data-focus="plot-${index}" ${s.passed ? "disabled" : ""} aria-label="Plot ${index+1}, ${index < 3 ? "shaded top" : "quiet bottom"} row, ${index%3===2 ? "river-side right" : index%3===1 ? "center" : "left trail"} column, ${townParts.find(item => item.id===id)?.name || "empty"}">${id ? iconSvg(townParts.find(item => item.id===id).icon) : iconSvg("seed")}<b>${townParts.find(item => item.id===id)?.name || "Build here"}</b><small>Plot ${index+1} · ${index%3===2 ? "river side" : index%3===1 ? "center" : "left trail"}</small></button>`).join("")}</div><span class="town-quiet">Bottom row · plots 4–6 · quiet side</span></div>`;
    if (!s.passed) toolBindings();
    a.bind("[data-plot]", node => {
      if (s.passed) return;
      const index = Number(node.dataset.plot), next = [...s.plots];
      if (s.tool !== "erase") { const previous = next.indexOf(s.tool); if (previous >= 0) next[previous] = null; }
      next[index] = s.tool === "erase" ? null : s.tool;
      const cost = next.reduce((sum,id) => sum + (townParts.find(item => item.id===id)?.cost || 0),0);
      if (cost > level.budget) { a.say("That plan needs more tokens. Clear a plot or move a building.", "try"); return; }
      s.plots = next; render();
    });
    if (s.passed) nextLevel(townLevels.length, "You completed twenty neighborhoods and listened to eighty different requests. Thoughtful design makes more room for everyone.");
    else a.button("Invite the neighbors", () => {
      if (!needs.every(Boolean)) { a.say("Some neighbors still need a change. Read each request and move one building at a time.", "try"); return; }
      s.passed = true; s.quality.push(100); render(); a.say(level.celebration, "good"); a.tone(1);
    });
  }
  const painters = { bridge, pipes, harbor, pantry, compass, cipher, trade, town };
  function start() {
    s = { level: 0, quality: [], found: [], tool: "park", plots: Array(6).fill(null), load: {}, box: {}, pantryDeck: world.mode === "pantry" ? a.challengeRound(pantryChallenges, PANTRY_ROUND_SIZE) : [] };
    resetLevel(); render();
  }
  return { start };
}
