(() => {
  'use strict';

  const STORAGE_KEY = 'larriverse.learningDay.v1';
  const SCHEMA = 'larriverse-learning-day';
  const VERSION = 1;
  const MAX_HISTORY = 6;
  const PACES = Object.freeze({
    quick: Object.freeze({
      label: 'Quick Spark',
      icon: '✨',
      description: 'One tiny step. Stop whenever it feels complete.',
      targets: Object.freeze({
        'subject-answers': 1,
        'cabinet-sessions': 1,
        'arcade-sessions': 1,
        'completed-sessions': 1,
        'xp-growth': 9,
        'new-cabinets': 1
      })
    }),
    steady: Object.freeze({
      label: 'Steady Quest',
      icon: '🧭',
      description: 'A comfortable middle-sized adventure.',
      targets: Object.freeze({
        'subject-answers': 3,
        'cabinet-sessions': 1,
        'arcade-sessions': 3,
        'completed-sessions': 1,
        'xp-growth': 18,
        'new-cabinets': 1
      })
    }),
    deep: Object.freeze({
      label: 'Deep Dive',
      icon: '🌊',
      description: 'A longer choice for days with extra energy.',
      targets: Object.freeze({
        'subject-answers': 6,
        'cabinet-sessions': 3,
        'arcade-sessions': 6,
        'completed-sessions': 3,
        'xp-growth': 36,
        'new-cabinets': 3
      })
    })
  });
  const TYPES = Object.freeze(Object.keys(PACES.quick.targets));

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

  function safeSlug(value) {
    return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  }

  function safeId(value, prefix) {
    return typeof value === 'string' && new RegExp(`^${prefix}-[a-z0-9-]{8,100}$`).test(value);
  }

  function safeTime(value) {
    return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
  }

  function goalsEngine() {
    const engine = window.LarriVerseLearningGoals;
    if (!engine || typeof engine.snapshot !== 'function' || typeof engine.summary !== 'function') {
      throw new Error('Learning Day requires the shared Learning Goals engine.');
    }
    return engine;
  }

  function currentSnapshot() {
    return goalsEngine().snapshot();
  }

  function normalizeSpec(spec, pace) {
    if (!spec || typeof spec !== 'object' || !TYPES.includes(spec.type) || !PACES[pace]) return null;
    const target = positiveInteger(spec.target);
    const allowedTarget = PACES[pace].targets[spec.type];
    if (!target || target > allowedTarget) return null;
    const normalized = { type: spec.type, target };
    if (spec.type === 'subject-answers') {
      if (!goalsEngine().subjects.includes(spec.subject)) return null;
      normalized.subject = spec.subject;
    }
    if (spec.type === 'cabinet-sessions') {
      if (!safeSlug(spec.gameId)) return null;
      normalized.gameId = spec.gameId;
    }
    return normalized;
  }

  function normalizeActive(active) {
    if (!active || typeof active !== 'object' || !safeId(active.id, 'step') || !PACES[active.pace]) return null;
    const spec = normalizeSpec(active, active.pace);
    if (!spec || !safeTime(active.chosenAt)) return null;
    const normalized = {
      id: active.id,
      source: active.source === 'goal' ? 'goal' : 'suggestion',
      sourceGoalId: safeId(active.sourceGoalId, 'goal') ? active.sourceGoalId : null,
      pace: active.pace,
      ...spec,
      chosenAt: active.chosenAt
    };
    if (spec.type === 'new-cabinets') {
      normalized.baseline = Array.isArray(active.baseline)
        ? [...new Set(active.baseline.filter(safeSlug))].sort()
        : [];
    } else {
      normalized.baseline = Math.max(0, Number(active.baseline) || 0);
    }
    return normalized;
  }

  function normalizeHistory(entry) {
    if (!entry || typeof entry !== 'object' || !safeId(entry.id, 'win') || !PACES[entry.pace] || !TYPES.includes(entry.type)) return null;
    if (!safeTime(entry.completedAt) || typeof entry.label !== 'string' || !entry.label.trim() || entry.label.length > 120) return null;
    return {
      id: entry.id,
      type: entry.type,
      pace: entry.pace,
      label: entry.label.trim(),
      completedAt: entry.completedAt
    };
  }

  function load() {
    const stored = readJson(STORAGE_KEY, { schema: SCHEMA, version: VERSION, active: null, history: [] });
    return {
      schema: SCHEMA,
      version: VERSION,
      active: normalizeActive(stored.active),
      history: Array.isArray(stored.history)
        ? stored.history.map(normalizeHistory).filter(Boolean).slice(0, MAX_HISTORY)
        : []
    };
  }

  function write(state) {
    const normalized = {
      schema: SCHEMA,
      version: VERSION,
      active: normalizeActive(state.active),
      history: Array.isArray(state.history)
        ? state.history.map(normalizeHistory).filter(Boolean).slice(0, MAX_HISTORY)
        : []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('larriverse:learning-day', {
      detail: { active: Boolean(normalized.active), celebrations: normalized.history.length }
    }));
    return normalized;
  }

  function createId(prefix) {
    const random = globalThis.crypto?.randomUUID?.().toLowerCase()
      || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    return `${prefix}-${random}`;
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

  function currentValue(spec, current) {
    switch (spec.type) {
      case 'subject-answers': return current.subjects[spec.subject]?.attempts || 0;
      case 'cabinet-sessions': return current.cabinetSessions[spec.gameId] || 0;
      case 'arcade-sessions': return current.sessions;
      case 'completed-sessions': return current.completedSessions;
      case 'xp-growth': return current.xp;
      case 'new-cabinets': {
        const baseline = new Set(spec.baseline || []);
        return current.visitedCabinets.filter(gameId => !baseline.has(gameId)).length;
      }
      default: return 0;
    }
  }

  function progress(active, current = currentSnapshot()) {
    if (!active) return null;
    const raw = currentValue(active, current);
    const baseline = active.type === 'new-cabinets' ? 0 : Number(active.baseline) || 0;
    const value = Math.max(0, raw - baseline);
    return {
      value: Math.min(active.target, value),
      rawValue: value,
      target: active.target,
      percent: Math.min(100, Math.round(value / active.target * 100)),
      complete: value >= active.target
    };
  }

  function catalogMap(catalog) {
    return new Map((Array.isArray(catalog) ? catalog : []).map(game => [game.id, game]));
  }

  function label(spec, catalog = []) {
    const games = catalogMap(catalog);
    const subjects = goalsEngine().subjectLabels;
    switch (spec.type) {
      case 'subject-answers': return `Answer ${spec.target} ${subjects[spec.subject]} question${spec.target === 1 ? '' : 's'}`;
      case 'cabinet-sessions': return `Play ${games.get(spec.gameId)?.title || 'a cabinet'} ${spec.target} time${spec.target === 1 ? '' : 's'}`;
      case 'arcade-sessions': return `Try ${spec.target} arcade session${spec.target === 1 ? '' : 's'}`;
      case 'completed-sessions': return `Complete ${spec.target} arcade session${spec.target === 1 ? '' : 's'}`;
      case 'xp-growth': return `Earn ${spec.target} XP`;
      case 'new-cabinets': return `Visit ${spec.target} new cabinet${spec.target === 1 ? '' : 's'}`;
      default: return 'Choose one learning step';
    }
  }

  function href(spec, catalog = []) {
    const games = catalogMap(catalog);
    if (spec.type === 'cabinet-sessions') return `../${games.get(spec.gameId)?.href || '#games'}`;
    if (spec.type === 'subject-answers') {
      const gameId = spec.subject === 'trivia' ? 'road-trip-quest' : 'creature-catcher';
      return `../${games.get(gameId)?.href || '#games'}`;
    }
    if (spec.type === 'completed-sessions') return '../games/brain-sweat-expanded/index.html';
    return '../#games';
  }

  function reasonForGoal(goal) {
    const remaining = Math.max(0, goal.target - goal.rawValue);
    return remaining
      ? `This moves a pinned goal forward. ${remaining} remain on the larger goal.`
      : 'This goal is already complete, so choose another gentle step.';
  }

  function paceTarget(type, pace, maximum = Infinity) {
    return Math.max(1, Math.min(PACES[pace].targets[type], positiveInteger(maximum) || Infinity));
  }

  function choiceKey(choice) {
    return [choice.type, choice.subject || '', choice.gameId || ''].join(':');
  }

  function suggestions(catalog = [], pace = 'steady') {
    if (!PACES[pace]) pace = 'steady';
    const Goals = goalsEngine();
    const current = Goals.snapshot();
    const goalSummary = Goals.summary(catalog);
    const choices = [];
    const used = new Set();

    function add(choice) {
      const key = choiceKey(choice);
      if (used.has(key) || choices.length >= 3) return;
      const spec = normalizeSpec(choice, pace);
      if (!spec) return;
      used.add(key);
      choices.push({
        id: choice.id,
        source: choice.source === 'goal' ? 'goal' : 'suggestion',
        sourceGoalId: choice.sourceGoalId || null,
        pace,
        ...spec,
        label: label(spec, catalog),
        href: href(spec, catalog),
        reason: choice.reason
      });
    }

    goalSummary.goals
      .filter(goal => !goal.complete)
      .sort((a, b) => a.percent - b.percent || a.createdAt.localeCompare(b.createdAt))
      .forEach(goal => {
        const remaining = Math.max(1, goal.target - goal.rawValue);
        add({
          id: `choice-goal-${goal.id.slice(5)}`,
          source: 'goal',
          sourceGoalId: goal.id,
          type: goal.type,
          subject: goal.subject,
          gameId: goal.gameId,
          target: paceTarget(goal.type, pace, remaining),
          reason: reasonForGoal(goal)
        });
      });

    const subjects = Object.entries(current.subjects)
      .map(([subject, stats]) => ({ subject, ...stats }))
      .filter(item => item.attempts >= 2 && item.accuracy !== null)
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);
    const practice = subjects.find(item => item.accuracy < 75);
    if (practice) {
      add({
        id: `choice-practice-${practice.subject}`,
        source: 'suggestion',
        type: 'subject-answers',
        subject: practice.subject,
        target: paceTarget('subject-answers', pace),
        reason: `${Goals.subjectLabels[practice.subject]} has ${practice.attempts} local answers at ${practice.accuracy}%. This is an optional practice invitation, not a grade.`
      });
    }

    const visited = new Set(current.visitedCabinets);
    const unvisited = catalog.find(game => !visited.has(game.id));
    if (unvisited) {
      add({
        id: `choice-visit-${unvisited.id}`,
        source: 'suggestion',
        type: 'cabinet-sessions',
        gameId: unvisited.id,
        target: 1,
        reason: `${unvisited.title} has not been visited in this browser yet.`
      });
    }

    const leastPlayed = [...catalog]
      .sort((a, b) => (current.cabinetSessions[a.id] || 0) - (current.cabinetSessions[b.id] || 0) || a.title.localeCompare(b.title))[0];
    if (leastPlayed) {
      add({
        id: `choice-return-${leastPlayed.id}`,
        source: 'suggestion',
        type: 'cabinet-sessions',
        gameId: leastPlayed.id,
        target: paceTarget('cabinet-sessions', pace),
        reason: `${leastPlayed.title} is one of the least-played cabinets on this device.`
      });
    }

    add({
      id: 'choice-any-session',
      source: 'suggestion',
      type: 'arcade-sessions',
      target: paceTarget('arcade-sessions', pace),
      reason: 'Choose any cabinet that feels interesting. The page does not decide for you.'
    });
    add({
      id: 'choice-xp-growth',
      source: 'suggestion',
      type: 'xp-growth',
      target: paceTarget('xp-growth', pace),
      reason: 'Any SDK-enabled cabinet can move this step forward.'
    });

    return choices.slice(0, 3);
  }

  function start(choice) {
    const state = load();
    if (state.active) throw new Error('Release or finish the current step before choosing another.');
    if (!choice || typeof choice !== 'object' || !PACES[choice.pace]) throw new Error('Choose a supported learning step.');
    const spec = normalizeSpec(choice, choice.pace);
    if (!spec) throw new Error('That learning step is not supported.');
    const current = currentSnapshot();
    const active = normalizeActive({
      id: createId('step'),
      source: choice.source,
      sourceGoalId: choice.sourceGoalId,
      pace: choice.pace,
      ...spec,
      baseline: baselineFor(spec, current),
      chosenAt: new Date().toISOString()
    });
    if (!active) throw new Error('The learning step could not be started.');
    write({ ...state, active });
    return active;
  }

  function release() {
    const state = load();
    if (!state.active) return false;
    write({ ...state, active: null });
    return true;
  }

  function complete(catalog = []) {
    const state = load();
    if (!state.active) throw new Error('There is no active learning step.');
    const status = progress(state.active);
    if (!status.complete) throw new Error('This step is still growing. More progress is needed before celebrating it.');
    const history = [{
      id: createId('win'),
      type: state.active.type,
      pace: state.active.pace,
      label: label(state.active, catalog),
      completedAt: new Date().toISOString()
    }, ...state.history].slice(0, MAX_HISTORY);
    return write({ ...state, active: null, history });
  }

  function clearHistory() {
    const state = load();
    write({ ...state, history: [] });
  }

  function summary(catalog = []) {
    const state = load();
    const active = state.active
      ? {
          ...state.active,
          label: label(state.active, catalog),
          href: href(state.active, catalog),
          paceLabel: PACES[state.active.pace].label,
          ...progress(state.active)
        }
      : null;
    return {
      schema: SCHEMA,
      version: VERSION,
      privacy: {
        deviceLocal: true,
        uploadsData: false,
        storesFreeText: false,
        usesTimers: false,
        usesSchedules: false,
        usesDeadlines: false,
        usesStreaks: false,
        usesGrades: false,
        includesRawFamilyRecords: false,
        includesLocationData: false
      },
      active,
      history: state.history.map(entry => ({
        ...entry,
        paceLabel: PACES[entry.pace].label
      })),
      totals: {
        active: active ? 1 : 0,
        celebrations: state.history.length
      }
    };
  }

  window.LarriVerseLearningDay = Object.freeze({
    schema: SCHEMA,
    version: VERSION,
    storageKey: STORAGE_KEY,
    maxHistory: MAX_HISTORY,
    paces: Object.fromEntries(Object.entries(PACES).map(([id, pace]) => [id, {
      label: pace.label,
      icon: pace.icon,
      description: pace.description,
      targets: { ...pace.targets }
    }])),
    load,
    summary,
    suggestions,
    start,
    release,
    complete,
    clearHistory,
    progress
  });
})();
