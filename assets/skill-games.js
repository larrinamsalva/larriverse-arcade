import {
  worlds,
  messages,
  conversations,
  newsCards,
  repairs,
  sorting,
  trafficQuestions,
  robotLevels,
} from "./skill-worlds.js";
import { createExpedition } from "./expedition-games.js";
import {
  mountScene,
  iconSvg,
  lemonadeStandSvg,
  musicStudioSvg,
  trafficSignSvg,
} from "./arcade-scenes.js";
const world = worlds.find((item) => item.id === document.body.dataset.world);
const sdk = window.LarriVerseArcade;
const $ = (id) => document.getElementById(id);
const board = $("gameBoard");
const actions = $("gameActions");
const feedback = $("feedback");
const finishDialog = $("finishDialog");
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const challengeKey = (item) => item.id || item.text || item.name || item.title;
const shuffle = (values) => {
  const list = [...values];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};
function challengeRound(pool, count) {
  const target = Math.min(count, pool.length);
  const storageKey = "larriverse.challengeRotation." + world.id + ".v1";
  let seen = [];
  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) || "[]");
    if (Array.isArray(stored)) seen = stored.filter((value) => typeof value === "string");
  } catch {}
  let unseen = pool.filter((item) => !seen.includes(challengeKey(item)));
  if (unseen.length < target) {
    seen = [];
    unseen = [...pool];
  }
  const picked = shuffle(unseen).slice(0, target);
  try {
    sessionStorage.setItem(storageKey, JSON.stringify([...seen, ...picked.map(challengeKey)]));
  } catch {}
  return picked;
}
const chip = (label, value) =>
  `<span class="stat-chip">${esc(label)}<b>${esc(value)}</b></span>`;
let state = {};
let finished = false;
let score = 0;
let sound = false;
let audioContext;
let playTimer;
let activeStep = -1;
let running = false;
let hint = world.take;

$("skillLabel").textContent = world.skill;
$("worldDescription").textContent = world.desc;
$("worldMeta").textContent = `Ages ${world.age} · about ${world.minutes}`;
$("missionIcon").textContent = world.icon;
if (world.mode === "bridge") $("missionIcon").innerHTML = iconSvg("wood");
$("missionTitle").textContent = world.skill;
$("missionText").textContent = world.mission;
$("takeaway").textContent = world.take;

function say(text, kind = "info") {
  feedback.textContent = text;
  feedback.className = `feedback ${kind}`;
  if (kind === "good" || kind === "try") {
    window.dispatchEvent(new CustomEvent("larriverse:bloom-message", {
      detail: {
        gameId: world.id,
        pose: kind === "good" ? "cheer" : "thinking",
        message: kind === "good" ? text : `Nice try! Every mistake teaches us something. ${text}`,
      },
    }));
  }
}
function updateScore(value) {
  score = Math.max(0, Math.min(100, Math.round(value)));
  $("runScore").textContent = score;
}
function progress(done, total, label) {
  $("progressBar").style.width = `${Math.min(100, (done / total) * 100)}%`;
  $("progressText").textContent = label || `${done} of ${total} explored`;
}
function button(text, action, style = "primary", disabled = false) {
  const node = document.createElement("button");
  node.type = "button";
  node.className = style;
  node.textContent = text;
  node.disabled = disabled;
  node.addEventListener("click", action);
  actions.append(node);
  return node;
}
function bind(selector, handler) {
  board.querySelectorAll(selector).forEach((node) =>
    node.addEventListener("click", (event) => {
      if (!finished) handler(node, event);
    }),
  );
}
function stage(text) {
  $("stageLabel").textContent = text;
  actions.replaceChildren();
}
function refreshBest() {
  const game = sdk.summary().games[world.id];
  $("bestScore").textContent = game ? game.highScore : "—";
}
function tone(track = 0) {
  if (!sound || document.hidden) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended")
      audioContext.resume().catch(() => {});
    const oscillator = audioContext.createOscillator(),
      gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type =
      track === 0 ? "sine" : track === 1 ? "triangle" : "square";
    oscillator.frequency.setValueAtTime([130, 420, 850][track], now);
    oscillator.frequency.exponentialRampToValueAtTime(
      [45, 210, 600][track],
      now + 0.1,
    );
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  } catch {
    sound = false;
    $("soundToggle").textContent = "Sound unavailable";
    $("soundToggle").setAttribute("aria-pressed", "false");
  }
}
function stopMusic() {
  clearInterval(playTimer);
  playTimer = null;
  activeStep = -1;
  running = false;
  if (world.mode === "music") paintMusic();
}
function finish(message, finalScore = score) {
  if (finished) return;
  finished = true;
  updateScore(finalScore);
  stopMusic();
  progress(1, 1, "Adventure explored");
  $("finishMessage").textContent = message;
  $("finishScore").textContent = score;
  $("finishTitle").textContent =
    score >= 75
      ? "Curiosity looks good on you!"
      : "Every try teaches you something.";
  const xp = 18 + Math.round(score * 0.3),
    kc = 3;
  try {
    sdk.award(world.id, {
      xp,
      kc,
      score,
      completed: true,
      metrics: { practiceRuns: 1, activitiesCompleted: 1 },
    });
    $("rewardMessage").textContent =
      `+${xp} XP · +${kc} pretend KC · progress saved`;
    refreshBest();
  } catch {
    $("rewardMessage").textContent =
      "Your browser could not save this round. You can still keep playing.";
  }
  finishDialog.showModal();
  window.dispatchEvent(new CustomEvent("larriverse:bloom-message", {
    detail: {
      gameId: world.id,
      pose: "celebrate",
      message: `WOW! You did it! ${message}`,
    },
  }));
}
function initialize() {
  stopMusic();
  if (finishDialog.open) finishDialog.close();
  finished = false;
  score = 0;
  running = false;
  $("runScore").textContent = "0";
  $("hintText").hidden = true;
  state = { step: 0, correct: 0 };
  feedback.className = "feedback";
  say("Take your time. Try things and see what happens.");
  hint = world.take;
  progress(0, 1, "Ready to explore");
  refreshBest();
  switch (world.mode) {
    case "budget":
      state.selected = new Set();
      renderBudget();
      break;
    case "messages":
      state.deck = challengeRound(messages, 6);
      renderCards("messages");
      break;
    case "conversation":
      state.deck = challengeRound(conversations, 6);
      renderCards("conversation");
      break;
    case "news":
      state.deck = challengeRound(newsCards, 6);
      renderCards("news");
      break;
    case "repair":
      state.deck = challengeRound(repairs, 8);
      state.order = shuffle([0, 1, 2, 3]);
      state.position = 0;
      renderRepair();
      break;
    case "route":
      state.player = 20;
      state.moves = 0;
      state.flags = new Set();
      state.visited = new Set([20]);
      renderRoute();
      break;
    case "garden":
      state.plots = Array.from({ length: 6 }, () => ({
        plant: null,
        growth: 0,
      }));
      state.tool = "carrot";
      state.water = 12;
      state.day = 0;
      state.watered = new Set();
      renderGarden();
      break;
    case "energy":
      state.build = { solar: 0, wind: 0, battery: 0 };
      state.day = 0;
      state.stored = 0;
      state.ledger = [];
      state.started = false;
      renderEnergy();
      break;
    case "sorting":
      state.deck = challengeRound(sorting, 6);
      renderCards("sorting");
      break;
    case "traffic":
      state.deck = challengeRound(trafficQuestions, 10);
      renderCards("traffic");
      break;
    case "robot":
      state.level = 0;
      state.commands = [];
      state.player = robotLevels[0].start;
      state.dir = robotLevels[0].dir;
      state.trail = [robotLevels[0].start];
      state.levelStars = Array(robotLevels.length).fill(0);
      state.activeCommand = -1;
      state.reached = false;
      renderRobot();
      break;
    case "market":
      state.cash = 14;
      state.day = 0;
      state.ledger = [];
      state.stock = 6;
      state.price = 3;
      renderMarket();
      break;
    case "music":
      state.tracks = Array.from({ length: 3 }, () => Array(16).fill(false));
      state.bpm = 100;
      renderMusic();
      break;
    default:
      expedition?.start();
  }
}

