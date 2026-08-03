(() => {
  'use strict';

  const MAX_FILE_BYTES = 2_000_000;
  const MAX_BUNDLE_BYTES = 6_500_000;
  const REQUIRED_DEVICE_CHECKS = ['controls', 'accessibility', 'backupRestore', 'privacy', 'sound', 'deviceComfort'];
  const PROJECTS = ['desktop-chromium', 'mobile-chromium'];
  const FORBIDDEN_EVIDENCE_KEYS = new Set(['latitude', 'longitude', 'coordinates', 'coords', 'geo' + 'location']);

  function fail(message) {
    throw new Error(message);
  }

  function assert(condition, message) {
    if (!condition) fail(message);
  }

  async function digestText(text) {
    const bytes = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function parseJsonText(text, label = 'JSON') {
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      fail(`${label} is not valid JSON`);
    }
    assert(value && typeof value === 'object' && !Array.isArray(value), `${label} must contain a JSON object`);
    return value;
  }

  function findForbiddenKey(value, trail = []) {
    if (!value || typeof value !== 'object') return null;
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        const found = findForbiddenKey(value[index], [...trail, String(index)]);
        if (found) return found;
      }
      return null;
    }
    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_EVIDENCE_KEYS.has(key.toLowerCase())) return [...trail, key].join('.');
      const found = findForbiddenKey(child, [...trail, key]);
      if (found) return found;
    }
    return null;
  }

  function cabinetIds(release) {
    assert(Array.isArray(release?.cabinets), 'release manifest cabinets are missing');
    return release.cabinets.map((cabinet) => cabinet.id);
  }

  function expectedGalleryPairs(release) {
    const subjects = ['lobby', ...cabinetIds(release)];
    return new Set(PROJECTS.flatMap((project) => subjects.map((subject) => `${project}/${subject}`)));
  }

  function validateGallery(value, release) {
    assert(value?.schema === 'larriverse-gallery-approval' && value.schemaVersion === 1, 'unsupported gallery approval schema');
    assert(value.release === release.version && value.candidate === release.candidate, 'gallery release does not match');
    assert(/^[a-f0-9]{40}$/.test(value.sourceCommit || ''), 'gallery source commit is invalid');
    assert(typeof value.reviewer === 'string' && value.reviewer.trim().length >= 2 && value.reviewedAt, 'gallery reviewer metadata is missing');
    assert(value.checks && Object.values(value.checks).length === 5 && Object.values(value.checks).every(Boolean), 'gallery global checks are incomplete');
    const expectedCount = release.galleryReview?.expectedImages || 18;
    assert(Array.isArray(value.entries) && value.entries.length === expectedCount, `gallery must approve exactly ${expectedCount} images`);

    const expected = expectedGalleryPairs(release);
    const seen = new Set();
    for (const entry of value.entries) {
      assert(PROJECTS.includes(entry.project), 'gallery project is invalid');
      const pair = `${entry.project}/${entry.subjectId}`;
      assert(expected.has(pair), `unknown gallery entry ${pair}`);
      assert(!seen.has(pair), `duplicate gallery entry ${pair}`);
      seen.add(pair);
      assert(entry.status === 'approved', `${pair} is not approved`);
      assert(/^[a-f0-9]{64}$/.test(entry.sha256 || ''), `${pair} hash is invalid`);
      assert(typeof entry.alt === 'string' && entry.alt.trim().length >= 20, `${pair} alt text is incomplete`);
    }
    assert(seen.size === expected.size, 'gallery pair coverage is incomplete');
    return value;
  }

  function validateQa(value, release, expectedDeviceClass) {
    assert(value?.schema === release.deviceQa?.schema && value.schemaVersion === release.deviceQa?.schemaVersion, 'QA schema must be version 2');
    assert(value.release === release.version && value.candidate === release.candidate, 'QA release does not match');
    assert(value.deviceClass === expectedDeviceClass, `expected ${expectedDeviceClass} evidence`);
    assert(typeof value.deviceName === 'string' && value.deviceName.trim().length >= 3, 'device name is missing');
    assert(typeof value.tester === 'string' && value.tester.trim().length >= 2, 'tester name is missing');
    assert(typeof value.userAgent === 'string' && value.userAgent.length >= 8 && value.exportedAt, 'browser or export metadata is incomplete');
    assert(value.locationGrantedDuringEvidence === false, 'location must remain ungranted');
    assert(value.environment && Number.isFinite(value.environment.viewportWidth) && Number.isFinite(value.environment.viewportHeight), 'viewport metadata is missing');
    if (expectedDeviceClass === 'physical-phone') {
      assert(Number(value.environment.maxTouchPoints) >= 1, 'phone evidence does not report touch capability');
    }
    const requiredChecks = release.deviceQa?.requiredDeviceChecks || REQUIRED_DEVICE_CHECKS;
    assert(requiredChecks.every((key) => value.deviceChecks?.[key] === true), 'six device-wide checks are incomplete');
    assert(Array.isArray(value.results) && value.results.length === release.cabinetCount, 'QA report must contain eight cabinet results');

    const expected = new Set(cabinetIds(release));
    const seen = new Set();
    for (const result of value.results) {
      assert(expected.has(result.id) && !seen.has(result.id), 'unknown or duplicate cabinet result');
      seen.add(result.id);
      assert(result.route === 'reachable', `${result.title || result.id} route is not reachable`);
      assert(result.result === 'pass', `${result.title || result.id} is not a complete pass`);
    }
    assert(!findForbiddenKey(value), 'QA evidence contains a forbidden location field');
    return value;
  }

  function validateEvidenceSet(items) {
    assert(items.gallery && items.desktop && items.physicalPhone, 'gallery, desktop, and physical-phone evidence are required');
    assert(items.desktop.sha256 !== items.physicalPhone.sha256, 'desktop and phone evidence files must be different');
    return items;
  }

  async function readEvidenceFile(file, kind, release) {
    assert(file, 'no file selected');
    assert(file.size <= MAX_FILE_BYTES, 'file exceeds the 2 MB limit');
    const text = await file.text();
    const value = parseJsonText(text, kind);
    const sha256 = await digestText(text);
    if (kind === 'gallery') validateGallery(value, release);
    else validateQa(value, release, kind === 'desktop' ? 'desktop' : 'physical-phone');
    return { kind, text, value, sha256, bytes: file.size };
  }

  function deploymentSummary(deployment, release) {
    assert(deployment?.schema === 'larriverse-deployment' && deployment.schemaVersion === 1, 'deployment identity is invalid');
    assert(deployment.release === release.version && deployment.candidate === release.candidate, 'deployment release does not match');
    assert(/^[a-f0-9]{40}$/.test(deployment.sourceCommit || ''), 'deployment source commit is invalid');
    assert(/^[a-f0-9]{64}$/.test(deployment.releaseManifestSha256 || ''), 'deployment release digest is invalid');
    return {
      schema: deployment.schema,
      schemaVersion: deployment.schemaVersion,
      release: deployment.release,
      candidate: deployment.candidate,
      sourceCommit: deployment.sourceCommit,
      builtAt: deployment.builtAt,
      repository: deployment.repository,
      workflowRunId: deployment.workflowRunId,
      workflowRunNumber: deployment.workflowRunNumber,
      releaseManifestSha256: deployment.releaseManifestSha256
    };
  }

  function createBundle({ release, deployment, items }) {
    validateEvidenceSet(items);
    return {
      schema: 'larriverse-evidence-bundle',
      schemaVersion: 1,
      release: release.version,
      candidate: release.candidate,
      createdAt: new Date().toISOString(),
      createsReleaseApproval: false,
      deployment: deploymentSummary(deployment, release),
      hashes: {
        gallery: items.gallery.sha256,
        desktop: items.desktop.sha256,
        physicalPhone: items.physicalPhone.sha256
      },
      documents: {
        gallery: items.gallery.text,
        desktop: items.desktop.text,
        physicalPhone: items.physicalPhone.text
      }
    };
  }

  async function validateBundle(value, release) {
    assert(value?.schema === 'larriverse-evidence-bundle' && value.schemaVersion === 1, 'unsupported evidence bundle schema');
    assert(value.release === release.version && value.candidate === release.candidate, 'bundle release does not match');
    assert(value.createsReleaseApproval === false, 'bundle must not claim release approval');
    deploymentSummary(value.deployment, release);
    assert(value.documents && value.hashes, 'bundle documents or hashes are missing');

    const kinds = ['gallery', 'desktop', 'physicalPhone'];
    const items = {};
    for (const kind of kinds) {
      const text = value.documents[kind];
      assert(typeof text === 'string' && text.length > 1, `bundle ${kind} document is missing`);
      const sha256 = await digestText(text);
      assert(sha256 === value.hashes[kind], `bundle ${kind} hash does not match`);
      const parsed = parseJsonText(text, kind);
      if (kind === 'gallery') validateGallery(parsed, release);
      else validateQa(parsed, release, kind === 'desktop' ? 'desktop' : 'physical-phone');
      items[kind] = { kind, text, value: parsed, sha256, bytes: new TextEncoder().encode(text).length };
    }
    validateEvidenceSet(items);
    return { bundle: value, items };
  }

  async function readBundleFile(file, release) {
    assert(file, 'no bundle selected');
    assert(file.size <= MAX_BUNDLE_BYTES, 'bundle exceeds the 6.5 MB limit');
    const text = await file.text();
    const value = parseJsonText(text, 'evidence bundle');
    const validated = await validateBundle(value, release);
    return { ...validated, text, sha256: await digestText(text), bytes: file.size };
  }

  window.LarriVerseEvidence = Object.freeze({
    MAX_FILE_BYTES,
    MAX_BUNDLE_BYTES,
    REQUIRED_DEVICE_CHECKS,
    digestText,
    parseJsonText,
    validateGallery,
    validateQa,
    validateEvidenceSet,
    readEvidenceFile,
    deploymentSummary,
    createBundle,
    validateBundle,
    readBundleFile
  });
})();
