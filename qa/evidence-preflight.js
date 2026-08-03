(() => {
  'use strict';

  const Contract = window.LarriVerseEvidence;
  const $ = (selector) => document.querySelector(selector);
  const items = { gallery: null, desktop: null, physicalPhone: null };
  const errors = { gallery: null, desktop: null, physicalPhone: null };
  let release = null;

  async function load(kind, file) {
    const uiKind = kind === 'physicalPhone' ? 'phone' : kind;
    const state = $(`#${uiKind}State`);
    state.className = '';
    state.textContent = 'Checking…';
    errors[kind] = null;
    try {
      items[kind] = await Contract.readEvidenceFile(file, kind, release);
      state.textContent = kind === 'gallery' ? '18 approved images' : `8 passed cabinets · ${items[kind].value.deviceName}`;
      state.className = 'good';
    } catch (error) {
      items[kind] = null;
      errors[kind] = error.message;
      state.textContent = error.message;
      state.className = 'bad';
    }
    update();
  }

  function ready() {
    try {
      Contract.validateEvidenceSet(items);
      return true;
    } catch {
      return false;
    }
  }

  function setSummary(selector, good, text) {
    const node = $(selector);
    node.textContent = text;
    node.className = good ? 'good' : 'bad';
  }

  function update() {
    setSummary('#gallerySummary', Boolean(items.gallery), items.gallery ? '18 approved' : 'missing');
    setSummary('#desktopSummary', Boolean(items.desktop), items.desktop ? '8 passed' : 'missing');
    setSummary('#phoneSummary', Boolean(items.physicalPhone), items.physicalPhone ? '8 passed' : 'missing');
    const distinct = Boolean(items.desktop && items.physicalPhone && items.desktop.sha256 !== items.physicalPhone.sha256);
    setSummary('#distinctSummary', distinct, distinct ? 'yes' : 'blocked');

    const complete = ready();
    $('#export').disabled = !complete;
    $('#approvalLink').setAttribute('aria-disabled', complete ? 'false' : 'true');
    $('#releaseRoomLink').setAttribute('aria-disabled', complete ? 'false' : 'true');
    $('#status').textContent = complete
      ? 'Preflight passed. The files use the shared schema-v2 contract and are structurally ready for the Release Room or final approval console.'
      : 'Preflight is blocked until all three valid, role-correct, distinct evidence files are loaded.';

    $('#issues').replaceChildren();
    const problems = Object.entries(errors).filter(([, value]) => value);
    if (!problems.length) {
      const item = document.createElement('li');
      item.textContent = complete ? 'No structural evidence problems detected.' : 'No files checked yet.';
      $('#issues').append(item);
    } else {
      for (const [kind, message] of problems) {
        const item = document.createElement('li');
        item.textContent = `${kind}: ${message}`;
        $('#issues').append(item);
      }
    }
  }

  function exportSummary() {
    if (!ready()) return;
    const summary = {
      schema: 'larriverse-evidence-rehearsal',
      schemaVersion: 1,
      release: release.version,
      candidate: release.candidate,
      checkedAt: new Date().toISOString(),
      createsReleaseApproval: false,
      readyForReleaseRoom: true,
      readyForApprovalConsole: true,
      evidence: {
        gallery: { sha256: items.gallery.sha256, images: items.gallery.value.entries.length, reviewer: items.gallery.value.reviewer },
        desktop: { sha256: items.desktop.sha256, deviceClass: items.desktop.value.deviceClass, tester: items.desktop.value.tester, deviceName: items.desktop.value.deviceName },
        physicalPhone: { sha256: items.physicalPhone.sha256, deviceClass: items.physicalPhone.value.deviceClass, tester: items.physicalPhone.value.tester, deviceName: items.physicalPhone.value.deviceName, maxTouchPoints: items.physicalPhone.value.environment.maxTouchPoints }
      }
    };
    const blob = new Blob([`${JSON.stringify(summary, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `larriverse-${release.version}-${release.candidate}-evidence-rehearsal.json`;
    link.click();
    URL.revokeObjectURL(url);
    $('#status').textContent = 'Rehearsal summary exported. It is not accepted as release approval.';
  }

  async function init() {
    if (!Contract) throw new Error('shared evidence contract did not load');
    const response = await fetch('../release.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`release manifest returned HTTP ${response.status}`);
    release = await response.json();
    $('#galleryFile').addEventListener('change', (event) => load('gallery', event.target.files[0]));
    $('#desktopFile').addEventListener('change', (event) => load('desktop', event.target.files[0]));
    $('#phoneFile').addEventListener('change', (event) => load('physicalPhone', event.target.files[0]));
    $('#export').addEventListener('click', exportSummary);
    for (const selector of ['#approvalLink', '#releaseRoomLink']) {
      $(selector).addEventListener('click', (event) => {
        if ($(selector).getAttribute('aria-disabled') === 'true') event.preventDefault();
      });
    }
    update();
  }

  init().catch((error) => {
    console.error(error);
    $('#status').textContent = `Evidence preflight could not load: ${error.message}`;
  });
})();