const supplies = [
  { name: "Drinking water", icon: "💧", cost: 4, need: true },
  { name: "Picnic lunch", icon: "🥪", cost: 5, need: true },
  { name: "Bus pass", icon: "🚌", cost: 3, need: true },
  { name: "A little kite", icon: "🪁", cost: 5, need: false },
  { name: "Island stickers", icon: "⭐", cost: 2, need: false },
  { name: "Giant toy boat", icon: "⛵", cost: 9, need: false },
];
function budgetLeft() {
  return (
    24 -
    [...state.selected].reduce(
      (total, index) => total + supplies[index].cost,
      0,
    )
  );
}
function renderBudget() {
  stage("Island picnic planner");
  const left = budgetLeft();
  const needs = [...state.selected].filter(
    (index) => supplies[index].need,
  ).length;
  board.innerHTML = `<h2 class="board-title">Pack your picnic</h2><p class="board-note">Tap to buy. Tap a packed item to put it back. Save at least 6 coins.</p><div class="stat-row">${chip("Coins left", left)}${chip("Needs packed", `${needs}/3`)}${chip("Savings goal", "6 coins")}</div><div class="item-grid">${supplies.map((item, i) => `<button class="item-button ${state.selected.has(i) ? "selected" : ""}" data-buy="${i}" aria-pressed="${state.selected.has(i)}"><span class="item-icon">${item.icon}</span>${item.name}<small>${item.cost} coins · ${item.need ? "Picnic need" : "Extra fun"}${state.selected.has(i) ? " · Packed" : ""}</small></button>`).join("")}</div>`;
  bind("[data-buy]", (node) => {
    const i = Number(node.dataset.buy);
    if (state.selected.has(i)) {
      state.selected.delete(i);
      say("Item returned. Your coins are back in your plan.");
    } else if (supplies[i].cost > budgetLeft()) {
      say(
        "That is more than you have left. Try returning another item.",
        "try",
      );
      return;
    } else {
      state.selected.add(i);
      tone();
      say(`${supplies[i].name} packed. Check your savings, too.`);
    }
    renderBudget();
  });
  progress(needs, 3, `${needs} of 3 picnic needs packed`);
  updateScore(needs * 20 + (left >= 6 ? 40 : 0));
  button("Try my plan", () => {
    if (needs < 3) {
      say(
        "Your picnic still needs water, lunch, and a bus pass. Pack those first.",
        "try",
      );
      return;
    }
    if (left < 6) {
      say(
        "Your telescope fund needs 6 coins. Return an extra and try again.",
        "try",
      );
      return;
    }
    finish(
      `You covered all three needs and saved ${left} coins. You chose what matters to you.`,
      100,
    );
  });
  hint =
    "Water + lunch + bus pass cost 12 coins. The kite is fun, but you still need 6 coins left after any extras.";
}

