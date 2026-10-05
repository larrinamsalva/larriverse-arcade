(() => {
  'use strict';
  const sdk = window.LarriVerseArcade;
  if (!sdk) return;
  const header = document.querySelector('.lv-cabinet-shell');
  const gameId = document.body.dataset.classic || document.body.dataset.world;
  const dialog = document.createElement('dialog');
  dialog.id = 'lvComfortDialog';
  dialog.className = 'lv-comfort-dialog';
  dialog.setAttribute('aria-labelledby', 'lvComfortTitle');
  dialog.innerHTML = `<form method="dialog" class="lv-comfort-card">
    <button class="lv-close" value="close" aria-label="Close comfort controls">×</button>
    <p class="lv-eyebrow">LarriVerse Arcade</p><h2 id="lvComfortTitle">Make it comfortable</h2>
    <p>These choices apply across the arcade and stay in this browser. Sound controls stay with each game.</p>
    <label><span><b>Reduce motion</b><small>Stops decorative motion and spotlight changes. Your device's motion preference also applies.</small></span><input type="checkbox" data-lv-setting="reducedMotion"></label>
    <label><span><b>High contrast</b><small>Stronger text, edges, and keyboard focus.</small></span><input type="checkbox" data-lv-setting="highContrast"></label>
    <label><span><b>Larger text</b><small>More room to read, with controls that wrap.</small></span><input type="checkbox" data-lv-setting="largeText"></label>
    <output class="lv-comfort-status" aria-live="polite"></output>
    <div class="lv-tools"><button class="lv-button" value="done">Back to my game</button><a class="lv-button" href="${gameId ? '../../' : '../'}index.html#games">Back to Arcade</a></div>
    <p class="lv-local-note">KC are fictional game coins. No purchases, ads, or progress uploads.</p>
  </form>`;
  let opener;

  function refresh() {
    const profile = sdk.summary();
    const node = header?.querySelector('[data-lv-profile]');
    if (node) {
      const record = profile.games?.[gameId];
      node.textContent = `${profile.avatar} ${profile.name} · ${record?.completions || 0} explored · ${profile.kc} pretend KC`;
    }
    const settings = sdk.settings();
    dialog.querySelectorAll('[data-lv-setting]').forEach(input => {
      input.checked = settings[input.dataset.lvSetting];
    });
  }

  function pauseForComfort() {
    // Use each cabinet's own pause control, and leave resuming to the player.
    const creatureRunning = gameId === 'creature-catcher' && !document.querySelector('.overlay:not(.hidden)');
    const roadRunning = gameId === 'road-trip-quest' && document.querySelector('#gameScreen.active');
    const chillRunning = gameId === 'chill-brain-rewards' && !document.querySelector('#sessionView')?.hidden;
    const button = creatureRunning || roadRunning ? document.querySelector('#pauseButton')
      : chillRunning ? document.querySelector('#pauseSession') : null;
    if (button && /pause/i.test(button.textContent)) button.click();
    window.dispatchEvent(new CustomEvent('larriverse:comfort-opened'));
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-lv-comfort]');
    if (!button) return;
    if (!dialog.isConnected) document.body.append(dialog);
    opener = button;
    refresh();
    pauseForComfort();
    dialog.querySelector('output').textContent = '';
    if (!dialog.open) dialog.showModal();
  });
  dialog.addEventListener('change', event => {
    const key = event.target.dataset.lvSetting;
    if (!key) return;
    sdk.setSettings({ [key]: event.target.checked });
    dialog.querySelector('output').textContent = 'Comfort choice saved across the arcade.';
  });
  dialog.addEventListener('close', () => opener?.isConnected && opener.focus());
  ['larriverse:profile', 'larriverse:settings', 'larriverse:data-imported', 'larriverse:data-cleared'].forEach(name => {
    window.addEventListener(name, refresh);
  });

  if (header) {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty('--lv-shell-height', `${header.getBoundingClientRect().height}px`);
      const topbar = document.querySelector('body[data-classic="creature-catcher"] > .topbar');
      if (topbar) document.documentElement.style.setProperty('--lv-creature-hud-height', `${topbar.getBoundingClientRect().height}px`);
    }).observe(header);
    // Native result dialogs keep their original replay/continue controls.
    document.querySelectorAll('#resultDialog .result-actions, #resultDialog .result-shell, #resultDialog .result-card, #resultDialog > div, #resultDialog > section').forEach(container => {
      if (container.querySelector('[data-lv-completion]') || container.querySelector('a[href="../../index.html"]')) return;
      // Choose only the innermost result action group when there is one.
      if (container.querySelector('.result-actions')) return;
      const link = document.createElement('a');
      link.className = 'lv-button lv-completion';
      link.dataset.lvCompletion = 'true';
      link.href = '../../index.html';
      link.textContent = 'Back to Arcade';
      container.append(link);
    });
  }

  if (gameId === 'creature-catcher') {
    // The original overlays are retained, but now behave as keyboard dialogs.
    const overlays = [...document.querySelectorAll('.overlay')];
    let active = null;
    let previousFocus = null;
    const originalInert = new Map();
    overlays.forEach(overlay => {
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      const title = overlay.querySelector('h1,h2,.question');
      if (title) {
        title.id ||= `${overlay.id}Title`;
        title.tabIndex = -1;
        overlay.setAttribute('aria-labelledby', title.id);
      }
      const tools = document.createElement('div');
      tools.className = 'lv-tools lv-overlay-tools';
      const returnLink = overlay.querySelector('a[href="../../index.html"]') ? ''
        : '<a class="lv-button" href="../../index.html">Back to Arcade</a>';
      tools.innerHTML = `${returnLink}<button type="button" class="lv-button" data-lv-comfort>Comfort & accessibility</button>`;
      overlay.querySelector('.card').append(tools);
    });
    const focusable = root => [...root.querySelectorAll('a[href],button:not(:disabled),input,select,[tabindex="0"]')]
      .filter(node => !node.closest('.hidden,[hidden]') && node.getClientRects().length);
    function syncOverlays() {
      const next = overlays.find(overlay => !overlay.classList.contains('hidden')) || null;
      if (next === active) return;
      for (const [node, value] of originalInert) node.inert = value;
      originalInert.clear();
      if (next) {
        if (!active) previousFocus = document.activeElement;
        for (const sibling of document.body.children) {
          if (sibling === next || sibling === dialog || sibling.tagName === 'SCRIPT') continue;
          originalInert.set(sibling, sibling.inert);
          sibling.inert = true;
        }
        const heading = next.querySelector('[tabindex="-1"]');
        (heading || focusable(next)[0])?.focus({ preventScroll: true });
      } else if (previousFocus?.isConnected && previousFocus.tabIndex >= 0 && !previousFocus.closest('.hidden')) previousFocus.focus();
      else document.querySelector('#world')?.focus();
      active = next;
    }
    new MutationObserver(syncOverlays).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Tab' || !active || dialog.open) return;
      const nodes = focusable(active);
      const first = nodes[0], last = nodes.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    syncOverlays();
  }
  refresh();
})();
