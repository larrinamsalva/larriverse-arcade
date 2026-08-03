import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { TextEncoder } from 'node:util';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let checks = 0;
const failures = [];
const assert = (condition, message) => {
  checks += 1;
  if (!condition) failures.push(message);
};
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const exists = (relative) => fs.existsSync(path.join(root, relative));

const required = [
  'qa/evidence-contract.js',
  'qa/release-room.html',
  'qa/release-room.css',
  'qa/release-room.js',
  'qa/evidence-preflight.html',
  'qa/evidence-preflight.js',
  'qa/release-approval.html',
  'qa/release-approval.js',
  'docs/RELEASE-ROOM.md',
  'tests/browser/rehearsal.spec.mjs'
];
for (const file of required) assert(exists(file), `missing ${file}`);
for (const file of [
  'qa/evidence-contract.js',
  'qa/release-room.js',
  'qa/evidence-preflight.js',
  'qa/release-approval.js',
  'scripts/validate-release-room.mjs',
  'tests/browser/rehearsal.spec.mjs'
]) {
  execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' });
  assert(true, `${file} syntax must pass`);
}

const contract = read('qa/evidence-contract.js');
const roomHtml = read('qa/release-room.html');
const roomCss = read('qa/release-room.css');
const roomJs = read('qa/release-room.js');
const preflightHtml = read('qa/evidence-preflight.html');
const preflightJs = read('qa/evidence-preflight.js');
const approvalHtml = read('qa/release-approval.html');
const approvalJs = read('qa/release-approval.js');
const qaJs = read('qa/qa.js');
const builder = read('scripts/build-pages-site.mjs');
const deploymentValidator = read('scripts/validate-deployment-rehearsal.mjs');
const guidedValidator = read('scripts/validate-guided-device-qa.mjs');
const evidenceValidator = read('scripts/validate-release-evidence.mjs');
const browserTests = read('tests/browser/rehearsal.spec.mjs');
const docs = read('docs/RELEASE-ROOM.md');
const checklist = read('docs/RELEASE-CHECKLIST.md');
const release = json('release.json');
const packageJson = json('package.json');

assert(contract.includes("window.LarriVerseEvidence"), 'shared browser contract export missing');
assert(contract.includes("deviceClass === expectedDeviceClass"), 'deviceClass contract missing');
assert(contract.includes('value.environment.maxTouchPoints'), 'environment touch metadata contract missing');
assert(contract.includes("schema: 'larriverse-evidence-bundle'"), 'evidence bundle schema missing');
assert(contract.includes('createsReleaseApproval: false'), 'bundle authority boundary missing');
assert(contract.includes('MAX_FILE_BYTES = 2_000_000'), 'evidence file size limit missing');
assert(contract.includes('MAX_BUNDLE_BYTES = 6_500_000'), 'bundle size limit missing');
assert(contract.includes("crypto.subtle.digest('SHA-256'"), 'evidence hashing missing');
assert(contract.includes('desktop and phone evidence files must be different'), 'distinct device evidence requirement missing');
assert(contract.includes('QA evidence contains a forbidden location field'), 'forbidden location-key check missing');
assert(!/sendBeacon|XMLHttpRequest|WebSocket|geolocation|watchPosition|getUserMedia/i.test(contract), 'contract must not upload or request sensors');

assert(qaJs.includes('deviceClass: profile.deviceClass'), 'guided QA must export deviceClass');
assert(qaJs.includes('environment: environmentDetails()'), 'guided QA must export environment metadata');
assert(!preflightJs.includes('deviceRole'), 'preflight must not use obsolete deviceRole');
assert(!preflightJs.includes('value.device?.maxTouchPoints'), 'preflight must not use obsolete device touch path');
assert(preflightHtml.indexOf('evidence-contract.js') < preflightHtml.indexOf('evidence-preflight.js'), 'preflight must load shared contract first');
assert(approvalHtml.indexOf('evidence-contract.js') < approvalHtml.indexOf('release-approval.js'), 'approval must load shared contract first');
assert(preflightJs.includes('Contract.readEvidenceFile'), 'preflight must use shared contract');
assert(approvalJs.includes('Contract.readEvidenceFile'), 'approval must use shared contract for individual files');
assert(approvalJs.includes('Contract.readBundleFile'), 'approval must use shared contract for bundles');
assert(approvalJs.includes("schema: 'larriverse-release-approval'"), 'approval schema must remain separate');
assert(approvalJs.includes('handoffBundle:'), 'final approval must record optional handoff identity');

