import { bridgeParts, bridgeLevels, pipePaths, directions, harborLevels, cargo, pantryFoods, pantryChallenges, PANTRY_ROUND_SIZE, landmarks, compassClues, cipherLevels, tradeLevels, townParts, townLevels } from "./expedition-worlds.js";
import { alphabet, wrap, encode, compassTarget, checkTownLevel, traceWater, checkPantryBox, cheapestShop } from "./expedition-logic.js";
import {
  iconSvg,
  iconDrawing,
  bridgePartDrawing,
  bridgeCartSvg,
} from "./arcade-scenes.js";
import { bridgeMiniatureLandscape } from "./bridge-miniatures.js";

export function createExpedition(world, a) {
  let s;
  const TRADE_SAVE_KEY="larriverse.tradeTown.roadmap.v1";
  const PANTRY_SAVE_KEY="larriverse.pantryPicnic.sixty.v1";
  function tradeProgress(){
    try{
      const saved=JSON.parse(localStorage.getItem(TRADE_SAVE_KEY)||"null");
      if(saved&&Number.isInteger(saved.next)&&saved.next>=0&&saved.next<=tradeLevels.length&&
        Array.isArray(saved.quality)&&saved.quality.length===saved.next&&
        saved.quality.every(n=>Number.isFinite(n)&&n>=0&&n<=100))return saved;
    }catch{}
    return {next:0,quality:[]};
  }
  function saveTrade(next){
    try{localStorage.setItem(TRADE_SAVE_KEY,JSON.stringify({next,quality:s.quality}));}
    catch{a.say("This browser could not save this town's progress, but you can continue.","try");}
  }
  function pantryProgress() {
    try {
      const saved=JSON.parse(localStorage.getItem(PANTRY_SAVE_KEY)||"null");
      if(saved && Number.isInteger(saved.next) && saved.next>=0 &&
         saved.next<=pantryChallenges.length && typeof saved.rewarded==="boolean")
        return saved;
    } catch {}
    return {next:0,rewarded:false};
  }
  function savePantry(next,rewarded=false) {
    try { localStorage.setItem(PANTRY_SAVE_KEY,JSON.stringify({next,rewarded})); }
    catch { a.say("This browser could not save your picnic checkpoint, but you can keep playing.","try"); }
  }
  const total = object => Object.values(object).reduce((sum, value) => sum + value, 0);
  const part = id => bridgeParts.find(item => item.id === id);
  const tool = (item, selected, disabled = false) => `<button type="button" class="build-tool ${selected === item.id ? "selected" : ""}" data-tool="${item.id}" data-focus="tool-${item.id}" aria-pressed="${selected === item.id}" ${disabled ? "disabled" : ""}>${item.capacity ? `<svg class="bridge-tool-art" viewBox="0 0 140 96" aria-hidden="true">${bridgePartDrawing(item.id)}</svg>` : iconSvg(item.icon || "wood")}<b>${a.esc(item.name)}</b><small>${item.capacity ? `Holds load ${item.capacity}` : "Choose and place"}</small></button>`;
  const rankNames = {
    bridge: ["Trail Builder", "Town Builder", "River Engineer", "Bridge Maker", "Safe Support Planner", "Span Surveyor", "Reinforced Designer", "Load Tester", "Cargo Engineer", "Mountain Builder", "Summit Engineer", "Master Bridge Maker"],
    pipes: ["Flow Finder","Pipe Planner","Network Engineer","Waterworks Master","Bend Builder","Filter Tracker","Flow Explorer","Route Analyst","Water Connector","Flow Specialist","Pipeline Designer","Waterworks Champion","Flow Mapper","Filter Engineer","Pipeline Pathfinder","Waterworks Grandmaster"],
    harbor: ["Dock Helper","Route Planner","Harbor Captain","Community Admiral","Supply Scout","Island Planner","Resource Organizer","Cargo Navigator","Delivery Leader","Harbor Coordinator","Community Captain","Master Harbor Helper","Coastal Dispatcher","Fleet Planner","Harbor Strategist","Grand Harbor Captain"],
    compass: ["Shore Scout","Trail Finder","Cove Navigator","Master Navigator","Map Pathfinder","Direction Decoder","Landmark Tracker","Route Explorer","Island Cartographer","Wayfinding Expert","Map Strategist","Compass Champion"],
    cipher: ["Code Rookie","Pattern Solver","Cipher Detective","Code Master","Letter Explorer","Shift Specialist","Symbol Strategist","Word Decoder","Code Researcher","Pattern Architect","Message Mentor","Cipher Champion"],
    town: ["Kind Listener", "Neighborhood Helper", "Access Planner", "Council Champion", "Park Pathfinder", "Neighbor Advocate", "Inclusive Designer", "Access Engineer", "Community Planner", "Shared Space Leader", "Council Mentor", "Neighborhood Champion"],
    trade: ["Careful Shopper", "Market Helper", "Price Detective", "Budget Builder", "Bundle Checker", "Fee Finder", "Unit Price Pro", "Smart Saver", "Whole Cost Planner", "Deal Detective", "Community Buyer", "Market Master"],
    pantry: ["Picnic Helper","Snack Sorter","Produce Picker","Leftover Saver","Lunch Planner","Pantry Scout","Balanced Packer","Food Waste Fighter","Picnic Planner","Pantry Pro","Lunch Leader","Pantry Champion","Trail Lunch Planner","Picnic Organizer","Food Saver","Pantry Grandmaster"],
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
    if (world.mode === "compass") s.wrongMap = -1;
    if (world.mode === "cipher") Object.assign(s, { shift: 0, tokens: [] });
    if (world.mode === "trade") s.cart = [0,0,0];
    if (world.mode === "pantry") s.box = {};
    if (world.mode === "town") Object.assign(s, { plots: Array(6).fill(null), tool: "park" });
  }
  function nextLevel(count, message) {
    a.button(s.level === count - 1 ? "Celebrate my discoveries" : "Next challenge", () => {
      if (s.level === count - 1) {
        if(world.mode==="trade")saveTrade(count);
        const score = s.quality.length ? s.quality.reduce((sum, value) => sum + value, 0) / s.quality.length : 100;
        a.finish(message, score);
      } else { s.level++; if(world.mode==="trade")saveTrade(s.level); resetLevel(); render(); a.say("A new challenge! Try your plan and see what happens."); }
    });
  }
  function pantryCompleteScreen(rewarded) {
    const count=pantryChallenges.length;
    const chapters=Math.ceil(count/PANTRY_ROUND_SIZE);
    a.stage(`🏆 Pantry Picnic · All ${count} picnics packed`);
    a.board.innerHTML=`<section class="adventure-advancement" aria-label="All ${count} picnics complete"><span>Pantry Grandmaster</span><b>${count} of ${count} picnics</b><div class="adventure-rank-track" role="progressbar" aria-label="Pantry Picnic completion" aria-valuemin="0" aria-valuemax="${count}" aria-valuenow="${count}"><i style="width:100%"></i></div></section><article class="pantry-challenge"><p class="eyebrow">${chapters} chapters explored</p><h2>🥪 Your whole picnic journey is complete!</h2><p>All ${count} different food-planning challenges are packed. You can replay them whenever you choose.</p></article>`;
    a.progress(count,count,`${count} of ${count} picnics complete · Progress saved`);
    a.score(100);
    if(!rewarded) a.button("Celebrate my discoveries",()=> {
      savePantry(count,true);
      a.finish(`You planned all ${count} different picnics and practiced using leftovers, choosing produce, and packing sensible pretend portions.`,100);
    });
    a.button(`Replay all ${count} picnics`,()=>{
      if(!window.confirm(`Replay all ${count} picnic challenges from the beginning? This replaces your saved Pantry Picnic checkpoint.`))return;
      try {localStorage.removeItem(PANTRY_SAVE_KEY);} catch {}
      start();
    },"secondary");
  }
  function toolBindings() {
    a.bind("[data-tool]", node => { s.tool = node.dataset.tool; render(); });
  }
  function bridge() {
    const level = bridgeLevels[s.level];
    a.stage(`${level.name} · ${s.level + 1} of ${bridgeLevels.length}`); a.progress(s.level + (s.passed ? 1 : 0), bridgeLevels.length); a.score((s.level + (s.passed ? 1 : 0)) / bridgeLevels.length * 100);
    a.board.innerHTML = `${advancement(bridgeLevels.length)}<div class="expedition-stats">${a.chip("Supports placed", `${s.parts.filter(Boolean).length}/4`)}${a.chip("Crossings", `${s.level + (s.passed ? 1 : 0)}/${bridgeLevels.length}`)}</div><p class="board-intro">Choose any support, then tap a span. All materials are free and unlimited! Each span must hold the vehicle load shown above it. Test and improve your design.</p><div class="tool-shelf bridge-tool-shelf">${bridgeParts.map(item => tool(item, s.tool)).join("")}<button type="button" class="build-tool" data-tool="erase" data-focus="tool-erase" aria-pressed="${s.tool === "erase"}"><span class="erase-tool" aria-hidden="true"></span><b>Clear a span</b><small>Change or remove a support</small></button></div><div class="bridge-landscape bridge-crossing--${level.scene} ${s.passed ? "crossed" : ""}">${bridgeMiniatureLandscape(level.scene)}<div class="bridge-scenery" aria-hidden="true"><span class="bridge-tree tree-left">${iconSvg("tree")}</span><span class="bridge-tree tree-right">${iconSvg("tree")}</span><span class="bridge-landmark">${iconSvg(level.landmark)}</span><span class="bridge-flowers flowers-left"></span><span class="bridge-flowers flowers-right"></span><span class="bridge-load-plaque"><b>${a.esc(level.name)}</b><small>${a.esc(level.cargo)}</small></span></div><div class="bridge-cart" aria-hidden="true">${bridgeCartSvg(level.vehicle)}</div><div class="bridge-abutment abutment-left" aria-hidden="true"></div><div class="bridge-abutment abutment-right" aria-hidden="true"></div><div class="bridge-piers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="bridge-preview-deck" aria-hidden="true">${s.parts.map(id => `<i class="bridge-preview-segment ${id || "empty"}"></i>`).join("")}</div><div class="bridge-river" aria-hidden="true"><i></i><i></i><i></i></div></div><section class="bridge-build-panel" aria-label="Bridge span answer area"><div class="bridge-build-heading"><b>Build the four bridge spans</b><span>Choose a support above, then tap the span where you want to place it.</span></div><div class="bridge-spans">${s.parts.map((id, index) => `<button type="button" class="bridge-span ${id || "empty"} ${s.failed.includes(index) ? "weak" : ""}" data-span="${index}" data-focus="span-${index}" ${s.passed ? "disabled" : ""} aria-label="Span ${index + 1}, load ${level.loads[index]}, ${part(id)?.name || "empty"}"><span class="load-label">Load ${level.loads[index]}</span><svg class="bridge-structure" viewBox="0 0 140 96" aria-hidden="true">${bridgePartDrawing(id)}</svg><b>${part(id)?.name || "Add a support"}</b><small>${id ? `Holds ${part(id).capacity}` : "Choose a tool first"}</small></button>`).join("")}</div></section>`;
    toolBindings();
    a.bind("[data-span]", node => {
      if (s.passed) return;
      const index = Number(node.dataset.span), next = s.tool === "erase" ? null : s.tool;
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
    a.board.innerHTML = `${advancement(pipePaths.length)}<p class="board-intro">Connect the reservoir at pipe 11 to the town at pipe 15 through the toy filter at pipe 13. Tap pipes to rotate them clockwise; later routes have more bends.</p><div class="pipe-labels"><span>${iconSvg("drop")} Reservoir, left</span><span>${iconSvg("hut")} Town, right</span></div><div class="pipe-grid">${s.cells.map((pair, index) => pair ? `<button type="button" class="pipe-tile ${index === 12 ? "filter" : ""} ${s.flow.includes(index) ? "flowing" : ""} ${s.leak === index ? "leak" : ""}" data-pipe="${index}" data-focus="pipe-${index}" ${s.passed ? "disabled" : ""} aria-label="Pipe ${index + 1}: ${pair.map(value => directions[value]).join(" and ")}${index === 12 ? "; toy filter" : ""}. Rotate clockwise."><svg viewBox="0 0 100 100" aria-hidden="true"><path class="pipe-shadow" d="M${endpoint[pair[0]].join(" ")}L50 50 ${endpoint[pair[1]].join(" ")}" fill="none" stroke="#476b78" stroke-width="31" stroke-linejoin="round"/><path class="pipe-shell" d="M${endpoint[pair[0]].join(" ")}L50 50 ${endpoint[pair[1]].join(" ")}" fill="none" stroke="#9cd1df" stroke-width="25" stroke-linejoin="round"/><path class="pipe-highlight" d="M${endpoint[pair[0]].join(" ")}L50 50 ${endpoint[pair[1]].join(" ")}" fill="none" stroke="#d9f2f7" stroke-width="6" stroke-linejoin="round" opacity=".68"/><circle class="pipe-joint" cx="50" cy="50" r="14" fill="#86b6c3" stroke="#4d7480" stroke-width="3"/><path class="pipe-flow" d="M${endpoint[pair[0]].join(" ")}L50 50 ${endpoint[pair[1]].join(" ")}" fill="none" stroke="#e3f8ff" stroke-width="10" stroke-linejoin="round"/>${index === 12 ? '<circle class="pipe-filter-ring" cx="50" cy="50" r="22" fill="#d2baed" stroke="#735f96" stroke-width="4"/><circle cx="50" cy="50" r="13" fill="#efe7ff"/><text x="50" y="57" text-anchor="middle" fill="#4e466d" font-size="20" font-weight="bold">F</text>' : ""}</svg><span class="tile-number">${index + 1}</span></button>` : `<div class="pipe-ground" aria-hidden="true">${iconSvg(index % 3 ? "seed" : "tree")}</div>`).join("")}</div><p class="small-note">F = toy filter. Real water safety needs real treatment and testing.</p>`;
    a.bind("[data-pipe]", node => { const index = Number(node.dataset.pipe); s.cells[index] = s.cells[index].map(value => (value + 1) % 4); s.flow = []; s.leak = -1; render(); });
    if (s.passed) nextLevel(pipePaths.length, `You connected ${pipePaths.length} water networks. Following the flow helped you find and fix each connection.`);
    else a.button("Send the water", () => { const flow = traceWater(s.cells); s.flow = flow.seen; s.leak = flow.ok ? -1 : flow.tile; s.passed = flow.ok; render(); a.say(flow.reason, flow.ok ? "good" : "try"); if (flow.ok) a.tone(1); });
  }
  function harbor() {
    const level = harborLevels[s.level];
    const cargoById = new Map(cargo.map(item => [item.id, item]));
    const availableCargo = cargo.filter(item => s.level >= (item.unlockAt || 0));
    const request = Object.entries(level.needs).map(([id, count]) => `${count} ${cargoById.get(id).name.toLowerCase()}`).join(" · ");
    const loadEntries = Object.entries(s.load).flatMap(([id, count]) => Array.from({ length: count }, () => id));
    const transportScale = level.chapter <= 2 ? .76 : level.chapter <= 4 ? .92 : 1.02;
    const transportArt = level.vehicleIcon === "truck"
      ? `<g class="harbor-ferry harbor-ferry--3d" transform="translate(230 90) scale(.92)">${iconDrawing("boat")}</g><g class="harbor-truck harbor-truck--3d" transform="translate(74 87) scale(.78)">${iconDrawing("truck")}</g>`
      : `<g class="harbor-boat harbor-boat--3d harbor-boat--chapter-${level.chapter}" transform="translate(105 85) scale(${transportScale})">${iconDrawing("boat")}</g>`;
    a.stage(`${level.name} · Chapter ${level.chapter}/6 · ${s.level + 1} of ${harborLevels.length}`);
    a.progress(s.level + (s.passed ? 1 : 0), harborLevels.length);
    a.score((s.level + (s.passed ? 1 : 0)) / harborLevels.length * 100);
    a.board.innerHTML = `${advancement(harborLevels.length)}
      <div class="expedition-stats">
        ${a.chip("Route fuel", level.fuel)}
        ${a.chip("Transport", level.vehicle)}
        ${a.chip("Cargo load", `${total(s.load)}/${level.capacity}`)}
        ${a.chip("Deliveries", `${s.level + (s.passed ? 1 : 0)}/${harborLevels.length}`)}
      </div>
      <div class="harbor-map harbor-route--${s.level + 1} harbor-map--dimensional harbor-map--chapter-${level.chapter}" aria-hidden="true">
        <svg viewBox="0 0 620 190">
          <defs><linearGradient id="harbor-water" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b9edf0"/><stop offset="1" stop-color="#49b5ca"/></linearGradient></defs>
          <rect width="620" height="190" rx="24" fill="url(#harbor-water)"/>
          <circle cx="532" cy="42" r="24" fill="#ffe07a"/>
          <path d="M0 128q100-28 200 0t200 0 220 0" stroke="#d9ffff" stroke-width="8" fill="none" opacity=".72"/>
          ${level.vehicleIcon === "truck" ? '<path d="M0 108h205v82H0Z" fill="#a9c78e"/><path d="M0 135h208" stroke="#657277" stroke-width="24"/><path d="M0 135h208" stroke="#e8dfac" stroke-width="3" stroke-dasharray="15 12"/>' : ""}
          <g transform="translate(405 35) scale(1.12)"><ellipse cx="50" cy="95" rx="82" ry="18" fill="#8fc98a"/>${iconDrawing(level.icon)}</g>
          ${transportArt}
          <path d="M194 139q88-42 190-24" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="10 12" opacity=".72"/>
        </svg>
      </div>
      <article class="harbor-request-card">
        <p class="eyebrow">Island request · Chapter ${level.chapter} of ${Math.ceil(harborLevels.length / 10)}</p>
        <h2>${a.esc(level.name)}</h2>
        <p>Load exactly <b>${a.esc(request)}</b>. Your <b>${a.esc(level.vehicle)}</b> carries ${level.capacity} crates on this route.</p>
        ${level.purpose ? `<p class="small-note">${a.esc(level.purpose)}</p>` : ""}
      </article>
      <div class="harbor-cargo-shelf cargo-shelf">
        ${availableCargo.map(item => `<button type="button" class="supply-card harbor-cargo-card harbor-cargo-card--${item.id}" data-cargo="${item.id}" data-focus="cargo-${item.id}" ${(s.load[item.id] || 0) >= item.count || s.passed ? "disabled" : ""}>${iconSvg(item.icon)}<b>${a.esc(item.name)}</b><small>${s.load[item.id] || 0} loaded · tap to add</small></button>`).join("")}
      </div>
      <section class="harbor-manifest" aria-label="Loaded cargo">
        <div class="harbor-manifest-head"><b>Cargo manifest</b><span>${total(s.load)} of ${level.capacity} spaces filled</span></div>
        <div class="harbor-manifest-crates">
          ${loadEntries.length ? loadEntries.map((id, index) => `<button type="button" data-unload-cargo="${id}" aria-label="Unload one ${a.esc(cargoById.get(id).name)}"><span aria-hidden="true">${iconSvg(cargoById.get(id).icon)}</span><small>${a.esc(cargoById.get(id).name)}</small></button>`).join("") : '<p>Choose supplies above. Loaded crates will appear here.</p>'}
        </div>
      </section>`;
    a.bind("[data-cargo]", node => {
      if (total(s.load) >= level.capacity) {
        a.say(`Your ${level.vehicle.toLowerCase()} holds ${level.capacity} crates. Tap a loaded crate below to unload one, or clear the whole load.`, "try");
        return;
      }
      const id = node.dataset.cargo;
      s.load[id] = (s.load[id] || 0) + 1;
      render();
    });
    a.bind("[data-unload-cargo]", node => {
      if (s.passed) return;
      const id = node.dataset.unloadCargo;
      s.load[id]--;
      if (!s.load[id]) delete s.load[id];
      render();
      a.say("One crate is back on the dock. Keep planning your load.");
    });
    if (s.passed) nextLevel(harborLevels.length, `You completed ${harborLevels.length} island deliveries, grew from a small skiff to big harbor transport, and matched every community request.`);
    else {
      a.button(`Sail to ${level.name}`, () => {
        if (!total(s.load)) {
          a.say("Load the requested crates before you sail.", "try");
          return;
        }
        const cargoIds = new Set([...Object.keys(level.needs), ...Object.keys(s.load)]);
        if ([...cargoIds].some(id => (s.load[id] || 0) !== (level.needs[id] || 0))) {
          a.say("The load does not match the island request yet. Check every crate and replan at the harbor.", "try");
          return;
        }
        s.passed = true;
        s.quality.push(100);
        render();
        a.say(`Delivery arrived at ${level.name}! Every requested crate is aboard.`, "good");
        a.tone(1);
      });
      a.button("Unload the boat", () => {
        s.load = {};
        render();
        a.say("The crates are back at the harbor. Try a different load.");
      }, "secondary");
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
    const count=pantryChallenges.length, chapter=Math.floor(s.level/PANTRY_ROUND_SIZE)+1, chapterCount=Math.ceil(count/PANTRY_ROUND_SIZE);
    a.stage(`${challenge.name} · Picnic ${s.level+1} of ${count} · Chapter ${chapter}/${chapterCount}`);
    a.progress(s.level + (s.passed ? 1 : 0), count, `${s.level + (s.passed ? 1 : 0)} of ${count} picnics packed · Chapter ${chapter} of ${chapterCount}`);
    a.score((s.level + (s.passed ? 1 : 0)) / count * 100);
    a.board.innerHTML = `${advancement(count)}<p class="board-note">🥪 Chapter ${chapter} of ${chapterCount} · Ten different picnics per chapter · Your next challenge saves automatically.</p><article class="pantry-challenge" data-pantry-challenge="${challenge.id}"><p class="eyebrow">${a.esc(challenge.chapter || "Pantry classics")} · ${pantryChallenges.length} different challenges</p><h2>${a.esc(challenge.name)}</h2><p>${a.esc(challenge.prompt)}</p><div class="pantry-rules" aria-label="Picnic request"><span>1 main</span><span>${produceRule}</span>${challenge.differentProduce ? "<span>2 different produce choices</span>" : ""}<span>Use marked leftovers first</span></div></article><div class="picnic-basket">${[0,1,2].map(index => packedItems[index] ? `<button type="button" class="picnic-slot pantry-picnic-slot filled" data-unpack="${packedItems[index].id}" data-focus="packed-${index}" ${s.passed ? "disabled" : ""} aria-label="Remove ${a.esc(packedItems[index].name)} from the picnic box">${iconSvg(packedItems[index].icon)}<b>${a.esc(packedItems[index].name)}</b><small>Tap to put back</small></button>` : `<div class="picnic-slot pantry-picnic-slot pantry-picnic-slot--empty"><span>${index === 0 ? "A main" : "Fruit or vegetable"}</span></div>`).join("")}</div><div class="cargo-shelf">${availableFoods.map(item => {
      const remaining = challenge.stock[item.id] - (s.box[item.id] || 0);
      const required = challenge.mustUse?.[item.id] || 0;
      return `<button type="button" class="supply-card pantry-food-card pantry-food-card--${item.id}" data-food="${item.id}" data-focus="food-${item.id}" ${remaining <= 0 || s.passed ? "disabled" : ""}>${iconSvg(item.icon)}<b>${a.esc(item.name)}</b><small>${remaining} available · ${groupLabel(item)}</small>${required ? `<span class="leftover-tag">Use first${required > 1 ? ` · ${required}` : ""}</span>` : ""}</button>`;
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
      a.button(s.level===pantryChallenges.length-1 ? "Celebrate my discoveries" : "Next picnic",()=>{
        if(s.level===pantryChallenges.length-1){
          savePantry(pantryChallenges.length,true);
          a.finish(`You completed all ${pantryChallenges.length} different picnics, from leftovers and fruit choices to balanced pretend portions.`,100);
        } else {
          s.level++;
          resetLevel();
          render();
          a.say(s.level%PANTRY_ROUND_SIZE===0
            ? `Chapter ${Math.floor(s.level/PANTRY_ROUND_SIZE)+1} unlocked! Ten fresh picnic challenges ahead.`
            : "Next picnic ready! Check the ingredients and choose your three portions.");
        }
      });
    } else {
      a.button("Check this picnic", () => {
        const result = checkPantryBox(challenge, s.box, pantryFoods);
        if (!result.ok) { a.say(result.reason, "try"); return; }
        s.passed = true;
        s.quality.push(100);
        savePantry(s.level+1,false);
        render();
        a.say(result.reason, "good");
        a.tone(1);
      });
      a.button("Clear my box", () => { s.box = {}; render(); a.say("Everything is back on the pretend shelf. Try a new plan."); }, "secondary");
    }
  }
  function compass() {
    const clue = compassClues[s.level], landmark = landmarks[clue.landmark];
    const steps = clue.steps || [];
    const directionName = step => step.east > 0 ? ["East", "right"] : step.east < 0 ? ["West", "left"] : step.south > 0 ? ["South", "down"] : ["North", "up"];
    const routeList = steps.map((step,index) => {
      const [name,screen] = directionName(step);
      return `<li><span>${index + 1}</span><div><b>${name}</b><small>Move 1 tile ${screen}</small></div></li>`;
    }).join("");
    a.stage(`Treasure ${s.level + 1} of ${compassClues.length} · Chapter ${clue.chapter}/6`);
    a.progress(s.found.length, compassClues.length);
    a.score(s.found.length / compassClues.length * 100);
    a.board.innerHTML = `${advancement(compassClues.length)}
      <div class="expedition-stats">
        ${a.chip("Direction steps", steps.length)}
        ${a.chip("Treasures found", `${s.found.length}/${compassClues.length}`)}
      </div>
      <div class="map-clue compass-clue-card compass-clue-card--steps">
        <span class="compass-rose compass-rose--3d" aria-hidden="true">N ↑<br>W ← ✦ → E<br>S ↓</span>
        <div class="compass-route-copy">
          <p class="eyebrow">Start at the ${a.esc(landmark.name)}</p>
          <h2>Follow each numbered step in order</h2>
          <p>Move one map tile for every step. Later treasure routes have more turns, so take them one at a time.</p>
          <ol class="compass-direction-list">${routeList}</ol>
        </div>
      </div>
      <p class="compass-gentle-note">Picked the wrong square? Nothing is erased. The red marker only shows your last try; use <b>Clear my try</b> and keep the same treasure clue.</p>
      <div class="compass-grid compass-grid--island">${Array.from({length:36}, (_,index) => {
        const place = landmarks.find(item => item.id === index), found = s.found.includes(index), wrong = s.wrongMap === index;
        return `<button type="button" class="map-tile compass-map-tile ${place ? "landmark" : ""} ${found ? "found" : ""} ${wrong ? "wrong-pick" : ""}" data-map="${index}" data-focus="map-${index}" ${s.passed ? "disabled" : ""} aria-label="Row ${Math.floor(index / 6) + 1}, column ${index % 6 + 1}${place ? `, ${place.name}` : ""}${found ? ", treasure found" : ""}${wrong ? ", not the treasure yet" : ""}">${place ? iconSvg(place.icon, "object-icon landmark-icon") : found ? iconSvg("coin") : '<span class="map-dot" aria-hidden="true"></span>'}${found && place ? iconSvg("coin", "treasure-marker") : ""}${wrong ? '<span class="compass-wrong-marker" aria-hidden="true">×</span>' : ""}<small>${index + 1}</small></button>`;
      }).join("")}</div>
      <div class="map-legend compass-map-legend">${landmarks.map(item => `<span>${iconSvg(item.icon)} ${item.name}</span>`).join("")}</div>`;
    a.bind("[data-map]", node => {
      if (s.passed) return;
      const target = compassTarget(landmark, clue), selected = Number(node.dataset.map);
      if (selected !== target) {
        s.wrongMap = selected;
        render();
        a.say(`Not here yet — nothing was lost. Go back to the ${landmark.name} and follow Step 1, Step 2, and each direction in order.`, "try");
        return;
      }
      s.wrongMap = -1;
      s.found.push(target);
      s.passed = true;
      render();
      a.say(`Treasure found! You followed all ${steps.length} direction steps in order.`, "good");
      a.tone(1);
    });
    if (s.passed) nextLevel(compassClues.length, `${compassClues.length} treasures found! You grew from short landmark clues into longer turn-by-turn compass routes.`);
  }
  function cipher() {
    const level = cipherLevels[s.level], message = level.encode ? level.word : encode(level.word, level.shift);
    a.stage(`Clubhouse message ${s.level + 1} of ${cipherLevels.length}`); a.progress(s.level + (s.passed ? 1 : 0), cipherLevels.length); a.score((s.level + (s.passed ? 1 : 0)) / cipherLevels.length * 100);
    a.board.innerHTML = `${advancement(cipherLevels.length)}<div class="cipher-workshop cipher-workshop--3d"><div class="cipher-dial cipher-dial--3d">${iconSvg("key")}<b>Shared key: ${level.shift}</b><span>Wheel now: ${s.shift}</span><div class="stepper"><button type="button" data-key="-1" data-focus="key-minus" aria-label="Turn key back">−</button><button type="button" data-key="1" data-focus="key-plus" aria-label="Turn key forward">+</button></div></div><div class="cipher-message cipher-message--panel"><span>${level.encode ? "Encode this message" : "Decode this message"}</span><strong>${message}</strong><p>${level.encode ? "Read from plain letters to code letters." : "Read from code letters back to plain letters."}</p>${level.clue ? `<p class="cipher-word-clue"><b>Word meaning:</b> ${a.esc(level.clue)}</p>` : ""}</div></div><div class="cipher-key cipher-key--tiles">${[...alphabet].map(letter => `<span><b>${letter}</b><i>↓</i><b>${encode(letter, s.shift)}</b></span>`).join("")}</div><div class="cipher-answer cipher-answer--slots" aria-label="Your answer">${Array.from({length:level.word.length}, (_, index) => `<span>${s.tokens[index] || "·"}</span>`).join("")}</div><div class="letter-keys cipher-letter-keys">${[...alphabet].map(letter => `<button type="button" data-letter="${letter}" data-focus="letter-${letter}" ${s.passed ? "disabled" : ""}>${letter}</button>`).join("")}</div><p class="small-note">A toy code for exploring patterns. It cannot protect real secrets.</p>`;
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
    a.board.innerHTML = `${advancement(tradeLevels.length)}<p class="board-note">Market district ${Math.floor(s.level/10)+1} of 6 · Each district includes ten different requests. The next shop saves your progress on this device.</p><div class="expedition-stats">${a.chip("Need", level.need)}${a.chip("Budget", level.budget)}${a.chip("In basket", quantity)}${a.chip("Whole cost", cost)}</div><p class="board-intro">${a.esc(level.tip || "Compare the price for each item, then choose enough for the request. Every bundle’s fee is included.")}</p><div class="market-stalls trade-market-stalls">${level.deals.map((deal,index) => `<article class="market-stall trade-market-stall trade-market-stall--${index+1}">${iconSvg(level.icon)}<h3>${deal.name}</h3><p>${deal.quantity} items · ${deal.price} coins${deal.fee ? ` + ${deal.fee} fee` : " · no fee"}</p><strong>${deal.price + deal.fee} coins total</strong><small>${((deal.price+deal.fee)/deal.quantity).toFixed(2)} per item, with fee</small><div class="stepper trade-quantity-stepper"><button type="button" data-shop="${index},-1" data-focus="shop-${index}-minus" aria-label="Return ${deal.name}" ${!s.cart[index] || s.passed ? "disabled" : ""}>−</button><b>${s.cart[index]}</b><button type="button" data-shop="${index},1" data-focus="shop-${index}-plus" aria-label="Add ${deal.name}" ${s.cart[index] >= 12 || s.passed ? "disabled" : ""}>+</button></div></article>`).join("")}</div>`;
    a.bind("[data-shop]", node => { const [index,delta] = node.dataset.shop.split(",").map(Number); s.cart[index] = Math.max(0,Math.min(12,s.cart[index]+delta)); render(); });
    a.button("Restart all market districts",()=>{
      if(!window.confirm("Restart all 60 Trade Town challenges from the first market?"))return;
      try{localStorage.removeItem(TRADE_SAVE_KEY)}catch{}
      start();
    },"secondary");
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
    a.board.innerHTML = `${advancement(townLevels.length)}<article class="town-challenge-card critter-challenge-card"><p class="eyebrow">Four neighbor requests</p><h2>${a.esc(level.name)}</h2><p>${a.esc(level.intro)}</p></article><div class="expedition-stats">${a.chip("Builder tokens", level.budget-spent)}${a.chip("Requests met", `${included}/4`)}${a.chip("Neighborhoods", `${s.level + (s.passed ? 1 : 0)}/${townLevels.length}`)}</div><div class="neighbor-requests critter-neighbor-requests">${level.requests.map((request,index) => `<p class="critter-request ${needs[index] ? "met" : ""}"><span aria-hidden="true">${needs[index] ? "✓" : "○"}</span><b>${a.esc(request.neighbor)}</b><small>${a.esc(request.text)}</small></p>`).join("")}</div><div class="tool-shelf town-tool-shelf critter-tool-shelf">${townParts.map(item => tool(item,s.tool,s.passed)).join("")}<button type="button" class="build-tool" data-tool="erase" data-focus="tool-erase" aria-pressed="${s.tool === "erase"}" ${s.passed ? "disabled" : ""}><span class="erase-tool" aria-hidden="true"></span><b>Clear a plot</b><small>Return builder tokens</small></button></div><div class="town-map critter-town-map"><span class="town-shade">Top row · plots 1–3 · shaded side</span><div class="town-plots">${s.plots.map((id,index) => `<button type="button" class="town-plot critter-town-plot ${id || "empty"}" data-plot="${index}" data-focus="plot-${index}" ${s.passed ? "disabled" : ""} aria-label="Plot ${index+1}, ${index < 3 ? "shaded top" : "quiet bottom"} row, ${index%3===2 ? "river-side right" : index%3===1 ? "center" : "left trail"} column, ${townParts.find(item => item.id===id)?.name || "empty"}">${id ? iconSvg(townParts.find(item => item.id===id).icon) : iconSvg("seed")}<b>${townParts.find(item => item.id===id)?.name || "Build here"}</b><small>Plot ${index+1} · ${index%3===2 ? "river side" : index%3===1 ? "center" : "left trail"}</small></button>`).join("")}</div><span class="town-quiet">Bottom row · plots 4–6 · quiet side</span></div>`;
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
    if (s.passed) nextLevel(townLevels.length, "You completed sixty neighborhoods and listened to 240 different requests. Thoughtful design makes more room for everyone.");
    else a.button("Invite the neighbors", () => {
      if (!needs.every(Boolean)) { a.say("Some neighbors still need a change. Read each request and move one building at a time.", "try"); return; }
      s.passed = true; s.quality.push(100); render(); a.say(level.celebration, "good"); a.tone(1);
    });
  }
  const painters = { bridge, pipes, harbor, pantry, compass, cipher, trade, town };
  function start() {
    const prior=world.mode==="trade"?tradeProgress():{next:0,quality:[]};
    s = { level: prior.next, quality: prior.quality, found: [], tool: "park", plots: Array(6).fill(null), load: {}, box: {}, pantryDeck: world.mode === "pantry" ? pantryChallenges : [] };
    if(world.mode==="pantry") {
      const saved=pantryProgress();
      s.level=saved.next;
      s.quality=Array(saved.next).fill(100);
      if(saved.next===pantryChallenges.length){
        pantryCompleteScreen(saved.rewarded);
        return;
      }
    }
    if(world.mode==="trade"&&s.level===tradeLevels.length){
      a.stage("Trade Town · Six districts completed");
      a.board.innerHTML='<div class="message-card"><div class="message-copy"><h2 class="board-title">🏆 All 60 markets explored!</h2><p>You completed six different market districts. Play again to revisit every real shopping decision.</p></div></div>';
      a.progress(60,60,"60 of 60 shopping challenges");
      a.score(Math.round(s.quality.reduce((total,n)=>total+n,0)/60));
      a.button("Replay all 60 markets",()=>{
        try{localStorage.removeItem(TRADE_SAVE_KEY)}catch{}
        start();
      });
      return;
    }
    resetLevel();render();

  }
  function clearTry() {
    if (world.mode !== "compass" || !s) return;
    s.wrongMap = -1;
    render();
    a.say("Cleared just that try. Your treasure progress and current clue are still here.");
  }
  return { start, clearTry };
}
