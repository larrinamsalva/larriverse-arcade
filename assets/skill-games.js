import { marketMissions, marketStockChoices, calculateMarketDay, beatMissions, rhythmMatches } from "./creative-missions.js";
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
} from "./skill-worlds.js";
import { resourceAdventures } from "./budget-adventures.js";
import { createExpedition } from "./expedition-games.js";
import { timeTrailLevelsWithGoals as timeTrailLevels } from "./time-trail-level.js";
import { gardenLevels, energyLevels } from "./garden-energy-levels.js";
import {
  mountScene,
  iconSvg,
  lemonadeStandSvg,
  musicStudioSvg,
  trafficSignSvg,
  weatherSceneSvg,
  weatherChoiceSvg,
  gardenLessonSvg,
  gardenChoiceSvg,
} from "./arcade-scenes.js";
const world = worlds.find((item) => item.id === document.body.dataset.world);
const sdk = window.LarriVerseArcade;
const $ = (id) => document.getElementById(id);
const board = $("gameBoard");
const actions = $("gameActions");
const feedback = $("feedback");
const finishDialog = $("finishDialog");
const weatherPanelToggle = $("weatherPanelToggle");
const weatherPanelBody = $("weatherPanelBody");
if (weatherPanelToggle && weatherPanelBody) {
  const setWeatherPanelExpanded = (expanded) => {
    weatherPanelBody.hidden = !expanded;
    weatherPanelToggle.setAttribute("aria-expanded", String(expanded));
    weatherPanelToggle.textContent = expanded ? "Minimize" : "Open weather";
    document.body.classList.toggle("weather-panel-collapsed", !expanded);
  };
  weatherPanelToggle.addEventListener("click", () => {
    setWeatherPanelExpanded(weatherPanelToggle.getAttribute("aria-expanded") !== "true");
  });
  window.addEventListener("pageshow", () => setWeatherPanelExpanded(true));
}
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
function rankedDeck(pool) {
  const rankOrder = [...new Set(pool.map((item) => item.rank))];
  const rotated = challengeRound(pool, pool.length);
  return rankOrder.flatMap((rank) =>
    rotated.filter((item) => item.rank === rank),
  );
}
// Long campaigns use every authored puzzle in the main game, not ten-question rounds.
const campaignModes = new Set(["messages","conversation","news","repair","sorting","traffic","budget"]);
const CAMPAIGN_VERSION = "v1";
const campaignKey = () => "larriverse.mainCampaign."+world.id+"."+CAMPAIGN_VERSION;
function loadCampaign(count) {
  try {
    const raw=JSON.parse(localStorage.getItem(campaignKey())||"null");
    if(raw&&Number.isInteger(raw.next)&&raw.next>=0&&raw.next<=count&&
      Number.isInteger(raw.correct)&&raw.correct>=0&&raw.correct<=raw.next)
      return {next:raw.next,correct:raw.correct};
  }catch {}
  return {next:0,correct:0};
}
function writeCampaign(next,correct) {
  try {localStorage.setItem(campaignKey(),JSON.stringify({next,correct}));}
  catch {say("This browser cannot save this mission yet. You can still continue.","try");}
}
function campaignTrail(step,total) {
  const chapters=total/10;
  if(!Number.isInteger(chapters))return "";
  return '<div class="level-trail" aria-label="Six adventure chapters">'+
    Array.from({length:chapters},(_,i)=>{
      const marker=(i+1)*10,done=step>=marker,active=step>=i*10&&step<marker;
      return '<span class="level-node '+(done?'complete':active?'active':'')+'"><b>'+
        (done?'✓':i+1)+'</b><small>Chapter '+(i+1)+'</small></span>';
    }).join("")+"</div>";
}
function endCampaignScreen() {
  stage("🏆 All 60 challenges explored");
  board.innerHTML='<div class="message-card"><div class="message-copy"><h2 class="board-title">You explored every challenge!</h2><p>Sixty different activities are complete in this world. Replay them whenever you want; the original arcade best score remains saved.</p></div></div>'+campaignTrail(60,60);
  progress(60,60,"60 of 60 completed · Six chapters finished");
  updateScore(Math.round(state.correct/60*100));
  button("Replay all 60 adventures",()=>{
    writeCampaign(0,0);
    initialize();
  });
}
function startCampaign(pool,mode) {
  const saved=loadCampaign(pool.length);
  state.deck=[...pool];
  state.step=saved.next;
  state.correct=saved.correct;
  if(state.step===state.deck.length)endCampaignScreen();
  else if(mode==="repair"){
    state.order=shuffle([0,1,2,3]);
    state.position=0;
    renderRepair();
  }else renderCards(mode);
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
$("worldMeta").textContent = `Ages ${world.age} · ${campaignModes.has(world.mode)||["market","music","trade","pantry"].includes(world.mode)?"60 levels · save and resume":`about ${world.minutes}`}`;
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
  if(campaignModes.has(world.mode)) progress(state.deck.length,state.deck.length,`All ${state.deck.length} challenges explored`);
  else progress(1, 1, "Adventure explored");
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
    case "budget": {
      // Pocket Planet's full sixty-project journey is now the primary game.
      // Keep a deterministic deck so a locally saved chapter resumes exactly.
      const saved=loadCampaign(resourceAdventures.length);
      state.deck=[...resourceAdventures];
      state.step=saved.next;
      state.passed=saved.next;
      state.correct=saved.correct;
      if(state.step===state.deck.length)endCampaignScreen();
      else startResourceProject();
      break;
    }
    case "messages":
      startCampaign(messages,"messages");
      break;
    case "conversation":
      startCampaign(conversations,"conversation");
      break;
    case "news":
      startCampaign(newsCards,"news");
      break;
    case "repair":
      startCampaign(repairs,"repair");
      break;
    case "route": {
      const saved = readTrailSave();
      state.level = saved.nextLevel;
      state.levelStars = saved.stars;
      startTrailLevel();
      break;
    }
    case "garden":
      state.level = 0;
      state.levelStars = Array(gardenLevels.length).fill(0);
      startGardenLevel();
      break;
    case "energy":
      state.level = 0;
      state.levelStars = Array(energyLevels.length).fill(0);
      startEnergyLevel();
      break;
    case "sorting":
      startCampaign(sorting,"sorting");
      break;
    case "traffic":
      startCampaign(trafficQuestions,"traffic");
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
      state.marketMode="missions";
      beginMarketJourney();
      break;
    case "music":
      state.musicMode="missions";
      beginBeatJourney();
      break;
    case "weather-reading":
      state.deck = rankedDeck(weatherChallenges);
      state.ranks = [...new Set(weatherChallenges.map((item) => item.rank))];
      renderLearningPath("weather");
      break;
    case "garden-grow":
      state.deck = rankedDeck(gardenGrowthChallenges);
      state.ranks = [...new Set(gardenGrowthChallenges.map((item) => item.rank))];
      renderLearningPath("garden");
      break;
    default:
      expedition?.start();
  }
}