function renderCards(mode) {
  const deck = state.deck,
    item = deck[state.step];
  state.answered = false;
  stage(
    `${mode === "sorting" ? "Toy Town cleanup" : mode === "news" ? "Tiny news desk" : mode === "conversation" ? "Treehouse crew" : mode === "traffic" ? "Traffic Town road school" : "Clubhouse inbox"} · ${state.step + 1}/${deck.length}`,
  );
  const labels =
    mode === "messages"
      ? ["Read it", "Check another way", "Block & tell an adult"]
      : mode === "conversation" || mode === "traffic"
        ? item.options
        : mode === "news"
          ? ["Evidence", "Opinion", "Advertisement", "Needs checking"]
          : ["Reuse", "Recycle", "Compost", "Trash"];
  const title =
    mode === "messages"
      ? item.from
      : mode === "conversation" || mode === "traffic"
        ? item.title
        : mode === "sorting"
          ? item.name
          : "Check before you share";
  const text =
    mode === "sorting"
      ? "Where should this object go under Toy Town rules?"
      : item.text;
  const actual = mode === "sorting" ? item.bin : item.answer;
  const display = shuffle(labels.map((label, index) => ({ label, index })));
  const messageArt = mode === "traffic"
    ? trafficSignSvg(item.title)
    : `<span class="message-icon" aria-hidden="true">${item.icon}</span>`;
  board.innerHTML = `<div class="message-card ${mode === "traffic" ? "traffic-message" : ""}">${messageArt}<div class="message-copy"><h2 class="board-title">${esc(title)}</h2><p>${esc(text)}</p></div></div><div class="choice-grid ${mode === "news" || mode === "sorting" ? "news-bins" : ""}">${display.map((choice) => `<button class="choice-button" data-answer="${choice.index}">${esc(choice.label)}</button>`).join("")}</div>${mode === "sorting" ? '<p class="board-note" style="margin-top:1rem">Toy Town accepts clean paper, cardboard, and metal cans. Fruit scraps go to compost.</p>' : ""}`;
  progress(state.step, deck.length);
  bind("[data-answer]", (node) => {
    if (state.answered) return;
    state.answered = true;
    const good = Number(node.dataset.answer) === actual;
    if (good) {
      state.correct++;
      tone();
    }
    node.classList.add(good ? "correct" : "wrong");
    board.querySelectorAll("[data-answer]").forEach((option) => {
      option.disabled = true;
      if (Number(option.dataset.answer) === actual)
        option.classList.add("correct");
    });
    say(
      `${good ? "Nice thinking!" : "Here is a useful clue:"} ${item.why}`,
      good ? "good" : "try",
    );
    updateScore((state.correct / deck.length) * 100);
    progress(state.step + 1, deck.length);
    const next = button(
      state.step === deck.length - 1 ? "See what I learned" : "Next discovery",
      () => {
        state.step++;
        if (state.step === deck.length) {
          finish(
            `You explored ${deck.length} situations and found ${state.correct} strong first choices. Each explanation is a new tool for next time.`,
          );
        } else {
          renderCards(mode);
          say("Look closely, then choose what you think.");
        }
      },
    );
    next.focus({ preventScroll: true });
  });
  hint =
    mode === "messages"
      ? "Watch for urgency, secrets, prizes, and unfamiliar links. Check a surprising message through a route you already know."
      : mode === "conversation"
        ? "Listen first. Be clear about your boundary. Ask for help when someone keeps hurting others."
        : mode === "news"
          ? "Evidence is something you can check. An opinion is a preference. An ad tries to sell. Missing sources need a closer look."
          : mode === "traffic"
            ? "Use the sign shape, color, symbol, and words together. Ask what the sign wants road users to notice or do."
          : "Try reuse first for things that still work. For this town: clean paper/cardboard/metal recycle; fruit scraps compost; ceramics/tissues go in trash.";
}

function renderRepair() {
  const item = state.deck[state.step];
  stage(`Repair ${state.step + 1} of ${state.deck.length}`);
  board.innerHTML = `<div class="message-card"><span class="message-icon">${item.icon}</span><h2 class="board-title">${esc(item.title)}</h2><p>Choose the next step. Done steps stay at the top.</p></div><div class="repair-list" style="margin-top:1rem">${Array.from({ length: state.position }, (_, i) => `<div class="repair-step done">✓ ${i + 1}. ${esc(item.steps[i])}</div>`).join("")}${state.order
    .filter((i) => i >= state.position)
    .map(
      (i) =>
        `<button class="repair-step" data-repair="${i}">${esc(item.steps[i])}</button>`,
    )
    .join("")}</div>`;
  progress(state.step * 4 + state.position, state.deck.length * 4);
  updateScore(((state.step * 4 + state.position) / (state.deck.length * 4)) * 100);
  bind("[data-repair]", (node) => {
    const i = Number(node.dataset.repair);
    if (i !== state.position) {
      say(
        "That step comes later. Look for a step that helps you understand or prepare first.",
        "try",
      );
      return;
    }
    state.position++;
    tone();
    say("Good order. Build on what you just found.", "good");
    renderRepair();
  });
  if (state.position === 4)
    button(state.step === state.deck.length - 1 ? "See my repairs" : "Next repair", () => {
      state.step++;
      if (state.step === state.deck.length) {
        finish(
          `You inspected, chose safe materials, repaired, and tested ${state.deck.length} different objects from a twenty-scenario repair bank. Each one got another chance.`,
          100,
        );
      } else {
        state.position = 0;
        state.order = shuffle([0, 1, 2, 3]);
        renderRepair();
        say("A new object, the same useful repair habits.");
      }
    });
  hint = item.hint;
}

