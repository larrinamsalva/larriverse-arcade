(() => {
  'use strict';

  const STORAGE_KEY = 'larriverse.releaseSmoke.v1';
  const MANIFEST_URL = '../release.json';
  const MAX_NOTES = 600;
  const $ = (selector, root = document) => root.querySelector(selector);
  const state = loadState();
  let manifest = null;

  function freshState() {
    return { schemaVersion: 1, tester: '', results: {}, updatedAt: null };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || parsed.schemaVersion !== 1 || typeof parsed.results !== 'object') return freshState();
      return { ...freshState(), ...parsed };
    } catch {
      return freshState();
    }
  }

  function saveState() {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateSummary();
  }

  function resultFor(id) {
    return state.results[id] || { result: 'untested', notes: '', route: 'unchecked', savedAt: null };
  }

  function setStatus(message) {
    $('#statusMessage').textContent = message;
  }

  async function checkRoute(cabinet, card) {
    const label = $('.route-state', card);
    label.textContent = 'checking…';
    label.className = 'route-state';
    try {
      const response = await fetch(`../${cabinet.route}`, { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (!/<!doctype html>|<html[\s>]/i.test(text)) throw new Error('not an HTML document');
      const entry = resultFor(cabinet.id);
      entry.route = 'reachable';
      entry.routeCheckedAt = new Date().toISOString();
      state.results[cabinet.id] = entry;
      label.textContent = 'route reachable';
      label.classList.add('ok');
      saveState();
      return true;
    } catch (error) {
      const entry = resultFor(cabinet.id);
      entry.route = 'failed';
      entry.routeError = error.message;
      entry.routeCheckedAt = new Date().toISOString();
      state.results[cabinet.id] = entry;
      label.textContent = 'route failed';
      label.classList.add('fail');
      saveState();
      return false;
    }
  }

  function renderCards() {
    const grid = $('#testGrid');
    const template = $('#testCardTemplate');
    grid.innerHTML = '';

    manifest.cabinets.forEach((cabinet, index) => {
      const card = template.content.firstElementChild.cloneNode(true);
      const entry = resultFor(cabinet.id);
      card.dataset.id = cabinet.id;
      card.dataset.result = entry.result;
      $('.number', card).textContent = index + 1;
      $('h3', card).textContent = cabinet.title;
      $('.focus', card).textContent = cabinet.manualFocus;
      const open = $('.open-game', card);
      open.href = `../${cabinet.route}`;
      const routeLabel = $('.route-state', card);
      routeLabel.textContent = entry.route === 'reachable' ? 'route reachable' : entry.route === 'failed' ? 'route failed' : 'not checked';
      if (entry.route === 'reachable') routeLabel.classList.add('ok');
      if (entry.route === 'failed') routeLabel.classList.add('fail');
      const selected = $(`input[value="${entry.result}"]`, card);
      if (selected) selected.checked = true;
      const notes = $('textarea', card);
      notes.value = entry.notes || '';
      $('.saved-at', card).textContent = entry.savedAt ? `Saved ${new Date(entry.savedAt).toLocaleString()}` : '';

      $('.check-one', card).addEventListener('click', async () => {
        setStatus(`Checking ${cabinet.title}…`);
        const ok = await checkRoute(cabinet, card);
        setStatus(ok ? `${cabinet.title} route is reachable. Gameplay still requires a human pass.` : `${cabinet.title} route check failed.`);
      });

      card.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.name = `result-${cabinet.id}`;
        radio.addEventListener('change', () => {
          const next = resultFor(cabinet.id);
          next.result = radio.value;
          next.savedAt = new Date().toISOString();
          state.results[cabinet.id] = next;
          card.dataset.result = radio.value;
          $('.saved-at', card).textContent = `Saved ${new Date(next.savedAt).toLocaleString()}`;
          saveState();
        });
      });

      notes.addEventListener('change', () => {
        const next = resultFor(cabinet.id);
        next.notes = notes.value.slice(0, MAX_NOTES);
        next.savedAt = new Date().toISOString();
        state.results[cabinet.id] = next;
        $('.saved-at', card).textContent = `Saved ${new Date(next.savedAt).toLocaleString()}`;
        saveState();
      });

      grid.append(card);
    });
  }

  function updateSummary() {
    if (!manifest) return;
    const entries = manifest.cabinets.map((cabinet) => resultFor(cabinet.id));
    const routes = entries.filter((entry) => entry.route === 'reachable').length;
    const passed = entries.filter((entry) => entry.result === 'pass').length;
    const needsWork = entries.filter((entry) => entry.result === 'needs-work').length;
    const untested = entries.filter((entry) => entry.result === 'untested').length;
    $('#routeCount').textContent = `${routes}/${manifest.cabinetCount}`;
    $('#passCount').textContent = `${passed}/${manifest.cabinetCount}`;
    $('#needsWorkCount').textContent = needsWork;
    $('#untestedCount').textContent = untested;
  }

  async function checkAllRoutes() {
    const button = $('#checkRoutes');
    button.disabled = true;
    setStatus('Checking all eight relative routes…');
    let passed = 0;
    for (const cabinet of manifest.cabinets) {
      const card = document.querySelector(`[data-id="${cabinet.id}"]`);
      if (await checkRoute(cabinet, card)) passed += 1;
    }
    button.disabled = false;
    setStatus(`${passed}/${manifest.cabinetCount} routes are reachable. Route checks do not count as gameplay passes.`);
  }

  function exportReport() {
    const report = {
      schema: 'larriverse-release-qa',
      schemaVersion: 1,
      release: manifest.version,
      candidate: manifest.candidate,
      tester: state.tester || null,
      userAgent: navigator.userAgent,
      exportedAt: new Date().toISOString(),
      results: manifest.cabinets.map((cabinet) => ({
        id: cabinet.id,
        title: cabinet.title,
        route: cabinet.route,
        ...resultFor(cabinet.id)
      }))
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `larriverse-${manifest.version}-${manifest.candidate}-qa.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('QA report exported. It contains test results and browser details, not arcade save data.');
  }

  function resetResults() {
    if (!window.confirm('Reset all device-local release QA results? Arcade game saves are not affected.')) return;
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, freshState());
    $('#testerName').value = '';
    renderCards();
    updateSummary();
    setStatus('QA results reset. Arcade progress was not changed.');
  }

  async function init() {
    const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Release manifest request failed: ${response.status}`);
    manifest = await response.json();
    if (manifest.schemaVersion !== 1 || manifest.cabinetCount !== 8 || manifest.cabinets.length !== 8) {
      throw new Error('Unsupported or incomplete release manifest.');
    }
    $('#testerName').value = state.tester || '';
    $('#testerName').addEventListener('change', (event) => {
      state.tester = event.target.value.trim().slice(0, 40);
      saveState();
    });
    $('#checkRoutes').addEventListener('click', checkAllRoutes);
    $('#exportReport').addEventListener('click', exportReport);
    $('#resetResults').addEventListener('click', resetResults);
    renderCards();
    updateSummary();
    setStatus(`${manifest.title} ${manifest.candidate} loaded. Manual results remain device-local.`);
  }

  init().catch((error) => {
    console.error(error);
    setStatus(`QA console could not load: ${error.message}`);
    $('#testGrid').innerHTML = '<p>The release manifest did not load. Serve the repository over HTTP and try again.</p>';
  });
})();
