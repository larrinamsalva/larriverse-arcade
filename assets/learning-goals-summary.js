(() => {
  'use strict';

  const Goals = window.LarriVerseLearningGoals;
  let catalog = [];

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  function render() {
    if (!Goals) return;
    const summary = Goals.summary(catalog);
    document.querySelectorAll('[data-learning-goals-count]').forEach(element => {
      element.textContent = `${summary.totals.complete}/${summary.totals.pinned || 0} complete`;
    });
    document.querySelectorAll('[data-learning-goals-summary]').forEach(container => {
      if (!summary.goals.length) {
        container.innerHTML = '<div class="shared-goal-empty"><strong>No goals pinned yet.</strong><p>Choose up to three gentle focus goals. There are no deadlines, streaks, or penalties.</p><a class="shared-goal-link" href="../goals/">Open Learning Goals</a></div>';
        return;
      }
      container.innerHTML = summary.goals.map(goal => `<article class="shared-goal-card ${goal.complete ? 'complete' : ''}" data-goal-id="${escapeHtml(goal.id)}">
        <header><span class="goal-status">${goal.complete ? 'Complete' : 'In progress'}</span><strong>${escapeHtml(goal.label)}</strong></header>
        <p>${escapeHtml(goal.detail)}</p>
        <div class="shared-goal-progress" role="progressbar" aria-label="${escapeHtml(goal.label)}" aria-valuemin="0" aria-valuemax="${goal.target}" aria-valuenow="${goal.value}"><span style="width:${goal.percent}%"></span></div>
        <footer><span>${goal.value} / ${goal.target}</span><a href="../goals/">Manage goal</a></footer>
      </article>`).join('');
    });
  }

  async function init() {
    if (!Goals) return;
    const response = await fetch('../games/catalog.json');
    if (response.ok) catalog = await response.json();
    render();
    window.addEventListener('larriverse:learning-goals', render);
    window.addEventListener('larriverse:profile', render);
    window.addEventListener('larriverse:data-imported', render);
    window.addEventListener('larriverse:data-cleared', render);
    window.addEventListener('storage', event => {
      if (event.key?.startsWith('larriverse.')) render();
    });
  }

  window.LarriVerseLearningGoalsSummary = Object.freeze({ render });
  init().catch(error => console.error(error));
})();