const routeRocks = new Set([6, 7, 8, 16, 17, 18]);
const routeFlags = [10, 2, 14];
function adjacent(a, b) {
  return (
    Math.abs(Math.floor(a / 5) - Math.floor(b / 5)) +
      Math.abs((a % 5) - (b % 5)) ===
    1
  );
}
function renderRoute() {
  stage("Three flags. One picnic.");
  board.innerHTML = `<div class="stat-row">${chip("Steps left", 18 - state.moves)}${chip("Flags found", `${state.flags.size}/3`)}</div><div class="route-legend"><span>🧑 You</span><span>🚩 Mission</span><span>🧺 Finish</span></div><div class="tile-grid" aria-label="Park route grid">${Array.from(
    { length: 25 },
    (_, i) => {
      const rock = routeRocks.has(i),
        flag = routeFlags.includes(i),
        player = i === state.player;
      return `<button class="tile ${rock ? "rock" : ""} ${player ? "player" : ""} ${flag ? "flag" : ""} ${state.visited.has(i) ? "visited" : ""}" data-tile="${i}" aria-label="Row ${Math.floor(i / 5) + 1}, column ${(i % 5) + 1}, ${player ? "your position" : rock ? "rock" : flag ? (state.flags.has(i) ? "flag collected" : "mission flag") : i === 4 ? "picnic finish" : "path"}" ${rock || player ? "disabled" : ""}>${player ? "🧑" : rock ? "🪨" : flag ? (state.flags.has(i) ? "✓" : "🚩") : i === 4 ? "🧺" : "·"}</button>`;
    },
  ).join("")}</div>`;
  bind("[data-tile]", (node) => moveRoute(Number(node.dataset.tile)));
  progress(state.flags.size, 3, `${state.flags.size} of 3 flags found`);
  updateScore(state.flags.size * 25);
  hint =
    "Walk up the left side, across the top to the flag, then around the right side for the last flag. Backtracking uses steps, too.";
  if (state.moves >= 18) button("Try a new route", initialize);
}
function moveRoute(next) {
  if (finished || state.moves >= 18) return;
  if (
    next < 0 ||
    next >= 25 ||
    routeRocks.has(next) ||
    !adjacent(state.player, next)
  ) {
    say("Choose a nearby path tile: one step up, down, left, or right.", "try");
    return;
  }
  state.player = next;
  state.moves++;
  state.visited.add(next);
  if (routeFlags.includes(next)) state.flags.add(next);
  tone();
  renderRoute();
  if (next === 4 && state.flags.size === 3) {
    finish(
      `You visited every flag and reached the picnic in ${state.moves} steps. A route is a plan you can test.`,
      Math.min(100, 115 - state.moves),
    );
    return;
  }
  if (state.moves >= 18)
    say(
      "Your 18-step plan ran out. Start again and try fewer detours. The rocks do not move.",
      "try",
    );
  else
    say(
      next === 4
        ? "Visit all three flags before finishing at the picnic."
        : `You have ${18 - state.moves} steps left. Look ahead to your next flag.`,
    );
}

const plants = {
  carrot: { icon: "🥕", name: "Carrot" },
  bean: { icon: "🫘", name: "Bean" },
  flower: { icon: "🌼", name: "Flower" },
};
function renderGarden() {
  stage(
    `Garden care · ${state.day === 0 ? "Planting day" : `Day ${state.day} of 3`}`,
  );
  board.innerHTML = `<div class="stat-row">${chip("Water drops", state.water)}${chip("Ready plants", state.plots.filter((p) => p.growth >= 2).length)}${chip("Plant types", new Set(state.plots.map((p) => p.plant).filter(Boolean)).size)}</div><p class="board-note">${state.day === 0 ? "Choose a plant, then tap a plot. Mix all three types." : "Tap a plant to water it once today. Each plant needs two watered days to grow."}</p>${
    state.day === 0
      ? `<div class="plant-picker">${Object.entries(plants)
          .map(
            ([id, plant]) =>
              `<button data-plant="${id}" class="${state.tool === id ? "selected" : ""}" aria-pressed="${state.tool === id}">${plant.icon} ${plant.name}</button>`,
          )
          .join("")}</div>`
      : ""
  }<div class="garden-grid">${state.plots.map((plot, i) => `<button class="plot ${state.watered.has(i) ? "selected" : ""}" data-plot="${i}" aria-label="Plot ${i + 1}, ${plot.plant ? plants[plot.plant].name : "empty"}, growth ${plot.growth} of 2">${plot.plant ? (plot.growth >= 2 ? plants[plot.plant].icon : "🌱") : "+"}<small>${plot.plant ? `${plants[plot.plant].name} · ${plot.growth}/2` : "Tap to plant"}</small></button>`).join("")}</div>`;
  bind("[data-plant]", (node) => {
    state.tool = node.dataset.plant;
    renderGarden();
  });
  bind("[data-plot]", (node) => {
    const i = Number(node.dataset.plot),
      plot = state.plots[i];
    if (state.day === 0) {
      plot.plant = state.tool;
      say(`${plants[state.tool].name} planted. Try different kinds, too.`);
    } else {
      if (state.watered.has(i)) {
        say("This plot already had water today. Try another plot.");
        return;
      }
      if (plot.growth >= 2) {
        say("That plant is ready. Save water for one that still needs it.");
        return;
      }
      if (state.water <= 0) {
        say(
          "You used your water budget. Finish the day and see your garden.",
          "try",
        );
        return;
      }
      plot.growth++;
      state.water--;
      state.watered.add(i);
      tone();
      say("One water drop used. Your plant is growing.", "good");
    }
    renderGarden();
  });
  progress(state.day, 3, `${state.day} of 3 growing days`);
  button(
    state.day === 0
      ? "Start growing"
      : state.day === 3
        ? "Visit my garden"
        : "Next day",
    () => {
      if (state.plots.some((p) => !p.plant)) {
        say("Plant all six plots before starting your growing days.", "try");
        return;
      }
      if (state.day === 3) {
        const grown = state.plots.filter((p) => p.growth >= 2).length,
          types = new Set(state.plots.map((p) => p.plant)).size;
        finish(
          `${grown} of 6 plants grew. Your garden has ${types} plant types. Flowers help make room for pollinators in our pretend garden.`,
          grown * 12 + types * 9,
        );
        return;
      }
      state.day++;
      state.watered.clear();
      renderGarden();
      say(`Day ${state.day}: choose which plants need your water.`);
    },
  );
  updateScore(
    state.plots.filter((p) => p.growth >= 2).length * 12 +
      new Set(state.plots.map((p) => p.plant).filter(Boolean)).size * 9,
  );
  hint =
    "Six plants need two watered days each: 12 drops total. Plant a mix, then water every plot on two different days.";
}

