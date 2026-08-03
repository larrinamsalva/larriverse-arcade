import fs from 'node:fs';
import path from 'node:path';
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
  '.github/workflows/pages.yml',
  'docs/DEVICE-QA.md',
  'qa/index.html',
  'qa/qa.css',
  'qa/qa.js',
  'qa/release-approval.html',
  'qa/release-approval.js',
  'scripts/build-pages-site.mjs',
  'scripts/verify-release-approval.mjs'
];
for (const file of required) assert(exists(file), `missing ${file}`);
for (const file of ['qa/qa.js', 'qa/release-approval.js', 'scripts/build-pages-site.mjs', 'scripts/verify-release-approval.mjs', 'scripts/validate-guided-device-qa.mjs']) {
  const result = execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' });
  assert(result !== null, `${file} syntax passes`);
}

const qaHtml = read('qa/index.html');
const qaCss = read('qa/qa.css');
const qaJs = read('qa/qa.js');
const approvalHtml = read('qa/release-approval.html');
const approvalJs = read('qa/release-approval.js');
const verifier = read('scripts/verify-release-approval.mjs');
const builder = read('scripts/build-pages-site.mjs');
const pages = read('.github/workflows/pages.yml');
const guide = read('docs/DEVICE-QA.md');
const checklist = read('docs/RELEASE-CHECKLIST.md');
const release = json('release.json');
const pkg = json('package.json');

assert(qaHtml.includes('Test the real device, not the idea of it.'), 'guided QA heading missing');
assert(qaHtml.includes('value="desktop"'), 'desktop device option missing');
assert(qaHtml.includes('value="physical-phone"'), 'physical-phone option missing');
assert(qaHtml.includes('id="deviceName"'), 'device name field missing');
assert(qaHtml.includes('id="shareTestLink"'), 'test-link handoff missing');
assert(qaHtml.includes('id="exportReport"') && qaHtml.includes('disabled'), 'report export must begin blocked');
assert(qaHtml.includes('data-device-check="controls"'), 'controls check missing');
assert(qaHtml.includes('data-device-check="accessibility"'), 'accessibility check missing');
assert(qaHtml.includes('data-device-check="backupRestore"'), 'backup check missing');
assert(qaHtml.includes('data-device-check="privacy"'), 'privacy check missing');
assert(qaHtml.includes('data-device-check="sound"'), 'sound check missing');
assert(qaHtml.includes('data-device-check="deviceComfort"'), 'device comfort check missing');
assert(qaHtml.includes('No uploads. No screenshots. No location request.'), 'visible QA privacy boundary missing');
assert(qaHtml.includes('Route checks do not count as gameplay passes') || qaJs.includes('Route checks do not count as gameplay passes.'), 'route/manual boundary missing');
assert(qaHtml.includes('DEVICE-QA.md'), 'device guide link missing');
assert(qaCss.includes('@media(max-width:420px)'), 'phone layout missing');
assert(qaCss.includes(':focus-visible'), 'visible focus missing');

