(() => {
  'use strict';

  const MANIFEST_URL = '../release.json';
  const Contract = window.LarriVerseEvidence;
  const $ = (selector) => document.querySelector(selector);
  const items = { gallery: null, desktop: null, physicalPhone: null };
  let manifest = null;
  let bundleMeta = null;

  function setStatus(text) { $('#status').textContent = text; }
  function humanChecks() {
    return Object.fromEntries([...document.querySelectorAll('[data-check]')].map((box) => [box.dataset.check, box.checked]));
  }

  function uiState(kind) {
    return $(`#${kind === 'physicalPhone' ? 'mobile' : kind}State`);
  }

  function setEvidenceState(kind, message, good) {
    const node = uiState(kind);
    node.textContent = message;
    node.className = good ? 'good' : 'bad';
  }

  function acceptItem(kind, item) {
    items[kind] = item;
    if (kind === 'physicalPhone' && !$('#device').value.trim()) $('#device').value = item.value.deviceName;
    setEvidenceState(kind, kind === 'gallery' ? '18/18 images approved' : `8/8 cabinets passed · ${item.value.deviceName}`, true);
  }

  async function loadEvidence(kind, file) {
    bundleMeta = null;
    $('#bundleState').textContent = 'Not loaded';
    $('#bundleState').className = '';
    try {
      const item = await Contract.readEvidenceFile(file, kind, manifest);
      acceptItem(kind, item);
      setStatus(`${kind === 'gallery' ? 'Gallery' : kind === 'desktop' ? 'Desktop QA' : 'Phone QA'} evidence loaded successfully.`);
    } catch (error) {
      items[kind] = null;
      setEvidenceState(kind, error.message, false);
      setStatus(`Evidence was rejected: ${error.message}`);
    }
    update();
  }

  async function loadBundle(file) {
    const state = $('#bundleState');
    state.textContent = 'Checking…';
    state.className = '';
    try {
      const result = await Contract.readBundleFile(file, manifest);
      bundleMeta = {
        fileSha256: result.sha256,
        createdAt: result.bundle.createdAt,
        deployment: result.bundle.deployment
      };
      acceptItem('gallery', result.items.gallery);
      acceptItem('desktop', result.items.desktop);
      acceptItem('physicalPhone', result.items.physicalPhone);
      state.textContent = `Accepted · deployed ${result.bundle.deployment.sourceCommit.slice(0, 10)}…`;
      state.className = 'good';
      setStatus('Evidence bundle loaded. The human release decision is still separate and blocked until all confirmations are complete.');
    } catch (error) {
      bundleMeta = null;
      state.textContent = error.message;
      state.className = 'bad';
      setStatus(`Evidence bundle was rejected: ${error.message}`);
    }
    update();
  }

  function evidenceReady() {
    try {
      Contract.validateEvidenceSet(items);
      return true;
    } catch {
      return false;
    }
  }

  function ready() {
    const approver = $('#approver').value.trim();
    const device = $('#device').value.trim();
    const checks = humanChecks();
    return Boolean(
      evidenceReady() &&
      approver.length >= 2 &&
      device === items.physicalPhone.value.deviceName &&
      Object.values(checks).length === 6 &&
      Object.values(checks).every(Boolean)
    );
  }

  function setSummary(selector, good, text) {
    const node = $(selector);
    node.textContent = text;
    node.className = good ? 'good' : 'bad';
  }

  function update() {
    setSummary('#gallerySummary', Boolean(items.gallery), items.gallery ? '18 approved' : 'missing');
    setSummary('#desktopSummary', Boolean(items.desktop), items.desktop ? `8 passed · ${items.desktop.value.deviceName}` : 'missing');
    setSummary('#mobileSummary', Boolean(items.physicalPhone), items.physicalPhone ? `8 passed · ${items.physicalPhone.value.deviceName}` : 'missing');
    const approved = ready();
    setSummary('#decisionSummary', approved, approved ? 'ready to export' : 'blocked');
    $('#export').disabled = !approved;
  }

  function reportSummary(item) {
    const report = item.value;
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

  function downloadJson(value, filename) {
    const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportApproval() {
    if (!ready()) return;
    const gallery = items.gallery.value;
    const phone = items.physicalPhone.value;
    const approval = {
      schema: 'larriverse-release-approval',
      schemaVersion: 1,
      qaSchemaVersion: 2,
      release: manifest.version,
      candidate: manifest.candidate,
      approvedCodeCommit: gallery.sourceCommit,
      approver: $('#approver').value.trim(),
      approvedAt: new Date().toISOString(),
      physicalDevice: phone.deviceName,
      locationGrantedDuringEvidence: false,
      notes: $('#notes').value.trim() || null,
      confirmations: humanChecks(),
      evidenceHashes: {
        gallery: items.gallery.sha256,
        desktop: items.desktop.sha256,
        mobile: items.physicalPhone.sha256
      },
      handoffBundle: bundleMeta ? { ...bundleMeta } : null,
      gallery: {
        approved: true,
        reviewer: gallery.reviewer,
        reviewedAt: gallery.reviewedAt,
        workflowRunId: gallery.workflowRunId || null,
        entries: gallery.entries.map((entry) => ({
          project: entry.project,
          subjectId: entry.subjectId,
          candidatePath: entry.path,
          approvedPath: `docs/screenshots/${entry.project}/${entry.subjectId}.png`,
          sha256: entry.sha256,
          alt: entry.alt,
          note: entry.note || null
        }))
      },
      desktopQa: { approved: true, fileSha256: items.desktop.sha256, ...reportSummary(items.desktop) },
      physicalMobileQa: { approved: true, device: phone.deviceName, fileSha256: items.physicalPhone.sha256, ...reportSummary(items.physicalPhone) }
    };
    downloadJson(approval, `larriverse-${manifest.version}-${manifest.candidate}-release-approval.json`);
    setStatus('Final approval exported. It must be committed with the exact approved images before the release tag can publish.');
  }

  async function init() {
    if (!Contract) throw new Error('shared evidence contract did not load');
    const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`release manifest request failed: ${response.status}`);
    manifest = await response.json();
    if (manifest.version !== '1.0.0' || manifest.candidate !== 'rc.1' || manifest.cabinetCount !== 8) throw new Error('unsupported release candidate');

    $('#bundleFile').addEventListener('change', (event) => loadBundle(event.target.files[0]));
    $('#galleryFile').addEventListener('change', (event) => loadEvidence('gallery', event.target.files[0]));
    $('#desktopFile').addEventListener('change', (event) => loadEvidence('desktop', event.target.files[0]));
    $('#mobileFile').addEventListener('change', (event) => loadEvidence('physicalPhone', event.target.files[0]));
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
