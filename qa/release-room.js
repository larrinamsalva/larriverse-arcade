(() => {
  'use strict';

  const Contract = window.LarriVerseEvidence;
  const $ = (selector) => document.querySelector(selector);
  const items = { gallery: null, desktop: null, physicalPhone: null };
  const errors = { gallery: null, desktop: null, physicalPhone: null };
  let release = null;
  let deployment = null;
  let deploymentReady = false;

  function setClass(node, state) {
    node.className = state === 'good' ? 'good' : state === 'warn' ? 'warn' : 'bad';
  }

  function setMetric(selector, text, state) {
    const node = $(selector);
    node.textContent = text;
    setClass(node, state);
  }

  async function fetchText(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
    return response.text();
  }

  async function routeIsHtml(path) {
    const response = await fetch(`../${path}`, { cache: 'no-store' });
    if (!response.ok) return false;
    return /<!doctype html>|<html[\s>]/i.test(await response.text());
  }

  async function privatePathMissing(path) {
    const response = await fetch(path, { cache: 'no-store' });
    return response.status === 404;
  }

  async function checkDeployment() {
    deploymentReady = false;
    $('#checkDeployment').disabled = true;
    $('#deploymentMessage').textContent = 'Checking deployment identity, routes, and private-path exclusions…';
    try {
      const [releaseText, deploymentText] = await Promise.all([
        fetchText('../release.json'),
        fetchText('../deployment.json')
      ]);
      release = Contract.parseJsonText(releaseText, 'release manifest');
      deployment = Contract.parseJsonText(deploymentText, 'deployment identity');
      Contract.deploymentSummary(deployment, release);
      const releaseDigest = await Contract.digestText(releaseText);
      const releaseMatches = releaseDigest === deployment.releaseManifestSha256;
      const secureProduction = location.protocol === 'https:' && window.isSecureContext;
      const loopback = ['localhost', '127.0.0.1'].includes(location.hostname);
      setMetric('#secureState', secureProduction ? 'HTTPS' : loopback ? 'local rehearsal' : 'blocked', secureProduction ? 'good' : loopback ? 'warn' : 'bad');
      setMetric('#deploymentState', releaseMatches ? 'identity matches' : 'digest mismatch', releaseMatches ? 'good' : 'bad');

      $('#sourceCommit').textContent = deployment.sourceCommit;
      $('#builtAt').textContent = deployment.builtAt ? new Date(deployment.builtAt).toLocaleString() : 'unknown';
      $('#releaseIdentity').textContent = `${release.version} ${release.candidate}`;
      const repository = deployment.repository || 'larrinamsalva/larriverse-arcade';
      if (deployment.workflowRunId) {
        $('#workflowRun').href = `https://github.com/${repository}/actions/runs/${deployment.workflowRunId}`;
        $('#workflowRun').textContent = `#${deployment.workflowRunNumber || deployment.workflowRunId}`;
        $('#workflowRun').setAttribute('aria-disabled', 'false');
      }
      $('#galleryAction').href = `https://github.com/${repository}/actions/workflows/browser-qa.yml`;

      let routes = 0;
      for (const cabinet of release.cabinets) if (await routeIsHtml(cabinet.route)) routes += 1;
      setMetric('#routeState', `${routes}/${release.cabinetCount}`, routes === release.cabinetCount ? 'good' : 'bad');

      const privateChecks = await Promise.all([
        privatePathMissing('../docs/release-approval.json'),
        privatePathMissing('../scripts/verify-release-approval.mjs'),
        privatePathMissing('../.github/workflows/pages.yml')
      ]);
      const privateSafe = privateChecks.every(Boolean);
      setMetric('#privateState', privateSafe ? 'not published' : 'exposed', privateSafe ? 'good' : 'bad');

      deploymentReady = Boolean(secureProduction && releaseMatches && routes === release.cabinetCount && privateSafe);
      $('#deploymentMessage').textContent = deploymentReady
        ? 'The live HTTPS build matches its deployment identity and all eight cabinet routes are reachable.'
        : loopback && releaseMatches && routes === release.cabinetCount && privateSafe
          ? 'Local rehearsal passed, but bundle export stays blocked until this page runs from the live HTTPS deployment.'
          : 'Deployment verification is blocked. Repair the failed checks before creating a release handoff.';
    } catch (error) {
      setMetric('#deploymentState', 'failed', 'bad');
      $('#deploymentMessage').textContent = `Deployment check failed: ${error.message}`;
    } finally {
      $('#checkDeployment').disabled = false;
      update();
    }
  }

  async function loadEvidence(kind, file) {
    const state = $(`#${kind === 'physicalPhone' ? 'phone' : kind}State`);
    state.textContent = 'Checking…';
    state.className = '';
    errors[kind] = null;
    try {
      items[kind] = await Contract.readEvidenceFile(file, kind, release);
      state.textContent = kind === 'gallery' ? '18/18 approved' : `8/8 passed · ${items[kind].value.deviceName}`;
      state.className = 'good';
    } catch (error) {
      items[kind] = null;
      errors[kind] = error.message;
      state.textContent = error.message;
      state.className = 'bad';
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

  function update() {
    setMetric('#deploymentSummary', deploymentReady ? 'verified' : 'blocked', deploymentReady ? 'good' : 'bad');
    setMetric('#gallerySummary', items.gallery ? '18 approved' : 'missing', items.gallery ? 'good' : 'bad');
    setMetric('#desktopSummary', items.desktop ? '8 passed' : 'missing', items.desktop ? 'good' : 'bad');
    setMetric('#phoneSummary', items.physicalPhone ? '8 passed' : 'missing', items.physicalPhone ? 'good' : 'bad');

    const issueList = Object.entries(errors).filter(([, value]) => value);
    $('#issues').replaceChildren();
    if (!issueList.length) {
      const li = document.createElement('li');
      li.textContent = evidenceReady() ? 'No structural evidence problems detected.' : 'Load all three valid evidence files.';
      $('#issues').append(li);
    } else {
      for (const [kind, message] of issueList) {
        const li = document.createElement('li');
        li.textContent = `${kind}: ${message}`;
        $('#issues').append(li);
      }
    }

    const ready = Boolean(deploymentReady && evidenceReady());
    $('#exportBundle').disabled = !ready;
    $('#approvalLink').setAttribute('aria-disabled', ready ? 'false' : 'true');
    $('#status').textContent = ready
      ? 'The live deployment and all three evidence files are ready for a private handoff bundle.'
      : 'The release handoff is blocked until the live deployment and all three human evidence files pass.';
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

  function exportBundle() {
    if (!deploymentReady || !evidenceReady()) return;
    const bundle = Contract.createBundle({ release, deployment, items });
    downloadJson(bundle, `larriverse-${release.version}-${release.candidate}-evidence-bundle.json`);
    $('#status').textContent = 'Evidence bundle exported. It is not release approval; import it into the separate final approval console.';
  }

  async function init() {
    if (!Contract) throw new Error('shared evidence contract did not load');
    $('#galleryFile').addEventListener('change', (event) => loadEvidence('gallery', event.target.files[0]));
    $('#desktopFile').addEventListener('change', (event) => loadEvidence('desktop', event.target.files[0]));
    $('#phoneFile').addEventListener('change', (event) => loadEvidence('physicalPhone', event.target.files[0]));
    $('#checkDeployment').addEventListener('click', checkDeployment);
    $('#exportBundle').addEventListener('click', exportBundle);
    $('#approvalLink').addEventListener('click', (event) => {
      if ($('#approvalLink').getAttribute('aria-disabled') === 'true') event.preventDefault();
    });
    await checkDeployment();
  }

  init().catch((error) => {
    console.error(error);
    $('#status').textContent = `Release Room could not load: ${error.message}`;
  });
})();
