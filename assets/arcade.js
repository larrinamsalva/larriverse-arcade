import { discoverGames } from './arcade-discovery.js';
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
let featurePaused = false;
const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

function artPosition(game) {
  const art = Number(game.art || 0);
  return `--art-x:${art % 4 * 100 / 3}%;--art-y:${Math.floor(art / 4) * (game.artSet === "expedition" ? 100 : 50)}%`;
}
function card(game) {
  const tag = game.isNew ? '<span class="cover-tag">NEW WORLD</span>' : '';
  const title = escapeHtml(game.title);
  return `<article class="game-card">
    <a class="game-cover ${game.artSet === "expedition" ? "expedition" : ""}" style="${artPosition(game)}" href="${encodeURI(game.href)}" aria-label="Play ${title}">${tag}</a>
    <div class="game-body"><div class="game-badges"><span>${escapeHtml(game.skill || game.topic || game.category)}</span><span>${escapeHtml(game.age || '7+')}</span></div>
    <h3>${title}</h3><p>${escapeHtml(game.desc)}</p>
    <small class="progress-line">${escapeHtml(gameProgress(game))}</small>
    <a class="launch" href="${encodeURI(game.href)}"><span>Play game</span><span>${escapeHtml(game.minutes || 'Explore')}</span></a></div>
  </article>`;
}

function render() {
  const query = search.value.trim().toLowerCase();
  const visible = games.filter(game =>
    (category === 'All' || (game.topic || game.category) === category) &&
    (!query || `${game.title} ${game.desc} ${game.category} ${game.topic} ${game.skill}`.toLowerCase().includes(query))
  );
  grid.innerHTML = visible.length
    ? visible.map(card).join('')
    : '<p class="empty">No games found yet. Try another skill or <button type="button" id="clearSearch" class="secondary">Clear search and filters</button>.</p>';
  document.querySelector('#clearSearch')?.addEventListener('click', () => {
    search.value = '';
    category = 'All';
    updateFilters();
    render();
    search.focus();
  });
}

function updateFilters() {
  filters.querySelectorAll('button').forEach(button => {
    const selected = button.dataset.category === category;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function renderFilters() {
  const categories = ['All', ...new Set(games.map(game => game.topic || game.category))];
  filters.innerHTML = categories.map(value =>
    `<button class="filter ${value === category ? 'active' : ''}" type="button" data-category="${escapeHtml(value)}" aria-pressed="${value === category}">${escapeHtml(value)}</button>`
  ).join('');
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    category = button.dataset.category;
    updateFilters();
    render();
  });
}

function discoveryCard(game) {
  return `<a class="discovery-card" href="${encodeURI(game.href)}"><span class="discovery-art ${game.artSet === 'expedition' ? 'expedition' : ''}" style="${artPosition(game)}" aria-hidden="true"></span><span><b>${escapeHtml(game.title)}</b><small>${escapeHtml(game.skill)}</small><small>${escapeHtml(game.minutes || 'Your pace')}</small></span><span aria-hidden="true">→</span></a>`;
}

function renderDiscovery() {
  const discovery = discoverGames(games, sdk?.summary?.());
  document.querySelector('#continueGroup').hidden = !discovery.recent.length;
  document.querySelector('#continueGames').innerHTML = discovery.recent.map(discoveryCard).join('');
  document.querySelector('#recommendationReason').textContent = discovery.recommendationReason;
  document.querySelector('#recommendedGames').innerHTML = discovery.recommended.map(discoveryCard).join('');
  document.querySelector('#newGroup').hidden = !discovery.unvisited.length;
  document.querySelector('#newGames').innerHTML = discovery.unvisited.map(discoveryCard).join('');
}

function renderProfile() {
  const node = document.querySelector('#profileStat');
  if (!node || !sdk) return;
  const profile = sdk.summary();
  node.innerHTML = `<b>${escapeHtml(profile.avatar)}</b> ${escapeHtml(profile.name)} · Level ${profile.level} · ${profile.kc} KC`;
  document.querySelector('#profileName').value = profile.name;
  document.querySelector('#profileAvatar').value = profile.avatar;
  render();
  renderDiscovery();
}

function showFeature() {
  if (!featured.length) return;
  const game = featured[featureIndex % featured.length];
  document.querySelector('#screenIcon').textContent = game.icon;
  document.querySelector('#screenTitle').textContent = game.title;
  document.querySelector('#featureDescription').textContent = game.desc;
  document.querySelector('#featuredPlay').href = game.href;
  document.querySelector('#featureSkill').textContent = `${game.skill || game.topic} · Ages ${game.age || '7+'}`;
  document.querySelector('#featureArt').setAttribute('style', artPosition(game));
  document.querySelector('#featureArt').classList.toggle('expedition', game.artSet === 'expedition');
}

function restartFeatureRotation() {
  clearInterval(featureTimer);
  featureTimer = null;
  const reduced = sdk?.settings?.().reducedMotion || systemMotion.matches;
  const pause = document.querySelector('#featureRotation');
  pause.disabled = reduced;
  pause.setAttribute('aria-pressed', String(reduced || featurePaused));
  pause.textContent = reduced ? 'Automatic changes off' : featurePaused ? 'Resume changes' : 'Pause changes';
  if (!reduced && !featurePaused && featured.length > 1) featureTimer = setInterval(() => {
    const spotlight = document.querySelector('.spotlight');
    if (document.hidden || controlCenter.open || spotlight.matches(':hover') || spotlight.contains(document.activeElement)) return;
    featureIndex = (featureIndex + 1) % featured.length;
    showFeature();
  }, 12000);
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
    featured = games.filter(game => game.featured && game.available).sort((a,b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
    document.querySelector('#gameCount').textContent = games.length;
    document.querySelector('#playableCount').textContent = playable.length;
    renderFilters();
    render();
    renderProfile();
    showFeature();
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
systemMotion.addEventListener('change', restartFeatureRotation);
document.querySelectorAll('[data-feature-step]').forEach(button => button.addEventListener('click', () => {
  if (!featured.length) return;
  featureIndex = (featureIndex + Number(button.dataset.featureStep) + featured.length) % featured.length;
  showFeature();
  restartFeatureRotation();
}));
document.querySelector('#featureRotation').addEventListener('click', () => {
  featurePaused = !featurePaused;
  restartFeatureRotation();
});

document.addEventListener('keydown', event => {
  if (event.key === '/' && !controlCenter.open && !document.activeElement?.matches('input,textarea,select,[contenteditable="true"]')) {
    event.preventDefault();
    search.focus();
  }
  if (event.key === 'Escape' && controlCenter.open) controlCenter.close();
});

bindControlCenter();
syncSettings();
renderProfile();
