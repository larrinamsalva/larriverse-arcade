(() => {
  'use strict';

  const GAME_ID = 'road-trip-quest';
  const SAVE_KEY = 'larriverse.roadTripQuest.v1';
  const QUESTION_SOURCE = '../learning-question-bank.json';
  const QUESTION_SUBJECTS = ['math', 'trivia', 'science', 'reading'];
  const lanes = [23, 50, 77];

  const CITIES = [
    {name:'New York City',emoji:'🗽',boss:{name:'King Cabbie',emoji:'🚕',hp:80,subject:'math'},reward:{name:'Liberty Star',emoji:'⭐',desc:'Defender of the big city!'}},
    {name:'Orlando',emoji:'🎡',boss:{name:'Gator Gulch',emoji:'🐊',hp:90,subject:'trivia'},reward:{name:'Sunny Gator',emoji:'🦎',desc:'Sunshine State warrior!'}},
    {name:'Nashville',emoji:'🎸',boss:{name:'Banjo Boss',emoji:'🤠',hp:85,subject:'reading'},reward:{name:'Country Star',emoji:'🌟',desc:'Plays the sweetest tunes!'}},
    {name:'Chicago',emoji:'🌬️',boss:{name:'Windy Wizard',emoji:'🌀',hp:95,subject:'science'},reward:{name:'Lake Guardian',emoji:'🧊',desc:'Master of the north winds!'}},
    {name:'Las Vegas',emoji:'🎰',boss:{name:'Neon Phantom',emoji:'💎',hp:100,subject:'math'},reward:{name:'Lucky Dragon',emoji:'🐉',desc:'Brings good fortune on all journeys!'}},
    {name:'Los Angeles',emoji:'🌴',boss:{name:'Surf Titan',emoji:'🏄',hp:110,subject:'trivia'},reward:{name:'Pacific Rider',emoji:'🌊',desc:'Rides the endless waves!'}},
    {name:'Denver',emoji:'⛰️',boss:{name:'Mountain Mammoth',emoji:'🦣',hp:105,subject:'science'},reward:{name:'Summit Elk',emoji:'🦌',desc:'Roams the highest peaks!'}},
    {name:'New Orleans',emoji:'🎷',boss:{name:'Jazz Phantom',emoji:'👻',hp:115,subject:'reading'},reward:{name:'Mardi Fox',emoji:'🦊',desc:'Dances through the night!'}}
  ];

  const ITEMS = [
    {emoji:'⚡',name:'Lightning Bolt',power:25,desc:'Crackles with electric energy!'},
    {emoji:'🔮',name:'Magic Orb',power:20,desc:'Glows with mysterious power!'},
    {emoji:'🍄',name:'Power Mushroom',power:15,desc:'Gives your next answer extra punch!'},
    {emoji:'🌟',name:'Gold Star',power:30,desc:'Shines with golden power!'},
    {emoji:'🧪',name:'Mystery Potion',power:18,desc:'Brewed by a roadside wizard!'},
    {emoji:'🔑',name:'Golden Key',power:22,desc:'Opens the door to victory!'},
    {emoji:'💎',name:'Road Diamond',power:35,desc:'Found sparkling on the highway!'},
    {emoji:'🎯',name:'Laser Target',power:28,desc:'Never misses its mark!'},
    {emoji:'🛡️',name:'Mini Shield',power:20,desc:'Blocks a boss attack!'},
    {emoji:'🏹',name:'Arrow of Speed',power:24,desc:'Fast as the open road!'},
    {emoji:'🌊',name:'Wave Splash',power:16,desc:'Washes away the enemy!'},
    {emoji:'🔥',name:'Road Flame',power:30,desc:'Burns with fierce power!'},
    {emoji:'🌪️',name:'Dust Twister',power:22,desc:'Picked up in the desert!'},
    {emoji:'🎀',name:'Lucky Ribbon',power:12,desc:'Brings good luck in battle!'},
    {emoji:'🦋',name:'Butterfly Wing',power:10,desc:'Light as a feather!'},
    {emoji:'🌈',name:'Rainbow Shard',power:40,desc:'The rarest find on any road!'}
  ];

  const ROAMERS = [
    {emoji:'🦄',name:'Road Unicorn',bonus:50,desc:'Joins you after answering its riddle!'},
    {emoji:'🐉',name:'Baby Dragon',bonus:60,desc:'Breathes fire on your enemies!'},
    {emoji:'🦅',name:'Sky Eagle',bonus:45,desc:'Spotted from the highway!'},
    {emoji:'🐺',name:'Highway Wolf',bonus:55,desc:'Runs alongside your car!'},
    {emoji:'🧜',name:'River Sprite',bonus:40,desc:'Spotted near a bridge!'},
    {emoji:'🦁',name:'Pride Lion',bonus:65,desc:'Roaring for adventure!'}
  ];

  const SCENERY = ['🌲','🌳','🏠','⛽','🚦','🏗️','🌾','🌵','⛰️','🏔️','🌊','🦅','🐄','🌻'];
  const $ = selector => document.querySelector(selector);
  const fresh = () => ({
    score:0,
    lane:1,
    bossMeter:0,
    currentCity:0,
    bag:[],
    heroes:[],
    cityProgress:{},
    itemsCollected:0,
    bossesDefeated:0,
    correctAnswers:0,
    totalAnswers:0
  });

  let state = loadTrip();
  let questionBank = null;
  const questionDecks = {};
  let running = false;
  let paused = false;
  let spawnTimer = null;
  let sceneryTimer = null;
  let activeBattle = null;
  let toastTimer = null;

  function loadTrip() {
    try {
      return { ...fresh(), ...JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') };
    } catch {
      return fresh();
    }
  }

  function saveTrip() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function resetTrip() {
    localStorage.removeItem(SAVE_KEY);
    state = fresh();
    renderHud();
    toast('Fresh road trip started!');
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(list) {
    return [...list].sort(() => Math.random() - 0.5);
  }

  function drawQuestion(subject) {
    if (!questionDecks[subject]?.length) questionDecks[subject] = shuffle(questionBank.subjects[subject]);
    return questionDecks[subject].pop();
  }

  function profile() {
    return window.LarriVerseArcade?.summary?.();
  }

  async function loadQuestions() {
    const response = await fetch(QUESTION_SOURCE);
    if (!response.ok) throw new Error(`Learning question bank could not load (${response.status})`);
    questionBank = await response.json();
    for (const subject of QUESTION_SUBJECTS) {
      if (!Array.isArray(questionBank.subjects?.[subject]) || questionBank.subjects[subject].length < 3) {
        throw new Error(`Question bank needs at least three ${subject} questions`);
      }
    }
  }

  function start() {
    if (!questionBank) return;
    $('#titleScreen').classList.remove('active');
    $('#gameScreen').classList.add('active');
    running = true;
    paused = false;
    renderHud();
    moveCar();
    startLoops();
    toast(`${CITIES[state.currentCity].emoji} Next stop: ${CITIES[state.currentCity].name}`);
  }

  function startLoops() {
    clearInterval(spawnTimer);
    clearInterval(sceneryTimer);
    spawnTimer = setInterval(() => {
      if (running && !paused) spawnRoadThing();
    }, 1150);
    sceneryTimer = setInterval(() => {
      if (running && !paused) spawnScenery();
    }, 900);
  }

  function togglePause() {
    paused = !paused;
    document.body.classList.toggle('paused', paused);
    $('#pauseButton').textContent = paused ? 'Resume' : 'Pause';
    $('#pauseButton').setAttribute('aria-pressed', String(paused));
  }

  function move(delta) {
    if (!running || paused) return;
    state.lane = Math.max(0, Math.min(2, state.lane + delta));
    moveCar();
  }

  function moveCar() {
    $('#car').style.left = `${lanes[state.lane]}%`;
  }

  function spawnRoadThing() {
    const special = Math.random() < .09 && state.heroes.filter(hero => hero.source === 'road').length < ROAMERS.length;
    const thing = special ? pick(ROAMERS) : pick(ITEMS);
    const lane = Math.floor(Math.random() * 3);
    if (special && state.heroes.some(hero => hero.name === thing.name)) return;

    const element = document.createElement('button');
    element.className = `road-item${special ? ' special' : ''}`;
    element.style.left = `calc(${lanes[lane]}% - 38px)`;
    element.style.setProperty('--speed', `${4.2 + Math.random() * 1.8}s`);
    element.dataset.lane = lane;
    element.innerHTML = `<b>${thing.emoji}</b><small>${special ? 'Mystery hero' : thing.name}</small>`;
    element.setAttribute('aria-label', special
      ? `${thing.name}, move into its lane to recruit`
      : `${thing.name}, move into its lane to collect`);
    $('#road').append(element);

    let checked = false;
    const collision = setInterval(() => {
      if (!element.isConnected) {
        clearInterval(collision);
        return;
      }
      const top = element.offsetTop;
      const carTop = $('#car').offsetTop;
      if (!checked && top > carTop - 45 && top < carTop + 65) {
        checked = true;
        if (Number(element.dataset.lane) === state.lane) {
          special ? meetRoamer(thing) : collectItem(thing);
          element.remove();
        }
      }
    }, 60);
    element.addEventListener('animationend', () => {
      clearInterval(collision);
      element.remove();
    });
  }

  function spawnScenery() {
    const element = document.createElement('span');
    element.textContent = pick(SCENERY);
    element.style.bottom = `${4 + Math.random() * 30}px`;
    element.style.animationDuration = `${5 + Math.random() * 4}s`;
    $('#skyline').append(element);
    element.addEventListener('animationend', () => element.remove());
  }

  function collectItem(item) {
    const found = state.bag.find(entry => entry.name === item.name);
    if (found) found.count += 1;
    else state.bag.push({ ...item, count: 1 });
    state.itemsCollected += 1;
    state.score += 5;
    state.bossMeter = Math.min(100, state.bossMeter + 12);
    saveTrip();
    renderHud();
    toast(`${item.emoji} ${item.name} collected!`);
    if (state.bossMeter >= 60) $('#roadMessage').textContent = 'Boss battle ready — or charge to 100% for bonus damage!';
  }

  function meetRoamer(hero) {
    paused = true;
    document.body.classList.add('paused');
    activeBattle = {
      mode:'recruit',
      hero,
      subject:pick(QUESTION_SUBJECTS),
      playerHp:100,
      bossHp:50,
      itemBonus:0,
      used:[]
    };
    openQuestion();
  }

  function triggerBoss() {
    if (state.bossMeter < 60) {
      toast('Collect more power items first!');
      return;
    }
    const city = CITIES[state.currentCity];
    activeBattle = {
      mode:'boss',
      city,
      boss:city.boss,
      subject:city.boss.subject,
      playerHp:100,
      bossHp:city.boss.hp,
      maxBossHp:city.boss.hp,
      itemBonus:state.bossMeter >= 100 ? 15 : 0,
      used:[],
      round:1
    };
    paused = true;
    document.body.classList.add('paused');
    openQuestion();
  }

  function openQuestion() {
    const battle = activeBattle;
    const isBoss = battle.mode === 'boss';
    const foe = isBoss ? battle.boss : battle.hero;
    $('#questionMode').textContent = isBoss
      ? `${battle.city.emoji} ${battle.city.name} · Round ${battle.round}`
      : 'Roaming hero challenge';
    $('#bossEmoji').textContent = foe.emoji;
    $('#bossName').textContent = foe.name;
    $('#subjectBadge').textContent = battle.subject;
    $('#playerHp').style.width = `${battle.playerHp}%`;
    $('#bossHp').style.width = `${Math.max(0, 100 * battle.bossHp / (battle.maxBossHp || 50))}%`;
    $('#feedback').textContent = '';
    $('#nextQuestion').hidden = true;
    renderBattleItems();

    const question = drawQuestion(battle.subject);
    battle.question = {
      id:question.id,
      text:question.prompt,
      answers:question.options,
      correct:question.answer,
      explanation:question.explanation
    };
    $('#questionText').textContent = battle.question.text;
    $('#answers').innerHTML = '';
    battle.question.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = answer;
      button.addEventListener('click', () => answerQuestion(index, button));
      $('#answers').append(button);
    });
    $('#questionDialog').showModal();
  }

  function renderBattleItems() {
    const row = $('#battleItems');
    row.innerHTML = state.bag.length ? '' : '<span class="muted">No road items yet.</span>';
    state.bag.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = `${item.emoji} ${item.name} ×${item.count} <small>+${item.power}</small>`;
      if (activeBattle.used.includes(item.name)) button.classList.add('used');
      button.disabled = activeBattle.used.includes(item.name);
      button.addEventListener('click', () => useItem(index, item, button));
      row.append(button);
    });
  }

  function useItem(index, item, button) {
    if (activeBattle.used.includes(item.name)) return;
    activeBattle.used.push(item.name);
    activeBattle.itemBonus += item.power;
    item.count -= 1;
    if (item.count <= 0) state.bag.splice(index, 1);
    button.classList.add('used');
    button.disabled = true;
    saveTrip();
    renderHud();
    toast(`${item.emoji} +${item.power} answer power`);
  }

  function answerQuestion(index, button) {
    const battle = activeBattle;
    if (battle.answered) return;
    battle.answered = true;
    state.totalAnswers += 1;
    const correct = index === battle.question.correct;
    [...$('#answers').children].forEach((element, answerIndex) => {
      element.disabled = true;
      if (answerIndex === battle.question.correct) element.classList.add('correct');
    });

    if (correct) {
      button.classList.add('correct');
      state.correctAnswers += 1;
      const damage = 30 + battle.itemBonus + (battle.mode === 'recruit' ? 20 : 0);
      battle.bossHp = Math.max(0, battle.bossHp - damage);
      state.score += 15;
      $('#feedback').textContent = `Correct! ${damage} power damage. ${battle.question.explanation}`;
    } else {
      button.classList.add('wrong');
      battle.playerHp = Math.max(0, battle.playerHp - 25);
      $('#feedback').textContent = `Not quite — ${battle.question.answers[battle.question.correct]} is correct. ${battle.question.explanation}`;
    }

    battle.itemBonus = 0;
    $('#playerHp').style.width = `${battle.playerHp}%`;
    $('#bossHp').style.width = `${Math.max(0, 100 * battle.bossHp / (battle.maxBossHp || 50))}%`;
    saveTrip();

    if (battle.mode === 'recruit') {
      setTimeout(() => correct
        ? recruitHero(battle.hero)
        : finishLoss(`${battle.hero.emoji} ${battle.hero.name} escaped down the highway.`), 700);
      return;
    }
    if (battle.bossHp <= 0) {
      setTimeout(winBoss, 700);
      return;
    }
    if (battle.playerHp <= 0) {
      setTimeout(() => finishLoss(`${battle.boss.emoji} ${battle.boss.name} won this round. Collect more items and try again!`), 700);
      return;
    }
    $('#nextQuestion').hidden = false;
  }

  function nextRound() {
    activeBattle.round += 1;
    activeBattle.answered = false;
    $('#questionDialog').close();
    setTimeout(openQuestion, 80);
  }

  function recruitHero(hero) {
    $('#questionDialog').close();
    state.heroes.push({ ...hero, source:'road' });
    state.score += hero.bonus;
    saveTrip();
    resumeRoad();
    toast(`${hero.emoji} ${hero.name} joined your crew!`);
    renderHud();
  }

  function finishLoss(message) {
    $('#questionDialog').close();
    state.bossMeter = Math.max(0, state.bossMeter - 20);
    saveTrip();
    showResult('🛞', 'Pit stop', 'Try again', message, {
      Score:state.score,
      'Boss meter':`${state.bossMeter}%`,
      Crew:state.heroes.length
    }, false);
  }

  function winBoss() {
    $('#questionDialog').close();
    const city = CITIES[state.currentCity];
    state.cityProgress[city.name] = { defeated:true };
    state.bossesDefeated += 1;
    state.score += 100;
    state.heroes.push({ ...city.reward, source:city.name });
    const accuracy = state.totalAnswers ? Math.round(state.correctAnswers / state.totalAnswers * 100) : 0;
    const sdk = window.LarriVerseArcade?.award?.(GAME_ID, {
      xp:36 + Math.min(54, state.itemsCollected),
      kc:9 + Math.floor(state.bossMeter / 20),
      score:state.score,
      completed:true,
      metrics:{
        itemsCollected:state.itemsCollected,
        bossesDefeated:1,
        heroesRecruited:1,
        correctAnswers:state.correctAnswers
      }
    });
    saveTrip();
    showResult(city.reward.emoji, 'City conquered', `${city.name} cleared!`, `${city.reward.name} joined your Hero Collection.`, {
      XP:`+${36 + Math.min(54, state.itemsCollected)}`,
      KC:`+${9 + Math.floor(state.bossMeter / 20) + (sdk?.milestoneBonus || 0)}`,
      Accuracy:`${accuracy}%`
    }, true);
  }

  function showResult(icon, eyebrow, title, text, rewards, won) {
    $('#resultIcon').textContent = icon;
    $('#resultEyebrow').textContent = eyebrow;
    $('#resultTitle').textContent = title;
    $('#resultText').textContent = text;
    $('#rewardGrid').innerHTML = Object.entries(rewards)
      .map(([key, value]) => `<div><b>${value}</b><small>${key}</small></div>`)
      .join('');
    $('#continueButton').dataset.won = String(won);
    $('#resultDialog').showModal();
  }

  function continueTrip() {
    const won = $('#continueButton').dataset.won === 'true';
    $('#resultDialog').close();
    if (won) {
      state.currentCity = (state.currentCity + 1) % CITIES.length;
      state.bossMeter = 0;
      state.bag = [];
      saveTrip();
      toast(`${CITIES[state.currentCity].emoji} Rolling toward ${CITIES[state.currentCity].name}!`);
    }
    resumeRoad();
    renderHud();
  }

  function resumeRoad() {
    paused = false;
    document.body.classList.remove('paused');
    activeBattle = null;
  }

  function renderHud() {
    const city = CITIES[state.currentCity];
    $('#cityHud').textContent = `${city.emoji} ${city.name}`;
    $('#scoreHud').textContent = state.score.toLocaleString();
    const itemCount = state.bag.reduce((sum, item) => sum + item.count, 0);
    $('#itemsHud').textContent = itemCount;
    $('#bagBadge').textContent = itemCount;
    $('#heroBadge').textContent = state.heroes.length;
    $('#bossFill').style.width = `${state.bossMeter}%`;
    $('#bossValue').textContent = `${state.bossMeter}%`;
    $('#battleButton').disabled = state.bossMeter < 60;
    $('#battleReady').textContent = state.bossMeter >= 60 ? 'READY' : `${60 - state.bossMeter}%`;
    moveCar();
  }

  function openPanel(name) {
    let html = '';
    if (name === 'bagPanel') {
      html = `<p class="eyebrow">Road inventory</p><h2>Power Bag</h2><div class="inventory">${state.bag.length
        ? state.bag.map(item => `<article><span>${item.emoji}</span><div><b>${item.name}</b><small class="muted">${item.desc}</small></div><strong>×${item.count}<br>+${item.power}</strong></article>`).join('')
        : '<p class="muted">Collect glowing items from the road.</p>'}</div>`;
    }
    if (name === 'routePanel') {
      html = `<p class="eyebrow">Eight-city expedition</p><h2>Quest Route</h2><div class="route-list">${CITIES.map((city, index) => `<article class="${index === state.currentCity ? 'current' : ''} ${state.cityProgress[city.name]?.defeated ? 'won' : ''}"><span>${city.emoji}</span><div><b>${city.name}</b><small class="muted">Boss: ${city.boss.emoji} ${city.boss.name} · ${city.boss.subject}</small></div><strong>${state.cityProgress[city.name]?.defeated ? '✅' : index === state.currentCity ? 'YOU' : '🔒'}</strong></article>`).join('')}</div>`;
    }
    if (name === 'heroesPanel') {
      html = `<p class="eyebrow">Friends from the road</p><h2>Hero Collection</h2><div class="hero-list">${state.heroes.length
        ? state.heroes.map(hero => `<article><span>${hero.emoji}</span><div><b>${hero.name}</b><small class="muted">${hero.desc}</small></div><strong>${hero.source}</strong></article>`).join('')
        : '<p class="muted">Defeat a boss or answer a roaming hero challenge.</p>'}</div>`;
    }
    if (name === 'helpPanel') {
      const total = QUESTION_SUBJECTS.reduce((sum, subject) => sum + questionBank.subjects[subject].length, 0);
      html = `<p class="eyebrow">How to play</p><h2>Driver's Guide</h2><p>Use <b>← →</b>, <b>A/D</b>, or the lane buttons. Match the car's lane with road items to collect them. Each item adds 12% to the boss meter. At 60%, you may battle; at 100%, you begin with bonus damage.</p><p>Use bag items before answering to increase correct-answer damage. Wrong answers cost 25 HP. Defeat each city's subject-themed boss to recruit its hero.</p><p class="muted">${total} reusable questions are loaded from data. Questions do not repeat within a subject until its deck cycles.</p>`;
    }
    $('#panelContent').innerHTML = html;
    $('#panelDialog').showModal();
  }

  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2300);
  }

  function syncProfile() {
    const current = profile();
    $('#profileChip').textContent = current
      ? `${current.avatar} ${current.name} · Level ${current.level} · ${current.kc} KC`
      : 'Device-local arcade profile';
  }

  function bind() {
    $('#startButton').addEventListener('click', start);
    $('#newTripButton').addEventListener('click', () => {
      if (confirm('Reset this Road Trip Quest campaign? Shared arcade XP and KC will stay safe.')) resetTrip();
    });
    $('#leftButton').addEventListener('click', () => move(-1));
    $('#rightButton').addEventListener('click', () => move(1));
    $('#battleButton').addEventListener('click', triggerBoss);
    $('#pauseButton').addEventListener('click', togglePause);
    $('#nextQuestion').addEventListener('click', nextRound);
    $('#continueButton').addEventListener('click', continueTrip);
    $('#closePanel').addEventListener('click', () => $('#panelDialog').close());
    document.querySelectorAll('.bottom-nav button').forEach(button => {
      button.addEventListener('click', () => openPanel(button.dataset.panel));
    });
    window.addEventListener('keydown', event => {
      if (['ArrowLeft','a','A'].includes(event.key)) move(-1);
      if (['ArrowRight','d','D'].includes(event.key)) move(1);
      if (event.key === ' ' && state.bossMeter >= 60) triggerBoss();
      if (event.key === 'p' || event.key === 'P') togglePause();
    });
    window.addEventListener('larriverse:profile', syncProfile);
  }

  async function init() {
    $('#startButton').disabled = true;
    $('#roadMessage').textContent = 'Loading the expanded learning question bank…';
    await loadQuestions();
    bind();
    syncProfile();
    renderHud();
    $('#startButton').disabled = false;
    const total = QUESTION_SUBJECTS.reduce((sum, subject) => sum + questionBank.subjects[subject].length, 0);
    $('#roadMessage').textContent = `${total} non-repeating questions ready. Collect road items to charge the boss meter.`;
  }

  init().catch(error => {
    console.error(error);
    $('#roadMessage').textContent = `Road Trip Quest could not load: ${error.message}`;
    $('#startButton').disabled = true;
  });
})();