function startResourceProject() {
  state.selected=new Set();
  state.phase="gather";
  state.makeStep=0;
  state.stepOrder=shuffle([0,1,2]);
  renderBudget();
}
function renderBudget() {
  const plan=state.deck[state.step];
  const chosen=[...state.selected].filter(i=>plan.items[i].need).length;
  stage(`Pocket Planet · Chapter ${Math.floor(state.step/10)+1}/6 · Project ${state.step+1}/${state.deck.length}`);
  const banner=`
    <div class="budget-hero pocket-project-hero pocket-project-hero--${esc(plan.kind)}">
      <span class="budget-illustration pocket-project-icon" aria-hidden="true">${esc(plan.icon)}</span>
      <div>
        <p class="budget-kicker">${esc(plan.kind)} project ${state.step+1} of ${state.deck.length}</p>
        <h2 class="board-title">${esc(plan.title)}</h2>
        <p>${esc(plan.story)}</p>
        <p class="budget-goal">🌟 We're making: <strong>${esc(plan.goal)}</strong></p>
      </div>
    </div>
    <div class="stat-row" aria-live="polite">
      ${chip("Projects completed",`${state.passed}/${state.deck.length}`)}
      ${chip("Useful supplies",`${chosen}/3`)}
      ${chip("Making steps",`${state.makeStep}/3`)}
    </div>`;
  if(state.phase==="gather"){
    board.innerHTML=campaignTrail(state.passed,state.deck.length)+banner+`<p class="board-note">Choose THREE useful things to ${esc(plan.kind)}. Some objects do not belong in this project. Tap again to remove one.</p>
      <div class="item-grid pocket-supply-grid">${plan.items.map((item,i)=>`<button class="item-button pocket-supply-card ${item.need?"useful":"decoy"} ${state.selected.has(i)?"selected":""}" data-supply="${i}" aria-pressed="${state.selected.has(i)}"><span class="item-icon pocket-supply-icon" aria-hidden="true">${esc(item.icon)}</span><b class="pocket-supply-name">${esc(item.name)}</b><small>${state.selected.has(i)?"✓ In your kit":"Tap to choose"}</small></button>`).join("")}</div>`;
    bind("[data-supply]",node=>{
      const i=Number(node.dataset.supply);
      if(state.selected.has(i))state.selected.delete(i);
      else if(state.selected.size===3){say("Your kit holds three supplies. Put one item back first.","try");return;}
      else{state.selected.add(i);tone();}
      renderBudget();
    });
    button("Use my supplies",()=>{
      if(state.selected.size!==3){say("Choose exactly three supplies before starting.","try");return;}
      if(chosen!==3){say("Some things in your kit do not help with this project. Swap them for useful supplies.","try");return;}
      state.phase="make";tone();renderBudget();say("Great supplies! Now put the steps in the right order.","good");
    });
  }else if(state.phase==="make"){
    board.innerHTML=campaignTrail(state.passed,state.deck.length)+banner+`<p class="board-note">You have the right supplies. What should happen next? Choose the steps in a sensible order.</p>
      <div class="planet-workbench pocket-workbench" aria-label="Project workbench">
        ${plan.items.filter(item=>item.need).map(item=>`<span class="pocket-workbench-item"><i aria-hidden="true">${esc(item.icon)}</i><b>${esc(item.name)}</b></span>`).join("")}
      </div>
      <div class="planet-step-status pocket-step-status">Step ${state.makeStep+1} of 3</div>
      <div class="choice-grid planet-step-choices pocket-step-choices">${state.stepOrder.map(i=>`<button class="choice-button ${i<state.makeStep?"correct":""}" data-make-step="${i}" ${i<state.makeStep?"disabled":""}>${i<state.makeStep?"✓ ":""}${esc(plan.steps[i])}</button>`).join("")}</div>`;
    bind("[data-make-step]",node=>{
      const i=Number(node.dataset.makeStep);
      if(i!==state.makeStep){say("Think about what should happen first. Try another step.","try");return;}
      state.makeStep++;tone();
      if(state.makeStep===3){
        state.passed++;
        state.correct=state.passed;
        writeCampaign(state.passed,state.correct);
        if(state.step===state.deck.length-1){
          finish(`You finished ${state.deck.length} hands-on projects! You learned to choose supplies and plan how to grow, build, and prepare food.`,100);
          return;
        }
        state.phase="next";renderBudget();say(`${plan.goal} completed! Your next project is ready.`,"good");
      }else{renderBudget();say("Good work! What comes next?","good");}
    });
  }else{
    board.innerHTML=campaignTrail(state.passed,state.deck.length)+banner+`<div class="planet-project-complete pocket-project-complete" role="status"><strong>🌟 ${esc(plan.goal)} completed!</strong><p>You chose useful supplies and followed all three steps.</p></div>`;
    button("Next project",()=>{
      state.step++;
      startResourceProject();
      if(state.step%10===0)say(`Chapter ${state.step/10+1} unlocked! Explore ten fresh projects.`,"good");
    });
  }
  progress(state.passed,state.deck.length,`${state.passed} of ${state.deck.length} projects completed`);
  updateScore(Math.round(state.passed/state.deck.length*100));
  hint=state.phase==="gather"
    ? `Look for things you can use to create ${plan.goal.toLowerCase()}. Unrelated objects do not belong in this kit.`
    : `First: ${plan.steps[0]}. What should happen after that?`;
}

