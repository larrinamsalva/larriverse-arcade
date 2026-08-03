(() => {
  'use strict';

  const GAME_ID = 'road-trip-quest-gps';
  const SAVE_KEY = 'larriverse.roadTripGps.v1';
  const FIELD_RADIUS_METERS = 340;
  const CATCH_RADIUS_METERS = 95;
  const $ = selector => document.querySelector(selector);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const fresh = () => ({
    version: 1,
    xp: 0,
    score: 0,
    totalCatches: 0,
    collection: [],
    levelUnlocks: [],
    demoFields: 0,
    liveFields: 0
  });

  let world;
  let state = load();
  let mode = 'demo';
  let player = { x: 50, y: 50 };
  let field = [];
  let caughtThisField = new Set();
  let currentEncounter = null;
  let currentQuestion = null;
  let watchId = null;
  let liveOrigin = null;
  let liveCurrent = null;
  let collectionFilter = 'all';

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      return {
        ...fresh(),
        ...saved,
        collection: Array.isArray(saved.collection) ? saved.collection : [],
        levelUnlocks: Array.isArray(saved.levelUnlocks) ? saved.levelUnlocks : []
      };
    } catch {
      return fresh();
    }
  }

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  async function init() {
    const response = await fetch('world.json');
    if (!response.ok) throw new Error(`Could not load quest data (${response.status})`);
    world = await response.json();
    bind();
    renderSharedProfile();
    renderHud();
  }

  function bind() {
    $('#demoButton').addEventListener('click', () => startMode('demo'));
    $('#liveButton').addEventListener('click', requestLiveMode);
    $('#privacyButton').addEventListener('click', () => $('#privacyDialog').showModal());
    $('#stopTracking').addEventListener('click', () => stopLocation(false));
    $('#newField').addEventListener('click', generateField);
    $('#collectionButton').addEventListener('click', openCollection);
    $('#closeEncounter').addEventListener('click', closeEncounter);
    $('#catchButton').addEventListener('click', beginQuestion);
    $('#closeLevel').addEventListener('click', () => $('#levelDialog').close());

    document.querySelectorAll('[data-move]').forEach(button => {
      button.addEventListener('click', () => moveDemo(button.dataset.move));
    });

    document.querySelectorAll('[data-collection]').forEach(button => {
      button.addEventListener('click', () => {
        collectionFilter = button.dataset.collection;
        document.querySelectorAll('[data-collection]').forEach(item => item.classList.toggle('active', item === button));
        renderCollection();
      });
    });

    window.addEventListener('keydown', event => {
      const key = event.key.toLowerCase();
      const direction = {
        arrowup: 'up', w: 'up',
        arrowdown: 'down', s: 'down',
        arrowleft: 'left', a: 'left',
        arrowright: 'right', d: 'right'
      }[key];
      if (direction && !$('#gameView').hidden && mode === 'demo') {
        event.preventDefault();
        moveDemo(direction);
      }
    });

    window.addEventListener('larriverse:profile', renderSharedProfile);
    window.addEventListener('pagehide', () => stopLocation(true));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopLocation(true);
    });
  }

  function startMode(nextMode) {
    mode = nextMode;
    $('#landingView').hidden = true;
    $('#gameView').hidden = false;
    $('#demoControls').hidden = mode !== 'demo';
    $('#modeIcon').textContent = mode === 'live' ? '📍' : '🎮';
    $('#modeLabel').textContent = mode === 'live' ? 'Live Movement' : 'Demo Mode';
    $('#trackingText').textContent = mode === 'live'
      ? 'Location active in memory only'
      : 'No location access';
    $('#stopTracking').hidden = mode !== 'live';
    player = { x: 50, y: 50 };
    if (mode === 'demo') state.demoFields += 1;
    if (mode === 'live') state.liveFields += 1;
    save();
    generateField();
    renderHud();
  }

  function requestLiveMode() {
    if (!navigator.geolocation) {
      toast('Location is unavailable here. Opening Demo Mode.');
      startMode('demo');
      return;
    }

    $('#liveButton').disabled = true;
    $('#liveButton').textContent = 'Requesting location…';

    navigator.geolocation.getCurrentPosition(
      position => {
        liveOrigin = pointFromPosition(position);
        liveCurrent = { ...liveOrigin };
        startMode('live');
        startWatching();
        $('#liveButton').disabled = false;
        $('#liveButton').textContent = 'Use Live Movement';
      },
      () => {
        $('#liveButton').disabled = false;
        $('#liveButton').textContent = 'Use Live Movement';
        toast('Location was not enabled. Demo Mode is ready.');
        startMode('demo');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  function startWatching() {
    if (watchId !== null || !navigator.geolocation || !liveOrigin) return;
    watchId = navigator.geolocation.watchPosition(
      position => updateLivePosition(pointFromPosition(position)),
      () => {
        toast('Live movement paused. Your quest progress is safe.');
        stopLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  function pointFromPosition(position) {
    return {
      lat: Number(position.coords.latitude),
      lng: Number(position.coords.longitude),
      accuracy: Number(position.coords.accuracy) || 0
    };
  }

  function updateLivePosition(next) {
    if (!liveOrigin || mode !== 'live') return;
    liveCurrent = next;
    const offset = meterOffset(liveOrigin, next);
    player.x = clamp(50 + offset.x / FIELD_RADIUS_METERS * 44, 4, 96);
    player.y = clamp(50 - offset.y / FIELD_RADIUS_METERS * 44, 4, 96);
    $('#trackingText').textContent = `Location active · accuracy about ${Math.round(next.accuracy)} m · never saved`;
    renderPlayer();
    updateDistances();
  }

  function stopLocation(silent) {
    if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    liveOrigin = null;
    liveCurrent = null;

    if (mode === 'live') {
      mode = 'demo';
      $('#modeIcon').textContent = '🎮';
      $('#modeLabel').textContent = 'Demo Mode';
      $('#trackingText').textContent = 'Location stopped and cleared';
      $('#stopTracking').hidden = true;
      $('#demoControls').hidden = false;
      if (!silent) toast('Location stopped. Coordinates were cleared.');
    }
  }

  function generateField() {
    caughtThisField = new Set();
    currentEncounter = null;
    const types = Object.keys(world.placeTypes);
    field = types.map((type, index) => {
      const angle = (Math.PI * 2 * index / types.length) + Math.random() * 0.32;
      const radius = 95 + Math.random() * 210;
      const xMeters = Math.cos(angle) * radius;
      const yMeters = Math.sin(angle) * radius;
      return {
        id: `${Date.now()}-${index}`,
        type,
        xMeters,
        yMeters,
        x: clamp(50 + xMeters / FIELD_RADIUS_METERS * 44, 6, 94),
        y: clamp(50 - yMeters / FIELD_RADIUS_METERS * 44, 6, 94),
        label: questLabel(type),
        reward: randomFrom(world.rewards[type] || world.rewards.default)
      };
    });
    renderField();
    updateDistances();
    toast(`${field.length} local quest markers generated.`);
  }

  function questLabel(type) {
    const sourceTag = world.placeTypes[type]?.tag || '📍 Place';
    return `${sourceTag.replace(/^\S+\s*/, '')} Quest`;
  }

  function renderField() {
    $('#poiLayer').innerHTML = field.map(poi => {
      const style = world.placeTypes[poi.type] || world.placeTypes.default;
      const emoji = (style.tag || '📍').split(' ')[0];
      return `<button class="poi" data-poi="${poi.id}" data-distance=""
        style="left:${poi.x}%;top:${poi.y}%;--poi-bg:${style.bg};--poi-glow:${style.glow}"
        aria-label="${esc(poi.label)}">${emoji}</button>`;
    }).join('');

    $('#poiLayer').querySelectorAll('[data-poi]').forEach(button => {
      button.addEventListener('click', () => openEncounter(button.dataset.poi));
    });
    renderPlayer();
  }

  function renderPlayer() {
    $('#player').style.left = `${player.x}%`;
    $('#player').style.top = `${player.y}%`;
    $('#rangeRing').style.left = `${player.x}%`;
    $('#rangeRing').style.top = `${player.y}%`;
  }

  function moveDemo(direction) {
    if (mode !== 'demo') return;
    const step = 4.6;
    if (direction === 'up') player.y -= step;
    if (direction === 'down') player.y += step;
    if (direction === 'left') player.x -= step;
    if (direction === 'right') player.x += step;
    player.x = clamp(player.x, 3, 97);
    player.y = clamp(player.y, 3, 97);
    renderPlayer();
    updateDistances();
  }

  function distanceTo(poi) {
    const px = (player.x - 50) / 44 * FIELD_RADIUS_METERS;
    const py = -(player.y - 50) / 44 * FIELD_RADIUS_METERS;
    return Math.hypot(px - poi.xMeters, py - poi.yMeters);
  }

  function updateDistances() {
    field.forEach(poi => {
      const button = $(`[data-poi="${poi.id}"]`);
      if (!button) return;
      const distance = Math.round(distanceTo(poi));
      button.dataset.distance = `${distance} m`;
      button.classList.toggle('near', distance <= CATCH_RADIUS_METERS && !caughtThisField.has(poi.id));
      button.classList.toggle('caught', caughtThisField.has(poi.id));
    });
  }

  function openEncounter(id) {
    const poi = field.find(item => item.id === id);
    if (!poi || caughtThisField.has(id)) return;
    const distance = distanceTo(poi);
    if (distance > CATCH_RADIUS_METERS) {
      toast(`Move about ${Math.max(1, Math.round(distance - CATCH_RADIUS_METERS))} m closer in the quest field.`);
      return;
    }

    currentEncounter = poi;
    currentQuestion = null;
    const style = world.placeTypes[poi.type] || world.placeTypes.default;
    $('#placeTag').textContent = style.tag;
    $('#placeTag').style.color = style.color;
    $('#rewardEmoji').textContent = poi.reward.emoji;
    $('#rewardName').textContent = poi.reward.name;
    $('#placeName').textContent = `${poi.label} · ${Math.round(distance)} m in the quest field`;
    $('#rewardXp').textContent = `+${poi.reward.xp} source XP`;
    $('#rewardDescription').textContent = poi.reward.desc;
    $('#questionSection').hidden = true;
    $('#catchButton').hidden = false;
    $('#catchButton').disabled = false;
    $('#catchButton').textContent = 'Answer to catch';
    $('#encounterDialog').showModal();
  }

  function closeEncounter() {
    $('#encounterDialog').close();
    currentEncounter = null;
    currentQuestion = null;
  }

  function beginQuestion() {
    if (!currentEncounter) return;
    currentQuestion = randomQuestion();
    $('#questionSection').hidden = false;
    $('#catchButton').hidden = true;
    const subjectMeta = {
      math: '🔢 Math',
      science: '🔬 Science',
      reading: '📖 Reading',
      trivia: '🌟 Trivia'
    };
    $('#subjectBadge').textContent = subjectMeta[currentQuestion.subject] || '❓ Question';
    $('#questionText').textContent = currentQuestion.q;
    $('#questionFeedback').textContent = '';
    $('#answerGrid').innerHTML = currentQuestion.a.map((answer, index) =>
      `<button data-answer="${index}">${esc(answer)}</button>`
    ).join('');
    $('#answerGrid').querySelectorAll('[data-answer]').forEach(button => {
      button.addEventListener('click', () => answerQuestion(Number(button.dataset.answer)));
    });
  }

  function randomQuestion() {
    const subjects = Object.entries(world.questions);
    const [subject, questions] = randomFrom(subjects);
    return { ...randomFrom(questions), subject };
  }

  function answerQuestion(answerIndex) {
    if (!currentQuestion || !currentEncounter) return;
    const buttons = [...$('#answerGrid').querySelectorAll('button')];
    buttons.forEach((button, index) => {
      button.disabled = true;
      if (index === currentQuestion.c) button.classList.add('correct');
      if (index === answerIndex && answerIndex !== currentQuestion.c) button.classList.add('wrong');
    });

    if (answerIndex !== currentQuestion.c) {
      $('#questionFeedback').textContent = 'Not this one. Choose another quest question when ready.';
      setTimeout(beginQuestion, 950);
      return;
    }

    $('#questionFeedback').textContent = 'Correct — collectible secured!';
    setTimeout(completeCatch, 550);
  }

  function completeCatch() {
    if (!currentEncounter) return;
    const poi = currentEncounter;
    const rewardId = `${poi.type}:${poi.reward.name}`;
    const isNew = !state.collection.includes(rewardId);
    const previousLevel = questLevel();
    const earnedXp = isNew ? poi.reward.xp : Math.max(12, Math.round(poi.reward.xp / 3));
    const earnedScore = earnedXp + (isNew ? 25 : 6);

    if (isNew) state.collection.push(rewardId);
    state.xp += earnedXp;
    state.score += earnedScore;
    state.totalCatches += 1;
    caughtThisField.add(poi.id);
    save();

    const kc = poi.reward.xp >= 65 ? 9 : poi.reward.xp >= 45 ? 6 : 3;
    const result = window.LarriVerseArcade?.award?.(GAME_ID, {
      xp: Math.min(54, earnedXp),
      kc,
      score: earnedScore,
      completed: true,
      metrics: {
        placesCaught: 1,
        questionsCorrect: 1,
        uniqueRewards: isNew ? 1 : 0,
        liveModeCatches: mode === 'live' ? 1 : 0,
        demoModeCatches: mode === 'demo' ? 1 : 0
      }
    });

    $('#encounterDialog').close();
    currentEncounter = null;
    currentQuestion = null;
    renderHud();
    updateDistances();
    renderSharedProfile();

    const newLevel = questLevel();
    const bonus = result?.milestoneBonus ? ` · +${result.milestoneBonus} milestone KC` : '';
    toast(`${poi.reward.emoji} ${poi.reward.name} ${isNew ? 'joined the collection' : 'gave repeat practice XP'}! +${kc} arcade KC${bonus}`);

    if (newLevel > previousLevel) showLevelUp(newLevel);
  }

  function questLevel() {
    let level = 1;
    world?.levelThresholds?.forEach((threshold, index) => {
      if (state.xp >= threshold) level = index + 1;
    });
    return level;
  }

  function showLevelUp(level) {
    const unlock = world.levelUnlocks[level - 1] || 'New quest level!';
    if (unlock && !state.levelUnlocks.includes(unlock)) {
      state.levelUnlocks.push(unlock);
      save();
    }
    $('#levelTitle').textContent = `Quest Level ${level}`;
    $('#levelUnlock').textContent = unlock || 'Your adventure collection keeps growing.';
    $('#levelDialog').showModal();
  }

  function renderHud() {
    if (!world) return;
    const level = questLevel();
    $('#questLevel').textContent = level;
    $('#scoreValue').textContent = state.score;
    $('#foundValue').textContent = `${state.collection.length}/${world.source.rewardCount}`;
    const currentThreshold = world.levelThresholds[level - 1] || 0;
    const nextThreshold = world.levelThresholds[level] ?? currentThreshold + 600;
    const progress = nextThreshold === currentThreshold
      ? 100
      : clamp((state.xp - currentThreshold) / (nextThreshold - currentThreshold) * 100, 0, 100);
    $('#xpFill').style.width = `${progress}%`;
  }

  function renderSharedProfile() {
    const profile = window.LarriVerseArcade?.summary?.() || { avatar: '🌟', level: 1 };
    $('#sharedAvatar').textContent = profile.avatar || '🌟';
    $('#sharedLevel').textContent = `Arcade ${profile.level || 1}`;
  }

  function openCollection() {
    collectionFilter = 'all';
    document.querySelectorAll('[data-collection]').forEach(button => {
      button.classList.toggle('active', button.dataset.collection === 'all');
    });
    renderCollection();
    $('#collectionDialog').showModal();
  }

  function renderCollection() {
    const allRewards = [];
    Object.entries(world.rewards).forEach(([type, rewards]) => {
      rewards.forEach(reward => allRewards.push({ ...reward, typeKey: type, rewardId: `${type}:${reward.name}` }));
    });
    const filtered = collectionFilter === 'all'
      ? allRewards
      : allRewards.filter(reward => reward.type === collectionFilter);

    $('#collectionGrid').innerHTML = filtered.map(reward => {
      const earned = state.collection.includes(reward.rewardId);
      return `<article class="collection-item ${earned ? '' : 'locked'}">
        <span class="emoji">${earned ? reward.emoji : '❔'}</span>
        <b>${earned ? esc(reward.name) : 'Undiscovered'}</b>
        <small>${earned ? `${esc(reward.type)} · ${esc(questLabel(reward.typeKey))}` : esc(reward.type)}</small>
      </article>`;
    }).join('');
  }

  function meterOffset(origin, point) {
    const latMeters = (point.lat - origin.lat) * 111320;
    const lngMeters = (point.lng - origin.lng) * 111320 * Math.cos(origin.lat * Math.PI / 180);
    return { x: lngMeters, y: latMeters };
  }

  function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  let toastTimer;
  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3200);
  }

  init().catch(error => {
    document.body.innerHTML = `<main class="view"><div class="boundary"><span>🌧️</span><div><strong>Road Trip Quest GPS could not load.</strong><p>${esc(error.message)}</p><p><a href="../../index.html">Return to the arcade</a></p></div></div></main>`;
  });
})();
