(() => {
  'use strict';

  const sdk = window.LarriVerseArcade;
  const Day = window.LarriVerseLearningDay;
  const $ = selector => document.querySelector(selector);
  let catalog = [];
  let choices = [];
  let selectedPace = 'steady';
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
    const output = $('#dayToast');
    output.textContent = message;
    output.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => output.classList.remove('show'), 2400);
  }

  function iconFor(choice) {
    const game = catalog.find(item => item.id === choice.gameId);
    if (game?.icon) return game.icon;
    if (choice.type === 'subject-answers') return '🧠';
    if (choice.type === 'xp-growth') return '⚡';
    if (choice.type === 'new-cabinets') return '🗺️';
    if (choice.type === 'completed-sessions') return '✓';
    return '🕹️';
  }

  function renderPaces() {
    document.querySelectorAll('.pace-card').forEach(card => {
      const input = card.querySelector('input[name="pace"]');
      card.classList.toggle('selected', input.checked);
    });
  }

  function renderChoices(summary) {
    choices = Day.suggestions(catalog, selectedPace);
    const locked = Boolean(summary.active);
    $('#choiceGrid').classList.toggle('locked', locked);
    $('#choiceGrid').innerHTML = choices.map((choice, index) => `<article class="choice-card" data-choice-id="${escapeHtml(choice.id)}">
      <span class="choice-source">${choice.source === 'goal' ? 'From a pinned goal' : 'Optional local idea'}</span>
      <span class="choice-icon" aria-hidden="true">${escapeHtml(iconFor(choice))}</span>
      <h3>${escapeHtml(choice.label)}</h3>
      <p>${escapeHtml(choice.reason)}</p>
      <footer><button class="primary" type="button" data-choice="${index}" ${locked ? 'disabled' : ''}>${locked ? 'Current step active' : `Choose ${escapeHtml(Day.paces[selectedPace].label)}`}</button></footer>
    </article>`).join('');
  }

  function renderActive(summary) {
    const active = summary.active;
    $('#activeEmpty').hidden = Boolean(active);
    $('#activeStep').hidden = !active;
    if (!active) return;

    $('#activeStep').classList.toggle('complete', active.complete);
    $('#activePace').textContent = active.paceLabel;
    $('#activeLabel').textContent = active.label;
    $('#activeBadge').textContent = active.complete ? 'Ready to celebrate' : 'In progress';
    $('#activeMessage').textContent = active.complete
      ? 'The measured step is complete. Celebrate it whenever you are ready.'
      : 'Progress is measured from the moment this step was chosen. There is no clock running.';
    $('#activeMeter').setAttribute('aria-valuemax', String(active.target));
    $('#activeMeter').setAttribute('aria-valuenow', String(active.value));
    $('#activeMeter span').style.width = `${active.percent}%`;
    $('#activeProgress').textContent = `${active.value} of ${active.target}`;
    $('#activePercent').textContent = `${active.percent}%`;
    $('#openActivity').href = active.href;
    $('#finishStep').disabled = !active.complete;
  }

  function renderHistory(summary) {
    $('#celebrationCount').textContent = summary.totals.celebrations;
    $('#clearHistory').disabled = summary.history.length === 0;
    if (!summary.history.length) {
      $('#historyGrid').innerHTML = '<div class="empty-card"><strong>No celebrations saved yet.</strong><p>Completed steps can appear here. Nothing is lost or marked late when time passes.</p></div>';
      return;
    }
    $('#historyGrid').innerHTML = summary.history.map(entry => `<article class="history-card">
      <strong>🌟 ${escapeHtml(entry.label)}</strong>
      <span>${escapeHtml(entry.paceLabel)} · Completed from real local progress</span>
    </article>`).join('');
  }

  function render() {
    const currentProfile = profile();
    const summary = Day.summary(catalog);
    $('#identityAvatar').textContent = currentProfile.avatar || '🌟';
    $('#identityName').textContent = currentProfile.name || 'Player One';
    document.title = `${currentProfile.name || 'Player One'}’s Learning Day · LarriVerse Arcade`;
    renderPaces();
    renderActive(summary);
    renderChoices(summary);
    renderHistory(summary);
  }

  function safeExport() {
    const currentProfile = profile();
    return {
      schema: 'larriverse-learning-day-summary',
      version: 1,
      exportedAt: new Date().toISOString(),
      privacy: {
        deviceLocalSource: true,
        uploadsData: false,
        includesFreeText: false,
        includesTimers: false,
        includesSchedules: false,
        includesDeadlines: false,
        includesStreaks: false,
        includesGrades: false,
        includesRawFamilyRecords: false,
        includesLocationData: false
      },
      learner: {
        name: currentProfile.name,
        avatar: currentProfile.avatar,
        level: currentProfile.level
      },
      learningDay: Day.summary(catalog)
    };
  }

  function downloadSummary() {
    const data = safeExport();
    const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `larriverse-learning-day-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Private Learning Day summary downloaded.');
  }

  function bind() {
    $('#pacePicker').addEventListener('change', event => {
      const input = event.target.closest('input[name="pace"]');
      if (!input || !Day.paces[input.value]) return;
      selectedPace = input.value;
      render();
    });

    $('#choiceGrid').addEventListener('click', event => {
      const button = event.target.closest('button[data-choice]');
      if (!button) return;
      const choice = choices[Number(button.dataset.choice)];
      if (!choice) return;
      try {
        Day.start(choice);
        toast('Step chosen. Progress starts from now.');
        render();
        $('#currentStep').scrollIntoView({ block: 'start' });
      } catch (error) {
        toast(error.message);
      }
    });

    $('#refreshDay').addEventListener('click', () => {
      render();
      toast('Local progress refreshed.');
    });

    $('#finishStep').addEventListener('click', () => {
      try {
        Day.complete(catalog);
        toast('Step celebrated. Nice work.');
        render();
      } catch (error) {
        toast(error.message);
      }
    });

    $('#releaseStep').addEventListener('click', () => {
      if (Day.release()) toast('Step released without penalty.');
      render();
    });

    $('#clearHistory').addEventListener('click', () => {
      if (!Day.load().history.length) {
        toast('Celebration history is already clear.');
        return;
      }
      if (!confirm('Clear the six-item celebration history? Goals and arcade progress will stay safe.')) return;
      Day.clearHistory();
      toast('Celebration history cleared. Arcade progress stayed safe.');
      render();
    });

    $('#printDay').addEventListener('click', () => window.print());
    $('#downloadDay').addEventListener('click', downloadSummary);
    window.addEventListener('larriverse:learning-day', render);
    window.addEventListener('larriverse:learning-goals', render);
    window.addEventListener('larriverse:profile', render);
    window.addEventListener('larriverse:data-imported', render);
    window.addEventListener('larriverse:data-cleared', render);
    window.addEventListener('storage', event => {
      if (event.key?.startsWith('larriverse.')) render();
    });
  }

  async function init() {
    if (!sdk || !Day) throw new Error('The shared arcade profile or Learning Day engine did not load.');
    const response = await fetch('../games/catalog.json');
    if (!response.ok) throw new Error(`Arcade catalog could not load (${response.status}).`);
    catalog = await response.json();
    if (!Array.isArray(catalog) || catalog.length !== 8) throw new Error('My Learning Day requires the complete eight-cabinet catalog.');
    bind();
    render();
  }

  window.LarriVerseLearningDayBoard = Object.freeze({
    summary: safeExport,
    refresh: render
  });

  init().catch(error => {
    console.error(error);
    $('#choiceGrid').innerHTML = `<div class="empty-card"><strong>My Learning Day could not load.</strong><p>${escapeHtml(error.message)}</p></div>`;
    $('#refreshDay').disabled = true;
  });
})();
