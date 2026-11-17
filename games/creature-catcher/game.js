(() => {
  'use strict';

  const GAME_ID = 'creature-catcher';
  const COLLECTION_KEY = 'larriverse.creature-catcher.collection.v1';
  const QUESTION_SOURCE = '../learning-question-bank.json';
  const QUESTION_SUBJECTS = ['math', 'reading', 'science', 'nature'];
  const SUBJECT_LABELS = { math: 'Math', reading: 'Reading', science: 'Science', nature: 'Nature' };

  const creatures = [
    {id:'foxfire',movement:'trot',name:'Foxfire',rarity:'common'},
    {id:'ribbit',movement:'hop',name:'Ribbit Rex',rarity:'common'},
    {id:'buzzy',movement:'fly',name:'Buzzy B',rarity:'common'},
    {id:'spiky',movement:'trot',name:'Spiky Sam',rarity:'common'},
    {id:'octo',movement:'swim',name:'Octo Otto',rarity:'uncommon'},
    {id:'flippy',movement:'swim',name:'Flippy',rarity:'uncommon'},
    {id:'roary',movement:'trot',name:'Roary',rarity:'uncommon'},
    {id:'drake',movement:'fly',name:'Sparkle Drake',rarity:'rare'},
    {id:'unicorny',movement:'trot',name:'Unicorny',rarity:'rare'},
    {id:'moonmoth',movement:'fly',name:'Moon Moth',rarity:'rare'}
  ];

  const world = document.querySelector('#world');
  const overlays = {
    start: document.querySelector('#startOverlay'),
    question: document.querySelector('#questionOverlay'),
    guide: document.querySelector('#guideOverlay'),
    end: document.querySelector('#endOverlay')
  };
  const state = {
    running: false,
    paused: false,
    time: 60,
    score: 0,
    caught: 0,
    active: [],
    current: null,
    timer: null,
    spawner: null,
    collection: loadCollection()
  };
  const decks = {};
  let questionBank = null;
  const $ = id => document.getElementById(id);

  function loadCollection() {
    try {
      return JSON.parse(localStorage.getItem(COLLECTION_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveCollection() {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(state.collection));
  }

  function random(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(list) {
    return [...list].sort(() => Math.random() - 0.5);
  }

  function rarityPoints(rarity) {
    return rarity === 'rare' ? 9 : rarity === 'uncommon' ? 6 : 3;
  }

  function profileText() {
    const profile = window.LarriVerseArcade.summary();
    const total = QUESTION_SUBJECTS.reduce((sum, subject) => sum + questionBank.subjects[subject].length, 0);
    $('profileLine').textContent = `${profile.avatar} ${profile.name} · Level ${profile.level} · ${profile.kc} KC · ${total} learning questions loaded`;
  }

  function updateHud() {
    $('time').textContent = state.time;
    $('score').textContent = state.score;
    $('caught').textContent = state.caught;
  }

  function toast(message) {
    const element = $('toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(element._timer);
    element._timer = setTimeout(() => element.classList.remove('show'), 1800);
  }

  function nextQuestion() {
    const subject = random(QUESTION_SUBJECTS);
    if (!decks[subject]?.length) decks[subject] = shuffle(questionBank.subjects[subject]);
    const question = decks[subject].pop();
    return {
      id: question.id,
      subject: SUBJECT_LABELS[subject],
      prompt: question.prompt,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation
    };
  }

  function begin() {
    if (!questionBank) return;
    Object.values(overlays).forEach(element => element.classList.add('hidden'));
    state.running = true;
    state.paused = false;
    state.time = 60;
    state.score = 0;
    state.caught = 0;
    state.active.forEach(removeCreature);
    state.active = [];
    updateHud();
    $('banner').classList.remove('hidden');
    setTimeout(() => $('banner').classList.add('hidden'), 1200);
    spawn();
    spawn();
    state.spawner = setInterval(spawn, 1900);
    state.timer = setInterval(tick, 1000);
    $('pauseButton').textContent = '⏸ Pause';
  }

  function tick() {
    if (!state.running || state.paused) return;
    state.time -= 1;
    updateHud();
    if (state.time <= 0) finish();
  }

  function creatureArt(creature) {
    return `<img class="creature-art" src="art/${creature.id}.webp" alt="" width="240" height="192" draggable="false">`;
  }

  function meadowPosition(movement) {
    const swims = movement === 'swim';
    const startX = swims ? 72 : 8;
    const spanX = swims ? 20 : movement === 'fly' ? 84 : 51;
    const startY = swims ? 44 : 43;
    const spanY = swims ? 17 : 36;
    const width = world.clientWidth;
    const height = world.clientHeight;
    const edge = Math.max(48, Math.min(width * .095, 84));
    const occupied = state.active.map(button => [button.offsetLeft, button.offsetTop]);
    let best = { space: -1 };

    for (let attempt = 0; attempt < 8; attempt++) {
      const left = startX + Math.random() * spanX;
      const top = startY + Math.random() * spanY;
      const x = Math.max(edge, Math.min(width - edge, width * left / 100));
      const y = Math.max(100, Math.min(height - 100, height * top / 100));
      const space = Math.min(...occupied.map(([otherX, otherY]) => Math.hypot(x - otherX, y - otherY)));
      if (space > best.space) best = { left, top, space };
    }
    return best;
  }

  function spawn() {
    if (!state.running || state.paused || state.active.length >= 5) return;
    const creature = random(creatures);
    const button = document.createElement('button');
    button.className = 'creature';
    button.dataset.movement = creature.movement;
    button.type = 'button';
    button.setAttribute('aria-label', `Catch ${creature.name}`);
    const { left, top } = meadowPosition(creature.movement);
    const edge = 'clamp(48px, 9.5%, 84px)';
    button.style.left = `clamp(${edge}, ${left}%, calc(100% - ${edge}))`;
    button.style.top = `clamp(100px, ${top}%, calc(100% - 100px))`;
    button.style.setProperty('--creature-delay', `-${Math.random()}s`);
    button.innerHTML = `${creatureArt(creature)}<span class="tag" aria-hidden="true">${creature.name}</span>`;
    button.addEventListener('click', () => encounter(creature, button));
    world.appendChild(button);
    state.active.push(button);
    button._expiry = setTimeout(() => removeCreature(button), 7500);
  }

  function removeCreature(button) {
    if (!button) return;
    clearTimeout(button._expiry);
    state.active = state.active.filter(item => item !== button);
    button.remove();
  }

  function encounter(creature, button) {
    if (!state.running || state.paused) return;
    state.paused = true;
    state.current = { creature, button, question: nextQuestion(), answered: false };
    $('questionCreature').innerHTML = creatureArt(creature);
    $('creatureName').textContent = creature.name;
    $('rarity').textContent = creature.rarity;
    $('subject').textContent = state.current.question.subject;
    $('questionText').textContent = state.current.question.prompt;
    $('feedback').textContent = '';
    $('feedback').className = 'feedback';
    $('continueButton').classList.add('hidden');
    $('answers').innerHTML = '';
    state.current.question.options.forEach((label, index) => {
      const answer = document.createElement('button');
      answer.className = 'answer';
      answer.type = 'button';
      answer.textContent = label;
      answer.addEventListener('click', () => answerQuestion(index, answer));
      $('answers').appendChild(answer);
    });
    overlays.question.classList.remove('hidden');
  }

  function answerQuestion(index, button) {
    if (state.current.answered) return;
    state.current.answered = true;
    const question = state.current.question;
    const buttons = [...document.querySelectorAll('.answer')];
    buttons.forEach(item => item.disabled = true);
    buttons[question.answer].classList.add('correct');

    if (index === question.answer) {
      const points = rarityPoints(state.current.creature.rarity);
      button.classList.add('correct');
      state.score += points;
      state.caught += 1;
      state.collection[state.current.creature.id] = (state.collection[state.current.creature.id] || 0) + 1;
      saveCollection();
      removeCreature(state.current.button);
      $('feedback').textContent = `Caught! +${points} points. ${question.explanation}`;
      $('feedback').className = 'feedback good';
      toast(`${state.current.creature.name} added to the field guide`);
    } else {
      button.classList.add('wrong');
      state.score += 1;
      $('feedback').textContent = `Good try — ${question.options[question.answer]} is correct. ${question.explanation}`;
      $('feedback').className = 'feedback bad';
      removeCreature(state.current.button);
    }

    updateHud();
    $('continueButton').classList.remove('hidden');
  }

  function continueRound() {
    overlays.question.classList.add('hidden');
    state.current = null;
    state.paused = false;
    spawn();
  }

  function togglePause() {
    if (!state.running) return;
    if (!overlays.question.classList.contains('hidden') || !overlays.guide.classList.contains('hidden')) return;
    state.paused = !state.paused;
    $('pauseButton').textContent = state.paused ? '▶ Resume' : '⏸ Pause';
    toast(state.paused ? 'Safari paused' : 'Safari resumed');
  }

  function openGuide() {
    state.paused = true;
    renderGuide();
    overlays.guide.classList.remove('hidden');
  }

  function closeGuide() {
    overlays.guide.classList.add('hidden');
    if (state.running) state.paused = false;
  }

  function renderGuide() {
    $('collectionGrid').innerHTML = creatures.map(creature => {
      const count = state.collection[creature.id] || 0;
      return `<div class="specimen ${count ? '' : 'locked'}"><span aria-hidden="true">${count ? creatureArt(creature) : '❔'}</span><b>${count ? creature.name : 'Undiscovered'}</b><small>${count ? `Caught ×${count}` : creature.rarity}</small></div>`;
    }).join('');
  }

  function finish() {
    state.running = false;
    state.paused = true;
    clearInterval(state.timer);
    clearInterval(state.spawner);
    state.active.forEach(removeCreature);
    state.active = [];
    overlays.question.classList.add('hidden');

    const kc = state.caught ? Math.min(18, 3 + Math.floor(state.caught / 3) * 3) : 0;
    const result = window.LarriVerseArcade.award(GAME_ID, {
      xp: state.score,
      kc,
      score: state.score,
      catches: state.caught,
      completed: state.caught > 0
    });
    $('finalScore').textContent = state.score;
    $('xpReward').textContent = state.score;
    $('kcReward').textContent = kc + result.milestoneBonus;
    $('scoreRing').style.setProperty('--score-angle', `${Math.min(100, state.score) / 100 * 360}deg`);
    $('roundSummary').textContent = `You caught ${state.caught} creature${state.caught === 1 ? '' : 's'} and reached Level ${result.level}.`;
    const notes = [];
    if (result.milestoneBonus) notes.push(`3-session milestone: +${result.milestoneBonus} KC`);
    if (result.unlocked.length) notes.push(`${result.unlocked.length} achievement unlocked`);
    $('bonusLine').textContent = notes.join(' · ') || 'Every safari grows your permanent arcade profile.';
    overlays.end.classList.remove('hidden');
  }

  function bind() {
    $('startButton').addEventListener('click', begin);
    $('replayButton').addEventListener('click', begin);
    $('continueButton').addEventListener('click', continueRound);
    $('pauseButton').addEventListener('click', togglePause);
    $('guideButton').addEventListener('click', openGuide);
    $('closeGuide').addEventListener('click', closeGuide);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.running && !state.paused) togglePause();
    });
  }

  async function init() {
    $('startButton').disabled = true;
    $('profileLine').textContent = 'Loading the expanded learning question bank…';
    const response = await fetch(QUESTION_SOURCE);
    if (!response.ok) throw new Error(`Question bank could not load (${response.status})`);
    questionBank = await response.json();
    for (const subject of QUESTION_SUBJECTS) {
      if (!Array.isArray(questionBank.subjects?.[subject]) || questionBank.subjects[subject].length < 3) {
        throw new Error(`Question bank needs at least three ${subject} questions`);
      }
    }
    bind();
    profileText();
    renderGuide();
    updateHud();
    $('startButton').textContent = 'Start exploring';
    $('startButton').disabled = false;
  }

  init().catch(error => {
    console.error(error);
    $('profileLine').textContent = `Creature Catcher could not load: ${error.message}`;
    $('startButton').disabled = true;
  });
})();
