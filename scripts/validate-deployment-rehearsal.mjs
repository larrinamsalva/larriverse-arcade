import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let checks = 0;
const assert = (condition, message) => {
  checks += 1;
  if (!condition) throw new Error(`Deployment rehearsal validation failed: ${message}`);
};
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const exists = (relative) => fs.existsSync(path.join(root, relative));

const required = [
  'qa/readiness.html',
  'qa/readiness.css',
  'qa/readiness.js',
  'qa/evidence-preflight.html',
  'qa/evidence-preflight.css',
  'qa/evidence-preflight.js',
  'docs/DEPLOYMENT-REHEARSAL.md',
  'scripts/build-pages-site.mjs',
  'tests/browser/rehearsal.spec.mjs'
];
for (const file of required) assert(exists(file), `missing ${file}`);
for (const file of ['qa/readiness.js', 'qa/evidence-preflight.js', 'scripts/build-pages-site.mjs', 'scripts/validate-deployment-rehearsal.mjs', 'tests/browser/rehearsal.spec.mjs']) {
  execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' });
  assert(true, `${file} syntax must pass`);
}

const build = read('scripts/build-pages-site.mjs');
const readinessHtml = read('qa/readiness.html');
const readinessCss = read('qa/readiness.css');
const readinessJs = read('qa/readiness.js');
const preflightHtml = read('qa/evidence-preflight.html');
const preflightCss = read('qa/evidence-preflight.css');
const preflightJs = read('qa/evidence-preflight.js');
const docs = read('docs/DEPLOYMENT-REHEARSAL.md');
const checklist = read('docs/RELEASE-CHECKLIST.md');
const pagesWorkflow = read('.github/workflows/pages.yml');
const config = read('playwright.config.mjs');
const rehearsalTests = read('tests/browser/rehearsal.spec.mjs');
const release = json('release.json');
const packageJson = json('package.json');

assert(build.includes("schema: 'larriverse-deployment'"), 'deployment schema missing');
assert(build.includes('schemaVersion: 1'), 'deployment schemaVersion missing');
assert(build.includes('GITHUB_SHA'), 'deployment must record source commit');
assert(build.includes('GITHUB_RUN_ID'), 'deployment must record workflow run');
assert(build.includes("crypto.createHash('sha256')"), 'release manifest digest missing');
assert(build.includes("path.join(out, 'deployment.json')"), 'deployment.json output missing');
assert(build.includes("publishesApprovalRecord: false"), 'approval publication boundary missing');
assert(build.includes("publishesPrivateEvidence: false"), 'private evidence boundary missing');
assert(build.includes("'qa/readiness.html'"), 'readiness route must be published');
assert(build.includes("'qa/evidence-preflight.html'"), 'preflight route must be published');
assert(build.includes("fs.rmSync(path.join(out, 'docs', 'release-approval.json')"), 'approval record must be stripped');
assert(build.includes("Forbidden preview path published"), 'forbidden path guard missing');
assert(build.includes("GitHub Pages build requires a full source commit SHA"), 'Actions source SHA guard missing');