const weather = [
  { name: "Sunny", icon: "☀️", solar: 3, wind: 1 },
  { name: "Cloudy", icon: "☁️", solar: 1, wind: 2 },
  { name: "Night", icon: "🌙", solar: 0, wind: 2 },
  { name: "Breezy", icon: "🌬️", solar: 2, wind: 2 },
];
const buildCosts = { solar: 2, wind: 3, battery: 2 };
function builderLeft() {
  return (
    12 -
    Object.entries(state.build).reduce(
      (sum, [type, count]) => sum + count * buildCosts[type],
      0,
    )
  );
}
function renderEnergy() {
  stage("Keep the island glowing");
  board.innerHTML = `<p class="board-note">Every day needs 6 energy units. A battery holds 4. Toy model: weather and costs are simplified.</p><div class="weather-preview">${weather.map((day, i) => `<div><strong>${day.icon}</strong>${day.name}<br>Solar ${day.solar} · Wind ${day.wind}${state.day > i ? " · Done" : ""}</div>`).join("")}</div><div class="stat-row">${chip("Builder tokens", builderLeft())}${chip("Stored energy", `${state.stored}/${state.build.battery * 4}`)}${chip("Days supplied", `${state.correct}/4`)}</div><div class="item-grid">${["solar", "wind", "battery"].map((type, i) => `<button class="item-button" data-build="${type}" ${state.started ? "disabled" : ""}><span class="item-icon">${["☀️", "🌬️", "🔋"][i]}</span>${["Solar panel", "Wind turbine", "Battery"][i]}<small>${buildCosts[type]} tokens · Built ${state.build[type]}</small></button>`).join("")}</div><div class="energy-scene" aria-label="Island energy mix"><span>🏡</span><span>${"☀️".repeat(state.build.solar) || "▫️"}</span><span>${"🌬️".repeat(state.build.wind) || "▫️"}</span><span>🔋 ${state.stored}</span></div>${state.ledger.length ? `<table class="ledger"><caption>Your energy log</caption><thead><tr><th>Day</th><th>Made</th><th>Stored after</th><th>Lights</th></tr></thead><tbody>${state.ledger.map((entry) => `<tr><td>${entry.name}</td><td>${entry.made}</td><td>${entry.stored}</td><td>${entry.ok ? "Glowing" : "Needs more"}</td></tr>`).join("")}</tbody></table>` : ""}`;
  bind("[data-build]", (node) => {
    const type = node.dataset.build;
    if (builderLeft() < buildCosts[type]) {
      say(
        "You need more builder tokens. Clear the build to try a different mix.",
        "try",
      );
      return;
    }
    state.build[type]++;
    tone();
    renderEnergy();
    say("Look at the weather. Your mix needs to work at night, too.");
  });
  progress(state.day, 4);
  updateScore(state.correct * 25);
  button(
    state.day === 4
      ? "See my island"
      : state.started
        ? `Run ${weather[state.day].name.toLowerCase()} day`
        : "Test my power mix",
    () => {
      if (state.day === 4) {
        finish(
          `Your mix supplied all 6 units on ${state.correct} of 4 days. Check the log to see when storage helped.`,
          state.correct * 25,
        );
        return;
      }
      if (!state.build.solar && !state.build.wind) {
        say("Build at least one energy source before testing.", "try");
        return;
      }
      state.started = true;
      const day = weather[state.day],
        made = day.solar * state.build.solar + day.wind * state.build.wind;
      const available = made + state.stored,
        ok = available >= 6;
      state.stored = Math.min(
        state.build.battery * 4,
        Math.max(0, available - 6),
      );
      if (ok) state.correct++;
      state.ledger.push({ name: day.name, made, stored: state.stored, ok });
      state.day++;
      renderEnergy();
      say(
        ok
          ? `${day.name}: the lights stayed on. ${state.stored} units are stored for later.`
          : `${day.name}: you were ${6 - available} units short. Try a mix with surplus and storage next round.`,
        ok ? "good" : "try",
      );
    },
  );
  if (!state.started)
    button(
      "Clear build",
      () => {
        state.build = { solar: 0, wind: 0, battery: 0 };
        renderEnergy();
        say("A fresh plan. Look at all four days before building.");
      },
      "secondary",
    );
  hint =
    "Try 2 solar panels, 2 wind turbines, and 1 battery. A sunny-day surplus can help your island get through the night.";
}