assert(qaJs.includes("const STORAGE_KEY = 'larriverse.releaseSmoke.v2'"), 'QA v2 storage key missing');
assert(qaJs.includes("const DEVICE_CLASSES = ['desktop', 'physical-phone']"), 'device class allowlist missing');
assert(qaJs.includes('schemaVersion: 2'), 'QA report schema v2 missing');
assert(qaJs.includes('deviceClass: profile.deviceClass'), 'QA report device class missing');
assert(qaJs.includes('deviceName: profile.deviceName.trim()'), 'QA report device name missing');
assert(qaJs.includes('deviceChecks: { ...profile.deviceChecks }'), 'QA report device checks missing');
assert(qaJs.includes('maxTouchPoints: Number(navigator.maxTouchPoints)'), 'touch metadata missing');
assert(qaJs.includes('locationGrantedDuringEvidence: false'), 'location boundary missing from report');
assert(qaJs.includes('profile.deviceClass') && qaJs.includes('state.profiles'), 'separate device profiles missing');
assert(qaJs.includes('reportReady()'), 'report readiness gate missing');
assert(qaJs.includes("entry.route === 'reachable' && entry.result === 'pass'"), 'all routes and passes required');
assert(qaJs.includes('CHECK_KEYS.every'), 'all device checks required');
assert(qaJs.includes('navigator.share') && qaJs.includes('navigator.clipboard.writeText'), 'phone handoff support missing');
assert(!/geolocation|watchPosition|sendBeacon|XMLHttpRequest|WebSocket/i.test(qaJs), 'QA page must not request location or upload data');
assert(!/https?:\/\//i.test(qaHtml + qaCss + qaJs), 'QA page must not load external resources');

assert(approvalHtml.includes('schema-v2 desktop report'), 'approval console must describe v2 evidence');
assert(approvalHtml.includes('physical-phone'), 'approval console must identify physical-phone evidence');
assert(approvalJs.includes('value.schemaVersion !== 2'), 'approval must require QA schema v2');
assert(approvalJs.includes('expectedDeviceClass'), 'approval must check expected device class');
assert(approvalJs.includes("kind === 'desktop' ? 'desktop' : 'physical-phone'"), 'desktop/phone import roles missing');
assert(approvalJs.includes('environment.maxTouchPoints'), 'phone touch check missing');
assert(approvalJs.includes('REQUIRED_DEVICE_CHECKS.every'), 'approval must require device-wide checks');
assert(approvalJs.includes('hashes.desktop !== hashes.mobile'), 'duplicate desktop/phone evidence blocked');
assert(approvalJs.includes('device === evidence.mobile.deviceName'), 'physical device identity agreement missing');
assert(approvalJs.includes('qaSchemaVersion: 2'), 'final approval must record QA schema version');
assert(!/geolocation|watchPosition|sendBeacon|XMLHttpRequest|WebSocket/i.test(approvalJs), 'approval console must not request location or upload data');

assert(verifier.includes("approval.qaSchemaVersion !== 2"), 'repository verifier must require QA schema v2');
assert(verifier.includes("verifyQa(approval.desktopQa, 'desktop QA', 'desktop')"), 'desktop verifier role missing');
assert(verifier.includes("verifyQa(approval.physicalMobileQa, 'physical mobile QA', 'physical-phone')"), 'phone verifier role missing');
assert(verifier.includes('environment.maxTouchPoints'), 'repository phone touch check missing');
assert(verifier.includes('desktop and phone evidence files must be different'), 'repository duplicate evidence check missing');
assert(verifier.includes('deviceChecks?.[key] !== true'), 'repository device-wide checks missing');

assert(pages.includes('name: Deploy LarriVerse Arcade'), 'Pages workflow name missing');
assert(pages.includes('workflow_dispatch:'), 'Pages manual redeploy must remain available');
assert(pages.includes('push:') && pages.includes('branches: [main]'), 'Pages must deploy only merged main');
assert(pages.includes('pages: write') && pages.includes('id-token: write'), 'Pages permissions missing');
assert(pages.includes('actions/checkout@v6'), 'Pages checkout version missing');
assert(pages.includes('actions/configure-pages@v5'), 'Pages configuration action missing');
assert(pages.includes('actions/upload-pages-artifact@v4'), 'Pages artifact action missing');
assert(pages.includes('actions/deploy-pages@v4'), 'Pages deployment action missing');
assert(pages.includes('npm run validate'), 'Pages deployment must validate first');
assert(pages.includes('node scripts/build-pages-site.mjs'), 'Pages allowlist build missing');
assert(pages.indexOf('npm run validate') < pages.indexOf('actions/deploy-pages@v4'), 'validation must precede deployment');
assert(pages.includes('path: _site'), 'Pages must deploy the allowlisted site');

assert(builder.includes("const directories = ['assets', 'games', 'qa', 'docs']"), 'preview directory allowlist missing');
assert(builder.includes("fs.rmSync(path.join(out, 'docs', 'release-approval.json')"), 'private final approval must be removed');
assert(builder.includes("fs.writeFileSync(path.join(out, '.nojekyll')"), 'nojekyll marker missing');
assert(builder.includes('Forbidden preview path published'), 'preview forbidden-path guard missing');
assert(builder.includes('private evidence or credential file'), 'preview credential guard missing');
assert(!builder.includes("fs.cpSync(root, out"), 'builder must not copy the whole repository');

assert(guide.includes('Settings') && guide.includes('Pages') && guide.includes('GitHub Actions'), 'one-time Pages setup missing');
assert(guide.includes('workflow_dispatch') && guide.includes('pull-request branches are never published'), 'deployment boundary missing');
assert(guide.includes('https://larrinamsalva.github.io/larriverse-arcade/qa/'), 'expected QA URL missing');
assert(guide.includes('touch-capable') && guide.includes('desktop') && guide.includes('physical-phone'), 'device evidence distinction missing');
assert(guide.includes('upload nothing') && guide.includes('request no location'), 'device guide privacy boundary missing');
assert(checklist.includes('schema-v2 desktop') && checklist.includes('schema-v2 physical-phone'), 'release checklist must require labeled device reports');

assert(pkg.scripts.validate.includes('validate-guided-device-qa.mjs'), 'normal validation must include guided QA audit');
assert(pkg.scripts['build:pages'] === 'node scripts/build-pages-site.mjs', 'Pages build script missing');
assert(release.deviceQa?.schemaVersion === 2, 'release device QA schema missing');
assert(JSON.stringify(release.deviceQa?.requiredDeviceClasses) === JSON.stringify(['desktop', 'physical-phone']), 'required device classes mismatch');
assert(release.deviceQa?.separateLocalRecords === true, 'separate local records flag missing');
assert(release.deviceQa?.physicalPhoneTouchRequired === true, 'phone touch requirement missing');
assert(release.deviceQa?.uploadsData === false && release.deviceQa?.requestsLocation === false, 'device QA privacy flags missing');
assert(release.preview?.workflow === '.github/workflows/pages.yml', 'preview workflow metadata missing');
assert(release.preview?.manualDeployment === false && release.preview?.deployOnMain === true, 'preview main deployment metadata missing');
assert(release.preview?.qaUrl === 'https://larrinamsalva.github.io/larriverse-arcade/qa/', 'preview QA URL mismatch');

if (failures.length) {
  console.error(`Guided device QA validation failed (${failures.length} failures):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Guided device QA validation passed ${checks} checks.`);
