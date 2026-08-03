(() => {
  'use strict';

  const GAME_ID = 'chill-brain-rewards';
  const SAVE_KEY = 'larriverse.chillBrain.v1';
  const SETTINGS_KEY = 'larriverse.chillBrain.settings.v1';
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const $ = selector => document.querySelector(selector);
  const fresh = () => ({
    onboardingComplete: false,
    guide: { name: '', age: '', avatar: '🌱', profile: 'little' },
    sessions: 0,
    completedMissionIds: [],
    totalSeconds: 0,
    breathCycles: 0,
    soundSessions: 0,
    skills: {},
    badges: [],
    practiceDates: [],
    lastMissionId: null
  });
  const defaultSettings = () => ({ sound: false, reducedMotion: false, highContrast: false, largeText: false, durationMode: 'source' });

  let manifest = null;
  let state = loadState();
  let settings = loadSettings();
  let setupStep = 0;
  let activeMission = null;
  let timer = null;
  let remaining = 0;
  let totalDuration = 0;
  let running = false;
  let paused = false;
  let phaseElapsed = 0;
  let audio = { context: null, oscillator: null, gain: null };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      return {
        ...fresh(),
        ...saved,
        guide: { ...fresh().guide, ...(saved.guide || {}) },
        skills: saved.skills || {},
        badges: Array.isArray(saved.badges) ? saved.badges : [],
        practiceDates: Array.isArray(saved.practiceDates) ? saved.practiceDates : [],
        completedMissionIds: Array.isArray(saved.completedMissionIds) ? saved.completedMissionIds : []
      };
    } catch {
      return fresh();
    }
  }

  function saveState() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function loadSettings() {
    try {
      return { ...defaultSettings(), ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
    } catch {
      return defaultSettings();
    }
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applySettings();
  }

  function profileSummary() {
    return window.LarriVerseArcade?.summary?.() || { avatar: '🌟', level: 1, kc: 0 };
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  async function init() {
    const response = await fetch('sessions.json');
    if (!response.ok) throw new Error(`Could not load sessions (${response.status})`);
    manifest = await response.json();
    applySettings();
    bindControls();
    if (state.onboardingComplete) showHome();
    else showSetup();
  }

  function bindControls() {
    $('#settingsButton').addEventListener('click', openSettings);
    $('#editGuideButton').addEventListener('click', () => {
      setupStep = 0;
      showSetup();
    });
    $('#leaveSession').addEventListener('click', leaveSession);
    $('#pauseSession').addEventListener('click', togglePause);
    $('#startSession').addEventListener('click', startTimer);
    $('#completeEarly').addEventListener('click', () => finishSession(false));
    $('#resultHome').addEventListener('click', () => {
      $('#resultDialog').close();
      showHome();
    });
    $('#settingsDialog').addEventListener('close', readSettings);
    ['soundToggle', 'motionToggle', 'contrastToggle', 'textToggle', 'durationMode'].forEach(id => {
      $('#' + id).addEventListener('change', readSettings);
    });
    window.addEventListener('larriverse:profile', renderProfile);
  }

  function applySettings() {
    document.body.classList.toggle('reduced-motion', settings.reducedMotion);
    document.body.classList.toggle('high-contrast', settings.highContrast);
    document.body.classList.toggle('large-text', settings.largeText);
    if (!settings.sound) stopAudio();
  }

  function openSettings() {
    $('#soundToggle').checked = settings.sound;
    $('#motionToggle').checked = settings.reducedMotion;
    $('#contrastToggle').checked = settings.highContrast;
    $('#textToggle').checked = settings.largeText;
    $('#durationMode').value = settings.durationMode;
    $('#settingsDialog').showModal();
  }

  function readSettings() {
    settings = {
      sound: $('#soundToggle').checked,
      reducedMotion: $('#motionToggle').checked,
      highContrast: $('#contrastToggle').checked,
      largeText: $('#textToggle').checked,
      durationMode: $('#durationMode').value === 'preview' ? 'preview' : 'source'
    };
    saveSettings();
  }

  function showSetup() {
    stopTimer();
    stopAudio();
    $('#homeView').hidden = true;
    $('#sessionView').hidden = true;
    $('#setupView').hidden = false;
    renderSetup();
  }

  function showHome() {
    stopTimer();
    stopAudio();
    $('#setupView').hidden = true;
    $('#sessionView').hidden = true;
    $('#homeView').hidden = false;
    renderHome();
  }

  function showSession(mission) {
    activeMission = mission;
    $('#setupView').hidden = true;
    $('#homeView').hidden = true;
    $('#sessionView').hidden = false;
    totalDuration = settings.durationMode === 'preview' ? 45 : mission.durationSeconds;
    remaining = totalDuration;
    phaseElapsed = 0;
    running = false;
    paused = false;
    $('#sessionWorld').textContent = mission.world;
    $('#sessionIcon').textContent = mission.icon;
    $('#sessionName').textContent = mission.name;
    $('#sessionCue').textContent = 'Settle in and choose Start.';
    $('#phaseLabel').textContent = settings.durationMode === 'preview'
      ? '45-second preview'
      : `${Math.round(mission.durationSeconds / 60)} minute source session`;
    $('#sessionSteps').innerHTML = mission.steps.map(step => `<li>${esc(step)}</li>`).join('');
    $('#startSession').hidden = false;
    $('#completeEarly').hidden = true;
    $('#pauseSession').textContent = 'Pause';
    renderTimer();
  }

  function renderSetup() {
    $('#setupProgress').innerHTML = Array.from({ length: 6 }, (_, index) => {
      const className = index < setupStep ? 'done' : index === setupStep ? 'active' : '';
      return `<i class="${className}"></i>`;
    }).join('');

    const body = $('#setupBody');
    const profile = manifest.profiles.find(item => item.id === state.guide.profile) || manifest.profiles[0];
    const mission = manifest.missions.find(item => item.id === profile.recommendedMission) || manifest.missions[0];
    const back = setupStep > 0
      ? '<button class="secondary" data-action="back">← Back</button>'
      : `<button class="secondary" data-action="cancel">${state.onboardingComplete ? 'Cancel' : 'Visit rewards'}</button>`;
    const actions = nextLabel => `<div class="setup-actions">${back}<button class="primary" data-action="next">${nextLabel}</button></div>`;

    if (setupStep === 0) {
      body.innerHTML = `<div class="setup-art">🧠</div><p class="eyebrow">Step 1 of 6</p><h1>Welcome to Chill Brain ✨</h1><p>Set up a private calm-training space with gentle missions, local progress, optional sound, and parent-controlled session length.</p><div class="notice-card"><span>🌳</span><div><strong>Source roots</strong><p>The recovered concept promises magical worlds, calm and focus skills, rewards, and parent controls. This build turns that static flow into a playable, non-competitive cabinet.</p></div></div>${actions("Let's begin →")}`;
    }

    if (setupStep === 1) {
      body.innerHTML = `<p class="eyebrow">Step 2 of 6</p><h1>Who is joining? 🌟</h1><p>Choose the source profile that best fits the kind of first mission you want.</p><div class="option-grid">${manifest.profiles.map(item => `<button class="option-card ${state.guide.profile === item.id ? 'selected' : ''}" data-profile="${item.id}"><span>${item.icon}</span><b>${esc(item.title)}</b><small>${esc(item.ages)} · ${esc(item.description)}</small></button>`).join('')}</div>${actions('Continue →')}`;
    }

    if (setupStep === 2) {
      body.innerHTML = `<p class="eyebrow">Step 3 of 6</p><h1>Name your guide 🌸</h1><p>A nickname is enough. It stays on this device.</p><input class="setup-input" id="guideNameInput" maxlength="24" placeholder="Explorer nickname" value="${esc(state.guide.name)}"><h3>Age (optional)</h3><div class="age-options">${['4','5','6','7','8','9','10','11','12','Prefer not to say'].map(age => `<button class="age-option ${state.guide.age === age ? 'selected' : ''}" data-age="${age}">${age}</button>`).join('')}</div>${actions('Continue →')}`;
    }

    if (setupStep === 3) {
      body.innerHTML = `<p class="eyebrow">Step 4 of 6</p><h1>Pick a spirit guide 🧠</h1><p>The source says the guide grows and glows as practice continues.</p><div class="avatar-options">${manifest.avatars.map(avatar => `<button class="avatar-option ${state.guide.avatar === avatar ? 'selected' : ''}" data-avatar="${avatar}">${avatar}</button>`).join('')}</div>${actions("That's the one →")}`;
    }

    if (setupStep === 4) {
      body.innerHTML = `<p class="eyebrow">Step 5 of 6</p><h1>Your first mission 🚀</h1><div class="mission-preview"><h2>${mission.icon} ${esc(mission.name)}</h2><p><b>${esc(mission.world)}</b> · ${Math.round(mission.durationSeconds / 60)} min · source reward ${mission.sourceXp} XP</p><ol>${mission.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol></div><p class="muted">You may choose any mission after setup. Full sessions use the source duration; preview mode is available in settings.</p>${actions('Ready →')}`;
    }

    if (setupStep === 5) {
      body.innerHTML = `<div class="setup-art">${state.guide.avatar}</div><p class="eyebrow">Step 6 of 6</p><h1>${esc(state.guide.name || 'Your guide')} is ready 🎉</h1><p>Welcome Explorer is unlocked. Sound remains off until someone turns it on in settings.</p><div class="notice-card"><span>🏅</span><div><strong>Welcome Explorer</strong><p>Given to every new mind that joins.</p></div></div>${actions('Open mission garden →')}`;
    }

    body.querySelectorAll('[data-profile]').forEach(button => button.addEventListener('click', () => {
      state.guide.profile = button.dataset.profile;
      saveState();
      renderSetup();
    }));

    body.querySelectorAll('[data-age]').forEach(button => button.addEventListener('click', event => {
      event.preventDefault();
      state.guide.age = button.dataset.age;
      saveState();
      renderSetup();
    }));

    body.querySelectorAll('[data-avatar]').forEach(button => button.addEventListener('click', event => {
      event.preventDefault();
      state.guide.avatar = button.dataset.avatar;
      saveState();
      renderSetup();
    }));

    body.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      setupStep -= 1;
      renderSetup();
    });

    body.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      if (state.onboardingComplete) showHome();
      else finishOnboarding(false);
    });

    body.querySelector('[data-action="next"]')?.addEventListener('click', () => {
      if (setupStep === 2) state.guide.name = ($('#guideNameInput')?.value || '').trim().slice(0, 24);
      if (setupStep < 5) {
        setupStep += 1;
        saveState();
        renderSetup();
      } else {
        finishOnboarding(true);
      }
    });
  }

  function finishOnboarding(unlockBadge) {
    state.onboardingComplete = true;
    if (unlockBadge && !state.badges.includes('welcome-explorer')) state.badges.push('welcome-explorer');
    saveState();
    showHome();
  }

  function renderHome() {
    const profile = manifest.profiles.find(item => item.id === state.guide.profile) || manifest.profiles[0];
    $('#guideName').textContent = state.guide.name || profile.title;
    $('#guideAvatar').textContent = state.guide.avatar;
    renderProfile();
    $('#sessionCount').textContent = state.sessions;
    $('#minuteCount').textContent = Math.round(state.totalSeconds / 60);
    $('#streakCount').textContent = calculateStreak();

    $('#missionGrid').innerHTML = manifest.missions.map(mission => {
      const recommended = mission.id === profile.recommendedMission;
      const done = state.completedMissionIds.includes(mission.id);
      return `<article class="mission-card ${recommended ? 'recommended' : ''}">${recommended ? '<span class="recommended-tag">Recommended</span>' : ''}<div class="mission-icon">${mission.icon}</div><span class="mission-world">${esc(mission.world)}</span><h3>${esc(mission.name)}</h3><p>${esc(mission.steps[0])}. ${esc(mission.steps[mission.steps.length - 1])}.</p><div class="mission-meta"><span>${Math.round(mission.durationSeconds / 60)} min</span><span>+${mission.sourceXp} XP</span><span>${done ? '✓ Practiced' : 'Gentle'}</span></div><button class="primary" data-mission="${mission.id}">${done ? 'Practice again' : 'Start mission'}</button></article>`;
    }).join('');

    $('#missionGrid').querySelectorAll('[data-mission]').forEach(button => {
      button.addEventListener('click', () => showSession(manifest.missions.find(mission => mission.id === button.dataset.mission)));
    });

    renderSkills();
    renderBadges();
  }

  function renderProfile() {
    const profile = profileSummary();
    $('#sharedAvatar').textContent = profile.avatar || '🌟';
    $('#sharedLevel').textContent = `Level ${profile.level || 1}`;
    $('#sharedKc').textContent = `${profile.kc || 0} KC`;
  }

  function renderSkills() {
    $('#skillsGrid').innerHTML = manifest.skills.map(skill => {
      const points = Number(state.skills[skill.id]) || 0;
      const percent = Math.min(100, Math.round(points / 36 * 100));
      return `<article class="skill-card"><div class="skill-top"><span>${skill.icon} <b>${esc(skill.title)}</b></span><b>${percent}%</b></div><div class="skill-track"><div class="skill-fill" style="width:${percent}%"></div></div></article>`;
    }).join('');
  }

  function evaluateBadges() {
    const unlocked = new Set(state.badges);
    if (state.onboardingComplete) unlocked.add('welcome-explorer');
    if (state.sessions >= 1) unlocked.add('first-calm');
    if (calculateStreak() >= 7) unlocked.add('seven-day-streak');
    if (state.completedMissionIds.includes('wave-breathing')) unlocked.add('wave-master');
    if (state.completedMissionIds.includes('leaf-breathing')) unlocked.add('forest-still');
    if (state.breathCycles >= 9) unlocked.add('bloom-breath');
    if (state.soundSessions >= 3) unlocked.add('tone-tuner');
    if (state.sessions >= 6) unlocked.add('star-gazer');
    if (state.sessions >= 9) unlocked.add('mind-master');
    if (state.completedMissionIds.includes('chaos-shield')) unlocked.add('chaos-hero');
    if (state.completedMissionIds.includes('sleep-moon-journey')) unlocked.add('dream-walker');
    if (manifest.missions.every(mission => state.completedMissionIds.includes(mission.id))) unlocked.add('crystal-mind');
    const before = new Set(state.badges);
    state.badges = [...unlocked];
    return state.badges.filter(id => !before.has(id));
  }

  function renderBadges() {
    evaluateBadges();
    saveState();
    $('#badgeGrid').innerHTML = manifest.badges.map(badge => {
      const locked = state.badges.includes(badge.id) ? '' : 'locked';
      return `<article class="badge ${locked}"><span>${badge.icon}</span><b>${esc(badge.name)}</b></article>`;
    }).join('');
  }

  function calculateStreak() {
    const dates = [...new Set(state.practiceDates)].sort().reverse();
    if (!dates.length) return 0;
    const today = todayKey();
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (dates[0] !== today && dates[0] !== yesterday) return 0;
    const cursor = new Date(`${dates[0]}T12:00:00`);
    let streak = 0;
    for (const date of dates) {
      const expected = cursor.toISOString().slice(0, 10);
      if (date !== expected) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function startTimer() {
    if (!activeMission || running) return;
    running = true;
    paused = false;
    $('#startSession').hidden = true;
    $('#completeEarly').hidden = false;
    if (settings.sound) startAudio();
    tick();
    timer = window.setInterval(tick, 1000);
  }

  function tick() {
    if (!running || paused) return;
    if (remaining <= 0) {
      finishSession(true);
      return;
    }
    remaining -= 1;
    phaseElapsed += 1;
    renderTimer();
    renderBreathCue();
  }

  function renderTimer() {
    const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
    const secs = Math.max(0, remaining % 60).toString().padStart(2, '0');
    $('#sessionTimer').textContent = `${mins}:${secs}`;
    const done = totalDuration ? ((totalDuration - remaining) / totalDuration) * 100 : 0;
    $('#sessionProgressFill').style.width = `${Math.min(100, done)}%`;
  }

  function renderBreathCue() {
    const cue = activeMission.cue;
    const sequence = [
      ['inhale', cue.inhale, 'Breathe in gently'],
      ['hold', cue.hold, cue.hold ? 'Hold softly' : ''],
      ['exhale', cue.exhale, 'Breathe out slowly'],
      ['rest', cue.rest, cue.rest ? 'Rest and notice' : '']
    ].filter(item => item[1] > 0);
    const cycle = sequence.reduce((sum, item) => sum + item[1], 0);
    let point = phaseElapsed % cycle;
    let selected = sequence[0];
    for (const item of sequence) {
      if (point < item[1]) {
        selected = item;
        break;
      }
      point -= item[1];
    }
    $('#phaseLabel').textContent = selected[0];
    $('#sessionCue').textContent = selected[2];
    $('#breathOrb').className = `breath-orb ${selected[0]}`;
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    $('#pauseSession').textContent = paused ? 'Resume' : 'Pause';
    $('#sessionCue').textContent = paused ? 'Paused. Take all the time you need.' : 'Welcome back.';
    if (paused) stopAudio();
    else if (settings.sound) startAudio();
  }

  function leaveSession() {
    stopTimer();
    stopAudio();
    showHome();
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
    running = false;
    paused = false;
  }

  function finishSession(fullCompletion) {
    if (!activeMission) return;
    const practiced = Math.max(1, totalDuration - remaining);
    const ratio = Math.max(0.25, Math.min(1, practiced / totalDuration));
    stopTimer();
    stopAudio();

    state.sessions += 1;
    state.totalSeconds += practiced;
    state.breathCycles += Math.max(1, Math.floor(practiced / Math.max(1, activeMission.cue.inhale + activeMission.cue.hold + activeMission.cue.exhale + activeMission.cue.rest)));
    if (settings.sound) state.soundSessions += 1;
    state.lastMissionId = activeMission.id;
    if (!state.completedMissionIds.includes(activeMission.id)) state.completedMissionIds.push(activeMission.id);
    if (!state.practiceDates.includes(todayKey())) state.practiceDates.push(todayKey());

    for (const [skill, weight] of Object.entries(activeMission.skillWeights)) {
      state.skills[skill] = (Number(state.skills[skill]) || 0) + Math.max(1, Math.round(weight * ratio));
    }

    const newlyUnlocked = evaluateBadges();
    saveState();

    const xp = Math.max(3, Math.round(activeMission.sourceXp * ratio));
    const kc = Math.max(3, Math.round(activeMission.kc * ratio));
    const cycleSeconds = Math.max(1, activeMission.cue.inhale + activeMission.cue.hold + activeMission.cue.exhale + activeMission.cue.rest);
    const arcadeResult = window.LarriVerseArcade?.award?.(GAME_ID, {
      xp,
      kc,
      score: Math.round(practiced),
      completed: fullCompletion,
      metrics: {
        sessionsCompleted: 1,
        mindfulSeconds: practiced,
        breathCycles: Math.max(1, Math.floor(practiced / cycleSeconds)),
        soundSessions: settings.sound ? 1 : 0
      }
    });

    $('#resultIcon').textContent = activeMission.icon;
    $('#resultTitle').textContent = fullCompletion ? 'Mission complete.' : 'Practice still counts.';
    $('#resultText').textContent = `You spent ${Math.ceil(practiced / 60)} gentle minute${practiced > 60 ? 's' : ''} with ${activeMission.name}. No score to chase—showing up was the win.`;
    $('#resultXp').textContent = `+${xp} XP`;
    $('#resultKc').textContent = `+${kc + (arcadeResult?.milestoneBonus || 0)} KC`;
    $('#newBadges').innerHTML = newlyUnlocked.map(id => {
      const badge = manifest.badges.find(item => item.id === id);
      return badge ? `<span>${badge.icon} ${esc(badge.name)}</span>` : '';
    }).join('');
    $('#resultDialog').showModal();
  }

  function startAudio() {
    if (!settings.sound || audio.oscillator) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audio.context = audio.context || new AudioContext();
      audio.oscillator = audio.context.createOscillator();
      audio.gain = audio.context.createGain();
      audio.oscillator.type = 'sine';
      audio.oscillator.frequency.value = 220;
      audio.gain.gain.value = 0.018;
      audio.oscillator.connect(audio.gain).connect(audio.context.destination);
      audio.oscillator.start();
    } catch {
      stopAudio();
    }
  }

  function stopAudio() {
    try { audio.oscillator?.stop(); } catch {}
    try {
      audio.oscillator?.disconnect();
      audio.gain?.disconnect();
    } catch {}
    audio.oscillator = null;
    audio.gain = null;
  }

  init().catch(error => {
    document.body.innerHTML = `<main class="view"><div class="notice-card"><span>🌧️</span><div><strong>Chill Brain could not load.</strong><p>${esc(error.message)}</p><p><a href="../../index.html">Return to the arcade</a></p></div></div></main>`;
  });
})();
