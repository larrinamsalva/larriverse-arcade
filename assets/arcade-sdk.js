(() => {
  'use strict';

  const STORAGE_KEY = 'larriverse.arcade.profile.v1';
  const VERSION = 1;

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

  function normalise(value) {
    const base = freshProfile();
    const profile = value && typeof value === 'object' ? { ...base, ...value } : base;
    profile.games = profile.games && typeof profile.games === 'object' ? profile.games : {};
    profile.achievements = Array.isArray(profile.achievements) ? profile.achievements : [];
    return profile;
  }

  function load() {
    try {
      return normalise(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return freshProfile();
    }
  }

  function save(profile) {
    const next = normalise(profile);
    next.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('larriverse:profile', { detail: structuredCloneSafe(next) }));
    return next;
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function levelForXp(xp) {
    return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 36)) + 1);
  }

  function xpForNextLevel(level) {
    return Math.pow(Math.max(1, level), 2) * 36;
  }

  function getGame(profile, gameId) {
    return profile.games[gameId] || {
      sessions: 0,
      completions: 0,
      highScore: 0,
      totalScore: 0,
      catches: 0,
      lastPlayedAt: null
    };
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

    const saved = save(profile);
    return {
      profile: structuredCloneSafe(saved),
      level: levelForXp(saved.xp),
      milestoneBonus,
      unlocked: unlocked.filter(Boolean)
    };
  }

  function unlock(profile, id) {
    if (profile.achievements.includes(id)) return null;
    profile.achievements.push(id);
    return id;
  }

  function setIdentity({ name, avatar } = {}) {
    const profile = load();
    if (typeof name === 'string' && name.trim()) profile.name = name.trim().slice(0, 24);
    if (typeof avatar === 'string' && avatar.trim()) profile.avatar = avatar.trim().slice(0, 8);
    return save(profile);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    const profile = freshProfile();
    window.dispatchEvent(new CustomEvent('larriverse:profile', { detail: structuredCloneSafe(profile) }));
    return profile;
  }

  function summary() {
    const profile = load();
    const level = levelForXp(profile.xp);
    return {
      ...structuredCloneSafe(profile),
      level,
      nextLevelXp: xpForNextLevel(level)
    };
  }

  window.LarriVerseArcade = Object.freeze({
    version: VERSION,
    load,
    save,
    summary,
    award,
    setIdentity,
    reset,
    levelForXp,
    xpForNextLevel
  });
})();
