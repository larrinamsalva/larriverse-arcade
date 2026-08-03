(() => {
  'use strict';

  // Previous QA storage contract (not read): const STORAGE_KEY = 'larriverse.releaseSmoke.v1'
  const STORAGE_KEY = 'larriverse.releaseSmoke.v2';
  const MANIFEST_URL = '../release.json';
  const MAX_NOTES = 600;
  const DEVICE_CLASSES = ['desktop', 'physical-phone'];
  const CHECK_KEYS = ['controls', 'accessibility', 'backupRestore', 'privacy', 'sound', 'deviceComfort'];
  const $ = (selector, root = document) => root.querySelector(selector);
  let state = loadState();
  let manifest = null;

  function freshProfile(deviceClass) {
    return {
      deviceClass,
      tester: '',
      deviceName: '',
      results: {},
      deviceChecks: Object.fromEntries(CHECK_KEYS.map((key) => [key, false])),
      updatedAt: null
    };
  }

  function freshState() {
    return {
      schemaVersion: 2,
      activeDeviceClass: '',
      profiles: {
        desktop: freshProfile('desktop'),
        'physical-phone': freshProfile('physical-phone')
      }
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || parsed.schemaVersion !== 2 || typeof parsed.profiles !== 'object') return freshState();
      const clean = freshState();
      clean.activeDeviceClass = DEVICE_CLASSES.includes(parsed.activeDeviceClass) ? parsed.activeDeviceClass : '';
      for (const kind of DEVICE_CLASSES) {
        const source = parsed.profiles[kind];
        if (!source || typeof source !== 'object') continue;
        clean.profiles[kind] = {
          ...clean.profiles[kind],
          ...source,
          deviceClass: kind,
          results: source.results && typeof source.results === 'object' ? source.results : {},
          deviceChecks: {
            ...clean.profiles[kind].deviceChecks,
            ...(source.deviceChecks && typeof source.deviceChecks === 'object' ? source.deviceChecks : {})
          }
        };
      }
      return clean;
    } catch {
      return freshState();
    }
  }

  function activeProfile() {
    return DEVICE_CLASSES.includes(state.activeDeviceClass) ? state.profiles[state.activeDeviceClass] : null;
  }

  function saveState() {
    const profile = activeProfile();
    if (profile) profile.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateSummary();
  }

  function resultFor(id) {
    const profile = activeProfile();
    return profile?.results[id] || { result: 'untested', notes: '', route: 'unchecked', savedAt: null };
  }

  function environmentDetails() {
    return {
      screenWidth: Number(screen.width) || null,
      screenHeight: Number(screen.height) || null,
      viewportWidth: Number(window.innerWidth) || null,
      viewportHeight: Number(window.innerHeight) || null,
      devicePixelRatio: Number(window.devicePixelRatio) || 1,
      maxTouchPoints: Number(navigator.maxTouchPoints) || 0,
      platform: navigator.platform || null,
      standalone: Boolean(window.matchMedia?.('(display-mode: standalone)').matches)
    };
  }

  function setStatus(message) {
    $('#statusMessage').textContent = message;
  }

  function chooseDevice(deviceClass) {
    if (!DEVICE_CLASSES.includes(deviceClass)) return;
    state.activeDeviceClass = deviceClass;
    renderCurrentProfile();
    saveState();
    setStatus(`${deviceClass === 'desktop' ? 'Desktop' : 'Physical-phone'} report selected. Its progress is stored separately.`);
  }

  function renderCurrentProfile() {
    const profile = activeProfile();
    document.querySelectorAll('input[name="deviceClass"]').forEach((radio) => {
      radio.checked = radio.value === state.activeDeviceClass;
    });
    $('#testerName').value = profile?.tester || '';
    $('#deviceName').value = profile?.deviceName || '';
    for (const box of document.querySelectorAll('[data-device-check]')) {
      box.checked = Boolean(profile?.deviceChecks?.[box.dataset.deviceCheck]);
    }
    $('#deviceComfortLabel').textContent = state.activeDeviceClass === 'physical-phone'
      ? 'Touch targets, scrolling, orientation, and narrow-screen layout felt usable on this phone.'
      : 'Keyboard, pointer, scrolling, dialogs, and layout felt usable on this computer.';
    updateDeviceHint();
    renderCards();
    updateSummary();
  }

  function updateDeviceHint() {
    const env = environmentDetails();
    const likelyTouch = env.maxTouchPoints > 0;
    const selected = state.activeDeviceClass || 'not selected';
    $('#deviceHint').textContent = `${env.viewportWidth}×${env.viewportHeight} viewport · ${env.screenWidth}×${env.screenHeight} screen · ${env.maxTouchPoints} touch points · selected: ${selected}${likelyTouch ? ' · touch capability detected' : ''}`;
  }

  async function checkRoute(cabinet, card) {
    const profile = activeProfile();
    if (!profile) {
      setStatus('Choose desktop or physical phone before checking routes.');
      return false;
    }
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
      profile.results[cabinet.id] = entry;
      label.textContent = 'route reachable';
      label.classList.add('ok');
      saveState();
      return true;
    } catch (error) {
      const entry = resultFor(cabinet.id);
      entry.route = 'failed';
      entry.routeError = error.message;
      entry.routeCheckedAt = new Date().toISOString();
      profile.results[cabinet.id] = entry;
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
    if (!manifest || !activeProfile()) {
      grid.innerHTML = '<p>Choose desktop or physical phone to load this device’s separate test record.</p>';
      return;
    }

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
        setStatus(ok ? `${cabinet.title} route is reachable. Route checks do not count as gameplay passes.` : `${cabinet.title} route check failed.`);
      });

      card.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.name = `result-${state.activeDeviceClass}-${cabinet.id}`;
        radio.addEventListener('change', () => {
          const profile = activeProfile();
          const next = resultFor(cabinet.id);
          next.result = radio.value;
          next.savedAt = new Date().toISOString();
          profile.results[cabinet.id] = next;
          card.dataset.result = radio.value;
          $('.saved-at', card).textContent = `Saved ${new Date(next.savedAt).toLocaleString()}`;
          saveState();
        });
      });

      notes.addEventListener('change', () => {
        const profile = activeProfile();
        const next = resultFor(cabinet.id);
        next.notes = notes.value.slice(0, MAX_NOTES);
        next.savedAt = new Date().toISOString();
        profile.results[cabinet.id] = next;
        $('.saved-at', card).textContent = `Saved ${new Date(next.savedAt).toLocaleString()}`;
        saveState();
      });

      grid.append(card);
    });
  }

  function reportReady() {
    const profile = activeProfile();
    if (!manifest || !profile) return false;
    if (profile.tester.trim().length < 2 || profile.deviceName.trim().length < 3) return false;
    const entries = manifest.cabinets.map((cabinet) => resultFor(cabinet.id));
    if (!entries.every((entry) => entry.route === 'reachable' && entry.result === 'pass')) return false;
    return CHECK_KEYS.every((key) => profile.deviceChecks[key] === true);
  }

  function updateSummary() {
    if (!manifest) return;
    const profile = activeProfile();
    const entries = profile ? manifest.cabinets.map((cabinet) => resultFor(cabinet.id)) : [];
    const routes = entries.filter((entry) => entry.route === 'reachable').length;
    const passed = entries.filter((entry) => entry.result === 'pass').length;
    const checks = profile ? CHECK_KEYS.filter((key) => profile.deviceChecks[key]).length : 0;
    const ready = reportReady();
    $('#routeCount').textContent = `${routes}/${manifest.cabinetCount}`;
    $('#passCount').textContent = `${passed}/${manifest.cabinetCount}`;
    $('#checkCount').textContent = `${checks}/${CHECK_KEYS.length}`;
    $('#readyCount').textContent = ready ? 'Ready' : 'Blocked';
    $('#readyCount').className = ready ? 'ready' : 'blocked';
    $('#exportReport').disabled = !ready;
  }

  async function checkAllRoutes() {
    if (!activeProfile()) {
      setStatus('Choose desktop or physical phone before checking routes.');
      return;
    }
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
    if (!reportReady()) {
      setStatus('The report is still blocked. Complete all device identity, route, cabinet, and device-wide checks.');
      return;
    }
    const profile = activeProfile();
    const report = {
      schema: 'larriverse-release-qa',
      schemaVersion: 2,
      release: manifest.version,
      candidate: manifest.candidate,
      deviceClass: profile.deviceClass,
      deviceName: profile.deviceName.trim(),
      tester: profile.tester.trim(),
      userAgent: navigator.userAgent,
      environment: environmentDetails(),
      deviceChecks: { ...profile.deviceChecks },
      locationGrantedDuringEvidence: false,
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
    link.download = `larriverse-${manifest.version}-${manifest.candidate}-${profile.deviceClass}-qa.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus(`${profile.deviceClass === 'desktop' ? 'Desktop' : 'Physical-phone'} QA report exported. It contains test evidence, not arcade saves.`);
  }

  async function shareTestLink() {
    const data = { title: 'LarriVerse Arcade device QA', text: 'Open the LarriVerse guided QA console on the device being tested.', url: location.href };
    try {
      if (navigator.share) {
        await navigator.share(data);
        setStatus('Test link shared through this device.');
        return;
      }
      await navigator.clipboard.writeText(location.href);
      setStatus('Test link copied to the clipboard.');
    } catch (error) {
      if (error?.name !== 'AbortError') setStatus('Could not share automatically. Copy the address from the browser bar.');
    }
  }

  function resetResults() {
    const profile = activeProfile();
    if (!profile) return;
    const label = profile.deviceClass === 'desktop' ? 'desktop' : 'physical-phone';
    if (!window.confirm(`Reset the ${label} QA report on this browser? Arcade game saves are not affected.`)) return;
    state.profiles[profile.deviceClass] = freshProfile(profile.deviceClass);
    renderCurrentProfile();
    saveState();
    setStatus(`${label} QA report reset. Arcade progress was not changed.`);
  }

  async function init() {
    const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Release manifest request failed: ${response.status}`);
    manifest = await response.json();
    if (manifest.schemaVersion !== 1 || manifest.cabinetCount !== 8 || manifest.cabinets.length !== 8) throw new Error('Unsupported or incomplete release manifest.');

    document.querySelectorAll('input[name="deviceClass"]').forEach((radio) => radio.addEventListener('change', () => chooseDevice(radio.value)));
    $('#testerName').addEventListener('input', (event) => {
      const profile = activeProfile();
      if (!profile) return;
      profile.tester = event.target.value.trimStart().slice(0, 40);
      saveState();
    });
    $('#deviceName').addEventListener('input', (event) => {
      const profile = activeProfile();
      if (!profile) return;
      profile.deviceName = event.target.value.trimStart().slice(0, 100);
      saveState();
    });
    document.querySelectorAll('[data-device-check]').forEach((box) => box.addEventListener('change', () => {
      const profile = activeProfile();
      if (!profile) {
        box.checked = false;
        setStatus('Choose a device type before recording checks.');
        return;
      }
      profile.deviceChecks[box.dataset.deviceCheck] = box.checked;
      saveState();
    }));
    $('#checkRoutes').addEventListener('click', checkAllRoutes);
    $('#exportReport').addEventListener('click', exportReport);
    $('#shareTestLink').addEventListener('click', shareTestLink);
    $('#resetResults').addEventListener('click', resetResults);
    window.addEventListener('resize', updateDeviceHint);

    renderCurrentProfile();
    setStatus(`${manifest.title} ${manifest.candidate} loaded. Choose the device you are physically testing.`);
  }

  init().catch((error) => {
    console.error(error);
    setStatus(`QA console could not load: ${error.message}`);
    $('#testGrid').innerHTML = '<p>The release manifest did not load. Serve the repository over HTTP and try again.</p>';
  });
})();
