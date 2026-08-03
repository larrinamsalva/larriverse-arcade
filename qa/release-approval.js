(() => {
  'use strict';

  const MANIFEST_URL = '../release.json';
  const MAX_FILE_BYTES = 2_000_000;
  const REQUIRED_DEVICE_CHECKS = ['controls', 'accessibility', 'backupRestore', 'privacy', 'sound', 'deviceComfort'];
  const $ = (selector) => document.querySelector(selector);
  const evidence = { gallery: null, desktop: null, mobile: null };
  const hashes = { gallery: null, desktop: null, mobile: null };
  let manifest = null;

  function setStatus(text) { $('#status').textContent = text; }
  function allCabinetIds() { return new Set(manifest.cabinets.map((cabinet) => cabinet.id)); }
  function humanChecks() {
    return Object.fromEntries([...document.querySelectorAll('[data-check]')].map((box) => [box.dataset.check, box.checked]));
  }
  async function digest(text) {
    const bytes = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  function validateGallery(value) {
    if (value?.schema !== 'larriverse-gallery-approval' || value.schemaVersion !== 1) throw new Error('unsupported gallery approval schema');
    if (value.release !== manifest.version || value.candidate !== manifest.candidate) throw new Error('gallery release does not match');
    if (!/^[a-f0-9]{40}$/.test(value.sourceCommit)) throw new Error('gallery source commit is invalid');
    if (!value.reviewer || !value.reviewedAt) throw new Error('gallery reviewer metadata is missing');
    if (!value.checks || Object.values(value.checks).length !== 5 || !Object.values(value.checks).every(Boolean)) throw new Error('gallery global checks are incomplete');
    if (!Array.isArray(value.entries) || value.entries.length !== 18) throw new Error('gallery must approve exactly 18 images');
    const expected = new Set(['lobby', ...manifest.cabinets.map((cabinet) => cabinet.id)]);
    const pairs = new Set();
    for (const entry of value.entries) {
      if (!['desktop-chromium', 'mobile-chromium'].includes(entry.project)) throw new Error('gallery project is invalid');
      if (!expected.has(entry.subjectId)) throw new Error(`unknown gallery subject ${entry.subjectId}`);
      const key = `${entry.project}/${entry.subjectId}`;
      if (pairs.has(key)) throw new Error(`duplicate gallery entry ${key}`);
      pairs.add(key);
      if (entry.status !== 'approved') throw new Error(`${key} is not approved`);
      if (!/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error(`${key} hash is invalid`);
      if (typeof entry.alt !== 'string' || entry.alt.trim().length < 20) throw new Error(`${key} alt text is incomplete`);
    }
    return value;
  }
  function validateQa(value, label, expectedDeviceClass) {
    if (value?.schema !== 'larriverse-release-qa' || value.schemaVersion !== 2) throw new Error(`${label} report schema is unsupported`);
    if (value.release !== manifest.version || value.candidate !== manifest.candidate) throw new Error(`${label} release does not match`);
    if (value.deviceClass !== expectedDeviceClass) throw new Error(`${label} must be labeled ${expectedDeviceClass}`);
    if (!value.deviceName || value.deviceName.trim().length < 3) throw new Error(`${label} device name is missing`);
    if (!value.tester || !value.userAgent || !value.exportedAt) throw new Error(`${label} tester or browser metadata is missing`);
    if (value.locationGrantedDuringEvidence !== false) throw new Error(`${label} must confirm that location was not granted`);
    if (!value.environment || !Number.isFinite(value.environment.viewportWidth) || !Number.isFinite(value.environment.viewportHeight)) throw new Error(`${label} viewport metadata is missing`);
    if (expectedDeviceClass === 'physical-phone' && !(Number(value.environment.maxTouchPoints) >= 1)) throw new Error('Phone QA must come from a touch-capable physical device');
    if (!value.deviceChecks || !REQUIRED_DEVICE_CHECKS.every((key) => value.deviceChecks[key] === true)) throw new Error(`${label} device-wide checks are incomplete`);
    if (!Array.isArray(value.results) || value.results.length !== manifest.cabinetCount) throw new Error(`${label} must contain eight cabinet results`);
    const expected = allCabinetIds();
    const seen = new Set();
    for (const result of value.results) {
      if (!expected.has(result.id) || seen.has(result.id)) throw new Error(`${label} has an unknown or duplicate cabinet`);
      seen.add(result.id);
      if (result.route !== 'reachable') throw new Error(`${label}: ${result.title || result.id} route was not reachable`);
      if (result.result !== 'pass') throw new Error(`${label}: ${result.title || result.id} did not pass`);
    }
    return value;
  }
  async function readJson(file, kind) {
    if (!file) throw new Error('no file selected');
    if (file.size > MAX_FILE_BYTES) throw new Error('file exceeds the 2 MB limit');
    const text = await file.text();
    const value = JSON.parse(text);
    hashes[kind] = await digest(text);
    return value;
  }
  async function loadEvidence(kind, file) {
    const label = kind === 'gallery' ? 'Gallery' : kind === 'desktop' ? 'Desktop QA' : 'Phone QA';
    const state = $(`#${kind}State`);
    state.className = '';
    state.textContent = 'Checking…';
    try {
      const value = await readJson(file, kind);
      evidence[kind] = kind === 'gallery'
        ? validateGallery(value)
        : validateQa(value, label, kind === 'desktop' ? 'desktop' : 'physical-phone');
      if (kind === 'mobile' && !$('#device').value.trim()) $('#device').value = evidence.mobile.deviceName;
      state.textContent = kind === 'gallery' ? '18/18 images approved' : `8/8 cabinets passed · ${evidence[kind].deviceName}`;
      state.className = 'good';
      setStatus(`${label} evidence loaded successfully.`);
    } catch (error) {
      evidence[kind] = null;
      hashes[kind] = null;
      state.textContent = error.message;
      state.className = 'bad';
      setStatus(`${label} evidence was rejected: ${error.message}`);
    }
    update();
  }
  function ready() {
    const approver = $('#approver').value.trim();
    const device = $('#device').value.trim();
    const checks = humanChecks();
    return Boolean(
      evidence.gallery &&
      evidence.desktop &&
      evidence.mobile &&
      hashes.desktop !== hashes.mobile &&
      approver.length >= 2 &&
      device === evidence.mobile.deviceName &&
      Object.values(checks).length === 6 &&
      Object.values(checks).every(Boolean)
    );
  }
  function update() {
    const states = [
      ['#gallerySummary', Boolean(evidence.gallery), evidence.gallery ? '18 approved' : 'missing'],
      ['#desktopSummary', Boolean(evidence.desktop), evidence.desktop ? `8 passed · ${evidence.desktop.deviceName}` : 'missing'],
      ['#mobileSummary', Boolean(evidence.mobile), evidence.mobile ? `8 passed · ${evidence.mobile.deviceName}` : 'missing']
    ];
    for (const [selector, good, text] of states) {
      const node = $(selector);
      node.textContent = text;
      node.className = good ? 'good' : 'bad';
    }
    const approved = ready();
    $('#decisionSummary').textContent = approved ? 'ready to export' : 'blocked';
    $('#decisionSummary').className = approved ? 'good' : 'bad';
    $('#export').disabled = !approved;
  }
  function reportSummary(report) {
    return {
      deviceClass: report.deviceClass,
      deviceName: report.deviceName,
      tester: report.tester,
      userAgent: report.userAgent,
      environment: report.environment,
      deviceChecks: report.deviceChecks,
      locationGrantedDuringEvidence: report.locationGrantedDuringEvidence,
      exportedAt: report.exportedAt,
      results: report.results.map(({ id, title, route, result, notes, savedAt }) => ({
        id,
        title,
        route,
        result,
        notes: notes || null,
        savedAt: savedAt || null
      }))
    };
  }
  function exportApproval() {
    if (!ready()) return;
    const approval = {
      schema: 'larriverse-release-approval',
      schemaVersion: 1,
      qaSchemaVersion: 2,
      release: manifest.version,
      candidate: manifest.candidate,
      approvedCodeCommit: evidence.gallery.sourceCommit,
      approver: $('#approver').value.trim(),
      approvedAt: new Date().toISOString(),
      physicalDevice: evidence.mobile.deviceName,
      locationGrantedDuringEvidence: false,
      notes: $('#notes').value.trim() || null,
      confirmations: humanChecks(),
      evidenceHashes: { ...hashes },
      gallery: {
        approved: true,
        reviewer: evidence.gallery.reviewer,
        reviewedAt: evidence.gallery.reviewedAt,
        workflowRunId: evidence.gallery.workflowRunId || null,
        entries: evidence.gallery.entries.map((entry) => ({
          project: entry.project,
          subjectId: entry.subjectId,
          candidatePath: entry.path,
          approvedPath: `docs/screenshots/${entry.project}/${entry.subjectId}.png`,
          sha256: entry.sha256,
          alt: entry.alt,
          note: entry.note || null
        }))
      },
      desktopQa: { approved: true, fileSha256: hashes.desktop, ...reportSummary(evidence.desktop) },
      physicalMobileQa: { approved: true, device: evidence.mobile.deviceName, fileSha256: hashes.mobile, ...reportSummary(evidence.mobile) }
    };
    const blob = new Blob([JSON.stringify(approval, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `larriverse-${manifest.version}-${manifest.candidate}-release-approval.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Final approval exported. It must be committed with the exact approved images before the release tag can publish.');
  }
  async function init() {
    const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`release manifest request failed: ${response.status}`);
    manifest = await response.json();
    if (manifest.version !== '1.0.0' || manifest.candidate !== 'rc.1' || manifest.cabinetCount !== 8) throw new Error('unsupported release candidate');
    $('#galleryFile').addEventListener('change', (event) => loadEvidence('gallery', event.target.files[0]));
    $('#desktopFile').addEventListener('change', (event) => loadEvidence('desktop', event.target.files[0]));
    $('#mobileFile').addEventListener('change', (event) => loadEvidence('mobile', event.target.files[0]));
    ['#approver', '#device', '#notes'].forEach((selector) => $(selector).addEventListener('input', update));
    document.querySelectorAll('[data-check]').forEach((box) => box.addEventListener('change', update));
    $('#export').addEventListener('click', exportApproval);
    setStatus(`${manifest.title} ${manifest.candidate} loaded. Evidence remains on this device.`);
    update();
  }
  init().catch((error) => {
    console.error(error);
    setStatus(`Release approval console could not load: ${error.message}`);
  });
})();
