const palette = ['#8b5cf6', '#ff4ecd', '#ffd43b', '#41e5ff', '#70f0a8', '#ff8e3c'];
const grid = document.querySelector('#gameGrid');
const filters = document.querySelector('#filters');
const search = document.querySelector('#search');
const randomButton = document.querySelector('#randomGame');
const controlCenter = document.querySelector('#controlCenter');
const sdk = window.LarriVerseArcade;

let games = [];
let category = 'All';
let featured = [];
let featureIndex = 0;
let featureTimer = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function gameProgress(game) {
  const profile = sdk?.summary?.();
  const record = profile?.games?.[game.id];
  if (!record) return 'Not played on this device';
  if (record.completions > 0) {
    return `${record.completions} completion${record.completions === 1 ? '' : 's'} · best ${Math.round(record.highScore || 0)}`;
  }
  return `${record.sessions || 0} session${record.sessions === 1 ? '' : 's'} started`;
}

function card(game, index) {
  const badges = [game.category, game.status].map(value => `<span>${escapeHtml(value)}</span>`).join('');
  const action = game.available
    ? `<a class="launch" href="${encodeURI(game.href)}"><span>Launch game</span><span>START ↗</span></a>`
    : `<div class="launch queued" title="This concept is preserved but not yet playable"><span>Integration queued</span><span>◌</span></div>`;
  return `<article class="game-card" style="--glow:${palette[index % palette.length]}">
    <div class="game-icon" aria-hidden="true">${escapeHtml(game.icon)}</div>
    <div class="game-badges">${badges}</div>
    <h3>${escapeHtml(game.title)}</h3>
    <p>${escapeHtml(game.desc)}</p>
    <small class="progress-line">${escapeHtml(gameProgress(game))}</small>
    ${action}
  </article>`;
}

function render() {
  const query = search.value.trim().toLowerCase();
  const visible = games.filter(game =>
    (category === 'All' || game.category === category) &&
    (!query || `${game.title} ${game.desc} ${game.category}`.toLowerCase().includes(query))
  );
  grid.innerHTML = visible.length
    ? visible.map(card).join('')
    : '<p class="empty">No cabinet matches that search. The arcade gremlins deny everything.</p>';
}

function renderFilters() {
  const categories = ['All', ...new Set(games.map(game => game.category))];
  filters.innerHTML = categories.map(value =>
    `<button class="filter ${value === category ? 'active' : ''}" type="button" data-category="${escapeHtml(value)}" aria-pressed="${value === category}">${escapeHtml(value)}</button>`
  ).join('');
  filters.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      category = button.dataset.category;
      renderFilters();
      render();
    });
  });
}

function renderProfile() {
  const node = document.querySelector('#profileStat');
  if (!node || !sdk) return;
  const profile = sdk.summary();
  node.innerHTML = `<b>${escapeHtml(profile.avatar)}</b> ${escapeHtml(profile.name)} · Level ${profile.level} · ${profile.kc} KC`;
  document.querySelector('#profileName').value = profile.name;
  document.querySelector('#profileAvatar').value = profile.avatar;
  render();
}

function showFeature() {
  if (!featured.length) return;
  const game = featured[featureIndex % featured.length];
  document.querySelector('#screenIcon').textContent = game.icon;
  document.querySelector('#screenTitle').textContent = game.title;
  featureIndex += 1;
}

function restartFeatureRotation() {
  clearInterval(featureTimer);
  featureTimer = null;
  showFeature();
  const reduced = sdk?.settings?.().reducedMotion;
  if (!reduced && featured.length > 1) featureTimer = setInterval(showFeature, 2600);
}

function setControlMessage(message, kind = 'info') {
  const output = document.querySelector('#controlMessage');
  output.textContent = message;
  output.dataset.kind = kind;
}

function syncSettings() {
  if (!sdk) return;
  const settings = sdk.settings();
  document.querySelector('#reducedMotion').checked = settings.reducedMotion;
  document.querySelector('#highContrast').checked = settings.highContrast;
  document.querySelector('#largeText').checked = settings.largeText;
}