assert(readinessHtml.includes('Is this the build we meant to test?'), 'readiness purpose missing');
assert(readinessHtml.includes('It does not play games or approve a release.'), 'readiness human boundary missing');
assert(readinessHtml.includes('role="status"') && readinessHtml.includes('aria-live="polite"'), 'readiness status must be accessible');
assert(readinessHtml.includes('evidence-preflight.html'), 'readiness must link preflight');
assert(readinessCss.includes(':focus-visible'), 'readiness focus style missing');
assert(readinessCss.includes('@media(max-width:560px)'), 'readiness mobile layout missing');
assert(readinessJs.includes("fetchJson('../deployment.json')"), 'readiness must load deployment identity');
assert(readinessJs.includes("fetchJson('../release.json')"), 'readiness must load release manifest');
assert(readinessJs.includes('for (const cabinet of release.cabinets)'), 'readiness must check all cabinet routes');
assert(readinessJs.includes("'../docs/release-approval.json'"), 'readiness must test approval privacy');
assert(readinessJs.includes("'../scripts/verify-release-approval.mjs'"), 'readiness must test script privacy');
assert(readinessJs.includes("'../.github/workflows/pages.yml'"), 'readiness must test workflow privacy');
assert(readinessJs.includes("location.protocol === 'https:'"), 'readiness must check HTTPS');
assert(readinessJs.includes("deployment.release === release.version"), 'release alignment check missing');
assert(readinessJs.includes("passed === release.cabinetCount"), 'complete route gate missing');
assert(!/sendBeacon|XMLHttpRequest|WebSocket|geolocation|watchPosition|getUserMedia/i.test(readinessJs), 'readiness must not upload or request sensors');
assert(!/https?:\/\//i.test(readinessHtml + readinessCss + readinessJs), 'readiness must use same-origin resources only');

assert(preflightHtml.includes('Check the evidence before approval.'), 'preflight purpose missing');
assert(preflightHtml.includes('No uploads. No repository writes. No release decision.'), 'preflight boundary missing');
assert(preflightHtml.includes('Gallery approval JSON'), 'gallery input missing');
assert(preflightHtml.includes('Desktop QA JSON'), 'desktop input missing');
assert(preflightHtml.includes('Physical-phone QA JSON'), 'phone input missing');
assert(preflightHtml.includes('release-approval.html'), 'final approval link missing');
assert(preflightCss.includes(':focus-visible'), 'preflight focus style missing');
assert(preflightCss.includes('@media(max-width:760px)'), 'preflight mobile layout missing');
assert(preflightJs.includes("schema !== 'larriverse-gallery-approval'"), 'gallery schema validation missing');
assert(preflightJs.includes("schema !== 'larriverse-release-qa'"), 'QA schema validation missing');
assert(preflightJs.includes('value.schemaVersion !== 2'), 'QA schema v2 requirement missing');
assert(preflightJs.includes("value.deviceRole !== role"), 'device role validation missing');
assert(preflightJs.includes("role === 'physical-phone'"), 'physical-phone branch missing');
assert(preflightJs.includes('maxTouchPoints'), 'touch capability validation missing');
assert(preflightJs.includes('requiredDeviceChecks'), 'device-wide checks missing');
assert(preflightJs.includes("result.route !== 'reachable'"), 'route pass validation missing');
assert(preflightJs.includes("result.result !== 'pass'"), 'gameplay pass validation missing');
assert(preflightJs.includes('hashes.desktop !== hashes.phone'), 'distinct evidence requirement missing');
assert(preflightJs.includes("schema: 'larriverse-evidence-rehearsal'"), 'rehearsal schema missing');
assert(preflightJs.includes('createsReleaseApproval: false'), 'rehearsal must not claim approval');
assert(preflightJs.includes("crypto.subtle.digest('SHA-256'"), 'evidence hashing missing');
assert(preflightJs.includes('MAX_FILE_BYTES = 2_000_000'), 'file size limit missing');
assert(!preflightJs.includes("schema: 'larriverse-release-approval'"), 'preflight must not create release approval');
assert(!/sendBeacon|XMLHttpRequest|WebSocket|geolocation|watchPosition|getUserMedia/i.test(preflightJs), 'preflight must not upload or request sensors');
assert(!/https?:\/\//i.test(preflightHtml + preflightCss + preflightJs), 'preflight must use local resources only');

assert(release.deployment?.schema === 'larriverse-deployment', 'release deployment schema missing');
assert(release.deployment?.manifest === 'deployment.json', 'deployment manifest path mismatch');
assert(release.deployment?.readinessRoute === 'qa/readiness.html', 'readiness route mismatch');
assert(release.deployment?.evidencePreflightRoute === 'qa/evidence-preflight.html', 'preflight route mismatch');
assert(release.deployment?.generatedAtDeploy === true, 'deployment identity must be generated');
assert(release.deployment?.publishesApprovalRecord === false, 'release must preserve approval privacy');
assert(release.evidenceRehearsal?.schema === 'larriverse-evidence-rehearsal', 'rehearsal release metadata missing');
assert(release.evidenceRehearsal?.createsReleaseApproval === false, 'rehearsal approval boundary missing');
assert(release.evidenceRehearsal?.requiredFiles?.length === 3, 'rehearsal must require three files');
assert(release.evidenceRehearsal?.uploadsData === false, 'rehearsal upload boundary missing');

assert(packageJson.scripts.validate.includes('validate-deployment-rehearsal.mjs'), 'normal validation must include Phase 15 contract');
assert(packageJson.scripts['build:pages'] === 'node scripts/build-pages-site.mjs', 'Pages build command mismatch');
assert(pagesWorkflow.includes('Validate complete arcade and QA contracts'), 'Pages must validate before build');
assert(pagesWorkflow.includes('Build allowlisted static preview and deployment identity'), 'Pages identity build step missing');
assert(pagesWorkflow.includes('test -f _site/deployment.json'), 'Pages must verify deployment manifest');
assert(pagesWorkflow.includes('test ! -e _site/docs/release-approval.json'), 'Pages must verify approval exclusion');
assert(pagesWorkflow.includes('Record deployment identity'), 'Pages summary step missing');
assert(pagesWorkflow.indexOf('npm run validate') < pagesWorkflow.indexOf('npm run build:pages'), 'validation must precede build');
assert(pagesWorkflow.indexOf('npm run build:pages') < pagesWorkflow.indexOf('actions/deploy-pages@v4'), 'build must precede deploy');

assert(config.includes('node scripts/build-pages-site.mjs && python3 -m http.server'), 'browser QA must serve production-shaped _site');
assert(config.includes('--directory _site'), 'browser QA server must use allowlisted artifact');
assert(rehearsalTests.includes("page.goto('/qa/readiness.html'"), 'browser test must visit readiness');
assert(rehearsalTests.includes("page.goto('/qa/evidence-preflight.html'"), 'browser test must visit preflight');
assert(rehearsalTests.includes("toHaveText('5/5')"), 'browser test must require all readiness checks');
assert(rehearsalTests.includes("toHaveText('8/8')"), 'browser test must require eight routes');
assert(rehearsalTests.includes("toBeDisabled()"), 'browser test must keep preflight export blocked');
assert(rehearsalTests.includes('assertNoHorizontalOverflow'), 'new pages need overflow checks');

assert(docs.includes('Search-engine indexing is not used as release evidence.'), 'docs must reject indexing as proof');
assert(docs.includes('larriverse-evidence-rehearsal'), 'docs must name rehearsal schema');
assert(docs.includes('cannot be committed as `docs/release-approval.json`'), 'docs must preserve approval boundary');
assert(docs.includes('upload nothing'), 'docs must state upload boundary');
assert(checklist.includes('deployment identity'), 'checklist must include deployment identity');
assert(checklist.includes('evidence preflight'), 'checklist must include evidence preflight');

const fakeSha = 'a'.repeat(40);
execFileSync(process.execPath, [path.join(root, 'scripts', 'build-pages-site.mjs')], {
  cwd: root,
  env: { ...process.env, GITHUB_ACTIONS: 'true', GITHUB_SHA: fakeSha, GITHUB_RUN_ID: '12345', GITHUB_RUN_NUMBER: '15', GITHUB_REF_NAME: 'main' },
  stdio: 'pipe'
});
const deployment = json('_site/deployment.json');
assert(deployment.schema === 'larriverse-deployment', 'built deployment schema mismatch');
assert(deployment.sourceCommit === fakeSha, 'built deployment source SHA mismatch');
assert(deployment.release === release.version && deployment.candidate === release.candidate, 'built deployment release mismatch');
assert(/^[a-f0-9]{64}$/.test(deployment.releaseManifestSha256), 'built release digest invalid');
assert(exists('_site/qa/readiness.html'), 'built readiness page missing');
assert(exists('_site/qa/evidence-preflight.html'), 'built preflight page missing');
assert(!exists('_site/docs/release-approval.json'), 'built site exposed approval record');
assert(!exists('_site/scripts'), 'built site exposed scripts');
assert(!exists('_site/.github'), 'built site exposed workflows');
fs.rmSync(path.join(root, '_site'), { recursive: true, force: true });

console.log(`Deployment rehearsal validation passed ${checks} checks.`);
