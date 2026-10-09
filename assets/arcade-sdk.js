(() => {
  'use strict';

  const PROFILE_KEY = 'larriverse.arcade.profile.v1';
  const SETTINGS_KEY = 'larriverse.arcade.settings.v1';
  const DATA_PREFIX = 'larriverse.';
  const VERSION = 3;
  const BACKUP_SCHEMA = 'larriverse-save-backup';
  const BACKUP_VERSION = 1;
  const MAX_BACKUP_BYTES = 1_500_000;
  const MAX_RECORDS = 64;
  const THEME_ORDER = ['light', 'dark', 'system'];
  const darkModeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');

  const BLOOM_GUIDES = Object.freeze({
    'arcade-home': {
      welcome: 'Hey, explorer! I’m Bloom. Let’s find an adventure that feels just right today.',
      hint: 'Try a game that sounds fun, or use Surprise me. Every try grows a new skill.'
    },
    'bridge-buddies': {
      welcome: 'Ready to build? We’ll match sturdy planks, beams, and triangle braces to each cart load.',
      hint: 'Read every load label first. Stronger supports cost more, so save them for the heaviest spans.'
    },
    'water-works': {
      welcome: 'Let’s follow every connection and guide clean blue water from the reservoir to town.',
      hint: 'Start at the reservoir and trace one pipe at a time. Turn the first piece where the flow leaks.'
    },
    'harbor-helpers': {
      welcome: 'Three island neighbors are waiting. Let’s load only what each community needs.',
      hint: 'Choose an island before loading. A full boat helps only when every crate matches its request.'
    },
    'pantry-picnic': {
      welcome: 'Picnic time! We’ll solve eight requests from a pantry of twenty-four different challenges.',
      hint: 'Read the request card, pack one main and two produce portions, and use every marked leftover first.'
    },
    'compass-cove': {
      welcome: 'Treasure maps ready! We’ll begin at a landmark and count each compass step carefully.',
      hint: 'East is right, west is left, north is up, and south is down. Count one tile per step.'
    },
    'cipher-club': {
      welcome: 'The clubhouse has a secret message. Let’s turn the code wheel and reveal its pattern.',
      hint: 'Match the wheel to the shared key, then translate one letter at a time.'
    },
    'trade-town': {
      welcome: 'Market day! We’ll compare bundles, fees, and whole prices before filling the basket.',
      hint: 'First cover the number of items needed. Then compare the total cost, including every fee.'
    },
    'critter-council': {
      welcome: 'Our woodland neighbors have different needs. Let’s design a town that welcomes everyone.',
      hint: 'Read each neighbor request, then notice the shaded row, quiet row, river edge, and nearby plots.'
    },
    'traffic-town': {
      welcome: 'Safety helper Bloom reporting! Let’s use sign shape, color, symbol, and words together.',
      hint: 'Ask what the sign wants road users to notice or do. Shape and color often give the first clue.'
    },
    'street-safety-scout': {
      welcome: 'Scout vest ready! Let’s notice signals, warning signs, emergency clues, and vehicle lights before choosing a calm first move.',
      hint: 'Look at color, shape, position, and what is changing around the clue. Then choose the most predictable safe action.'
    },
    'pocket-planet': {
      welcome: 'Let’s pack the things we need and still protect coins for your telescope dream.',
      hint: 'Cover water, lunch, and the bus pass first. Check that at least six coins remain.'
    },
    'scam-sleuth': {
      welcome: 'Detective Bloom is ready. We’ll slow down, spot pressure, and protect private information.',
      hint: 'Urgency, secrets, surprise money, and unfamiliar links are clues to stop and check with an adult.'
    },
    'kindness-quest': {
      welcome: 'Kindness can include clear boundaries. Let’s help the treehouse crew listen and speak up.',
      hint: 'Look for the choice that respects both people and asks for trusted help when harm continues.'
    },
    'fact-finder': {
      welcome: 'Welcome to the tiny news desk! We’ll separate evidence, opinions, ads, and claims to check.',
      hint: 'Evidence can be checked. Opinions share a view. Ads sell. Missing sources need another look.'
    },
    'repair-cafe': {
      welcome: 'Let’s look closely before replacing anything. Safe little repairs can give objects new life.',
      hint: 'A strong repair order is inspect, prepare safely, make the fix, and test.'
    },
    'time-trail': {
      welcome: 'Adventure map open! We’ll plan a route that reaches every flag without wasting steps.',
      hint: 'Look at the whole path before moving. Avoid detours and save the picnic finish for last.'
    },
    'garden-guardians': {
      welcome: 'Let’s grow a lively garden with carrots, beans, flowers, and a careful water plan.',
      hint: 'Plant all six plots with a mix of types, then water each plot on two different days.'
    },
    'energy-island': {
      welcome: 'The island needs dependable power in sun, wind, clouds, and night. Let’s build a balanced system.',
      hint: 'Make extra energy when you can and include a battery so stored power can help at night.'
    },
    'reuse-rally': {
      welcome: 'Toy Town cleanup is on! We’ll reuse good objects first and sort the rest thoughtfully.',
      hint: 'If it still works, try reuse. Then follow the town rules for recycling, compost, and trash.'
    },
    'robot-rover': {
      welcome: 'Rover is charged! We’ll build a command sequence, test it, and learn from every trail.',
      hint: 'Check the direction Rover faces before each Forward command. Turns happen in place.'
    },
    'lemonade-lab': {
      welcome: 'Apron on! We’ll watch the weather, choose a batch and price, then read the business ledger.',
      hint: 'Estimate demand before making cups. Profit is revenue minus the cost of every cup you made.'
    },
    'beat-builder': {
      welcome: 'Studio lights on! Let’s build a repeating rhythm, hear the space, and make it your own.',
      hint: 'Start with the listed kick, clap, and hi-hat steps. Turn off extra pads when checking the pattern.'
    },
    'kidscoin-family': {
      welcome: 'Let’s practice planning, saving, and choosing rewards together—one family goal at a time.',
      hint: 'Start with a small goal everyone understands, then choose tasks and rewards that feel fair.'
    },
    'brain-sweat-expanded': {
      welcome: 'Pick a world and warm up your problem-solving powers. We can take every challenge one step at a time.',
      hint: 'Read the goal first, try your best idea, and use the explanation as a tool for the next round.'
    },
    'brain-sweat-life-skills': {
      welcome: 'Real-life skills grow through practice. Choose a lesson that feels useful or interesting today.',
      hint: 'There is no need to rush. Think about how the choice could work in everyday life.'
    },
    'bubble-resonance-phi369': {
      welcome: 'Let’s line up a clever bank shot and clear the glowing bubble board together.',
      hint: 'Use the wall angle to reach tucked-away colors, and look for groups that open the board.'
    },
    'chill-brain-rewards': {
      welcome: 'I’m right here with you. Choose a gentle pause, breathe comfortably, and go at your own pace.',
      hint: 'Relax your shoulders and make the exhale easy. Stop any exercise that does not feel comfortable.'
    },
    'creature-catcher': {
      welcome: 'Field guide ready! Let’s catch curious creatures and turn each question into a new discovery.',
      hint: 'Watch the play area, take your time with each question, and remember that every try adds practice.'
    },
    'road-trip-quest': {
      welcome: 'Seat belt imagination on! We’ll travel, collect power-ups, and solve one city challenge at a time.',
      hint: 'Stay centered on the road, watch what is coming, and pause whenever you need a calmer pace.'
    },
    'road-trip-quest-gps': {
      welcome: 'Map explorer ready! Let’s discover useful places in this pretend neighborhood without sharing real location data.',
      hint: 'Use the demo map clues and place types. This adventure never needs your exact location.'
    }
  });

  const freshProfile = () => ({
    version: VERSION,
    name: 'Player One',
    avatar: '🌟',
    xp: 0,
    kc: 0,
    streak: 0,
    sessions: 0,
    completedSessions: 0,
    games: {},
    achievements: [],
    updatedAt: new Date().toISOString()
  });

  const freshSettings = () => ({
    reducedMotion: Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
    highContrast: false,
    largeText: false,
    theme: 'system',
    bloomHidden: false
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function gameDefaults() {
    return {
      sessions: 0,
      completions: 0,
      highScore: 0,
      totalScore: 0,
      catches: 0,
      metrics: {},
      lastPlayedAt: null
    };
  }

  function normalise(value) {
    const base = freshProfile();
    const profile = value && typeof value === 'object'
      ? { ...base, ...value, version: VERSION }
      : base;
    profile.games = profile.games && typeof profile.games === 'object' ? profile.games : {};
    profile.achievements = Array.isArray(profile.achievements) ? profile.achievements : [];
    for (const [gameId, game] of Object.entries(profile.games)) {
      const safeGame = game && typeof game === 'object' ? game : {};
      profile.games[gameId] = {
        ...gameDefaults(),
        ...safeGame,
        metrics: safeGame.metrics && typeof safeGame.metrics === 'object' ? safeGame.metrics : {}
      };
    }
    return profile;
  }

  function normaliseSettings(value) {
    const base = freshSettings();
    const source = value && typeof value === 'object' ? value : {};
    return {
      reducedMotion: base.reducedMotion || (typeof source.reducedMotion === 'boolean' ? source.reducedMotion : false),
      highContrast: Boolean(source.highContrast),
      largeText: Boolean(source.largeText),
      theme: THEME_ORDER.includes(source.theme) ? source.theme : 'system',
      bloomHidden: Boolean(source.bloomHidden)
    };
  }

  function load() {
    try {
      return normalise(JSON.parse(localStorage.getItem(PROFILE_KEY)));
    } catch {
      return freshProfile();
    }
  }

  function save(profile) {
    const next = normalise(profile);
    next.updatedAt = new Date().toISOString();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('larriverse:profile', { detail: clone(next) }));
    return next;
  }

  function loadSettings() {
    try {
      return normaliseSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY)));
    } catch {
      return freshSettings();
    }
  }

  function ensureAccessibilityStyles() {
    if (document.querySelector('[data-larriverse-accessibility]')) return;
    const style = document.createElement('style');
    style.dataset.larriverseAccessibility = 'true';
    style.textContent = `
      html.larriverse-large-text { font-size: 112.5% !important; }
      html.larriverse-high-contrast { --muted: #fff !important; }
      html.larriverse-high-contrast body { background-color: #000 !important; color: #fff !important; }
      html.larriverse-high-contrast a,
      html.larriverse-high-contrast button,
      html.larriverse-high-contrast input,
      html.larriverse-high-contrast select,
      html.larriverse-high-contrast textarea {
        outline-color: currentColor !important;
        border-color: currentColor !important;
      }
      html.larriverse-reduced-motion,
      html.larriverse-reduced-motion * {
        scroll-behavior: auto !important;
      }
      html.larriverse-reduced-motion *,
      html.larriverse-reduced-motion *::before,
      html.larriverse-reduced-motion *::after {
        animation: none !important;
        transition: none !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function applySettings(settings = loadSettings()) {
    ensureAccessibilityStyles();
    const root = document.documentElement;
    const resolvedTheme = settings.theme === 'system'
      ? (darkModeQuery?.matches ? 'dark' : 'light')
      : settings.theme;
    root.classList.toggle('larriverse-reduced-motion', settings.reducedMotion);
    root.classList.toggle('larriverse-high-contrast', settings.highContrast);
    root.classList.toggle('larriverse-large-text', settings.largeText);
    root.classList.toggle('larriverse-dark', resolvedTheme === 'dark');
    root.classList.toggle('larriverse-light', resolvedTheme === 'light');
    root.dataset.larriverseMotion = settings.reducedMotion ? 'reduced' : 'full';
    root.dataset.larriverseTheme = resolvedTheme;
    root.dataset.larriverseThemePreference = settings.theme;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = resolvedTheme === 'dark' ? '#17132f' : '#6854d9';
    return { ...clone(settings), resolvedTheme };
  }

  function setSettings(patch = {}) {
    const current = loadSettings();
    const next = normaliseSettings({ ...current, ...patch });
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    applySettings(next);
    window.dispatchEvent(new CustomEvent('larriverse:settings', { detail: clone(next) }));
    return clone(next);
  }

  function themeLabel(theme = loadSettings().theme) {
    return theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'Device';
  }

  function cycleTheme() {
    const current = loadSettings().theme;
    const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
    return setSettings({ theme: next });
  }

  const bloomSvg = () => `<svg class="bloom-character" viewBox="0 0 180 190" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="bloomFaceGlow" cx="38%" cy="28%"><stop offset="0" stop-color="#fffbd0"/><stop offset=".6" stop-color="#ffd968"/><stop offset="1" stop-color="#f2a94f"/></radialGradient>
      <linearGradient id="bloomLeaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8ee4a1"/><stop offset="1" stop-color="#39a96d"/></linearGradient>
      <filter id="bloomGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g class="bloom-sparkles" fill="#fff2a8" filter="url(#bloomGlow)"><path d="M18 35l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M154 28l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><circle cx="158" cy="88" r="4"/></g>
    <g class="bloom-petals">
      <ellipse cx="90" cy="42" rx="25" ry="38" fill="#a98af3"/><ellipse cx="127" cy="58" rx="25" ry="38" transform="rotate(52 127 58)" fill="#ff8eb9"/>
      <ellipse cx="137" cy="99" rx="25" ry="38" transform="rotate(102 137 99)" fill="#ffad70"/><ellipse cx="112" cy="132" rx="25" ry="38" transform="rotate(154 112 132)" fill="#ffd56f"/>
      <ellipse cx="68" cy="132" rx="25" ry="38" transform="rotate(206 68 132)" fill="#6ed6c3"/><ellipse cx="43" cy="99" rx="25" ry="38" transform="rotate(258 43 99)" fill="#70b9f3"/>
      <ellipse cx="53" cy="58" rx="25" ry="38" transform="rotate(308 53 58)" fill="#c392f2"/>
    </g>
    <path class="bloom-arm bloom-arm-left" d="M49 105Q20 112 17 135" fill="none" stroke="#4c9b68" stroke-width="8" stroke-linecap="round"/>
    <path class="bloom-arm bloom-arm-right" d="M132 104q28 4 34 27" fill="none" stroke="#4c9b68" stroke-width="8" stroke-linecap="round"/>
    <path d="M67 145q-11 24-28 25" fill="none" stroke="#4c9b68" stroke-width="9" stroke-linecap="round"/><path d="M113 145q11 24 28 25" fill="none" stroke="#4c9b68" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="36" cy="171" rx="18" ry="8" fill="#3b8159"/><ellipse cx="144" cy="171" rx="18" ry="8" fill="#3b8159"/>
    <path d="M68 148q22 19 44 0" fill="url(#bloomLeaf)"/>
    <circle cx="90" cy="94" r="52" fill="url(#bloomFaceGlow)" stroke="#fff3bb" stroke-width="5"/>
    <g class="bloom-face" fill="#42385f"><ellipse cx="72" cy="86" rx="7" ry="10"/><ellipse cx="109" cy="86" rx="7" ry="10"/><circle cx="69" cy="82" r="2.5" fill="#fff"/><circle cx="106" cy="82" r="2.5" fill="#fff"/><path class="bloom-mouth" d="M72 108q18 18 37 0" fill="none" stroke="#42385f" stroke-width="5" stroke-linecap="round"/></g>
    <circle cx="61" cy="103" r="7" fill="#f4939c" opacity=".55"/><circle cx="119" cy="103" r="7" fill="#f4939c" opacity=".55"/>
  </svg>`;

  function mountBloom(options = {}) {
    const gameId = options.gameId || document.body?.dataset?.world || document.body?.dataset?.classic || 'arcade-home';
    const existing = document.querySelector(`[data-bloom-for="${CSS.escape(gameId)}"]`);
    if (existing) return existing;
    const guide = BLOOM_GUIDES[gameId] || {
      welcome: `Hey, explorer! Ready to discover ${options.title || 'something new'}?`,
      hint: options.hint || 'Take your time, try one idea, and use what happens as your next clue.'
    };
    const section = document.createElement('section');
    section.className = `bloom-guide bloom-guide--${options.variant || 'game'}`;
    section.dataset.bloomFor = gameId;
    section.dataset.pose = 'welcome';
    section.setAttribute('aria-label', `Bloom's guide for ${options.title || gameId}`);
    section.innerHTML = `<div class="bloom-portrait">${bloomSvg()}<span class="bloom-name">BLOOM</span></div><div class="bloom-copy"><p class="bloom-eyebrow">Your adventure buddy</p><h2 class="bloom-title"></h2><p class="bloom-message" aria-live="polite"></p><div class="bloom-actions"><button type="button" class="bloom-start">Start adventure</button><button type="button" class="bloom-hint">Bloom's hint</button><button type="button" class="bloom-hide">Hide Bloom</button></div></div>`;
    section.querySelector('.bloom-title').textContent = options.heading || 'Hey, explorer!';
    section.querySelector('.bloom-message').textContent = guide.welcome;

    const peek = document.createElement('button');
    peek.type = 'button';
    peek.className = 'bloom-peek';
    peek.dataset.bloomPeek = gameId;
    peek.setAttribute('aria-label', 'Bring Bloom back');
    peek.innerHTML = `<span aria-hidden="true">✿</span> Bloom`;

    const target = options.target || document.querySelector('.game-shell, main, #app') || document.body;
    const after = options.after;
    if (after?.isConnected) after.insertAdjacentElement('afterend', section);
    else if (target === document.body) target.prepend(section);
    else target.prepend(section);
    document.body.append(peek);

    const focusTarget = options.focusTarget || document.querySelector('#playArea, #game, #world, main, #app');
    function setPose(pose, message) {
      section.dataset.pose = pose || 'welcome';
      if (message) section.querySelector('.bloom-message').textContent = message;
    }
    function syncVisibility() {
      const hidden = loadSettings().bloomHidden;
      section.hidden = hidden;
      peek.hidden = !hidden;
    }
    section.querySelector('.bloom-start').addEventListener('click', () => {
      setPose('cheer', options.startMessage || 'You’ve got this! Try, notice, improve, and bloom.');
      focusTarget?.scrollIntoView?.({ behavior: loadSettings().reducedMotion ? 'auto' : 'smooth', block: 'start' });
      if (focusTarget && !focusTarget.hasAttribute('tabindex')) focusTarget.tabIndex = -1;
      focusTarget?.focus?.({ preventScroll: true });
    });
    section.querySelector('.bloom-hint').addEventListener('click', () => setPose('thinking', guide.hint));
    section.querySelector('.bloom-hide').addEventListener('click', () => setSettings({ bloomHidden: true }));
    peek.addEventListener('click', () => {
      setSettings({ bloomHidden: false });
      section.scrollIntoView({ behavior: loadSettings().reducedMotion ? 'auto' : 'smooth', block: 'center' });
      section.querySelector('.bloom-start').focus({ preventScroll: true });
    });
    const onSettings = () => syncVisibility();
    const onMessage = event => {
      if (event.detail?.gameId && event.detail.gameId !== gameId) return;
      setPose(event.detail?.pose || 'cheer', event.detail?.message);
    };
    window.addEventListener('larriverse:settings', onSettings);
    window.addEventListener('larriverse:bloom-message', onMessage);
    section.bloom = { setPose, guide, destroy() {
      window.removeEventListener('larriverse:settings', onSettings);
      window.removeEventListener('larriverse:bloom-message', onMessage);
      peek.remove(); section.remove();
    } };
    syncVisibility();
    return section;
  }

  function levelForXp(xp) {
    return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 36)) + 1);
  }

  function xpForNextLevel(level) {
    return Math.pow(Math.max(1, level), 2) * 36;
  }

  function getGame(profile, gameId) {
    const existing = profile.games[gameId] && typeof profile.games[gameId] === 'object'
      ? profile.games[gameId]
      : {};
    return {
      ...gameDefaults(),
      ...existing,
      metrics: existing.metrics && typeof existing.metrics === 'object' ? existing.metrics : {}
    };
  }

  function addMetrics(game, metrics) {
    if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) return;
    for (const [key, rawValue] of Object.entries(metrics)) {
      if (!/^[a-z][a-zA-Z0-9]{0,39}$/.test(key)) continue;
      const value = Number(rawValue);
      if (!Number.isFinite(value) || value <= 0) continue;
      game.metrics[key] = (Number(game.metrics[key]) || 0) + value;
    }
  }

  function unlock(profile, id) {
    if (profile.achievements.includes(id)) return null;
    profile.achievements.push(id);
    return id;
  }

  function award(gameId, reward = {}) {
    if (!gameId) throw new Error('LarriVerse award() requires a gameId.');

    const profile = load();
    const game = getGame(profile, gameId);
    const xp = Math.max(0, Number(reward.xp) || 0);
    const kc = Math.max(0, Number(reward.kc) || 0);
    const score = Math.max(0, Number(reward.score) || 0);
    const catches = Math.max(0, Number(reward.catches) || 0);
    const completed = Boolean(reward.completed);

    profile.xp += xp;
    profile.kc += kc;
    profile.sessions += 1;
    game.sessions += 1;
    game.totalScore += score;
    game.highScore = Math.max(game.highScore, score);
    game.catches += catches;
    addMetrics(game, reward.metrics);
    game.lastPlayedAt = new Date().toISOString();

    let milestoneBonus = 0;
    if (completed) {
      profile.completedSessions += 1;
      profile.streak += 1;
      game.completions += 1;
      if (profile.completedSessions % 3 === 0) {
        milestoneBonus = 3;
        profile.kc += milestoneBonus;
      }
    }

    profile.games[gameId] = game;
    const unlocked = [];
    if (profile.completedSessions >= 1) unlocked.push(unlock(profile, 'first-flight'));
    if (profile.completedSessions >= 3) unlocked.push(unlock(profile, 'three-is-magic'));
    if (profile.kc >= 36) unlocked.push(unlock(profile, 'coin-spark'));
    if (game.highScore >= 90) unlocked.push(unlock(profile, `${gameId}-score-90`));
    if ((game.metrics.bossesDefeated || 0) >= 8) {
      unlocked.push(unlock(profile, `${gameId}-campaign-clear`));
    }

    const saved = save(profile);
    return {
      profile: clone(saved),
      game: clone(saved.games[gameId]),
      level: levelForXp(saved.xp),
      milestoneBonus,
      unlocked: unlocked.filter(Boolean)
    };
  }

  function setIdentity({ name, avatar } = {}) {
    const profile = load();
    if (typeof name === 'string' && name.trim()) profile.name = name.trim().slice(0, 24);
    if (typeof avatar === 'string' && avatar.trim()) profile.avatar = avatar.trim().slice(0, 8);
    return save(profile);
  }

  function reset() {
    localStorage.removeItem(PROFILE_KEY);
    const profile = freshProfile();
    window.dispatchEvent(new CustomEvent('larriverse:profile', { detail: clone(profile) }));
    return profile;
  }

  function summary() {
    const profile = load();
    const level = levelForXp(profile.xp);
    return {
      ...clone(profile),
      level,
      nextLevelXp: xpForNextLevel(level)
    };
  }

  function dataKeys() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(DATA_PREFIX))
      .sort();
  }

  function exportData() {
    const records = {};
    for (const key of dataKeys()) {
      const value = localStorage.getItem(key);
      if (typeof value === 'string') records[key] = value;
    }
    return {
      schema: BACKUP_SCHEMA,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      arcadeVersion: VERSION,
      records
    };
  }

  function parseBackup(input) {
    let backup = input;
    if (typeof backup === 'string') {
      if (new TextEncoder().encode(backup).length > MAX_BACKUP_BYTES) {
        throw new Error('Backup is larger than the supported 1.5 MB limit.');
      }
      backup = JSON.parse(backup);
    }
    if (!backup || typeof backup !== 'object' || Array.isArray(backup)) {
      throw new Error('Backup must be a JSON object.');
    }
    if (backup.schema !== BACKUP_SCHEMA || backup.version !== BACKUP_VERSION) {
      throw new Error('This is not a supported LarriVerse backup.');
    }
    if (!backup.records || typeof backup.records !== 'object' || Array.isArray(backup.records)) {
      throw new Error('Backup records are missing.');
    }

    const entries = Object.entries(backup.records);
    if (entries.length > MAX_RECORDS) throw new Error('Backup contains too many records.');

    let totalBytes = 0;
    for (const [key, value] of entries) {
      if (!/^larriverse\.[a-zA-Z0-9._-]{1,120}$/.test(key)) {
        throw new Error(`Backup contains an invalid record key: ${key}`);
      }
      if (typeof value !== 'string') throw new Error(`Backup record ${key} is not text.`);
      totalBytes += new TextEncoder().encode(key + value).length;
      if (totalBytes > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the supported size limit.');
      JSON.parse(value);
    }
    return { ...backup, records: Object.fromEntries(entries) };
  }

  function importData(input, { replace = true } = {}) {
    const backup = parseBackup(input);
    const before = exportData();
    try {
      if (replace) {
        for (const key of dataKeys()) localStorage.removeItem(key);
      }
      for (const [key, value] of Object.entries(backup.records)) {
        localStorage.setItem(key, value);
      }
      applySettings();
      window.dispatchEvent(new CustomEvent('larriverse:data-imported', {
        detail: { records: Object.keys(backup.records).length }
      }));
      return { imported: Object.keys(backup.records).length, backup: clone(backup) };
    } catch (error) {
      for (const key of dataKeys()) localStorage.removeItem(key);
      for (const [key, value] of Object.entries(before.records)) localStorage.setItem(key, value);
      applySettings();
      throw error;
    }
  }

  function clearData({ keepSettings = true } = {}) {
    const preservedSettings = keepSettings ? localStorage.getItem(SETTINGS_KEY) : null;
    for (const key of dataKeys()) localStorage.removeItem(key);
    if (keepSettings && preservedSettings) localStorage.setItem(SETTINGS_KEY, preservedSettings);
    applySettings();
    window.dispatchEvent(new CustomEvent('larriverse:data-cleared'));
    return { cleared: true, keptSettings: Boolean(keepSettings && preservedSettings) };
  }

  window.addEventListener('storage', event => {
    if (event.key === SETTINGS_KEY || event.key === null) {
      const settings = applySettings();
      window.dispatchEvent(new CustomEvent('larriverse:settings', { detail: settings }));
    }
  });
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.addEventListener?.('change', () => {
    const settings = applySettings();
    window.dispatchEvent(new CustomEvent('larriverse:settings', { detail: settings }));
  });
  darkModeQuery?.addEventListener?.('change', () => {
    if (loadSettings().theme !== 'system') return;
    const settings = applySettings();
    window.dispatchEvent(new CustomEvent('larriverse:settings', { detail: settings }));
  });

  applySettings();

  window.LarriVerseArcade = Object.freeze({
    version: VERSION,
    load,
    save,
    summary,
    award,
    setIdentity,
    reset,
    settings: loadSettings,
    setSettings,
    applySettings,
    cycleTheme,
    themeLabel,
    mountBloom,
    exportData,
    importData,
    clearData,
    dataKeys,
    levelForXp,
    xpForNextLevel
  });
})();