assert(roomHtml.includes('One room for the final handoff.'), 'Release Room purpose missing');
assert(roomHtml.includes('No uploads. No automatic approval. No tag creation.'), 'Release Room authority boundary missing');
assert(roomHtml.includes('id="galleryFile"') && roomHtml.includes('id="desktopFile"') && roomHtml.includes('id="phoneFile"'), 'Release Room evidence inputs missing');
assert(roomHtml.includes('id="exportBundle"') && roomHtml.includes('disabled'), 'bundle export must begin blocked');
assert(roomHtml.includes('release-approval.html'), 'Release Room final approval link missing');
assert(roomHtml.indexOf('evidence-contract.js') < roomHtml.indexOf('release-room.js'), 'Release Room must load shared contract first');
assert(roomCss.includes(':focus-visible'), 'Release Room focus style missing');
assert(roomCss.includes('@media(max-width:760px)'), 'Release Room mobile layout missing');
assert(roomJs.includes("fetchText('../deployment.json')"), 'Release Room must load deployment identity');
assert(roomJs.includes("fetchText('../release.json')"), 'Release Room must load release manifest');
assert(roomJs.includes("location.protocol === 'https:'"), 'Release Room must require live HTTPS for export');
assert(roomJs.includes('for (const cabinet of release.cabinets)'), 'Release Room must check all cabinet routes');
assert(roomJs.includes("'../docs/release-approval.json'"), 'Release Room must verify approval privacy');
assert(roomJs.includes('Contract.createBundle'), 'Release Room bundle creation missing');
assert(roomJs.includes('Contract.validateEvidenceSet'), 'Release Room complete evidence gate missing');
assert(roomJs.includes('deploymentReady && evidenceReady()'), 'Release Room must require deployment and evidence');
assert(!roomJs.includes("schema: 'larriverse-release-approval'"), 'Release Room must not create final approval');
assert(!/sendBeacon|XMLHttpRequest|WebSocket|geolocation|watchPosition|getUserMedia/i.test(roomJs), 'Release Room must not upload or request sensors');
assert(!/https?:\/\//i.test(roomHtml + roomCss), 'Release Room markup must not load external resources');

assert(approvalHtml.includes('Release Room evidence bundle'), 'final approval bundle input missing');
assert(approvalHtml.includes('No automatic approval'), 'final approval must preserve human authority');
assert(approvalJs.includes('items.physicalPhone.value.deviceName'), 'final approval phone identity check missing');
assert(approvalJs.includes('items.desktop.sha256'), 'final approval desktop hash missing');
assert(approvalJs.includes('items.physicalPhone.sha256'), 'final approval phone hash missing');
assert(!/sendBeacon|XMLHttpRequest|WebSocket|geolocation|watchPosition|getUserMedia/i.test(approvalJs), 'approval must not upload or request sensors');

assert(release.evidenceContract?.script === 'qa/evidence-contract.js', 'release evidence contract path missing');
assert(release.evidenceContract?.deviceClassField === 'deviceClass', 'release device class field mismatch');
assert(release.evidenceContract?.touchField === 'environment.maxTouchPoints', 'release touch field mismatch');
assert(release.evidenceBundle?.schema === 'larriverse-evidence-bundle', 'release bundle schema missing');
assert(release.evidenceBundle?.schemaVersion === 1, 'release bundle schemaVersion missing');
assert(release.evidenceBundle?.route === 'qa/release-room.html', 'release room route mismatch');
assert(release.evidenceBundle?.createsReleaseApproval === false, 'release bundle authority boundary missing');
assert(release.evidenceBundle?.requiredDocuments?.length === 3, 'release bundle must require three documents');
assert(release.deployment?.releaseRoomRoute === 'qa/release-room.html', 'deployment release room route missing');
assert(release.galleryReview?.approvalConsole === 'qa/release-approval.html', 'final approval route must remain unchanged');

assert(builder.includes("releaseRoom: release.deployment.releaseRoomRoute"), 'deployment manifest Release Room route missing');
assert(builder.includes("'qa/release-room.html'"), 'Pages builder must require Release Room');
assert(builder.includes("'qa/evidence-contract.js'"), 'Pages builder must require shared evidence contract');
assert(deploymentValidator.includes("'qa/release-room.html'"), 'deployment validator must cover Release Room');
assert(guidedValidator.includes('evidence-contract.js'), 'guided validator must cover shared evidence contract');
assert(evidenceValidator.includes('evidence-contract.js'), 'release evidence validator must cover shared evidence contract');
assert(packageJson.scripts.validate.includes('validate-release-room.mjs'), 'normal validation must include Phase 16 contract');

assert(browserTests.includes("page.goto('/qa/release-room.html'"), 'browser tests must visit Release Room');
assert(browserTests.includes("page.goto('/qa/release-approval.html'"), 'browser tests must visit final approval');
assert(browserTests.includes('shared evidence contract accepts schema-v2'), 'browser contract round-trip test missing');
assert(browserTests.includes("schema: 'larriverse-evidence-bundle'"), 'browser bundle round-trip missing');
assert(browserTests.includes("desktopClass: 'desktop'"), 'browser desktop schema assertion missing');
assert(browserTests.includes("phoneClass: 'physical-phone'"), 'browser phone schema assertion missing');
assert(browserTests.includes('assertNoHorizontalOverflow'), 'new pages need overflow checks');

assert(docs.includes('deviceClass') && docs.includes('environment.maxTouchPoints'), 'Release Room docs must name the canonical QA fields');
assert(docs.includes('larriverse-evidence-bundle'), 'Release Room docs must name bundle schema');
assert(docs.includes('does not approve the release'), 'Release Room docs must preserve authority boundary');
assert(docs.includes('uploads nothing'), 'Release Room docs must state privacy boundary');
assert(checklist.includes('Release Room'), 'release checklist must include Release Room');
assert(checklist.includes('evidence bundle'), 'release checklist must include evidence bundle');

const context = { window: null, crypto: crypto.webcrypto, TextEncoder, console };
context.window = context;
vm.runInNewContext(contract, context, { filename: 'evidence-contract.js' });
const api = context.LarriVerseEvidence;
assert(Boolean(api), 'shared contract must execute in a browser-like context');

const entries = [];
for (const project of ['desktop-chromium', 'mobile-chromium']) {
  for (const subjectId of ['lobby', ...release.cabinets.map((cabinet) => cabinet.id)]) {
    entries.push({ project, subjectId, status: 'approved', sha256: 'a'.repeat(64), alt: `Approved descriptive screenshot of ${subjectId} on ${project}.` });
  }
}
const gallery = {
  schema: 'larriverse-gallery-approval', schemaVersion: 1, release: release.version, candidate: release.candidate,
  sourceCommit: 'b'.repeat(40), reviewer: 'Validator', reviewedAt: new Date().toISOString(),
  checks: { privacy: true, layout: true, accuracy: true, altText: true, humanBoundary: true }, entries
};
const makeQa = (deviceClass) => ({
  schema: 'larriverse-release-qa', schemaVersion: 2, release: release.version, candidate: release.candidate,
  deviceClass, deviceName: deviceClass === 'desktop' ? 'Validation desktop' : 'Validation phone', tester: 'Validator',
  userAgent: 'Validator browser agent', exportedAt: new Date().toISOString(), locationGrantedDuringEvidence: false,
  environment: { viewportWidth: 390, viewportHeight: 844, maxTouchPoints: deviceClass === 'physical-phone' ? 5 : 0 },
  deviceChecks: Object.fromEntries(release.deviceQa.requiredDeviceChecks.map((key) => [key, true])),
  results: release.cabinets.map((cabinet) => ({ id: cabinet.id, title: cabinet.title, route: 'reachable', result: 'pass' }))
});
api.validateGallery(gallery, release);
assert(true, 'shared contract accepts valid gallery evidence');
api.validateQa(makeQa('desktop'), release, 'desktop');
assert(true, 'shared contract accepts canonical desktop evidence');
api.validateQa(makeQa('physical-phone'), release, 'physical-phone');
assert(true, 'shared contract accepts canonical phone evidence');
let obsoleteRejected = false;
try { api.validateQa({ ...makeQa('desktop'), deviceClass: undefined, deviceRole: 'desktop' }, release, 'desktop'); } catch { obsoleteRejected = true; }
assert(obsoleteRejected, 'shared contract must reject obsolete deviceRole evidence');

const documents = {
  gallery: JSON.stringify(gallery),
  desktop: JSON.stringify(makeQa('desktop')),
  physicalPhone: JSON.stringify(makeQa('physical-phone'))
};
const items = {};
for (const [kind, text] of Object.entries(documents)) {
  items[kind] = { kind, text, value: JSON.parse(text), sha256: await api.digestText(text), bytes: text.length };
}
const deployment = {
  schema: 'larriverse-deployment', schemaVersion: 1, release: release.version, candidate: release.candidate,
  sourceCommit: 'c'.repeat(40), builtAt: new Date().toISOString(), repository: 'larrinamsalva/larriverse-arcade',
  workflowRunId: '16', workflowRunNumber: '16', releaseManifestSha256: 'd'.repeat(64)
};
const bundle = api.createBundle({ release, deployment, items });
assert(bundle.schema === 'larriverse-evidence-bundle', 'shared contract must create bundle schema');
const checkedBundle = await api.validateBundle(bundle, release);
assert(checkedBundle.items.desktop.value.deviceClass === 'desktop', 'bundle desktop device class changed');
assert(checkedBundle.items.physicalPhone.value.deviceClass === 'physical-phone', 'bundle phone device class changed');
assert(checkedBundle.items.desktop.sha256 !== checkedBundle.items.physicalPhone.sha256, 'bundle device evidence hashes must differ');

const fakeSha = 'e'.repeat(40);
execFileSync(process.execPath, [path.join(root, 'scripts', 'build-pages-site.mjs')], {
  cwd: root,
  env: { ...process.env, GITHUB_ACTIONS: 'true', GITHUB_SHA: fakeSha, GITHUB_RUN_ID: '1600', GITHUB_RUN_NUMBER: '16', GITHUB_REF_NAME: 'main' },
  stdio: 'pipe'
});
const builtDeployment = json('_site/deployment.json');
assert(builtDeployment.routes.releaseRoom === 'qa/release-room.html', 'built deployment Release Room route mismatch');
assert(exists('_site/qa/release-room.html'), 'built Release Room page missing');
assert(exists('_site/qa/evidence-contract.js'), 'built shared evidence contract missing');
assert(!exists('_site/docs/release-approval.json'), 'built site exposed final approval');
fs.rmSync(path.join(root, '_site'), { recursive: true, force: true });

if (failures.length) {
  console.error(`Release Room validation failed (${failures.length} failures):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Release Room validation passed ${checks} checks.`);
