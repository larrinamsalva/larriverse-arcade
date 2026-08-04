(() => {
  'use strict';

  const sdk = window.LarriVerseArcade;
  const LEARNING_KEY = 'larriverse.learningPath.v1';
  const PASSPORT_SCHEMA = 'larriverse-progress-passport';
  const PASSPORT_VERSION = 1;
  const GAME_LABELS = {
    'creature-catcher': 'Creature Catcher',
    'road-trip-quest': 'Road Trip Quest'
  };
  const SUBJECT_LABELS = {
    math: 'Math', reading: 'Reading', science: 'Science', nature: 'Nature', trivia: 'Trivia'
  };
  const MODE_LABELS = {
    starter: 'Starter', growing: 'Growing', challenge: 'Challenge', mixed: 'Mixed'
  };
  const ACHIEVEMENTS = {
    'first-flight': { icon: '🚀', title: 'First Flight', detail: 'Completed a first LarriVerse session.' },
    'three-is-magic': { icon: '✨', title: 'Three Is Magic', detail: 'Completed three arcade sessions.' },
    'coin-spark': { icon: '🪙', title: 'Coin Spark', detail: 'Collected at least 36 Arcade KC.' }
  };

  let catalog = [];
  let latestSummary = null;
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

  function levelProgress(profile) {
    const level = Math.max(1, number(profile.level) || 1);
    const start = level === 1 ? 0 : Math.pow(level - 1, 2) * 36;
    const end = Math.pow(level, 2) * 36;
    const span = Math.max(1, end - start);
    const value = Math.min(100, Math.max(0, Math.round((number(profile.xp) - start) / span * 100)));
    return { level, start, end, value };
  }

  function learningSummary() {
    const state = readJson(LEARNING_KEY, { version: 1, games: {} });
    const games = state.games && typeof state.games === 'object' ? state.games : {};
    return Object.entries(GAME_LABELS).map(([gameId, title]) => {
      const entry = games[gameId] && typeof games[gameId] === 'object' ? games[gameId] : {};
      const seenBySubject = entry.seen && typeof entry.seen === 'object' ? entry.seen : {};
      const statsBySubject = entry.stats && typeof entry.stats === 'object' ? entry.stats : {};
      const subjects = [...new Set([...Object.keys(seenBySubject), ...Object.keys(statsBySubject)])]
        .filter(subject => SUBJECT_LABELS[subject])
        .sort((a, b) => SUBJECT_LABELS[a].localeCompare(SUBJECT_LABELS[b]))
        .map(subject => {
          const stats = statsBySubject[subject] && typeof statsBySubject[subject] === 'object' ? statsBySubject[subject] : {};
          const attempts = number(stats.attempts);
          const correct = Math.min(attempts, number(stats.correct));
          const seen = Array.isArray(seenBySubject[subject]) ? new Set(seenBySubject[subject]).size : 0;
          return {
            id: subject,
            label: SUBJECT_LABELS[subject],
            attempts,
            correct,
            accuracy: percent(correct, attempts),
            recent: seen
          };
        });
      return {
        gameId,
        title,
        mode: MODE_LABELS[entry.mode] || MODE_LABELS.mixed,
        subjects,
        recent: subjects.reduce((sum, subject) => sum + subject.recent, 0),
        attempts: subjects.reduce((sum, subject) => sum + subject.attempts, 0),
        correct: subjects.reduce((sum, subject) => sum + subject.correct, 0)
      };
    });
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

  function friendlyAchievement(id) {
    if (ACHIEVEMENTS[id]) return { id, ...ACHIEVEMENTS[id] };
    if (id.endsWith('-campaign-clear')) {
      return { id, icon: '🏁', title: 'Campaign Clear', detail: 'Defeated every major campaign challenge in one cabinet.' };
    }
    if (id.endsWith('-score-90')) {
      return { id, icon: '🏆', title: 'Score 90', detail: 'Reached a best score of at least 90 in one cabinet.' };
    }
    return { id, icon: '🌠', title: 'Arcade Milestone', detail: 'Unlocked a special LarriVerse milestone.' };
  }

  function achievementSummary(profile) {
    const unlocked = new Set(Array.isArray(profile.achievements) ? profile.achievements : []);
    const known = ['first-flight', 'three-is-magic', 'coin-spark'];
    const ordered = [...known, ...[...unlocked].filter(id => !known.includes(id)).sort()];
    return ordered.map(id => ({ ...friendlyAchievement(id), unlocked: unlocked.has(id) }));
  }

  function nextMission(profile, cabinets, learning) {
    const weakSubject = learning
      .flatMap(game => game.subjects.map(subject => ({ ...subject, gameId: game.gameId, gameTitle: game.title })))
      .filter(subject => subject.attempts >= 2 && subject.accuracy !== null)
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)[0];

    if (weakSubject && weakSubject.accuracy < 75) {
      const game = catalog.find(item => item.id === weakSubject.gameId);
      return {
        heading: `Practice ${weakSubject.label}`,
        text: `${weakSubject.gameTitle} shows ${weakSubject.accuracy}% across ${weakSubject.attempts} answers. A short fresh round can strengthen that trail without turning learning into a punishment parade.`,
        label: `Open ${weakSubject.gameTitle}`,
        href: game?.href ? `../${game.href}` : '../#games'
      };
    }

    const unplayed = cabinets.find(game => game.sessions === 0);
    if (unplayed) {
      return {
        heading: `Stamp ${unplayed.title}`,
        text: `${unplayed.title} has not been visited on this device yet. One session adds a new cabinet stamp to the passport.`,
        label: `Open ${unplayed.title}`,
        href: `../${unplayed.href}`
      };
    }

    const leastCompleted = [...cabinets].sort((a, b) => a.completions - b.completions || a.sessions - b.sessions)[0];
    if (leastCompleted) {
      return {
        heading: `Revisit ${leastCompleted.title}`,
        text: `${leastCompleted.title} currently has ${leastCompleted.completions} completed session${leastCompleted.completions === 1 ? '' : 's'}. A return trip keeps the eight-cabinet journey balanced.`,
        label: `Play ${leastCompleted.title}`,
        href: `../${leastCompleted.href}`
      };
    }

    return {
      heading: 'Choose a first adventure',
      text: 'Open any cabinet and start building a private progress trail on this device.',
      label: 'Explore games',
      href: '../#games'
    };
  }

  function formatDate(value) {
    if (!value) return 'No visit yet';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Visit recorded';
    return `Last played ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  function renderIdentity(profile) {
    $('#identityAvatar').textContent = profile.avatar || '🌟';
    $('#identityName').textContent = profile.name || 'Player One';
    $('#levelValue').textContent = profile.level;
    $('#xpValue').textContent = `${number(profile.xp)} XP`;
    $('#totalXp').textContent = number(profile.xp);
    $('#totalKc').textContent = number(profile.kc);
    $('#totalSessions').textContent = number(profile.sessions);
    $('#totalCompletions').textContent = number(profile.completedSessions);

    const trail = levelProgress(profile);
    $('#levelStart').textContent = `${trail.start} XP`;
    $('#levelEnd').textContent = `${trail.end} XP`;
    $('#levelProgressText').textContent = `${trail.value}% to Level ${trail.level + 1}`;
    $('#levelProgressBar').style.width = `${trail.value}%`;
    const track = $('.progress-track');
    track.setAttribute('aria-valuenow', String(trail.value));
    $('#levelMessage').textContent = trail.value
      ? `${number(profile.xp) - trail.start} XP earned in Level ${trail.level}; ${Math.max(0, trail.end - number(profile.xp))} XP remains before the next seal.`
      : `Level ${trail.level} has just begun. The next seal arrives at ${trail.end} XP.`;
  }

  function renderLearning(learning) {
    const active = learning.filter(game => game.recent || game.attempts);
    $('#learningGrid').innerHTML = active.length ? learning.map(game => {
      const overall = percent(game.correct, game.attempts);
      const subjects = game.subjects.length
        ? game.subjects.map(subject => `<div class="subject-row"><span>${escapeHtml(subject.label)} · ${subject.recent} recent</span><strong>${subject.attempts ? `${subject.accuracy}% · ${subject.correct}/${subject.attempts}` : 'No answers yet'}</strong></div>`).join('')
        : '<div class="subject-row"><span>No subject history yet</span><strong>Ready to begin</strong></div>';
      return `<article class="learning-card">
        <header><h3>${escapeHtml(game.title)}</h3><span class="mode-badge">${escapeHtml(game.mode)}</span></header>
        <p>${game.attempts ? `${overall}% overall across ${game.attempts} answer${game.attempts === 1 ? '' : 's'} · ${game.recent} recent question${game.recent === 1 ? '' : 's'} remembered` : 'A learning path is selected, but no answers have been recorded yet.'}</p>
        <div class="subject-list">${subjects}</div>
      </article>`;
    }).join('') : '<div class="learning-empty"><strong>No adaptive-learning trail yet.</strong><p>Choose a learning path in Creature Catcher or Road Trip Quest, answer a question, and the trail will appear here.</p></div>';
  }

  function renderCabinets(cabinets) {
    const played = cabinets.filter(game => game.sessions > 0).length;
    const completed = cabinets.filter(game => game.completions > 0).length;
    $('#cabinetSummary').textContent = `${played} of ${cabinets.length} cabinets visited · ${completed} with at least one completed session`;
    $('#cabinetGrid').innerHTML = cabinets.map(game => {
      const status = game.completions ? 'Completed' : game.sessions ? 'Visited' : 'Open stamp';
      const classes = ['cabinet-stamp', game.sessions ? 'played' : '', game.completions ? 'completed' : ''].filter(Boolean).join(' ');
      return `<article class="${classes}">
        <header><span class="cabinet-icon" aria-hidden="true">${escapeHtml(game.icon)}</span><span class="stamp-status">${status}</span></header>
        <h3>${escapeHtml(game.title)}</h3>
        <p>${game.sessions ? `${game.sessions} session${game.sessions === 1 ? '' : 's'} · ${game.completions} completed · best score ${Math.round(game.highScore)}` : 'No progress has been recorded for this cabinet on this device.'}</p>
        <footer><span>${escapeHtml(game.category)}</span><span>${escapeHtml(formatDate(game.lastPlayedAt))}</span></footer>
      </article>`;
    }).join('');
  }

  function renderAchievements(achievements) {
    $('#achievementGrid').innerHTML = achievements.map(item => `<article class="achievement ${item.unlocked ? '' : 'locked'}">
      <span aria-hidden="true">${item.unlocked ? item.icon : '🔒'}</span>
      <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.unlocked ? item.detail : `Locked · ${item.detail}`)}</p></div>
    </article>`).join('');
  }

  function renderMission(mission) {
    $('#missionHeading').textContent = mission.heading;
    $('#missionText').textContent = mission.text;
    $('#missionLink').textContent = mission.label;
    $('#missionLink').href = mission.href;
  }

  function buildSummary() {
    const profile = sdk.summary();
    const learning = learningSummary();
    const cabinets = cabinetSummary(profile);
    return {
      schema: PASSPORT_SCHEMA,
      version: PASSPORT_VERSION,
      exportedAt: new Date().toISOString(),
      privacy: {
        deviceLocalSource: true,
        uploadsData: false,
        includesRawFamilyRecords: false,
        includesLocationData: false
      },
      player: {
        name: profile.name,
        avatar: profile.avatar,
        level: profile.level,
        xp: number(profile.xp),
        arcadeKc: number(profile.kc),
        sessions: number(profile.sessions),
        completedSessions: number(profile.completedSessions)
      },
      cabinets: cabinets.map(({ id, title, sessions, completions, highScore, lastPlayedAt }) => ({ id, title, sessions, completions, highScore, lastPlayedAt })),
      learning: learning.map(game => ({
        gameId: game.gameId,
        title: game.title,
        mode: game.mode,
        recentQuestions: game.recent,
        attempts: game.attempts,
        correct: game.correct,
        subjects: game.subjects
      })),
      achievements: achievementSummary(profile).filter(item => item.unlocked).map(({ id, title }) => ({ id, title }))
    };
  }

  function showMessage(message) {
    const output = $('#passportMessage');
    output.textContent = message;
    output.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => output.classList.remove('show'), 2200);
  }

  function downloadSummary() {
    const summary = buildSummary();
    const blob = new Blob([`${JSON.stringify(summary, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `larriverse-progress-passport-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showMessage('Private progress summary downloaded.');
  }

  function render() {
    const profile = sdk.summary();
    const learning = learningSummary();
    const cabinets = cabinetSummary(profile);
    const achievements = achievementSummary(profile);
    latestSummary = { profile, learning, cabinets, achievements };
    renderIdentity(profile);
    renderLearning(learning);
    renderCabinets(cabinets);
    renderAchievements(achievements);
    renderMission(nextMission(profile, cabinets, learning));
    document.title = `${profile.name || 'Player One'}’s Progress Passport · LarriVerse Arcade`;
  }

  async function init() {
    if (!sdk) throw new Error('The shared LarriVerse Arcade SDK did not load.');
    const response = await fetch('../games/catalog.json');
    if (!response.ok) throw new Error(`Arcade catalog could not load (${response.status}).`);
    catalog = await response.json();
    if (!Array.isArray(catalog) || catalog.length !== 8) throw new Error('The Progress Passport requires the complete eight-cabinet catalog.');
    render();
  }

  $('#printPassport').addEventListener('click', () => window.print());
  $('#downloadPassport').addEventListener('click', downloadSummary);
  window.addEventListener('larriverse:profile', render);
  window.addEventListener('larriverse:data-imported', render);
  window.addEventListener('larriverse:data-cleared', render);
  window.addEventListener('storage', event => {
    if (event.key?.startsWith('larriverse.')) render();
  });

  window.LarriVerseProgressPassport = Object.freeze({
    schema: PASSPORT_SCHEMA,
    version: PASSPORT_VERSION,
    summary: () => buildSummary(),
    current: () => latestSummary ? JSON.parse(JSON.stringify(latestSummary)) : null
  });

  init().catch(error => {
    console.error(error);
    $('#cabinetSummary').textContent = error.message;
    $('#cabinetGrid').innerHTML = '<div class="learning-empty"><strong>The passport could not load.</strong><p>Return to the arcade and make sure the site is being served over HTTP.</p></div>';
  });
})();
