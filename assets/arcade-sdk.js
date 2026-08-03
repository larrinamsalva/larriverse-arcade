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
    largeText: false
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
      reducedMotion: typeof source.reducedMotion === 'boolean' ? source.reducedMotion : base.reducedMotion,
      highContrast: Boolean(source.highContrast),
      largeText: Boolean(source.largeText)
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
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function applySettings(settings = loadSettings()) {
    ensureAccessibilityStyles();
    const root = document.documentElement;
    root.classList.toggle('larriverse-reduced-motion', settings.reducedMotion);
    root.classList.toggle('larriverse-high-contrast', settings.highContrast);
    root.classList.toggle('larriverse-large-text', settings.largeText);
    root.dataset.larriverseMotion = settings.reducedMotion ? 'reduced' : 'full';
    return clone(settings);
  }

  function setSettings(patch = {}) {
    const current = loadSettings();
    const next = normaliseSettings({ ...current, ...patch });
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    applySettings(next);
    window.dispatchEvent(new CustomEvent('larriverse:settings', { detail: clone(next) }));
    return clone(next);
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
    if (event.key === SETTINGS_KEY) applySettings();
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
    exportData,
    importData,
    clearData,
    dataKeys,
    levelForXp,
    xpForNextLevel
  });
})();
