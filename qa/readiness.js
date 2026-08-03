(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const privatePaths = ['../docs/release-approval.json', '../scripts/verify-release-approval.mjs', '../.github/workflows/pages.yml'];
  let release = null;
  let deployment = null;

  function mark(id, passed, title, detail) {
    const heading = $(`#${id}State`);
    heading.textContent = title;
    heading.className = passed ? 'good' : 'bad';
    $(`#${id}Detail`).textContent = detail;
    return passed;
  }

  async function fetchJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
    return response.json();
  }

  async function checkRoutes() {
    let passed = 0;
    for (const cabinet of release.cabinets) {
      try {
        const response = await fetch(`../${cabinet.route}`, { cache: 'no-store' });
        const text = await response.text();
        if (response.ok && /<!doctype html>|<html[\s>]/i.test(text)) passed += 1;
      } catch {
        // The final count explains the result without exposing browser internals.
      }
    }
    $('#routeState').textContent = `${passed}/${release.cabinetCount}`;
    $('#routeState').className = passed === release.cabinetCount ? 'good' : 'bad';
    $('#routeDetail').textContent = passed === release.cabinetCount
      ? 'Every published cabinet route returned an HTML document.'
      : 'At least one cabinet route was missing or did not return HTML.';
    return passed === release.cabinetCount;
  }

  async function checkPrivatePaths() {
    const visible = [];
    for (const path of privatePaths) {
      try {
        const response = await fetch(path, { cache: 'no-store' });
        if (response.ok) visible.push(path);
      } catch {
        // A network failure is not counted as public exposure.
      }
    }
    return mark('private', visible.length === 0, visible.length === 0 ? 'Hidden' : 'Exposed', visible.length === 0
      ? 'Approval records, workflows, and release-verification scripts are not public Pages files.'
      : `Unexpected public paths: ${visible.join(', ')}`);
  }

  async function run() {
    $('#status').textContent = 'Checking deployment identity, routes, and public-file boundaries…';
    const results = [];
    try {
      [deployment, release] = await Promise.all([fetchJson('../deployment.json'), fetchJson('../release.json')]);
      const secure = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
      results.push(mark('https', secure, secure ? 'Secure' : 'Not HTTPS', secure ? 'The QA tools are running in a secure or local development context.' : 'Use the published HTTPS Pages address for physical-device QA.'));

      const validIdentity = deployment.schema === 'larriverse-deployment'
        && deployment.schemaVersion === 1
        && (/^[a-f0-9]{40}$/i.test(deployment.sourceCommit) || deployment.sourceCommit === 'local-build')
        && Boolean(deployment.builtAt);
      results.push(mark('identity', validIdentity, validIdentity ? 'Identified' : 'Invalid', validIdentity
        ? `Build ${String(deployment.sourceCommit).slice(0, 12)} has a generated timestamp and source identity.`
        : 'The deployment identity file is missing or malformed.'));

      const aligned = deployment.release === release.version
        && deployment.candidate === release.candidate
        && deployment.releaseState === release.releaseState;
      results.push(mark('release', aligned, aligned ? 'Aligned' : 'Mismatch', aligned
        ? `${release.title} ${release.candidate} matches the deployed build metadata.`
        : 'The deployment and release manifest disagree. Do not collect human evidence.'));

      $('#commit').textContent = deployment.sourceCommit;
      $('#builtAt').textContent = new Date(deployment.builtAt).toLocaleString();
      $('#runId').textContent = deployment.workflowRunId || 'local build';
      $('#releaseLabel').textContent = `${deployment.release} ${deployment.candidate}`;

      results.push(await checkRoutes());
      results.push(await checkPrivatePaths());
      const passed = results.filter(Boolean).length;
      $('#score').textContent = `${passed}/5`;
      $('#summaryTitle').textContent = passed === 5 ? 'Deployment is ready for human rehearsal' : 'Deployment needs attention';
      $('#summaryTitle').className = passed === 5 ? 'good' : 'bad';
      $('#status').textContent = passed === 5
        ? 'All deployment checks passed. Gameplay and physical-phone judgment are still human tasks.'
        : 'One or more deployment checks failed. Do not use this build for final evidence yet.';
    } catch (error) {
      console.error(error);
      $('#summaryTitle').textContent = 'Deployment metadata unavailable';
      $('#summaryTitle').className = 'bad';
      $('#status').textContent = `Readiness check stopped: ${error.message}`;
    }
  }

  $('#rerun').addEventListener('click', run);
  run();
})();