function renderCards(mode) {
  const deck = state.deck,
    item = deck[state.step];
  state.answered = false;
  stage(
    `${mode === "sorting" ? "Toy Town cleanup" : mode === "news" ? "Tiny news desk" : mode === "conversation" ? "Treehouse crew" : mode === "traffic" ? "Traffic Town road school" : "Clubhouse inbox"} · Chapter ${Math.floor(state.step/10)+1}/6 · Challenge ${state.step + 1}/${deck.length}`,
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
    ? `<div class="traffic-street-scene"><div class="traffic-skyline" aria-hidden="true"><span></span><span></span><span></span></div><div class="traffic-road-bed" aria-hidden="true"><i></i><i></i><i></i></div><div class="traffic-sign-model">${trafficSignSvg(item.title)}</div></div>`
    : mode === "sorting"
      ? `<div class="reuse-object-stage">
          <div class="reuse-sorting-station" aria-hidden="true">
            <span class="reuse-bin reuse-bin-reuse">REUSE</span>
            <span class="reuse-bin reuse-bin-recycle">RECYCLE</span>
            <span class="reuse-bin reuse-bin-compost">COMPOST</span>
            <span class="reuse-bin reuse-bin-trash">TRASH</span>
          </div>
          <div class="reuse-object-model">${iconSvg(item.art, "message-icon reuse-item-art")}</div>
          <span class="reuse-material-chip">${esc(item.name)}</span>
        </div>`
    : `<span class="message-icon" aria-hidden="true">${item.icon}</span>`;
  board.innerHTML = `${campaignTrail(state.step,deck.length)}<div class="message-card ${mode === "traffic" ? "traffic-message" : mode === "sorting" ? "reuse-message" : ""}">${messageArt}<div class="message-copy"><h2 class="board-title">${esc(title)}</h2><p>${esc(text)}</p></div></div><div class="choice-grid ${mode === "news" || mode === "sorting" ? "news-bins" : ""}">${display.map((choice) => `<button class="choice-button" data-answer="${choice.index}">${esc(choice.label)}</button>`).join("")}</div>${mode === "sorting" ? '<p class="board-note reuse-rule-card">Toy Town accepts clean paper, cardboard, and metal cans. Fruit scraps go to compost.</p>' : ""}`;
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
          writeCampaign(state.step,state.correct);
          finish(
            `You explored ${deck.length} situations and found ${state.correct} strong first choices. Each explanation is a new tool for next time.`,
          );
        } else {
          writeCampaign(state.step,state.correct);
          renderCards(mode);
          say(state.step%10===0?`Chapter ${state.step/10+1} unlocked! Ten new challenges ahead.`:"Look closely, then choose what you think.");
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

function renderLearningPath(mode) {
  const item = state.deck[state.step];
  const rankIndex = state.ranks.indexOf(item.rank);
  const rankItems = state.deck.filter((entry) => entry.rank === item.rank);
  const rankStep = state.deck
    .slice(0, state.step + 1)
    .filter((entry) => entry.rank === item.rank).length;
  const display = shuffle(
    item.options.map((option, index) => ({ ...option, index })),
  );
  const isWeather = mode === "weather";
  state.answered = false;
  stage(
    `Level ${rankIndex + 1} of ${state.ranks.length} · ${item.rank} · ${rankStep}/${rankItems.length}`,
  );
  const trail = state.ranks
    .map((rank, index) => {
      const status =
        index < rankIndex ? "complete" : index === rankIndex ? "active" : "";
      return `<span class="level-node ${status}"><b>${index < rankIndex ? "✓" : index + 1}</b><small>${esc(rank)}</small></span>`;
    })
    .join("");
  const scene = isWeather
    ? weatherSceneSvg(item.scene)
    : gardenLessonSvg(item.scene);
  const choices = display
    .map(
      (choice) => `<button class="picture-choice" data-learning-answer="${choice.index}">
        ${isWeather ? weatherChoiceSvg(choice.art) : gardenChoiceSvg(choice.art)}
        <span>${esc(choice.label)}</span>
      </button>`,
    )
    .join("");
  board.innerHTML = `<div class="level-trail" aria-label="Adventure levels">${trail}</div>
    <div class="learning-scene">${scene}<span class="scene-label">${isWeather ? "Look at the whole sky" : "Look closely at the garden"}</span></div>
    <div class="clue-row" aria-label="Picture clues">${item.clues.map((clue) => `<span>✦ ${esc(clue)}</span>`).join("")}</div>
    <section class="learning-question" aria-labelledby="learningQuestionTitle">
      <p class="eyebrow">${esc(item.rank)} challenge</p>
      <h2 class="board-title" id="learningQuestionTitle">${esc(item.title)}</h2>
      <p class="learning-prompt">${esc(item.prompt)}</p>
      <div class="picture-choice-grid">${choices}</div>
    </section>`;
  progress(
    state.step,
    state.deck.length,
    `Level ${rankIndex + 1}: ${item.rank} · ${state.step} of ${state.deck.length} complete`,
  );
  bind("[data-learning-answer]", (node) => {
    if (state.answered) return;
    state.answered = true;
    const picked = Number(node.dataset.learningAnswer);
    const good = picked === item.answer;
    if (good) {
      state.correct += 1;
      tone();
    }
    node.classList.add(good ? "correct" : "wrong");
    board.querySelectorAll("[data-learning-answer]").forEach((option) => {
      option.disabled = true;
      if (Number(option.dataset.learningAnswer) === item.answer)
        option.classList.add("correct");
    });
    say(
      `${good ? "Great observation!" : "Here is the clue to remember:"} ${item.why}`,
      good ? "good" : "try",
    );
    updateScore((state.correct / state.deck.length) * 100);
    progress(
      state.step + 1,
      state.deck.length,
      `${state.step + 1} of ${state.deck.length} challenges complete`,
    );
    const nextItem = state.deck[state.step + 1];
    const nextRank = nextItem && nextItem.rank !== item.rank;
    const nextLabel =
      state.step === state.deck.length - 1
        ? "See my adventure results"
        : nextRank
          ? `Advance to ${nextItem.rank}`
          : isWeather
            ? "Read the next sky"
            : "Try the next garden job";
    const next = button(nextLabel, () => {
      state.step += 1;
      if (state.step === state.deck.length) {
        finish(
          isWeather
            ? `You completed all ${state.deck.length} weather challenges and made ${state.correct} strong sky-reading choices across four levels.`
            : `You completed all ${state.deck.length} garden challenges and made ${state.correct} strong growing choices from soil to safe storage.`,
        );
      } else {
        renderLearningPath(mode);
        say(
          nextRank
            ? `Level ${state.ranks.indexOf(state.deck[state.step].rank) + 1} unlocked. Look for the picture clues.`
            : "Look closely at the picture, clues, and words before choosing.",
          nextRank ? "good" : "info",
        );
      }
    });
    next.focus({ preventScroll: true });
  });
  hint = isWeather
    ? "Name what you can actually see first: sun, cloud shape, stars, falling water, fog, or moving branches. A forecast is a useful possibility, not a promise."
    : "Follow the garden's order: prepare soil, read the packet, plant gently, check before watering, observe before treating, then harvest and store cleanly.";
}


function repairVisual(item) {
  const title = item.title.toLowerCase();
  const match = [
    ["book","book"],["notebook","book"],["journal","book"],["paperback","book"],
    ["box","cardboardBox"],["folder","paper"],["cardboard","cardboardBox"],["ruler","wood"],
    ["wagon","metal"],["wheel","metal"],["hinge","metal"],["zipper","metal"],
    ["basket","basket"],["pencil","pencil"],["paintbrush","paintBrush"],["brush","paintBrush"],
    ["chair","wood"],["cap","shirt"],["cloth","shirt"],["pouch","shirt"],["costume","shirt"],
    ["kite","paper"],["teddy","shirt"],["mask","paper"],["bottle","bottle"],["jar","jar"],
    ["can","can"],["mug","brokenMug"],["mirror","brokenMirror"]
  ].find(([word]) => title.includes(word));
  const art = match ? match[1] : "wood";
  const material =
    ["book","paper","cardboardBox","pencil"].includes(art) ? "Paper & cardboard" :
    ["metal","can"].includes(art) ? "Metal hardware" :
    ["shirt"].includes(art) ? "Fabric & stitching" :
    ["basket","wood","paintBrush"].includes(art) ? "Wood & fiber" :
    ["bottle","jar","brokenMug","brokenMirror"].includes(art) ? "Glass / hard surface" :
    "Mixed materials";
  return `<div class="repair-object-scene">
    <div class="repair-workbench" aria-hidden="true">
      <span class="repair-peg repair-peg-a"></span><span class="repair-peg repair-peg-b"></span><span class="repair-peg repair-peg-c"></span>
      <span class="repair-tool repair-tool-hammer">🔨</span><span class="repair-tool repair-tool-tape">🧰</span>
    </div>
    <div class="repair-object-model">${iconSvg(art, "repair-object-art")}</div>
    <span class="repair-material-tag">${esc(material)}</span>
  </div>`;
}

function renderRepair() {
  const item = state.deck[state.step];
  stage(`Repair Café · Chapter ${Math.floor(state.step/10)+1}/6 · Repair ${state.step + 1} of ${state.deck.length}`);
  board.innerHTML = `${campaignTrail(state.step,state.deck.length)}<div class="message-card repair-card">${repairVisual(item)}<div class="repair-copy"><p class="eyebrow">Inspect · choose · repair · test</p><h2 class="board-title">${esc(item.title)}</h2><p>Choose the next repair step. Finished steps stay on the workbench so you can see the order.</p></div></div><div class="repair-list" style="margin-top:1rem">${Array.from({ length: state.position }, (_, i) => `<div class="repair-step done">✓ ${i + 1}. ${esc(item.steps[i])}</div>`).join("")}${state.order
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
        writeCampaign(state.step,state.deck.length);
        finish(
          `You inspected, chose safe materials, repaired, and tested ${state.deck.length} different objects across six chapters. Each one got another chance.`,
          100,
        );
      } else {
        writeCampaign(state.step,state.step);
        state.position = 0;
        state.order = shuffle([0, 1, 2, 3]);
        renderRepair();
        say("A new object, the same useful repair habits.");
      }
    });
  hint = item.hint;
}


const TRAIL_SAVE_KEY = "larriverse.timeTrail.progress.v2";
function readTrailSave() {
  const fresh={nextLevel:0,stars:Array(timeTrailLevels.length).fill(0)};
  try {
    const saved=JSON.parse(localStorage.getItem(TRAIL_SAVE_KEY)||"null");
    if(!saved||!Array.isArray(saved.stars)||saved.stars.length!==timeTrailLevels.length)return fresh;
    return {
      nextLevel:Number.isInteger(saved.nextLevel)&&saved.nextLevel>=0&&saved.nextLevel<timeTrailLevels.length?saved.nextLevel:0,
      stars:saved.stars.map(n=>Number.isInteger(n)&&n>=0&&n<=3?n:0),
    };
  }catch {return fresh;}
}
function saveTrail(nextLevel=state.level) {
  try {localStorage.setItem(TRAIL_SAVE_KEY,JSON.stringify({nextLevel,stars:state.levelStars}));}
  catch {/* Game still works with storage disabled. */}
}

function trailNow() { return timeTrailLevels[state.level]; }
function startTrailLevel() {
  const level=trailNow();
  state.player=level.start; state.moves=0; state.flags=new Set();
  state.visited=new Set([level.start]); state.levelPassed=false;
  renderRoute();
}
function adjacent(a,b,width=5) {
  return Math.abs(Math.floor(a/width)-Math.floor(b/width))+Math.abs(a%width-b%width)===1;
}
function renderRoute() {
  const level=trailNow();
  const rocks=new Set(level.rocks);
  const moving=!state.levelPassed && state.moves<level.stepLimit;
  const stars=state.levelStars.reduce((sum,n)=>sum+n,0);
  stage(`Time Trail · Map ${state.level+1} of ${timeTrailLevels.length} · ${level.rank}`);
  board.innerHTML=`${levelTrail(timeTrailLevels,state.level)}
    <section class="route-level-hero route-zone--${esc(level.zone)}">
      <span aria-hidden="true">${esc(level.icon)}</span>
      <div><h2>${esc(level.name)}</h2><p>${esc(level.lesson)}</p><small>Chapter ${level.chapter+1} of 6 · ${level.width} × ${level.width} map</small></div>
    </section>
    <p class="route-instruction"><strong>${level.stepLimit} moves maximum</strong><span>Collect ${level.flags.length} flags and reach the picnic. Glowing tiles are one move away.</span></p>
    <div class="stat-row route-stats">
      ${chip("Map",`${state.level+1}/${timeTrailLevels.length}`)}
      ${chip("Steps left",level.stepLimit-state.moves)}
      ${chip("Flags found",`${state.flags.size}/${level.flags.length}`)}
      ${chip("Shortest route",`${level.bestMoves} moves`)}
      ${chip("Trail stars",`${stars}/${timeTrailLevels.length*3}`)}
    </div>
    <div class="route-legend"><span>🧑 You</span><span>🚩 Mission</span><span>🧺 Finish</span><span>✨ Glowing = next move</span></div>
    <div class="tile-grid route-map route-map--${level.width}" aria-label="Trail map, ${level.width} by ${level.width} squares">${Array.from({length:level.width*level.width},(_,i)=>{
      const rock=rocks.has(i),flag=level.flags.includes(i),finishTile=i===level.finish,player=i===state.player;
      const reachable=moving&&!rock&&!player&&adjacent(state.player,i,level.width);
      return `<button class="tile ${rock?"rock":""} ${player?"player":""} ${reachable?"route-reachable":""} ${flag?"flag":""} ${finishTile?"finish":""} ${state.visited.has(i)?"visited":""}" data-tile="${i}" aria-label="Row ${Math.floor(i/level.width)+1}, column ${i%level.width+1}, ${player?"your position":rock?"rock":flag?(state.flags.has(i)?"flag collected":"mission flag"):finishTile?"picnic finish":"path"}${reachable?", next possible move":""}" ${!moving||rock||player?"disabled":""}>${player?"🧑":rock?"🪨":flag?(state.flags.has(i)?"✓":"🚩"):finishTile?"🧺":"·"}</button>`;
    }).join("")}</div><p class="trail-local-note">🌱 Your completed maps and trail stars are saved only in this browser.</p>`;
  bind("[data-tile]",node=>moveRoute(Number(node.dataset.tile)));
  progress(state.level+(state.levelPassed?1:0),timeTrailLevels.length,
    `${state.level+(state.levelPassed?1:0)} of ${timeTrailLevels.length} trails explored`);
  updateScore(Math.round(stars/(timeTrailLevels.length*3)*100));
  if(state.levelPassed){
    button(state.level===timeTrailLevels.length-1?"See all my trails":"Next trail",()=>{
      if(state.level===timeTrailLevels.length-1){
        const total=state.levelStars.reduce((sum,n)=>sum+n,0);
        saveTrail(0);
        finish(`You explored all ${timeTrailLevels.length} trails across six chapters and earned ${total} of ${timeTrailLevels.length*3} trail stars!`,
          Math.round(total/(timeTrailLevels.length*3)*100));
      }else{state.level++;saveTrail(state.level);startTrailLevel();say("New trail unlocked! Check the flags and plan the next route.","good");}
    });
  }else if(!moving)button("Retry this trail",()=>{startTrailLevel();say("Fresh map. Check the flags before you move.");});
  if(!state.levelPassed&&state.level>0)button("Replay from first map",()=>{state.level=0;saveTrail(0);startTrailLevel();say("Back to the first trail! Your earned stars stay saved.","good");},"secondary");
  hint=`The ${level.width} by ${level.width} map has ${level.flags.length} flags. Its shortest route uses ${level.bestMoves} moves; you have ${level.stepLimit}. Follow glowing neighbor tiles, collect the flags, then reach the picnic.`;
}
function moveRoute(next) {
  const level=trailNow();
  if(finished||state.levelPassed||state.moves>=level.stepLimit)return;
  if(next<0||next>=level.width*level.width||level.rocks.includes(next)||!adjacent(state.player,next,level.width)){
    say("Choose a glowing nearby path tile, one move up, down, left, or right.","try");return;
  }
  state.player=next;state.moves++;state.visited.add(next);
  if(level.flags.includes(next))state.flags.add(next);
  tone();
  if(next===level.finish&&state.flags.size===level.flags.length){
    state.levelStars[state.level]=Math.max(state.levelStars[state.level],state.moves<=level.bestMoves?3:state.moves<=level.bestMoves+2?2:1);
    state.levelPassed=true;
    saveTrail(state.level===timeTrailLevels.length-1?0:state.level+1);
    renderRoute();
    say(`Excellent! All ${level.flags.length} flags collected in ${state.moves} moves. ${state.levelStars[state.level]} stars earned! Continue to the next trail.`,"good");
    return;
  }
  renderRoute();
  if(state.moves>=level.stepLimit)say(`You've used all ${level.stepLimit} moves. Press Retry this trail and try another plan.`,"try");
  else say(next===level.finish?`Collect all ${level.flags.length} flags before stopping at the picnic.`:`${level.stepLimit-state.moves} moves left. Look for your next flag.`);
}

const plants = {
  carrot: { icon: "🥕", name: "Carrot" },
  bean: { icon: "🫘", name: "Bean" },
  flower: { icon: "🌼", name: "Flower" },
};
function levelTrail(levels, current) {
  const ranks = [...new Set(levels.map((level) => level.rank))];
  const active = ranks.indexOf(levels[current].rank);
  return `<div class="level-trail nature-level-trail" aria-label="Adventure ranks">
    ${ranks.map((rank, i) => `<span class="level-node ${i < active ? "complete" : i === active ? "active" : ""}"><b>${i < active ? "✓" : i + 1}</b><small>${esc(rank)}</small></span>`).join("")}
  </div>`;
}
function stageStars(levels) {
  return state.levelStars.reduce((sum, value) => sum + value, 0);
}
function startGardenLevel() {
  const level = gardenLevels[state.level];
  state.plots = Array.from({ length: 6 }, () => ({ plant: null, growth: 0 }));
  state.tool = "carrot";
  state.water = level.water;
  state.day = 0;
  state.watered = new Set();
  renderGarden();
}
function gardenQuota(level) {
  return ["carrot", "bean", "flower"].map((type) => {
    const placed = state.plots.filter((p) => p.plant === type).length;
    return `<span class="nature-quota ${placed === level[type] ? "complete" : ""}">${plants[type].icon} ${plants[type].name}: ${placed}/${level[type]}</span>`;
  }).join("");
}
function renderGarden() {
  const level = gardenLevels[state.level];
  const grown = state.plots.filter((p) => p.growth >= 2).length;
  const mixed = ["carrot", "bean", "flower"].every((type) => state.plots.filter((p) => p.plant === type).length === level[type]);
  const levelDone = state.day === 3;
  stage(`Garden level ${state.level + 1} of ${gardenLevels.length} · ${level.rank} · ${state.day === 0 ? "Planting" : "Day " + state.day + "/3"}`);
  board.innerHTML = `${levelTrail(gardenLevels, state.level)}
    <section class="nature-banner nature-zone--${level.zone}" aria-label="${esc(level.name)} garden challenge">
      <span aria-hidden="true">🌻</span>
      <div><h2>${esc(level.name)}</h2><p>${esc(level.lesson)}</p><small>Grow at least ${level.target} of 6 plants and try to match the planting plan.</small></div>
    </section>
    <div class="stat-row">${chip("Level", `${state.level + 1}/${gardenLevels.length}`)}
      ${chip("Water drops", state.water)}${chip("Ready plants", `${grown}/${level.target}`)}
      ${chip("Garden stars", `${stageStars(gardenLevels)}/${gardenLevels.length * 3}`)}</div>
    <div class="nature-quotas" aria-label="Planting plan">${gardenQuota(level)}</div>
    <p class="board-note">${state.day === 0 ? "Choose a crop, then plant all six plots to match the plan." : "Water each growing plot at most once per day. Two watered days grow a plant. You can leave a plot unwatered to save drops."}</p>
    ${state.day === 0 ? `<div class="plant-picker">${Object.entries(plants).map(([id, plant]) =>
      `<button data-plant="${id}" class="${state.tool === id ? "selected" : ""}" aria-pressed="${state.tool === id}">${plant.icon} ${plant.name}</button>`).join("")}</div>` : ""}
    <div class="garden-grid">${state.plots.map((plot, i) =>
      `<button class="plot ${state.watered.has(i) ? "selected" : ""}" data-plot="${i}" aria-label="Plot ${i + 1}, ${plot.plant ? plants[plot.plant].name : "empty"}, growth ${plot.growth} of 2" ${levelDone ? "disabled" : ""}>
        ${plot.plant ? (plot.growth >= 2 ? plants[plot.plant].icon : plot.growth === 1 ? "🌿" : "🌱") : "+"}
        <small>${plot.plant ? `${plants[plot.plant].name} · ${plot.growth}/2` : "Tap to plant"}</small>
      </button>`).join("")}</div>`;
  bind("[data-plant]", (node) => { state.tool = node.dataset.plant; renderGarden(); });
  bind("[data-plot]", (node) => {
    const i = Number(node.dataset.plot), plot = state.plots[i];
    if (state.day === 0) {
      plot.plant = state.tool;
      say(`${plants[state.tool].name} planted. Check the planting plan above.`);
    } else {
      if (state.watered.has(i)) { say("You already watered this plot today. Try a different one."); return; }
      if (plot.growth >= 2) { say("That plant is already grown. Save your water."); return; }
      if (state.water <= 0) { say("Out of drops! Move to the next day to check your harvest.", "try"); return; }
      plot.growth++; state.water--; state.watered.add(i); tone();
      say("Water saved in the soil. Look how your plant grows!", "good");
    }
    renderGarden();
  });
  progress(state.level, gardenLevels.length, `${state.level} of ${gardenLevels.length} garden levels explored`);
  updateScore(Math.round((stageStars(gardenLevels) / (gardenLevels.length * 3)) * 100));
  button(state.day === 0 ? "Start growing" : !levelDone ? "Next day" :
    state.level === gardenLevels.length - 1 ? "Visit my garden" : "Next garden", () => {
    if (state.day === 0 && state.plots.some((p) => !p.plant)) {
      say("Plant all six plots before growing.", "try"); return;
    }
    if (state.day < 3) {
      state.day++; state.watered.clear(); renderGarden();
      say(`Day ${state.day}: check each plant and decide how to use your water.`);
      return;
    }
    state.levelStars[state.level] = grown >= level.target && mixed ? 3 : grown >= level.target ? 2 : 1;
    if (state.level === gardenLevels.length - 1) {
      finish(`You explored all ${gardenLevels.length} garden levels and earned ${stageStars(gardenLevels)} of ${gardenLevels.length * 3} garden stars. Thoughtful planting helps all kinds of life.`,
        Math.round(stageStars(gardenLevels) / (gardenLevels.length * 3) * 100));
      return;
    }
    state.level++;
    startGardenLevel();
    say(`${grown} plants grew! ${mixed ? "Your planting mix matched the plan." : "Next time, match the planting counts."} Welcome to a new garden!`, "good");
  });
  hint = `Plant ${level.carrot} carrots, ${level.bean} beans, and ${level.flower} flowers. ${level.target} fully grown plants need ${level.target * 2} drops used over different days. You have ${level.water}.`;
}

const buildCosts = { solar: 2, wind: 3, battery: 2 };
function startEnergyLevel() {
  state.build = { solar: 0, wind: 0, battery: 0 };
  state.day = 0;
  state.stored = 0;
  state.ledger = [];
  state.successDays = 0;
  state.started = false;
  renderEnergy();
}
function builderLeft() {
  const level = energyLevels[state.level];
  return level.tokens - Object.entries(state.build).reduce(
    (sum, [type, count]) => sum + count * buildCosts[type], 0,
  );
}
function renderEnergy() {
  const level = energyLevels[state.level];
  stage(`Energy level ${state.level + 1} of ${energyLevels.length} · ${level.rank} · ${level.name}`);
  board.innerHTML = `${levelTrail(energyLevels, state.level)}
    <section class="nature-banner energy-zone--${level.zone}" aria-label="${esc(level.name)} power mission">
      <span aria-hidden="true">🏝️</span>
      <div><h2>${esc(level.name)}</h2><p>${esc(level.lesson)}</p>
      <small>Keep the lights on for four days. Each day needs ${level.demand} energy units. Each battery holds 4.</small></div>
    </section>
    <p class="board-note">Toy energy system: real electrical systems and weather are more complicated. Build before testing, then watch the forecast.</p>
    <div class="weather-preview">${level.weather.map((day, i) =>
      `<div class="${state.day === i && state.day < 4 ? "forecast-current" : ""}">
      <strong>${day.icon}</strong>${esc(day.name)}<br>Solar ${day.solar} · Wind ${day.wind}${state.day > i ? " · Done" : ""}</div>`).join("")}</div>
    <div class="stat-row">${chip("Level", `${state.level + 1}/${energyLevels.length}`)}
      ${chip("Builder tokens", builderLeft())}
      ${chip("Stored energy", `${state.stored}/${state.build.battery * 4}`)}
      ${chip("Days supplied", `${state.successDays}/4`)}
      ${chip("Island stars", `${stageStars(energyLevels)}/${energyLevels.length * 3}`)}</div>
    <div class="item-grid">${["solar","wind","battery"].map((type, i) =>
      `<button class="item-button" data-build="${type}" ${state.started ? "disabled" : ""}>
        <span class="item-icon" aria-hidden="true">${["☀️", "🌬️", "🔋"][i]}</span>
        ${["Solar panel", "Wind turbine", "Battery"][i]}
        <small>${buildCosts[type]} tokens · Built ${state.build[type]}</small></button>`).join("")}</div>
    <div class="energy-scene" aria-label="Island energy equipment">
      <span aria-hidden="true">🏡</span><span aria-hidden="true">${"☀️".repeat(state.build.solar) || "▫️"}</span>
      <span aria-hidden="true">${"🌬️".repeat(state.build.wind) || "▫️"}</span>
      <span aria-hidden="true">🔋</span><strong>${state.stored} stored</strong></div>
    ${state.ledger.length ? `<table class="ledger"><caption>Your energy log</caption><thead><tr><th>Day</th><th>Made</th><th>Stored after</th><th>Lights</th></tr></thead><tbody>${state.ledger.map((entry) =>
      `<tr><td>${esc(entry.name)}</td><td>${entry.made}</td><td>${entry.stored}</td><td>${entry.ok ? "Glowing" : "Needs more"}</td></tr>`).join("")}</tbody></table>` : ""}`;
  bind("[data-build]", (node) => {
    const type = node.dataset.build;
    if (builderLeft() < buildCosts[type]) {
      say("Not enough builder tokens. Clear your build and test a different mix.", "try"); return;
    }
    state.build[type]++; tone(); renderEnergy();
    say("Look at all four forecast days. A good plan keeps working after dark.");
  });
  progress(state.level, energyLevels.length, `${state.level} of ${energyLevels.length} energy levels explored`);
  updateScore(Math.round(stageStars(energyLevels) / (energyLevels.length * 3) * 100));
  button(state.day === 4 ? (state.level === energyLevels.length - 1 ? "See my island" : "Next island") :
    state.started ? `Run ${level.weather[state.day].name.toLowerCase()} day` : "Test my power mix", () => {
    if (state.day === 4) {
      state.levelStars[state.level] = state.successDays === 4 ? 3 : state.successDays >= 3 ? 2 : 1;
      if (state.level === energyLevels.length - 1) {
        finish(`You designed power systems for ${energyLevels.length} islands and earned ${stageStars(energyLevels)} of ${energyLevels.length * 3} island stars. Watch how changing weather affects storage.`,
          Math.round(stageStars(energyLevels) / (energyLevels.length * 3) * 100));
        return;
      }
      const supplied = state.successDays;
      state.level++;
      startEnergyLevel();
      say(`You powered ${supplied} of 4 days. Now try the next island's new weather!`, "good");
      return;
    }
    if (!state.build.solar && !state.build.wind) {
      say("Choose at least one energy source before starting.", "try"); return;
    }
    state.started = true;
    const day = level.weather[state.day];
    const made = day.solar * state.build.solar + day.wind * state.build.wind;
    const available = made + state.stored;
    const ok = available >= level.demand;
    state.stored = Math.min(state.build.battery * 4, Math.max(0, available - level.demand));
    if (ok) state.successDays++;
    state.ledger.push({ name: day.name, made, stored: state.stored, ok });
    state.day++;
    renderEnergy();
    say(ok ? `${day.name}: the lights stayed on! ${state.stored} units are saved.` :
      `${day.name}: you were ${level.demand - available} units short. Plan for low production and dark days next time.`, ok ? "good" : "try");
  });
  if (!state.started) button("Clear build", () => {
    state.build = { solar: 0, wind: 0, battery: 0 };
    renderEnergy(); say("Fresh build! Check the forecast before placing panels.");
  }, "secondary");
  hint = `You have ${level.tokens} builder tokens and each day needs ${level.demand} units. Sunny and cloudy skies give different solar output; wind can work at night. A battery saves up to 4 spare units.`;
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
  const ranks = [...new Set(robotLevels.map((item) => item.rank))];
  const rankIndex = ranks.indexOf(level.rank);
  const rankTrail = ranks
    .map((rank, index) => {
      const status = index < rankIndex ? "complete" : index === rankIndex ? "active" : "";
      return `<span class="level-node ${status}"><b>${index < rankIndex ? "✓" : index + 1}</b><small>${esc(rank)}</small></span>`;
    })
    .join("");
  stage(`Robot world ${state.level + 1} of ${robotLevels.length} · ${level.rank} · ${level.name}`);
  board.innerHTML = `<div class="level-trail rover-level-trail" aria-label="Rover advancement ranks">${rankTrail}</div><div class="stat-row rover-stats">${chip("Facing", directions[state.dir])}${chip("World", `${state.level + 1}/${robotLevels.length}`)}${chip("Rank", level.rank)}${chip("3-star target", `${level.par} cmds`)}${chip("Stars earned", `${roverStarTotal()}/${robotLevels.length * 3}`)}</div><p class="board-note rover-lesson"><strong>Forward moves Rover in the direction it is facing.</strong> Left and Right turn Rover in place. The dotted trail shows where it has traveled.</p><div class="tile-grid rover-grid rover-zone--${level.zone}" aria-label="${esc(level.name)} rover path grid">${Array.from({ length: 25 }, (_, i) => {
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
  }).join("")}</div><div class="rover-efficiency"><strong>${esc(level.name)}</strong><span>Target: ${level.par} commands for ⭐⭐⭐</span>${currentStars ? `<span class="rover-stars" aria-label="${currentStars} efficiency stars">${"⭐".repeat(currentStars)}${"☆".repeat(3 - currentStars)}</span>` : "<span>Reach the star to earn 1–3 efficiency stars.</span>"}</div><div class="command-bar" aria-label="Add rover commands"><button class="secondary" data-command="F" ${running || state.reached ? "disabled" : ""}>↑ Forward</button><button class="secondary" data-command="L" ${running || state.reached ? "disabled" : ""}>↶ Turn left</button><button class="secondary" data-command="R" ${running || state.reached ? "disabled" : ""}>↷ Turn right</button></div><div class="command-list" aria-label="Your command list">${state.commands.length ? state.commands.map((cmd, i) => `<button class="${i === state.activeCommand ? "active-command" : ""}" data-remove="${i}" aria-label="Remove command ${i + 1}: ${cmd === "F" ? "forward" : cmd === "L" ? "left turn" : "right turn"}" ${i === state.activeCommand ? 'aria-current="step"' : ""} ${running || state.reached ? "disabled" : ""}><small>${i + 1}</small>${cmd === "F" ? "↑" : cmd === "L" ? "↶" : "↷"}</button>`).join("") : '<span class="board-note" style="margin:0">Your program goes here (up to 64 commands).</span>'}</div>`;
  bind("[data-command]", (node) => {
    if (running || state.reached) return;
    if (state.commands.length >= 64) {
      say(
        "Your program has 64 commands. Remove a command before adding another.",
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
          `You sequenced, tested, and improved programs in ${robotLevels.length} rover worlds across ${ranks.length} ranks and earned ${totalStars} of ${robotLevels.length * 3} efficiency stars.`,
          finalScore,
        );
        return;
      }
      const completedRank = robotLevels[state.level].rank;
      state.level++;
      state.commands = [];
      state.reached = false;
      state.activeCommand = -1;
      state.player = robotLevels[state.level].start;
      state.dir = robotLevels[state.level].dir;
      state.trail = [state.player];
      renderRobot();
      const nextLevel = robotLevels[state.level];
      say(`${nextLevel.rank !== completedRank ? `${nextLevel.rank} unlocked! ` : ""}Welcome to ${nextLevel.name}. Check Rover's facing direction before you build the next program.`);
    });
  const completed = state.level + (state.reached ? 1 : 0);
  progress(completed, robotLevels.length, `${completed} of ${robotLevels.length} rover worlds solved · ${level.rank}`);
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

function creativeProgress(kind){
  try {
    const raw=JSON.parse(localStorage.getItem("larriverse.creative."+kind+".v1")||"{}");
    if(Number.isInteger(raw.nextLevel)&&raw.nextLevel>=0&&raw.nextLevel<60)return raw.nextLevel;
  }catch{}
  return 0;
}

function saveCreativeProgress(kind,nextLevel){
  try{localStorage.setItem("larriverse.creative."+kind+".v1",JSON.stringify({nextLevel:Math.min(60,nextLevel)}));}
  catch{say("This browser could not save your mission progress; you can still keep playing.","try");}
}

function beginMarketJourney(){
  state.marketMode="missions";state.mission=creativeProgress("market");
  state.missionPassed=false;state.lastMarketResult=null;
  state.stock=6;state.price=3;renderMarketMission();
}

function renderMarketMission(){
  const m=marketMissions[state.mission],done=state.missionPassed;
  const completion=state.mission+(done?1:0);
  stage(`Lemonade Lab · Mission ${state.mission+1} of 60 · ${m.chapter}`);
  board.innerHTML=`<article class="creative-mission-card" data-market-mission="${m.id}">
    <p class="eyebrow">🍋 Market mission ${state.mission+1}/60 · ${esc(m.chapter)}</p>
    <h2>${esc(m.name)}</h2><p>At 2 coins per cup, about <strong>${m.base} customers</strong> might visit. Charging more may reduce demand.</p>
    <div class="stat-row">${chip("Supply cost",`${m.supplyCost} coin${m.supplyCost===1?"":"s"}/cup`)}
      ${chip("Available budget",`${m.startCash} coins`)}${chip("Profit goal",`${m.goal}+ coins`)}
      ${chip("Completed",`${completion}/60`)}</div>
    <p class="board-note">${esc(m.hint)}</p>
    <div class="field-grid">
      <label>Cups to make<select id="stockInput" ${done?"disabled":""}>${marketStockChoices.map(n=>`<option value="${n}" ${state.stock===n?"selected":""}>${n} cups · ${n*m.supplyCost} coins</option>`).join("")}</select></label>
      <label>Price per cup<select id="priceInput" ${done?"disabled":""}>${[1,2,3,4,5].map(n=>`<option value="${n}" ${state.price===n?"selected":""}>${n} coin${n===1?"":"s"}</option>`).join("")}</select></label>
    </div>
    ${state.lastMarketResult?`<div class="creative-result"><strong>${state.lastMarketResult.profit>=m.goal?"Goal reached!":"Try a different plan"}</strong>
      <p>Customers: ${state.lastMarketResult.demand} · Sold: ${state.lastMarketResult.sold} · Left over: ${state.lastMarketResult.leftovers}</p>
      <p>Revenue ${state.lastMarketResult.revenue} − cost ${state.lastMarketResult.cost} = <strong>${state.lastMarketResult.profit} coins profit</strong></p></div>`:""}
    </article>`;
  const stockNode=board.querySelector("#stockInput"),priceNode=board.querySelector("#priceInput");
  stockNode?.addEventListener("change",e=>{state.stock=Number(e.target.value);});
  priceNode?.addEventListener("change",e=>{state.price=Number(e.target.value);});
  progress(completion,60,`${completion} of 60 market missions completed`);
  updateScore(Math.round(completion/60*100));
  if(done){
    button(state.mission===59?"Celebrate market mastery":"Next market mission",()=>{
      if(state.mission===59){finish("You completed all 60 market missions, comparing demand, supplies, prices and profit.",100);return;}
      state.mission++;state.missionPassed=false;state.lastMarketResult=null;state.stock=6;state.price=3;
      renderMarketMission();say("New market, new customers! Check your budget and plan.","good");
    });
  }else{
    button("Run my mission stand",()=>{
      if(state.stock*m.supplyCost>m.startCash){
        say("Your supplies cost more than your available budget. Choose fewer cups.","try");return;
      }
      const result=calculateMarketDay(m,state.stock,state.price);
      state.lastMarketResult=result;
      if(result.profit>=m.goal){
        state.missionPassed=true;
        saveCreativeProgress("market",state.mission+1);
        renderMarketMission();say(`Great planning! You reached the ${m.goal}-coin profit goal.`, "good");tone();
      }else{renderMarketMission();say(`Your ${result.profit}-coin profit is below the ${m.goal}-coin goal. Compare price and leftovers, then try again.`,"try");}
    });
  }
  button("Return to four-day lab",()=>{
    state.marketMode="free";state.cash=14;state.day=0;state.ledger=[];state.stock=6;state.price=3;
    renderMarket();say("Back in the original four-day stand!");
  },"secondary");
  hint=m.hint;
}

function beginBeatJourney(){
  stopMusic();state.musicMode="missions";state.mission=creativeProgress("beat");
  state.missionPassed=false;state.tracks=Array.from({length:3},()=>Array(16).fill(false));
  state.bpm=beatMissions[state.mission].bpm;renderBeatMission();
}

function renderBeatMission(){
  const m=beatMissions[state.mission],done=state.missionPassed,completion=state.mission+(done?1:0);
  stage(`Beat Builder · Mission ${state.mission+1} of 60 · ${m.chapter}`);
  board.innerHTML=`<section class="creative-mission-card" data-beat-mission="${m.id}">
    <p class="eyebrow">🎵 Rhythm mission ${state.mission+1}/60 · ${esc(m.chapter)}</p>
    <h2>${esc(m.name)}</h2><p>${esc(m.explanation)}</p>
    <div class="stat-row">${chip("Tempo",`${m.bpm} BPM`)}${chip("Completed",`${completion}/60`)}</div>
    <p class="board-note">Light up the numbered steps below for each instrument. Leave all unlisted steps off. Sound is optional.</p>
    ${musicStudioSvg()}
    <div class="beat-numbers">${Array.from({length:16},(_,i)=>`<span>${i%4===0?i/4+1:"·"}</span>`).join("")}</div>
    ${state.tracks.map((track,row)=>`<div class="track-label">${trackNames[row]} · Steps: ${m.rows[row].map(n=>n+1).join(", ")}</div>
      <div class="beat-grid">${track.map((on,col)=>`<button type="button" class="beat-cell ${on?"active":""}" data-beat="${row},${col}" aria-label="${trackNames[row]}, step ${col+1}" aria-pressed="${on}" ${done?"disabled":""}>${col+1}</button>`).join("")}</div>`).join("")}
    </section>`;
  bind("[data-beat]",node=>{
    const [row,col]=node.dataset.beat.split(",").map(Number);
    state.tracks[row][col]=!state.tracks[row][col];
    node.classList.toggle("active",state.tracks[row][col]);
    node.setAttribute("aria-pressed",String(state.tracks[row][col]));
    if(state.tracks[row][col])tone(row);
  });
  progress(completion,60,`${completion} of 60 rhythm missions completed`);
  updateScore(Math.round(completion/60*100));
  if(done){
    button(state.mission===59?"Celebrate my rhythm journey":"Next beat mission",()=>{
      stopMusic();
      if(state.mission===59){finish("You completed 60 different rhythms, counting beats and learning to hear the spaces.",100);return;}
      state.mission++;state.missionPassed=false;
      state.tracks=Array.from({length:3},()=>Array(16).fill(false));
      state.bpm=beatMissions[state.mission].bpm;
      renderBeatMission();say("New rhythm unlocked. Read all three instrument patterns.","good");
    });
  }else{
    button("Check mission beat",()=>{
      const matched=rhythmMatches(state.tracks,m);
      if(matched.every(Boolean)){
        stopMusic();state.missionPassed=true;saveCreativeProgress("beat",state.mission+1);
        renderBeatMission();say("Perfect pattern! Every note and rest matches.","good");
      }else{
        say(`${matched.filter(Boolean).length} of 3 rows match. Recheck ${trackNames.filter((_,i)=>!matched[i]).join(" and ")}. Extra notes need switching off too.`,"try");
      }
    });
    button(running?"Pause beat":"Play beat",()=>{
      if(running)stopMusic();else startMusic();
      renderBeatMission();
    },"secondary");
    button("Clear this pattern",()=>{
      stopMusic();state.tracks=Array.from({length:3},()=>Array(16).fill(false));
      renderBeatMission();say("Blank grid ready for your next try.");
    },"secondary");
  }
  button("Return to freestyle",()=>{
    stopMusic();state.musicMode="free";state.tracks=Array.from({length:3},()=>Array(16).fill(false));
    state.bpm=100;renderMusic();say("Your freestyle studio is ready!");
  },"secondary");
  hint=m.explanation;
  paintMusic();
}

const marketWeather = [
  { name: "Sunny park day", icon: "☀️", base: 10 },
  { name: "Rainy afternoon", icon: "🌧️", base: 5 },
  { name: "Busy festival", icon: "🎪", base: 14 },
  { name: "Quiet neighborhood day", icon: "🏡", base: 8 },
];
function renderMarket() {
  if(state.marketMode==="missions"){renderMarketMission();return;}
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
  button("Explore 60 market missions",beginMarketJourney,"secondary");
  hint =
    "At a 3-coin price, expect 2 fewer customers than the 2-coin forecast. Match your batch to likely demand. Profit = revenue − supplies.";
}

const trackNames = ["Kick", "Clap", "Hi-hat"];
function renderMusic() {
  if(state.musicMode==="missions"){renderBeatMission();return;}
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
  button("Explore 60 beat missions",beginBeatJourney,"secondary");
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

$("restartButton").addEventListener("click",()=>{
  if(campaignModes.has(world.mode)){
    if(!window.confirm("Replay all 60 challenges in this world from the beginning?"))return;
    writeCampaign(0,0);
  }
  initialize();
});
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
