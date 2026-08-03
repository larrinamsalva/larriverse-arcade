(() => {
  'use strict';

  const MAX_FILE_BYTES = 2_000_000;
  const $ = (selector) => document.querySelector(selector);
  const evidence = { gallery: null, desktop: null, phone: null };
  const hashes = { gallery: null, desktop: null, phone: null };
  const errors = { gallery: null, desktop: null, phone: null };
  let release = null;

  async function digest(text) {
    const bytes = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function validateGallery(value) {
    if (value?.schema !== 'larriverse-gallery-approval' || value.schemaVersion !== 1) throw new Error('unsupported gallery approval schema');
    if (value.release !== release.version || value.candidate !== release.candidate) throw new Error('gallery release does not match');
    if (!value.reviewer || !value.reviewedAt || !/^[a-f0-9]{40}$/.test(value.sourceCommit || '')) throw new Error('gallery reviewer or source metadata is incomplete');
    if (!value.checks || Object.values(value.checks).length !== 5 || !Object.values(value.checks).every(Boolean)) throw new Error('gallery global checks are incomplete');
    if (!Array.isArray(value.entries) || value.entries.length !== 18) throw new Error('gallery must contain 18 images');
    if (!value.entries.every((entry) => entry.status === 'approved' && /^[a-f0-9]{64}$/.test(entry.sha256 || '') && String(entry.alt || '').trim().length >= 20)) {
      throw new Error('every gallery image must be approved, hashed, and have useful alt text');
    }
    return value;
  }

  function validateQa(value, role) {
    if (value?.schema !== 'larriverse-release-qa' || value.schemaVersion !== 2) throw new Error('QA schema must be version 2');
    if (value.release !== release.version || value.candidate !== release.candidate) throw new Error('QA release does not match');
    if (value.deviceRole !== role) throw new Error(`expected ${role} evidence`);
    if (!value.tester || !value.deviceName || !value.userAgent || !value.exportedAt) throw new Error('tester and device metadata are incomplete');
    if (value.locationGrantedDuringEvidence !== false) throw new Error('location must remain ungranted');
    const requiredChecks = release.deviceQa.requiredDeviceChecks;
    if (!requiredChecks.every((key) => value.deviceChecks?.[key] === true)) throw new Error('six device-wide checks are incomplete');
    if (!Array.isArray(value.results) || value.results.length !== release.cabinetCount) throw new Error('QA report must contain eight cabinet results');
    const expected = new Set(release.cabinets.map((cabinet) => cabinet.id));
    const seen = new Set();
    for (const result of value.results) {
      if (!expected.has(result.id) || seen.has(result.id)) throw new Error('unknown or duplicate cabinet result');
      seen.add(result.id);
      if (result.route !== 'reachable' || result.result !== 'pass') throw new Error(`${result.title || result.id} is not a complete pass`);
    }
    if (role === 'physical-phone' && !(Number(value.device?.maxTouchPoints) > 0)) throw new Error('phone evidence does not report touch capability');
    return value;
  }

  async function readFile(file, kind) {
    if (!file) throw new Error('no file selected');
    if (file.size > MAX_FILE_BYTES) throw new Error('file exceeds the 2 MB limit');
    const text = await file.text();
    hashes[kind] = await digest(text);
    return JSON.parse(text);
  }

  async function load(kind, file) {
    const state = $(`#${kind}State`);
    state.className = '';
    state.textContent = 'Checking…';
    errors[kind] = null;
    try {
      const value = await readFile(file, kind);
      evidence[kind] = kind === 'gallery' ? validateGallery(value) : validateQa(value, kind === 'phone' ? 'physical-phone' : 'desktop');
      state.textContent = kind === 'gallery' ? '18 approved images' : '8 passed cabinets and 6 device checks';
      state.className = 'good';
    } catch (error) {
      evidence[kind] = null;
      hashes[kind] = null;
      errors[kind] = error.message;
      state.textContent = error.message;
      state.className = 'bad';
    }
    update();
  }

  function ready() {
    return Boolean(evidence.gallery && evidence.desktop && evidence.phone && hashes.desktop !== hashes.phone);
  }

  function update() {
    const states = [
      ['gallery', Boolean(evidence.gallery), evidence.gallery ? '18 approved' : 'missing'],
      ['desktop', Boolean(evidence.desktop), evidence.desktop ? '8 passed' : 'missing'],
      ['phone', Boolean(evidence.phone), evidence.phone ? '8 passed' : 'missing']
    ];
    for (const [kind, good, text] of states) {
      const node = $(`#${kind}Summary`);
      node.textContent = text;
      node.className = good ? 'good' : 'bad';
    }
    const distinct = Boolean(hashes.desktop && hashes.phone && hashes.desktop !== hashes.phone);
    $('#distinctSummary').textContent = distinct ? 'yes' : 'blocked';
    $('#distinctSummary').className = distinct ? 'good' : 'bad';
    const complete = ready();
    $('#export').disabled = !complete;
    $('#approvalLink').setAttribute('aria-disabled', complete ? 'false' : 'true');
    $('#status').textContent = complete
      ? 'Preflight passed. These files are structurally ready for the separate final approval console.'
      : 'Preflight is blocked until all three valid, role-correct, distinct evidence files are loaded.';
    const items = Object.entries(errors).filter(([, value]) => value).map(([kind, value]) => `${kind}: ${value}`);
    $('#issues').innerHTML = items.length ? items.map((item) => `<li>${escapeHtml(item)}</li>`).join('') : '<li>No structural evidence problems detected.</li>';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
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
      readyForApprovalConsole: true,
      evidence: {
        gallery: { sha256: hashes.gallery, images: evidence.gallery.entries.length, reviewer: evidence.gallery.reviewer },
        desktop: { sha256: hashes.desktop, deviceRole: evidence.desktop.deviceRole, tester: evidence.desktop.tester, deviceName: evidence.desktop.deviceName },
        physicalPhone: { sha256: hashes.phone, deviceRole: evidence.phone.deviceRole, tester: evidence.phone.tester, deviceName: evidence.phone.deviceName, maxTouchPoints: evidence.phone.device.maxTouchPoints }
      }
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `larriverse-${release.version}-${release.candidate}-evidence-rehearsal.json`;
    link.click();
    URL.revokeObjectURL(url);
    $('#status').textContent = 'Rehearsal summary exported. It is not accepted as release approval.';
  }

  async function init() {
    const response = await fetch('../release.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`release manifest returned HTTP ${response.status}`);
    release = await response.json();
    $('#galleryFile').addEventListener('change', (event) => load('gallery', event.target.files[0]));
    $('#desktopFile').addEventListener('change', (event) => load('desktop', event.target.files[0]));
    $('#phoneFile').addEventListener('change', (event) => load('phone', event.target.files[0]));
    $('#export').addEventListener('click', exportSummary);
    update();
  }

  init().catch((error) => {
    console.error(error);
    $('#status').textContent = `Evidence preflight could not load: ${error.message}`;
  });
})();