function roverStarTotal() {
  return state.levelStars.reduce((total, stars) => total + stars, 0);
}
function roverStarsFor(commandsUsed, par) {
  return commandsUsed <= par ? 3 : commandsUsed <= par + 2 ? 2 : 1;
}
function renderRobot() {
  const level = robotLevels[state.level];
  const directions = ["↑ North", "→ East", "↓ South", "← West"];
  const trail = new Set(state.trail || [level.start]);
  const currentStars = state.levelStars[state.level] || 0;
  stage(`Robot world ${state.level + 1} of ${robotLevels.length} · ${level.name}`);
  board.innerHTML = `<div class="stat-row rover-stats">${chip("Facing", directions[state.dir])}${chip("World", `${state.level + 1}/${robotLevels.length}`)}${chip("3-star target", `${level.par} cmds`)}${chip("Stars earned", `${roverStarTotal()}/${robotLevels.length * 3}`)}</div><p class="board-note rover-lesson"><strong>Forward moves Rover in the direction it is facing.</strong> Left and Right turn Rover in place. The dotted trail shows where it has traveled.</p><div class="tile-grid rover-grid" aria-label="Robot path grid">${Array.from({ length: 25 }, (_, i) => {
    const rock = level.rocks.includes(i);
    const player = i === state.player;
    const goal = i === level.goal;
    const visited = trail.has(i) && !player;
    const label = player
      ? `rover facing ${directions[state.dir].slice(2)}`
      : goal
        ? "goal star"
        : rock
          ? "rock"
          : visited
            ? "visited path"
            : "path";
      const art = player
        ? `${iconSvg("robot", "rover-token")}<small>${["↑", "→", "↓", "←"][state.dir]}</small>`
        : goal
          ? iconSvg("star", "rover-goal")
          : rock
            ? iconSvg("rock", "rover-rock")
            : visited
              ? '<span class="rover-trail-dot" aria-hidden="true"></span>'
              : '<span class="rover-path-dot" aria-hidden="true"></span>';
      return `<div class="tile rover ${rock ? "rock" : ""} ${player ? "player" : ""} ${visited ? "trail" : ""} ${goal ? "goal" : ""}" aria-label="Row ${Math.floor(i / 5) + 1}, column ${(i % 5) + 1}: ${label}">${art}</div>`;
  }).join("")}</div><div class="rover-efficiency"><strong>${esc(level.name)}</strong><span>Target: ${level.par} commands for ⭐⭐⭐</span>${currentStars ? `<span class="rover-stars" aria-label="${currentStars} efficiency stars">${"⭐".repeat(currentStars)}${"☆".repeat(3 - currentStars)}</span>` : "<span>Reach the star to earn 1–3 efficiency stars.</span>"}</div><div class="command-bar" aria-label="Add rover commands"><button class="secondary" data-command="F" ${running || state.reached ? "disabled" : ""}>↑ Forward</button><button class="secondary" data-command="L" ${running || state.reached ? "disabled" : ""}>↶ Turn left</button><button class="secondary" data-command="R" ${running || state.reached ? "disabled" : ""}>↷ Turn right</button></div><div class="command-list" aria-label="Your command list">${state.commands.length ? state.commands.map((cmd, i) => `<button class="${i === state.activeCommand ? "active-command" : ""}" data-remove="${i}" aria-label="Remove command ${i + 1}: ${cmd === "F" ? "forward" : cmd === "L" ? "left turn" : "right turn"}" ${i === state.activeCommand ? 'aria-current="step"' : ""} ${running || state.reached ? "disabled" : ""}><small>${i + 1}</small>${cmd === "F" ? "↑" : cmd === "L" ? "↶" : "↷"}</button>`).join("") : '<span class="board-note" style="margin:0">Your program goes here (up to 32 commands).</span>'}</div>`;
  bind("[data-command]", (node) => {
    if (running || state.reached) return;
    if (state.commands.length >= 32) {
      say(
        "Your program has 32 commands. Remove a command before adding another.",
        "try",
      );
      return;
    }
    state.commands.push(node.dataset.command);
    renderRobot();
  });
  bind("[data-remove]", (node) => {
    if (!running && !state.reached) {
      state.commands.splice(Number(node.dataset.remove), 1);
      renderRobot();
    }
  });
  button("Run my code", runRobot, "primary", running || state.reached || !state.commands.length);
  button(
    "Clear code",
    () => {
      state.commands = [];
      state.player = level.start;
      state.dir = level.dir;
      state.trail = [level.start];
      state.activeCommand = -1;
      state.reached = false;
      renderRobot();
      say("Program cleared. Rover is back at the start, facing its original direction.");
    },
    "secondary",
    running || state.reached,
  );
  if (state.reached)
    button(state.level === robotLevels.length - 1 ? "See my rover" : "Next world", () => {
      if (state.level === robotLevels.length - 1) {
        const totalStars = roverStarTotal();
        const finalScore = Math.round((totalStars / (robotLevels.length * 3)) * 100);
        finish(
          `You sequenced, tested, and improved programs in ${robotLevels.length} rover worlds and earned ${totalStars} of ${robotLevels.length * 3} efficiency stars.`,
          finalScore,
        );
        return;
      }
      state.level++;
      state.commands = [];
      state.reached = false;
      state.activeCommand = -1;
      state.player = robotLevels[state.level].start;
      state.dir = robotLevels[state.level].dir;
      state.trail = [state.player];
      renderRobot();
      say(`Welcome to ${robotLevels[state.level].name}. Check Rover's facing direction before you build the next program.`);
    });
  const completed = state.level + (state.reached ? 1 : 0);
  progress(completed, robotLevels.length, `${completed} of ${robotLevels.length} rover worlds solved`);
  updateScore(Math.round((roverStarTotal() / (robotLevels.length * 3)) * 100));
  hint = level.hint;
}
async function runRobot() {
  if (running || finished || state.reached) return;
  const level = robotLevels[state.level];
  const program = [...state.commands];
  const session = state;
  running = true;
  state.reached = false;
  state.activeCommand = -1;
  state.player = level.start;
  state.dir = level.dir;
  state.trail = [level.start];
  renderRobot();
  for (let i = 0; i < program.length; i++) {
    if (session !== state || finished) return;
    const cmd = program[i];
    state.activeCommand = i;
    if (cmd === "L") state.dir = (state.dir + 3) % 4;
    else if (cmd === "R") state.dir = (state.dir + 1) % 4;
    else {
      const next = state.player + [-5, 1, 5, -1][state.dir];
      if (
        next < 0 ||
        next >= 25 ||
        !adjacent(next, state.player) ||
        level.rocks.includes(next)
      ) {
        running = false;
        renderRobot();
        say(
          `Command ${i + 1} hit a rock or edge while Rover faced ${["north", "east", "south", "west"][state.dir]}. The trail shows the last safe path. Change your program and try again.`,
          "try",
        );
        return;
      }
      state.player = next;
      state.trail.push(next);
    }
    tone();
    renderRobot();
    say(
      `Command ${i + 1} of ${program.length}: ${cmd === "F" ? `forward while facing ${["north", "east", "south", "west"][state.dir]}` : cmd === "L" ? "turn left in place" : "turn right in place"}.`,
    );
    if (state.player === level.goal) {
      const used = i + 1;
      const stars = roverStarsFor(used, level.par);
      state.levelStars[state.level] = Math.max(state.levelStars[state.level], stars);
      state.reached = true;
      running = false;
      state.activeCommand = -1;
      renderRobot();
      say(
        `Rover found the star in ${used} command${used === 1 ? "" : "s"} — ${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}. ${stars === 3 ? "That meets the shortest-path target!" : "You solved it. Try trimming turns or extra moves if you want more efficiency stars."}`,
        "good",
      );
      return;
    }
    if (!sdk.settings().reducedMotion)
      await new Promise((resolve) => setTimeout(resolve, 300));
  }
  running = false;
  state.activeCommand = -1;
  renderRobot();
  say(
    `Rover followed all ${program.length} commands but has not reached the star yet. Use the trail and Facing arrow to decide what to change.`,
    "try",
  );
}