function openControlCenter() {
  syncSettings();
  renderProfile();
  setControlMessage('');
  if (!controlCenter.open) controlCenter.showModal();
}

function downloadBackup() {
  try {
    const backup = sdk.exportData();
    const text = JSON.stringify(backup, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `larriverse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setControlMessage(`Backup downloaded with ${Object.keys(backup.records).length} LarriVerse records.`, 'success');
  } catch (error) {
    setControlMessage(error.message || 'The backup could not be created.', 'error');
  }
}

async function restoreBackup(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const result = sdk.importData(text, { replace: true });
    syncSettings();
    renderProfile();
    setControlMessage(`Restored ${result.imported} records. Open cabinets will use the restored data next time they load.`, 'success');
  } catch (error) {
    setControlMessage(error.message || 'That backup could not be restored.', 'error');
  } finally {
    document.querySelector('#importSaves').value = '';
  }
}

function clearProgress() {
  const confirmed = window.confirm('Erase all LarriVerse game progress and family data from this browser? Accessibility settings will be kept.');
  if (!confirmed) return;
  sdk.clearData({ keepSettings: true });
  renderProfile();
  setControlMessage('Game progress was erased. Accessibility settings were kept.', 'success');
}

function bindControlCenter() {
  document.querySelectorAll('[data-open-control]').forEach(button => {
    button.addEventListener('click', openControlCenter);
  });

  ['reducedMotion', 'highContrast', 'largeText'].forEach(id => {
    document.querySelector(`#${id}`).addEventListener('change', event => {
      sdk.setSettings({ [id]: event.target.checked });
      syncSettings();
      restartFeatureRotation();
      setControlMessage('Comfort settings saved for every cabinet.', 'success');
    });
  });

  document.querySelector('#saveProfile').addEventListener('click', () => {
    const name = document.querySelector('#profileName').value;
    const avatar = document.querySelector('#profileAvatar').value;
    sdk.setIdentity({ name, avatar });
    renderProfile();
    setControlMessage('Shared arcade profile updated.', 'success');
  });

  document.querySelector('#exportSaves').addEventListener('click', downloadBackup);
  document.querySelector('#importSaves').addEventListener('change', event => restoreBackup(event.target.files?.[0]));
  document.querySelector('#clearSaves').addEventListener('click', clearProgress);
}

fetch('games/catalog.json')
  .then(response => {
    if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
    return response.json();
  })
  .then(data => {
    games = data;
    const playable = games.filter(game => game.available);
    featured = games.filter(game => game.featured && game.available);
    document.querySelector('#gameCount').textContent = games.length;
    document.querySelector('#playableCount').textContent = playable.length;
    renderFilters();
    render();
    renderProfile();
    restartFeatureRotation();

    randomButton.disabled = !playable.length;
    randomButton.title = playable.length ? 'Launch a random playable cabinet' : 'No playable cabinets found';
    randomButton.addEventListener('click', () => {
      if (playable.length) location.href = playable[Math.floor(Math.random() * playable.length)].href;
    });
  })
  .catch(error => {
    console.error(error);
    grid.innerHTML = '<p class="empty">The catalog did not load. Serve this folder over HTTP instead of opening the file directly.</p>';
    randomButton.disabled = true;
  });

search.addEventListener('input', render);
window.addEventListener('larriverse:profile', renderProfile);
window.addEventListener('larriverse:settings', () => {
  syncSettings();
  restartFeatureRotation();
});
window.addEventListener('larriverse:data-imported', renderProfile);
window.addEventListener('larriverse:data-cleared', renderProfile);

document.addEventListener('keydown', event => {
  if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
    event.preventDefault();
    search.focus();
  }
  if (event.key === 'Escape' && controlCenter.open) controlCenter.close();
});

bindControlCenter();
syncSettings();
renderProfile();
