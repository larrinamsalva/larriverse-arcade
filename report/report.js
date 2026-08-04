(() => {
  'use strict';

  const sdk = window.LarriVerseArcade;
  const LEARNING_KEY = 'larriverse.learningPath.v1';
  const REPORT_SCHEMA = 'larriverse-family-learning-report';
  const REPORT_VERSION = 1;
  const GAME_LABELS = {
    'creature-catcher': 'Creature Catcher',
    'road-trip-quest': 'Road Trip Quest'
  };
  const SUBJECT_LABELS = {
    math: 'Math',
    reading: 'Reading',
    science: 'Science',
    nature: 'Nature',
    trivia: 'Trivia'
  };
  const MODE_LABELS = {
    starter: 'Starter',
    growing: 'Growing',
    challenge: 'Challenge',
    mixed: 'Mixed'
  };

  let catalog = [];
  let latestReport = null;
  let toastTimer = null;

  const $ = selector => document.querySelector(selector);

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === 'object' ? value : fallback;
    } catch {
      return fallback;
    }
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  function percent(correct, attempts) {
    return attempts ? Math.round(correct / attempts * 100) : null;
  }

  function formatDate(value, empty = 'No visit yet') {
    if (!value) return empty;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Visit recorded';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function learningPaths() {
    const state = readJson(LEARNING_KEY, { version: 1, games: {} });
    const games = state.games && typeof state.games === 'object' ? state.games : {};

    return Object.entries(GAME_LABELS).map(([gameId, title]) => {
      const entry = games[gameId] && typeof games[gameId] === 'object' ? games[gameId] : {};
      const seenBySubject = entry.seen && typeof entry.seen === 'object' ? entry.seen : {};
      const statsBySubject = entry.stats && typeof entry.stats === 'object' ? entry.stats : {};
      const subjectIds = [...new Set([...Object.keys(seenBySubject), ...Object.keys(statsBySubject)])]
        .filter(subject => SUBJECT_LABELS[subject]);
      const subjects = subjectIds.map(subject => {
        const stats = statsBySubject[subject] && typeof statsBySubject[subject] === 'object' ? statsBySubject[subject] : {};
        const attempts = number(stats.attempts);
        const correct = Math.min(attempts, number(stats.correct));
        const recent = Array.isArray(seenBySubject[subject]) ? new Set(seenBySubject[subject]).size : 0;
        return {
          id: subject,
          label: SUBJECT_LABELS[subject],
          attempts,
          correct,
          accuracy: percent(correct, attempts),
          recent
        };
      }).sort((a, b) => a.label.localeCompare(b.label));

      return {
        gameId,
        title,
        mode: MODE_LABELS[entry.mode] || MODE_LABELS.mixed,
        subjects,
        recentQuestions: subjects.reduce((sum, subject) => sum + subject.recent, 0),
        attempts: subjects.reduce((sum, subject) => sum + subject.attempts, 0),
        correct: subjects.reduce((sum, subject) => sum + subject.correct, 0)
      };
    });
  }

  function aggregateSubjects(paths) {
    const totals = new Map();
    for (const path of paths) {
      for (const subject of path.subjects) {
        const current = totals.get(subject.id) || {
          id: subject.id,
          label: subject.label,
          attempts: 0,
          correct: 0,
          recentQuestions: 0,
          games: []
        };
        current.attempts += subject.attempts;
        current.correct += subject.correct;
        current.recentQuestions += subject.recent;
        if (subject.attempts || subject.recent) current.games.push(path.title);
        totals.set(subject.id, current);
      }
    }

    return [...totals.values()]
      .map(subject => ({
        ...subject,
        games: [...new Set(subject.games)],
        accuracy: percent(subject.correct, subject.attempts)
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  function cabinetSummary(profile) {
    return catalog.map(game => {
      const record = profile.games?.[game.id] || {};
      return {
        id: game.id,
        title: game.title,
        icon: game.icon,
        href: game.href,
        category: game.category,
        sessions: number(record.sessions),
        completions: number(record.completions),
        highScore: number(record.highScore),
        lastPlayedAt: typeof record.lastPlayedAt === 'string' ? record.lastPlayedAt : null
      };
    });
  }

  function learningInsights(subjects) {
    const eligible = subjects.filter(subject => subject.attempts >= 2 && subject.accuracy !== null);
    const strengths = eligible
      .filter(subject => subject.accuracy >= 80)
      .sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts);
    const practice = eligible
      .filter(subject => subject.accuracy < 75)
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);
    return { strengths, practice };
  }

  function recentActivity(cabinets) {
    return cabinets
      .filter(cabinet => cabinet.sessions > 0 && cabinet.lastPlayedAt && !Number.isNaN(new Date(cabinet.lastPlayedAt).getTime()))
      .sort((a, b) => new Date(b.lastPlayedAt) - new Date(a.lastPlayedAt))
      .slice(0, 5)
      .map(cabinet => ({
        cabinetId: cabinet.id,
        title: cabinet.title,
        sessions: cabinet.sessions,
        completions: cabinet.completions,
        lastPlayedAt: cabinet.lastPlayedAt
      }));
  }

  function conversationStarters(insights, cabinets, subjects) {
    const starters = [];
    if (insights.strengths[0]) {
      starters.push(`What made ${insights.strengths[0].label} feel successful or interesting?`);
    }
    if (insights.practice[0]) {
      starters.push(`Would a short ${insights.practice[0].label} round feel useful, or would a different cabinet make practice more fun?`);
    }
    const unvisited = cabinets.find(cabinet => cabinet.sessions === 0);
    if (unvisited) starters.push(`What looks most interesting about trying ${unvisited.title} for the first time?`);
    if (!starters.length && subjects.length) starters.push('Which subject or cabinet felt most enjoyable during this learning trail?');
    starters.push('What effort, curiosity, or persistence should we celebrate from this snapshot?');
    return starters.slice(0, 3);
  }

  function buildReport() {
    const profile = sdk.summary();
    const paths = learningPaths();
    const subjects = aggregateSubjects(paths);
    const cabinets = cabinetSummary(profile);
    const insights = learningInsights(subjects);
    const activity = recentActivity(cabinets);
    const starters = conversationStarters(insights, cabinets, subjects);
    const totalAttempts = subjects.reduce((sum, subject) => sum + subject.attempts, 0);
    const totalCorrect = subjects.reduce((sum, subject) => sum + subject.correct, 0);

    return {
      schema: REPORT_SCHEMA,
      version: REPORT_VERSION,
      exportedAt: new Date().toISOString(),
      privacy: {
        deviceLocalSource: true,
        uploadsData: false,
        includesRawFamilyRecords: false,
        includesLocationData: false,
        storesReviewNotes: false
      },
      learner: {
        name: profile.name,
        avatar: profile.avatar,
        level: profile.level,
        xp: number(profile.xp),
        arcadeKc: number(profile.kc),
        sessions: number(profile.sessions),
        completedSessions: number(profile.completedSessions)
      },
      overview: {
        cabinetCount: cabinets.length,
        visitedCabinets: cabinets.filter(cabinet => cabinet.sessions > 0).length,
        completedCabinets: cabinets.filter(cabinet => cabinet.completions > 0).length,
        learningAttempts: totalAttempts,
        learningCorrect: totalCorrect,
        learningAccuracy: percent(totalCorrect, totalAttempts)
      },
      strengths: insights.strengths.map(({ id, label, attempts, correct, accuracy, recentQuestions, games }) => ({ id, label, attempts, correct, accuracy, recentQuestions, games })),
      practiceOpportunities: insights.practice.map(({ id, label, attempts, correct, accuracy, recentQuestions, games }) => ({ id, label, attempts, correct, accuracy, recentQuestions, games })),
      subjects: subjects.map(({ id, label, attempts, correct, accuracy, recentQuestions, games }) => ({ id, label, attempts, correct, accuracy, recentQuestions, games })),
      learningPaths: paths.map(path => ({
        gameId: path.gameId,
        title: path.title,
        mode: path.mode,
        recentQuestions: path.recentQuestions,
        attempts: path.attempts,
        correct: path.correct,
        accuracy: percent(path.correct, path.attempts)
      })),
      cabinets: cabinets.map(({ id, title, sessions, completions, highScore, lastPlayedAt }) => ({ id, title, sessions, completions, highScore, lastPlayedAt })),
      recentActivity: activity,
      conversationStarters: starters,
      boundaries: {
        notAGrade: true,
        notADiagnosis: true,
        notARanking: true,
        notACertification: true
      }
    };
  }

  function renderInsights(container, items, emptyTitle, emptyText) {
    if (!items.length) {
      container.innerHTML = `<div class="empty-card"><strong>${escapeHtml(emptyTitle)}</strong><p>${escapeHtml(emptyText)}</p></div>`;
      return;
    }
    container.innerHTML = items.map(item => `<article class="insight-card" data-subject="${escapeHtml(item.id)}">
      <strong>${escapeHtml(item.label)} · ${item.accuracy}%</strong>
      <span>${item.correct} of ${item.attempts} answers correct${item.games.length ? ` · ${escapeHtml(item.games.join(' and '))}` : ''}</span>
    </article>`).join('');
  }

  function renderSubjects(subjects) {
    if (!subjects.length) {
      $('#subjectGrid').innerHTML = '<div class="empty-card"><strong>No subject history yet</strong><p>Answer questions in Creature Catcher or Road Trip Quest to begin a local learning snapshot.</p></div>';
      return;
    }
    $('#subjectGrid').innerHTML = subjects.map(subject => {
      const label = subject.attempts ? `${subject.accuracy}%` : 'New';
      const width = subject.accuracy ?? 0;
      return `<article class="subject-card" data-subject="${escapeHtml(subject.id)}">
        <header><h3>${escapeHtml(subject.label)}</h3><strong>${label}</strong></header>
        <div class="meter" aria-hidden="true"><span style="width:${width}%"></span></div>
        <p>${subject.attempts ? `${subject.correct}/${subject.attempts} correct · ${subject.recentQuestions} recent question${subject.recentQuestions === 1 ? '' : 's'}` : 'More data needed before a pattern is described.'}</p>
      </article>`;
    }).join('');
  }

  function renderPaths(paths) {
    $('#learningPathGrid').innerHTML = paths.map(path => {
      const accuracy = percent(path.correct, path.attempts);
      return `<article class="path-card" data-game="${escapeHtml(path.gameId)}">
        <header><h3>${escapeHtml(path.title)}</h3><span class="path-badge">${escapeHtml(path.mode)}</span></header>
        <p>${path.attempts ? `${accuracy}% overall · ${path.correct}/${path.attempts} answers` : 'No answers recorded yet.'}</p>
        <strong>${path.recentQuestions} recent question${path.recentQuestions === 1 ? '' : 's'} remembered locally</strong>
      </article>`;
    }).join('');
  }

  function renderCabinets(cabinets) {
    const visited = cabinets.filter(cabinet => cabinet.sessions > 0).length;
    const completed = cabinets.filter(cabinet => cabinet.completions > 0).length;
    $('#cabinetSummary').textContent = `${visited} of ${cabinets.length} visited · ${completed} with a completed session`;
    $('#cabinetReport').innerHTML = cabinets.map(cabinet => `<article class="cabinet-row ${cabinet.sessions ? '' : 'unvisited'}" data-cabinet="${escapeHtml(cabinet.id)}">
      <div class="cabinet-title"><span aria-hidden="true">${escapeHtml(cabinet.icon)}</span><div>${escapeHtml(cabinet.title)}<small>${escapeHtml(cabinet.category)}</small></div></div>
      <div class="cabinet-metric"><strong>${cabinet.sessions}</strong><small>Sessions</small></div>
      <div class="cabinet-metric"><strong>${cabinet.completions}</strong><small>Completed</small></div>
      <div class="cabinet-metric"><strong>${Math.round(cabinet.highScore)}</strong><small>Best score</small></div>
      <div class="cabinet-date">${cabinet.sessions ? `Last played ${escapeHtml(formatDate(cabinet.lastPlayedAt, 'date unavailable'))}` : 'Not visited on this device'}</div>
    </article>`).join('');
  }

  function renderActivity(activity) {
    if (!activity.length) {
      $('#recentActivity').innerHTML = '<li><strong>No recent cabinet timestamps yet</strong><span>Play a cabinet to begin a local activity trail.</span></li>';
      return;
    }
    $('#recentActivity').innerHTML = activity.map(item => `<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(formatDate(item.lastPlayedAt))} · ${item.sessions} session${item.sessions === 1 ? '' : 's'} · ${item.completions} completed</span></li>`).join('');
  }

  function renderStarters(starters) {
    $('#conversationStarters').innerHTML = starters.map(starter => `<li>${escapeHtml(starter)}</li>`).join('');
  }

  function showMessage(message) {
    const output = $('#reportMessage');
    output.textContent = message;
    output.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => output.classList.remove('show'), 2200);
  }

  function downloadReport() {
    const report = buildReport();
    const blob = new Blob([`${JSON.stringify(report, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `larriverse-family-learning-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showMessage('Private family learning report downloaded.');
  }

  function render() {
    const report = buildReport();
    latestReport = report;
    $('#identityAvatar').textContent = report.learner.avatar || '🌟';
    $('#identityName').textContent = report.learner.name || 'Player One';
    $('#levelValue').textContent = report.learner.level;
    $('#levelXp').textContent = `${report.learner.xp} XP`;
    $('#totalXp').textContent = report.learner.xp;
    $('#totalSessions').textContent = report.learner.sessions;
    $('#totalCompletions').textContent = report.learner.completedSessions;
    $('#cabinetsVisited').textContent = `${report.overview.visitedCabinets} / ${report.overview.cabinetCount}`;
    $('#generatedDate').textContent = formatDate(report.exportedAt, 'today');
    $('#generatedDate').dateTime = report.exportedAt;
    renderInsights($('#strengthCards'), report.strengths, 'More history needed', 'Strengths appear after at least two answers and 80% accuracy in a subject.');
    renderInsights($('#practiceCards'), report.practiceOpportunities, 'No practice flag right now', 'Subjects are not labeled for practice until at least two answers exist and accuracy is below 75%.');
    renderSubjects(report.subjects);
    renderPaths(report.learningPaths);
    renderCabinets(report.cabinets.map(cabinet => ({ ...catalog.find(game => game.id === cabinet.id), ...cabinet })));
    renderActivity(report.recentActivity);
    renderStarters(report.conversationStarters);
    document.title = `${report.learner.name || 'Player One'}’s Family Learning Report · LarriVerse Arcade`;
  }

  async function init() {
    if (!sdk || typeof sdk.summary !== 'function') {
      throw new Error('The shared Arcade SDK could not be loaded.');
    }
    const response = await fetch('../games/catalog.json');
    if (!response.ok) throw new Error('The arcade catalog could not be loaded.');
    catalog = await response.json();
    if (!Array.isArray(catalog) || catalog.length !== 8) throw new Error('The Family Learning Report requires all eight playable cabinets.');
    render();
    $('#printReport').addEventListener('click', () => window.print());
    $('#downloadReport').addEventListener('click', downloadReport);
    window.addEventListener('storage', event => {
      if (event.key?.startsWith('larriverse.')) render();
    });
  }

  window.LarriVerseFamilyLearningReport = {
    report: () => buildReport(),
    refresh: () => render(),
    latest: () => latestReport
  };

  init().catch(error => {
    console.error(error);
    $('#reportMain').innerHTML = `<section class="boundary-card"><span aria-hidden="true">⚠️</span><div><h1>Report unavailable</h1><p>${escapeHtml(error.message)}</p><a class="secondary" href="../">Return to the arcade</a></div></section>`;
  });
})();