const marketWeather = [
  { name: "Sunny park day", icon: "☀️", base: 10 },
  { name: "Rainy afternoon", icon: "🌧️", base: 5 },
  { name: "Busy festival", icon: "🎪", base: 14 },
  { name: "Quiet neighborhood day", icon: "🏡", base: 8 },
];
function renderMarket() {
  const forecast = marketWeather[Math.min(state.day, 3)];
  stage(`Lemonade stand · Day ${Math.min(state.day + 1, 4)} of 4`);
  board.innerHTML = `<div class="stat-row">${chip("Coins in till", state.cash)}${chip("Supply cost", "1 coin/cup")}${chip("Days tried", `${state.day}/4`)}</div><div class="stand-scene">${lemonadeStandSvg(forecast.name)}<div class="weather-caption"><b>${esc(forecast.name)}</b><span>${forecast.base} customers at a 2-coin price</span></div></div><p class="board-note">A higher price brings fewer buyers in this toy town. Unsold cups are not carried to tomorrow. Watch costs and sales.</p><div class="field-grid"><label>Cups to make<select id="stockInput">${[2, 4, 6, 8, 10, 12].map((n) => `<option value="${n}" ${state.stock === n ? "selected" : ""}>${n} cups · ${n} coins</option>`).join("")}</select></label><label>Price per cup<select id="priceInput">${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${state.price === n ? "selected" : ""}>${n} coin${n === 1 ? "" : "s"}</option>`).join("")}</select></label></div>${state.ledger.length ? `<table class="ledger"><caption>Your business ledger</caption><thead><tr><th>Day</th><th>Made / sold</th><th>Costs</th><th>Revenue</th><th>Profit</th></tr></thead><tbody>${state.ledger.map((entry, i) => `<tr><td>${i + 1}</td><td>${entry.stock} / ${entry.sold}</td><td>${entry.stock}</td><td>${entry.revenue}</td><td>${entry.profit}</td></tr>`).join("")}</tbody></table>` : ""}`;
  $("stockInput").addEventListener("change", (event) => {
    state.stock = Number(event.target.value);
  });
  $("priceInput").addEventListener("change", (event) => {
    state.price = Number(event.target.value);
  });
  progress(state.day, 4);
  updateScore(Math.min(100, Math.max(0, state.cash - 14) * 2 + state.day * 10));
  button(state.day === 4 ? "Read my ledger" : "Open for the day", () => {
    if (state.day === 4) {
      const profit = state.cash - 14;
      finish(
        `Your stand ended with ${state.cash} coins, ${profit >= 0 ? "a gain of" : "a change of"} ${profit} from its 14-coin start. Your ledger shows why.`,
        score,
      );
      return;
    }
    if (state.cash < 2) {
      finish(
        "Your stand needs more supplies. Your ledger shows which days used more money than they earned. Try a smaller batch next time.",
        state.day * 15,
      );
      return;
    }
    if (state.stock > state.cash) {
      say("That batch costs more than you have. Choose fewer cups.", "try");
      return;
    }
    const demand = Math.max(1, forecast.base - 2 * (state.price - 2)),
      sold = Math.min(state.stock, demand),
      revenue = sold * state.price,
      profit = revenue - state.stock;
    state.cash += profit;
    state.ledger.push({ stock: state.stock, sold, revenue, profit });
    state.day++;
    renderMarket();
    tone();
    say(
      `Sold ${sold} cups. Revenue ${revenue}, cost ${state.stock}, profit ${profit}. ${state.stock - sold} cups were left over.`,
      profit >= 0 ? "good" : "try",
    );
  });
  hint =
    "At a 3-coin price, expect 2 fewer customers than the 2-coin forecast. Match your batch to likely demand. Profit = revenue − supplies.";
}

const trackNames = ["Kick", "Clap", "Hi-hat"];
function renderMusic() {
  stage("Your little rhythm studio");
  board.innerHTML = `${musicStudioSvg()}<p class="board-note">Tap glowing pads to make a pattern. Four steps make one beat. Play is visual even with sound off.</p><div class="beat-numbers">${Array.from({ length: 16 }, (_, i) => `<span>${i % 4 === 0 ? i / 4 + 1 : "·"}</span>`).join("")}</div>${state.tracks.map((track, row) => `<div class="track-label"><span class="track-symbol track-symbol-${row}" aria-hidden="true"></span>${trackNames[row]}</div><div class="beat-grid">${track.map((on, col) => `<button class="beat-cell ${on ? "active" : ""}" data-beat="${row},${col}" aria-pressed="${on}" aria-label="${trackNames[row]}, step ${col + 1}">${col + 1}</button>`).join("")}</div>`).join("")}<div class="pattern-goals"><span>Kick: steps 1, 5, 9, 13</span><span>Clap: steps 5, 13</span><span>Hi-hat: odd steps</span></div><label class="board-note">Tempo <select id="tempoInput">${[80, 100, 120, 140].map((n) => `<option value="${n}" ${n === state.bpm ? "selected" : ""}>${n} BPM</option>`).join("")}</select></label>`;
  bind("[data-beat]", (node) => {
    const [row, col] = node.dataset.beat.split(",").map(Number);
    state.tracks[row][col] = !state.tracks[row][col];
    node.classList.toggle("active", state.tracks[row][col]);
    node.setAttribute("aria-pressed", String(state.tracks[row][col]));
    if (state.tracks[row][col]) tone(row);
  });
  $("tempoInput").addEventListener("change", (event) => {
    state.bpm = Number(event.target.value);
    if (running) startMusic();
  });
  button(
    running ? "Pause beat" : "Play beat",
    () => {
      if (running) {
        stopMusic();
        renderMusic();
      } else {
        startMusic();
        renderMusic();
      }
    },
    "secondary",
  );
  button("Check my rhythm", () => {
    const targets = [
      [0, 4, 8, 12],
      [4, 12],
      [0, 2, 4, 6, 8, 10, 12, 14],
    ];
    const matches = state.tracks.map((track, row) =>
      track.every((on, col) => on === targets[row].includes(col)),
    );
    const count = matches.filter(Boolean).length;
    updateScore((count / 3) * 100);
    progress(count, 3, `${count} of 3 rhythm patterns found`);
    if (count === 3)
      finish(
        "You made a steady kick, an offbeat clap, and a repeating hi-hat. Now you have a starting beat to remix.",
        100,
      );
    else
      say(
        `${count} of 3 patterns match. ${trackNames.filter((_, i) => !matches[i]).join(" and ")} can use another look. Turn extra squares off, too.`,
        "try",
      );
  });
  button(
    "Save my freestyle",
    () => {
      const notes = state.tracks.flat().filter(Boolean).length;
      if (notes < 4) {
        say("Try at least four notes, then save your creation.");
        return;
      }
      finish(
        `You created a ${notes}-note beat at ${state.bpm} BPM. Keep experimenting with space, repetition, and change.`,
        Math.min(100, 50 + notes * 2),
      );
    },
    "secondary",
  );
  hint =
    "For the rhythm challenge, switch on only the listed steps for each track. Beat 1 starts at step 1. Every fourth step begins the next beat.";
  paintMusic();
}
function paintMusic() {
  board.querySelectorAll("[data-beat]").forEach((node) => {
    const col = Number(node.dataset.beat.split(",")[1]);
    node.classList.toggle("playing", col === activeStep);
  });
}
function startMusic() {
  clearInterval(playTimer);
  running = true;
  activeStep = -1;
  playTimer = setInterval(
    () => {
      activeStep = (activeStep + 1) % 16;
      paintMusic();
      state.tracks.forEach((track, row) => {
        if (track[activeStep]) tone(row);
      });
    },
    60000 / state.bpm / 4,
  );
}

$("restartButton").addEventListener("click", initialize);
$("hintButton").addEventListener("click", () => {
  $("hintText").textContent = hint;
  $("hintText").hidden = !$("hintText").hidden;
  if (!$("hintText").hidden) {
    window.dispatchEvent(new CustomEvent("larriverse:bloom-message", {
      detail: { gameId: world.id, pose: "thinking", message: hint },
    }));
  }
});
$("playAgain").addEventListener("click", initialize);
$("closeFinish").addEventListener("click", () => finishDialog.close());
$("soundToggle").addEventListener("click", () => {
  sound = !sound;
  $("soundToggle").textContent = sound ? "Sound on" : "Sound off";
  $("soundToggle").setAttribute("aria-pressed", String(sound));
  if (sound) tone();
});
$("comfortToggle").addEventListener("click", () => {
  const reduced = !sdk.settings().reducedMotion;
  sdk.setSettings({ reducedMotion: reduced });
  syncComfort();
});
function syncComfort() {
  const reduced = sdk.settings().reducedMotion;
  $("comfortToggle").setAttribute("aria-pressed", String(reduced));
  $("comfortToggle").textContent = reduced ? "Motion reduced" : "Reduce motion";
}
window.addEventListener("larriverse:settings", syncComfort);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopMusic();
    if (world.mode === "music") renderMusic();
    audioContext?.suspend().catch(() => {});
  }
});
window.addEventListener("pagehide", () => {
  clearInterval(playTimer);
  audioContext?.close().catch(() => {});
});
document.addEventListener("keydown", (event) => {
  if (
    world.mode !== "route" ||
    finished ||
    finishDialog.open ||
    ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(event.target.tagName)
  )
    return;
  const delta = { ArrowUp: -5, ArrowRight: 1, ArrowDown: 5, ArrowLeft: -1 }[
    event.key
  ];
  if (delta) {
    event.preventDefault();
    moveRoute(state.player + delta);
  }
});
const expedition = world.artSet === "expedition" ? createExpedition(world, {
  board, actions, esc, chip, stage, bind, button, tone, say, finish, progress, score: updateScore, challengeRound,
}) : null;
mountScene(world);
syncComfort();
initialize();
