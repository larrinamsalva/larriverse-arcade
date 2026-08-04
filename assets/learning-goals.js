(() => {
  'use strict';

  const STORAGE_KEY = 'larriverse.learningGoals.v1';
  const LEARNING_KEY = 'larriverse.learningPath.v1';
  const SCHEMA = 'larriverse-learning-goals';
  const VERSION = 1;
  const MAX_GOALS = 3;
  const SUBJECTS = ['math', 'reading', 'science', 'nature', 'trivia'];
  const TYPES = ['subject-answers', 'cabinet-sessions', 'arcade-sessions', 'completed-sessions', 'xp-growth', 'new-cabinets'];
  const TARGETS = Object.freeze({
    'subject-answers': [3, 6, 9],
    'cabinet-sessions': [1, 3, 6],
    'arcade-sessions': [1, 3, 6],
    'completed-sessions': [1, 3],
    'xp-growth': [9, 18, 36],
    'new-cabinets': [1, 3]
  });
  const SUBJECT_LABELS = Object.freeze({
    math: 'Math', reading: 'Reading', science: 'Science', nature: 'Nature', trivia: 'Trivia'
  });

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === 'object' ? value : fallback;
    } catch {
      return fallback;
    }
  }

  function positiveInteger(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
  }

  function profileSummary() {
    const sdk = window.LarriVerseArcade;
    if (!sdk || typeof sdk.summary !== 'function') {
      return { xp: 0, sessions: 0, completedSessions: 0, games: {} };
    }
    const profile = sdk.summary();
    return profile && typeof profile === 'object'
      ? profile
      : { xp: 0, sessions: 0, completedSessions: 0, games: {} };
  }

  function learningSummary() {
    const state = readJson(LEARNING_KEY, { games: {} });
    const games = state.games && typeof state.games === 'object' ? state.games : {};
    const subjects = Object.fromEntries(SUBJECTS.map(subject => [subject, { attempts: 0, correct: 0, accuracy: null }]));
    for (const entry of Object.values(games)) {
      const stats = entry && typeof entry.stats === 'object' ? entry.stats : {};
      for (const subject of SUBJECTS) {
        const attempts = positiveInteger(stats[subject]?.attempts);
        const correct = Math.min(attempts, positiveInteger(stats[subject]?.correct));
        subjects[subject].attempts += attempts;
        subjects[subject].correct += correct;
      }
    }
    for (const subject of SUBJECTS) {
      const entry = subjects[subject];
      entry.accuracy = entry.attempts ? Math.round(entry.correct / entry.attempts * 100) : null;
    }
    return subjects;
  }

  function snapshot() {
    const profile = profileSummary();
    const games = profile.games && typeof profile.games === 'object' ? profile.games : {};
    const cabinetSessions = {};
    const visitedCabinets = [];
    for (const [gameId, record] of Object.entries(games)) {
      const sessions = positiveInteger(record?.sessions);
      cabinetSessions[gameId] = sessions;
      if (sessions > 0) visitedCabinets.push(gameId);
    }
    return {
      xp: positiveInteger(profile.xp),
      sessions: positiveInteger(profile.sessions),
      completedSessions: positiveInteger(profile.completedSessions),
      cabinetSessions,
      visitedCabinets: [...new Set(visitedCabinets)].sort(),
      subjects: learningSummary()
    };
  }

  function safeGoalId(value) {
    return typeof value === 'string' && /^goal-[a-z0-9-]{8,80}$/.test(value);
  }

  function normalizeGoal(goal) {
    if (!goal || typeof goal !== 'object' || !safeGoalId(goal.id) || !TYPES.includes(goal.type)) return null;
    const target = positiveInteger(goal.target);
    if (!TARGETS[goal.type]?.includes(target)) return null;
    const normalized = {
      id: goal.id,
      type: goal.type,
      target,
      createdAt: typeof goal.createdAt === 'string' && !Number.isNaN(new Date(goal.createdAt).getTime())
        ? goal.createdAt
        : new Date().toISOString()
    };
    if (goal.type === 'subject-answers') {
      if (!SUBJECTS.includes(goal.subject)) return null;
      normalized.subject = goal.subject;
    }
    if (goal.type === 'cabinet-sessions') {
      if (typeof goal.gameId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(goal.gameId)) return null;
      normalized.gameId = goal.gameId;
    }
    if (goal.type === 'new-cabinets') {
      normalized.baseline = Array.isArray(goal.baseline)
        ? [...new Set(goal.baseline.filter(value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)))].sort()
        : [];
    } else {
      normalized.baseline = Math.max(0, Number(goal.baseline) || 0);
    }
    return normalized;
  }

  function load() {
    const state = readJson(STORAGE_KEY, { schema: SCHEMA, version: VERSION, goals: [] });
    const goals = Array.isArray(state.goals)
      ? state.goals.map(normalizeGoal).filter(Boolean).slice(0, MAX_GOALS)
      : [];
    return { schema: SCHEMA, version: VERSION, goals };
  }

  function write(goals) {
    const normalized = goals.map(normalizeGoal).filter(Boolean).slice(0, MAX_GOALS);
    const state = { schema: SCHEMA, version: VERSION, goals: normalized };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('larriverse:learning-goals', { detail: { count: normalized.length } }));
    return state;
  }

  function baselineFor(spec, current) {
    switch (spec.type) {
      case 'subject-answers': return current.subjects[spec.subject]?.attempts || 0;
      case 'cabinet-sessions': return current.cabinetSessions[spec.gameId] || 0;
      case 'arcade-sessions': return current.sessions;
      case 'completed-sessions': return current.completedSessions;
      case 'xp-growth': return current.xp;
      case 'new-cabinets': return current.visitedCabinets;
      default: return 0;
    }
  }

  function createId() {
    const random = globalThis.crypto?.randomUUID?.().toLowerCase() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    return `goal-${random}`;
  }

  function validateSpec(spec) {
    if (!spec || typeof spec !== 'object' || !TYPES.includes(spec.type)) throw new Error('Choose a supported goal type.');
    const target = positiveInteger(spec.target);
    if (!TARGETS[spec.type].includes(target)) throw new Error('Choose a supported goal target.');
    if (spec.type === 'subject-answers' && !SUBJECTS.includes(spec.subject)) throw new Error('Choose a learning subject.');
    if (spec.type === 'cabinet-sessions' && (typeof spec.gameId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(spec.gameId))) {
      throw new Error('Choose a playable cabinet.');
    }
    return { type: spec.type, target, subject: spec.subject, gameId: spec.gameId };
  }

  function create(spec) {
    const state = load();
    if (state.goals.length >= MAX_GOALS) throw new Error(`Keep up to ${MAX_GOALS} goals at a time.`);
    const valid = validateSpec(spec);
    const current = snapshot();
    const goal = normalizeGoal({
      id: createId(),
      type: valid.type,
      target: valid.target,
      subject: valid.subject,
      gameId: valid.gameId,
      baseline: baselineFor(valid, current),
      createdAt: new Date().toISOString()
    });
    if (!goal) throw new Error('The goal could not be created.');
    if (state.goals.some(existing => equivalent(existing, goal))) throw new Error('That goal is already on the board.');
    write([...state.goals, goal]);
    return goal;
  }

  function remove(id) {
    const state = load();
    const goals = state.goals.filter(goal => goal.id !== id);
    if (goals.length === state.goals.length) return false;
    write(goals);
    return true;
  }

  function restart(id) {
    const state = load();
    const current = snapshot();
    let restarted = null;
    const goals = state.goals.map(goal => {
      if (goal.id !== id) return goal;
      restarted = normalizeGoal({ ...goal, baseline: baselineFor(goal, current), createdAt: new Date().toISOString() });
      return restarted;
    });
    if (!restarted) return null;
    write(goals);
    return restarted;
  }

  function clear() {
    write([]);
  }

  function equivalent(a, b) {
    return a.type === b.type
      && a.target === b.target
      && (a.subject || null) === (b.subject || null)
      && (a.gameId || null) === (b.gameId || null);
  }

  function currentValue(goal, current) {
    switch (goal.type) {
      case 'subject-answers': return current.subjects[goal.subject]?.attempts || 0;
      case 'cabinet-sessions': return current.cabinetSessions[goal.gameId] || 0;
      case 'arcade-sessions': return current.sessions;
      case 'completed-sessions': return current.completedSessions;
      case 'xp-growth': return current.xp;
      case 'new-cabinets': {
        const baseline = new Set(goal.baseline || []);
        return current.visitedCabinets.filter(gameId => !baseline.has(gameId)).length;
      }
      default: return 0;
    }
  }

  function progress(goal, current = snapshot()) {
    const raw = currentValue(goal, current);
    const baseline = goal.type === 'new-cabinets' ? 0 : Number(goal.baseline) || 0;
    const value = Math.max(0, raw - baseline);
    const complete = value >= goal.target;
    return {
      value: Math.min(goal.target, value),
      rawValue: value,
      target: goal.target,
      percent: Math.min(100, Math.round(value / goal.target * 100)),
      complete
    };
  }

  function catalogMap(catalog) {
    return new Map((Array.isArray(catalog) ? catalog : []).map(game => [game.id, game]));
  }

  function label(goal, catalog = []) {
    const games = catalogMap(catalog);
    switch (goal.type) {
      case 'subject-answers': return `Answer ${goal.target} ${SUBJECT_LABELS[goal.subject]} question${goal.target === 1 ? '' : 's'}`;
      case 'cabinet-sessions': return `Play ${games.get(goal.gameId)?.title || 'a cabinet'} ${goal.target} time${goal.target === 1 ? '' : 's'}`;
      case 'arcade-sessions': return `Try ${goal.target} arcade session${goal.target === 1 ? '' : 's'}`;
      case 'completed-sessions': return `Complete ${goal.target} arcade session${goal.target === 1 ? '' : 's'}`;
      case 'xp-growth': return `Earn ${goal.target} XP`;
      case 'new-cabinets': return `Visit ${goal.target} new cabinet${goal.target === 1 ? '' : 's'}`;
      default: return 'Learning goal';
    }
  }

  function detail(goal, catalog = []) {
    const games = catalogMap(catalog);
    switch (goal.type) {
      case 'subject-answers': return `Counts answers across Creature Catcher and Road Trip Quest after this goal was added.`;
      case 'cabinet-sessions': return `Counts new ${games.get(goal.gameId)?.title || 'cabinet'} sessions after this goal was added.`;
      case 'arcade-sessions': return 'Counts any new cabinet sessions after this goal was added.';
      case 'completed-sessions': return 'Counts completed sessions recorded by the shared arcade profile.';
      case 'xp-growth': return 'Counts new Arcade XP after this goal was added.';
      case 'new-cabinets': return 'Counts cabinets that had no sessions when this goal was added.';
      default: return 'Progress stays on this device.';
    }
  }

  function href(goal, catalog = []) {
    const games = catalogMap(catalog);
    if (goal.type === 'cabinet-sessions') return `../${games.get(goal.gameId)?.href || '#games'}`;
    if (goal.type === 'subject-answers') {
      const gameId = goal.subject === 'trivia' ? 'road-trip-quest' : 'creature-catcher';
      return `../${games.get(gameId)?.href || '#games'}`;
    }
    return '../#games';
  }

  function summary(catalog = []) {
    const state = load();
    const current = snapshot();
    const goals = state.goals.map(goal => {
      const status = progress(goal, current);
      return {
        id: goal.id,
        type: goal.type,
        subject: goal.subject || null,
        gameId: goal.gameId || null,
        target: goal.target,
        createdAt: goal.createdAt,
        label: label(goal, catalog),
        detail: detail(goal, catalog),
        href: href(goal, catalog),
        ...status
      };
    });
    return {
      schema: SCHEMA,
      version: VERSION,
      privacy: {
        deviceLocal: true,
        uploadsData: false,
        storesFreeText: false,
        usesDeadlines: false,
        usesStreaks: false,
        includesRawFamilyRecords: false,
        includesLocationData: false
      },
      maxGoals: MAX_GOALS,
      goals,
      totals: {
        pinned: goals.length,
        complete: goals.filter(goal => goal.complete).length,
        inProgress: goals.filter(goal => !goal.complete).length,
        openSlots: MAX_GOALS - goals.length
      }
    };
  }

  function hasEquivalent(spec) {
    try {
      const valid = validateSpec(spec);
      return load().goals.some(goal => equivalent(goal, valid));
    } catch {
      return false;
    }
  }

  window.LarriVerseLearningGoals = Object.freeze({
    schema: SCHEMA,
    version: VERSION,
    storageKey: STORAGE_KEY,
    maxGoals: MAX_GOALS,
    subjects: [...SUBJECTS],
    subjectLabels: { ...SUBJECT_LABELS },
    types: [...TYPES],
    targets: Object.fromEntries(Object.entries(TARGETS).map(([key, values]) => [key, [...values]])),
    load,
    snapshot,
    summary,
    create,
    remove,
    restart,
    clear,
    hasEquivalent
  });
})();
