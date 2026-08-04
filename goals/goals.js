(() => {
  'use strict';

  const sdk = window.LarriVerseArcade;
  const Goals = window.LarriVerseLearningGoals;
  const $ = selector => document.querySelector(selector);
  let catalog = [];
  let toastTimer = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  function profile() {
    return sdk?.summary?.() || { name: 'Player One', avatar: '🌟', level: 1 };
  }

  function toast(message) {
    const output = $('#goalToast');
    output.textContent = message;
    output.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => output.classList.remove('show'), 2200);
  }

  function renderForm() {
    const type = $('#goalType').value;
    const context = $('#goalContext');
    const contextLabel = $('#contextLabel');
    const targets = Goals.targets[type] || [];
    $('#goalTarget').innerHTML = targets.map(target => `<option value="${target}">${target}</option>`).join('');

    if (type === 'subject-answers') {
      contextLabel.hidden = false;
      context.disabled = false;
      context.required = true;
      contextLabel.firstChild.textContent = 'Subject';
      context.innerHTML = Goals.subjects.map(subject => `<option value="${subject}">${escapeHtml(Goals.subjectLabels[subject])}</option>`).join('');
    } else if (type === 'cabinet-sessions') {
      contextLabel.hidden = false;
      context.disabled = false;
      context.required = true;
      contextLabel.firstChild.textContent = 'Cabinet';
      context.innerHTML = catalog.map(game => `<option value="${escapeHtml(game.id)}">${escapeHtml(game.title)}</option>`).join('');
    } else {
      contextLabel.hidden = true;
      context.disabled = true;
      context.required = false;
      context.innerHTML = '';
    }
    const full = Goals.summary(catalog).totals.openSlots === 0;
    $('#addGoalButton').disabled = full;
    $('#builderMessage').textContent = full ? 'The board has three goals. Restart or remove one before adding another.' : '';
  }

  function goalSpecFromForm() {
    const type = $('#goalType').value;
    const spec = { type, target: Number($('#goalTarget').value) };
    if (type === 'subject-answers') spec.subject = $('#goalContext').value;
    if (type === 'cabinet-sessions') spec.gameId = $('#goalContext').value;
    return spec;
  }

  function renderBoard() {
    const currentProfile = profile();
    const summary = Goals.summary(catalog);
    $('#identityAvatar').textContent = currentProfile.avatar || '🌟';
    $('#identityName').textContent = currentProfile.name || 'Player One';
    $('#completeCount').textContent = `${summary.totals.complete} / ${summary.totals.pinned}`;
    $('#pinnedCount').textContent = summary.totals.pinned;
    $('#doneCount').textContent = summary.totals.complete;
    $('#progressCount').textContent = summary.totals.inProgress;
    $('#slotCount').textContent = summary.totals.openSlots;

    if (!summary.goals.length) {
      $('#goalGrid').innerHTML = '<div class="empty-card"><strong>No goals pinned yet.</strong><p>Choose one small focus below or use an optional suggestion. The board works fine with zero goals too.</p></div>';
    } else {
      $('#goalGrid').innerHTML = summary.goals.map(goal => `<article class="goal-card ${goal.complete ? 'complete' : ''}" data-goal-id="${escapeHtml(goal.id)}">
        <header><h3>${escapeHtml(goal.label)}</h3><span class="goal-badge">${goal.complete ? 'Complete' : 'In progress'}</span></header>
        <p>${escapeHtml(goal.detail)}</p>
        <div class="goal-meter" role="progressbar" aria-label="${escapeHtml(goal.label)}" aria-valuemin="0" aria-valuemax="${goal.target}" aria-valuenow="${goal.value}"><span style="width:${goal.percent}%"></span></div>
        <div class="goal-meta"><span>${goal.value} of ${goal.target}</span><span>${goal.percent}%</span></div>
        <div class="goal-actions">
          <a class="secondary" href="${escapeHtml(goal.href)}">Open activity</a>
          <button class="secondary" type="button" data-action="restart" data-goal="${escapeHtml(goal.id)}">Restart from now</button>
          <button class="danger" type="button" data-action="remove" data-goal="${escapeHtml(goal.id)}">Remove</button>
        </div>
      </article>`).join('');
    }

    renderSuggestions(summary);
    renderForm();
    document.title = `${currentProfile.name || 'Player One'}’s Learning Goals · LarriVerse Arcade`;
  }

  function suggestionSpecs() {
    const current = Goals.snapshot();
    const suggestions = [];
    const subjects = Object.entries(current.subjects)
      .map(([id, stats]) => ({ id, ...stats }))
      .filter(subject => subject.attempts >= 2 && subject.accuracy !== null)
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);
    const practice = subjects.find(subject => subject.accuracy < 75);
    if (practice) {
      suggestions.push({
        spec: { type: 'subject-answers', subject: practice.id, target: 3 },
        icon: '🧭',
        title: `Try 3 more ${Goals.subjectLabels[practice.id]} questions`,
        text: `${practice.accuracy}% across ${practice.attempts} answers suggests a short optional practice round.`
      });
    } else {
      suggestions.push({
        spec: { type: 'subject-answers', subject: 'math', target: 3 },
        icon: '🔢',
        title: 'Try 3 Math questions',
        text: 'A tiny learning round is enough to start a subject trail.'
      });
    }

    const visited = new Set(current.visitedCabinets);
    const unvisited = catalog.find(game => !visited.has(game.id));
    if (unvisited) {
      suggestions.push({
        spec: { type: 'cabinet-sessions', gameId: unvisited.id, target: 1 },
        icon: unvisited.icon,
        title: `Visit ${unvisited.title}`,
        text: 'One visit adds a new cabinet to the local progress trail.'
      });
    } else {
      suggestions.push({
        spec: { type: 'completed-sessions', target: 1 },
        icon: '✓',
        title: 'Complete one session',
        text: 'Choose any cabinet and finish one comfortable round.'
      });
    }

    suggestions.push({
      spec: { type: 'xp-growth', target: 18 },
      icon: '⚡',
      title: 'Earn 18 XP',
      text: 'Any SDK-enabled cabinet can move this goal forward.'
    });
    return suggestions.slice(0, 3);
  }

  function renderSuggestions(summary) {
    const full = summary.totals.openSlots === 0;
    $('#suggestionGrid').innerHTML = suggestionSpecs().map((suggestion, index) => {
      const duplicate = Goals.hasEquivalent(suggestion.spec);
      const disabled = full || duplicate;
      return `<article class="suggestion-card">
        <span aria-hidden="true">${escapeHtml(suggestion.icon)}</span>
        <h3>${escapeHtml(suggestion.title)}</h3>
        <p>${escapeHtml(suggestion.text)}</p>
        <footer><button class="secondary" type="button" data-suggestion="${index}" ${disabled ? 'disabled' : ''}>${duplicate ? 'Already pinned' : full ? 'Board full' : 'Pin suggestion'}</button></footer>
      </article>`;
    }).join('');
  }

  function safeExport() {
    const currentProfile = profile();
    return {
      schema: 'larriverse-learning-goals-summary',
      version: 1,
      exportedAt: new Date().toISOString(),
      privacy: {
        deviceLocalSource: true,
        uploadsData: false,
        includesFreeText: false,
        includesDeadlines: false,
        includesStreaks: false,
        includesRawFamilyRecords: false,
        includesLocationData: false
      },
      learner: {
        name: currentProfile.name,
        avatar: currentProfile.avatar,
        level: currentProfile.level
      },
      board: Goals.summary(catalog)
    };
  }

  function downloadSummary() {
    const data = safeExport();
    const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `larriverse-learning-goals-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Private goal summary downloaded.');
  }

  function bind() {
    $('#goalType').addEventListener('change', renderForm);
    $('#goalForm').addEventListener('submit', event => {
      event.preventDefault();
      try {
        Goals.create(goalSpecFromForm());
        $('#builderMessage').textContent = 'Goal pinned. Progress starts from now.';
        toast('Goal pinned.');
        renderBoard();
      } catch (error) {
        $('#builderMessage').textContent = error.message;
      }
    });
    $('#goalGrid').addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const id = button.dataset.goal;
      if (button.dataset.action === 'restart') {
        Goals.restart(id);
        toast('Goal restarted from the current progress.');
      }
      if (button.dataset.action === 'remove') {
        Goals.remove(id);
        toast('Goal removed without penalty.');
      }
      renderBoard();
    });
    $('#suggestionGrid').addEventListener('click', event => {
      const button = event.target.closest('button[data-suggestion]');
      if (!button) return;
      const suggestion = suggestionSpecs()[Number(button.dataset.suggestion)];
      if (!suggestion) return;
      try {
        Goals.create(suggestion.spec);
        toast('Suggestion pinned as a goal.');
        renderBoard();
      } catch (error) {
        toast(error.message);
      }
    });
    $('#clearGoals').addEventListener('click', () => {
      if (!Goals.load().goals.length) {
        toast('The goal board is already clear.');
        return;
      }
      if (!confirm('Clear all learning goals? Arcade progress will stay safe.')) return;
      Goals.clear();
      toast('Goal board cleared. Arcade progress was not changed.');
      renderBoard();
    });
    $('#printGoals').addEventListener('click', () => window.print());
    $('#downloadGoals').addEventListener('click', downloadSummary);
    window.addEventListener('larriverse:learning-goals', renderBoard);
    window.addEventListener('larriverse:profile', renderBoard);
    window.addEventListener('larriverse:data-imported', renderBoard);
    window.addEventListener('larriverse:data-cleared', renderBoard);
    window.addEventListener('storage', event => {
      if (event.key?.startsWith('larriverse.')) renderBoard();
    });
  }

  async function init() {
    if (!sdk || !Goals) throw new Error('The shared arcade profile or learning-goal engine did not load.');
    const response = await fetch('../games/catalog.json');
    if (!response.ok) throw new Error(`Arcade catalog could not load (${response.status}).`);
    catalog = await response.json();
    if (!Array.isArray(catalog) || catalog.length !== 8) throw new Error('Learning Goals requires the complete eight-cabinet catalog.');
    bind();
    renderForm();
    renderBoard();
  }

  window.LarriVerseLearningGoalsBoard = Object.freeze({
    summary: safeExport,
    refresh: renderBoard
  });

  init().catch(error => {
    console.error(error);
    $('#goalGrid').innerHTML = `<div class="empty-card"><strong>Learning Goals could not load.</strong><p>${escapeHtml(error.message)}</p></div>`;
    $('#addGoalButton').disabled = true;
  });
})();
