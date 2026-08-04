(() => {
  'use strict';

  const script = document.currentScript;
  const PACK_URL = new URL('../games/learning-question-pack-2.json', script.src).href;
  const STORAGE_KEY = 'larriverse.learningPath.v1';
  const LEVELS = {
    starter: { label: 'Starter', allowed: ['starter'], note: 'Build confidence with the gentlest questions.' },
    growing: { label: 'Growing', allowed: ['starter', 'growing'], note: 'Mix foundations with the next step up.' },
    challenge: { label: 'Challenge', allowed: ['growing', 'challenge'], note: 'Use stronger practice and reasoning questions.' },
    mixed: { label: 'Mixed', allowed: ['starter', 'growing', 'challenge'], note: 'Use the complete learning bank.' }
  };
  const gameId = location.pathname.includes('/creature-catcher/')
    ? 'creature-catcher'
    : location.pathname.includes('/road-trip-quest/')
      ? 'road-trip-quest'
      : 'shared-learning-game';
  const nativeFetch = window.fetch.bind(window);
  let promptIndex = new Map();
  let currentPrompt = '';
  let feedbackRecorded = false;
  let loadedSummary = null;

  function freshState() {
    return { version: 1, games: {} };
  }

  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed?.version === 1 && parsed.games && typeof parsed.games === 'object' ? parsed : freshState();
    } catch {
      return freshState();
    }
  }

  function writeState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function gameState(state = readState()) {
    if (!state.games[gameId]) {
      state.games[gameId] = { mode: 'mixed', seen: {}, stats: {} };
    }
    const entry = state.games[gameId];
    if (!LEVELS[entry.mode]) entry.mode = 'mixed';
    if (!entry.seen || typeof entry.seen !== 'object') entry.seen = {};
    if (!entry.stats || typeof entry.stats !== 'object') entry.stats = {};
    return entry;
  }

  function mode() {
    const state = readState();
    return gameState(state).mode;
  }

  function setMode(nextMode) {
    if (!LEVELS[nextMode]) return;
    const state = readState();
    gameState(state).mode = nextMode;
    writeState(state);
  }

  function mergeBanks(base, pack) {
    const merged = {
      ...base,
      schemaVersion: Math.max(Number(base.schemaVersion) || 1, Number(pack.schemaVersion) || 1),
      packs: [...(base.packs || []), pack.packId],
      subjects: {}
    };
    const subjects = new Set([...Object.keys(base.subjects || {}), ...Object.keys(pack.subjects || {})]);
    for (const subject of subjects) {
      const questions = [...(base.subjects?.[subject] || []), ...(pack.subjects?.[subject] || [])];
      const ids = new Set();
      merged.subjects[subject] = questions.filter(question => {
        if (!question?.id || ids.has(question.id)) return false;
        ids.add(question.id);
        return true;
      });
    }
    return merged;
  }

  function prepareBank(bank) {
    const state = readState();
    const entry = gameState(state);
    const selectedMode = entry.mode;
    const allowed = new Set(LEVELS[selectedMode].allowed);
    const subjects = {};
    promptIndex = new Map();
    let total = 0;
    let available = 0;

    for (const [subject, allQuestions] of Object.entries(bank.subjects || {})) {
      const eligible = allQuestions.filter(question => allowed.has(question.difficulty));
      const seen = Array.isArray(entry.seen[subject]) ? entry.seen[subject] : [];
      const seenSet = new Set(seen);
      let fresh = eligible.filter(question => !seenSet.has(question.id));
      const minimumDeck = Math.min(8, eligible.length);
      if (fresh.length < minimumDeck) {
        entry.seen[subject] = [];
        fresh = [...eligible];
      }
      subjects[subject] = fresh;
      total += allQuestions.length;
      available += fresh.length;
      for (const question of fresh) promptIndex.set(question.prompt, { id: question.id, subject });
    }

    writeState(state);
    loadedSummary = { gameId, mode: selectedMode, total, available, subjects: Object.fromEntries(Object.entries(subjects).map(([subject, questions]) => [subject, questions.length])) };
    return { ...bank, selectedLearningMode: selectedMode, subjects };
  }

  window.fetch = async function learningPathFetch(input, init) {
    const requestUrl = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (!requestUrl.pathname.endsWith('/games/learning-question-bank.json')) return nativeFetch(input, init);

    const [baseResponse, packResponse] = await Promise.all([
      nativeFetch(input, init),
      nativeFetch(PACK_URL, { cache: 'no-store' })
    ]);
    if (!baseResponse.ok) return baseResponse;
    if (!packResponse.ok) throw new Error(`Learning expansion pack could not load (${packResponse.status})`);

    const [base, pack] = await Promise.all([baseResponse.clone().json(), packResponse.json()]);
    const prepared = prepareBank(mergeBanks(base, pack));
    const headers = new Headers(baseResponse.headers);
    headers.set('content-type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify(prepared), {
      status: baseResponse.status,
      statusText: baseResponse.statusText,
      headers
    });
  };

  function rememberSeen(info) {
    if (!info?.id || !info.subject) return;
    const state = readState();
    const entry = gameState(state);
    const list = Array.isArray(entry.seen[info.subject]) ? entry.seen[info.subject] : [];
    entry.seen[info.subject] = [info.id, ...list.filter(id => id !== info.id)].slice(0, 32);
    writeState(state);
    updateControl();
  }

  function rememberAttempt(info, correct) {
    if (!info?.subject) return;
    const state = readState();
    const entry = gameState(state);
    const stats = entry.stats[info.subject] || { attempts: 0, correct: 0 };
    stats.attempts += 1;
    if (correct) stats.correct += 1;
    entry.stats[info.subject] = stats;
    writeState(state);
    updateControl();
  }

  function summary() {
    const state = readState();
    const entry = gameState(state);
    const seen = Object.values(entry.seen).reduce((sum, ids) => sum + (Array.isArray(ids) ? ids.length : 0), 0);
    const attempts = Object.values(entry.stats).reduce((sum, stats) => sum + (stats?.attempts || 0), 0);
    const correct = Object.values(entry.stats).reduce((sum, stats) => sum + (stats?.correct || 0), 0);
    return {
      gameId,
      mode: entry.mode,
      seen,
      attempts,
      correct,
      accuracy: attempts ? Math.round(correct / attempts * 100) : null,
      loaded: loadedSummary
    };
  }

  function ensureStyles() {
    if (document.querySelector('#learningPathStyles')) return;
    const style = document.createElement('style');
    style.id = 'learningPathStyles';
    style.textContent = `
      .learning-path{margin:16px auto;padding:14px;border-radius:18px;background:rgba(255,255,255,.88);color:#10203b;box-shadow:0 8px 24px rgba(16,32,59,.12);text-align:left}
      .learning-path__head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
      .learning-path__head strong{font-size:.92rem}.learning-path__head small{font-size:.68rem;color:#5f6b80}
      .learning-path__choices{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
      .learning-path__choices button{border:2px solid #d8dceb;border-radius:12px;background:white;color:#10203b;padding:8px 5px;font-size:.72rem;font-weight:900;cursor:pointer}
      .learning-path__choices button[aria-pressed="true"]{border-color:#7c4dff;background:#eee8ff;color:#4f35a6}
      .learning-path__note{margin:8px 0 0!important;font-size:.7rem!important;color:#5f6b80!important;line-height:1.35!important}
      @media(max-width:520px){.learning-path__choices{grid-template-columns:1fr 1fr}}
    `;
    document.head.append(style);
  }

  function renderControl() {
    const host = document.querySelector('#learningPathControl');
    if (!host) return;
    ensureStyles();
    const data = summary();
    const accuracy = data.accuracy === null ? 'No answers recorded yet' : `${data.accuracy}% correct across ${data.attempts} answers`;
    host.innerHTML = `
      <section class="learning-path" aria-label="Learning difficulty">
        <div class="learning-path__head"><strong>🧭 Learning path</strong><small>${data.seen} recent question${data.seen === 1 ? '' : 's'} remembered</small></div>
        <div class="learning-path__choices">
          ${Object.entries(LEVELS).map(([id, level]) => `<button type="button" data-learning-mode="${id}" aria-pressed="${data.mode === id}">${level.label}</button>`).join('')}
        </div>
        <p class="learning-path__note">${LEVELS[data.mode].note} ${accuracy}. Progress stays in this browser.</p>
      </section>
    `;
    host.querySelectorAll('[data-learning-mode]').forEach(button => {
      button.addEventListener('click', () => {
        const nextMode = button.dataset.learningMode;
        if (nextMode === mode()) return;
        setMode(nextMode);
        location.reload();
      });
    });
  }

  function updateControl() {
    if (document.readyState === 'loading') return;
    renderControl();
  }

  function observeQuestions() {
    const question = document.querySelector('#questionText');
    const feedback = document.querySelector('#feedback');
    if (question) {
      new MutationObserver(() => {
        const prompt = question.textContent.trim();
        if (!prompt || prompt === currentPrompt) return;
        currentPrompt = prompt;
        feedbackRecorded = false;
        rememberSeen(promptIndex.get(prompt));
      }).observe(question, { childList: true, characterData: true, subtree: true });
    }
    if (feedback) {
      new MutationObserver(() => {
        const text = feedback.textContent.trim();
        if (!text || feedbackRecorded || !currentPrompt) return;
        const correct = feedback.classList.contains('good') || /^(correct|caught)/i.test(text);
        const incorrect = feedback.classList.contains('bad') || /^(not quite|good try)/i.test(text);
        if (!correct && !incorrect) return;
        feedbackRecorded = true;
        rememberAttempt(promptIndex.get(currentPrompt), correct);
      }).observe(feedback, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
  }

  window.LarriVerseLearningPath = Object.freeze({
    version: 1,
    levels: Object.keys(LEVELS),
    mode,
    setMode,
    summary,
    remember: (id, subject, correct = null) => {
      const info = { id, subject };
      rememberSeen(info);
      if (typeof correct === 'boolean') rememberAttempt(info, correct);
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderControl();
    observeQuestions();
  });
})();
