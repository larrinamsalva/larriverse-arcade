import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let checks = 0;
const assert = (condition, message) => {
  checks += 1;
  if (!condition) throw new Error(`Release candidate validation failed: ${message}`);
};
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const exists = (relative) => fs.existsSync(path.join(root, relative));

const packageJson = json('package.json');
const release = json('release.json');
const catalog = json('games/catalog.json');
const qaHtml = read('qa/index.html');
const qaCss = read('qa/qa.css');
const qaJs = read('qa/qa.js');
const notes = read('docs/RELEASE-NOTES-1.0.0.md');
const checklist = read('docs/RELEASE-CHECKLIST.md');
const gallery = read('docs/CABINET-GALLERY.md');
const workflow = read('.github/workflows/release.yml');

assert(packageJson.version === '1.0.0', 'package version must remain 1.0.0');
assert(release.schemaVersion === 1, 'release schemaVersion must be 1');
assert(release.version === packageJson.version, 'release and package versions must match');
assert(release.candidate === 'rc.1', 'candidate must be rc.1');
assert(release.tag === `v${packageJson.version}`, 'tag must match package version');
assert(release.releaseState === 'candidate', 'release state must remain candidate before the tag is created');
assert(release.humanChecksRequired === true, 'human release checks must remain required');
assert(release.cabinetCount === 8, 'release must declare eight cabinets');
assert(Array.isArray(release.cabinets) && release.cabinets.length === 8, 'release must list eight cabinets');
assert(release.privacy.uploadsData === false, 'QA console must not upload data');
assert(release.privacy.requestsLocation === false, 'QA console must not request location');
assert(release.privacy.capturesScreenshots === false, 'QA console must not claim screenshot capture');
assert(release.privacy.qaStoragePrefix === 'larriverse.releaseSmoke.', 'QA storage prefix must be scoped');

const ids = new Set();
const routes = new Set();
for (const cabinet of release.cabinets) {
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cabinet.id), `unsafe cabinet id ${cabinet.id}`);
  assert(!ids.has(cabinet.id), `duplicate cabinet id ${cabinet.id}`);
  ids.add(cabinet.id);
  assert(typeof cabinet.title === 'string' && cabinet.title.length > 2, `${cabinet.id} needs a title`);
  assert(typeof cabinet.manualFocus === 'string' && cabinet.manualFocus.length > 40, `${cabinet.id} needs a meaningful manual focus`);
  assert(!cabinet.route.startsWith('/') && !cabinet.route.includes('..') && cabinet.route.endsWith('/index.html'), `${cabinet.id} route must be safe and relative`);
  assert(!routes.has(cabinet.route), `duplicate route ${cabinet.route}`);
  routes.add(cabinet.route);
  assert(exists(cabinet.route), `missing cabinet route ${cabinet.route}`);
  const match = catalog.find((game) => game.id === cabinet.id);
  assert(Boolean(match), `${cabinet.id} missing from catalog`);
  assert(match.available === true, `${cabinet.id} must be playable`);
  assert(match.href === cabinet.route, `${cabinet.id} route must match catalog`);
  assert(notes.includes(`**${cabinet.title}**`), `${cabinet.title} missing from release notes`);
  assert(checklist.includes(cabinet.title), `${cabinet.title} missing from release checklist`);
  assert(gallery.includes(cabinet.title), `${cabinet.title} missing from gallery manifest`);
}
assert(catalog.length === 8, 'catalog must contain eight entries');
assert(catalog.every((game) => game.available && game.featured), 'all release cabinets must be playable and featured');

for (const file of ['qa/index.html', 'qa/qa.css', 'qa/qa.js', 'docs/RELEASE-NOTES-1.0.0.md', '.github/workflows/release.yml']) {
  assert(exists(file), `missing release file ${file}`);
}
assert(qaHtml.includes('Test what automation cannot.'), 'QA console must explain human verification');
assert(qaHtml.includes('No uploads. No screenshots. No location request.'), 'QA privacy boundary must be visible');
assert(qaHtml.includes('role="status"') && qaHtml.includes('aria-live="polite"'), 'QA status updates must be announced');
assert(qaHtml.includes('target="_blank"') && qaHtml.includes('rel="noopener"'), 'cabinet tests must open safely in a new tab');
assert(qaHtml.includes('RELEASE-CHECKLIST.md') && qaHtml.includes('CABINET-GALLERY.md'), 'QA console must link release docs');
assert(qaCss.includes(':focus-visible'), 'QA console must show keyboard focus');
assert(qaCss.includes('@media(max-width:420px)'), 'QA console must include narrow mobile layout');
assert(qaJs.includes("const STORAGE_KEY = 'larriverse.releaseSmoke.v1'"), 'QA storage must use its dedicated local key');
assert(qaJs.includes("fetch(MANIFEST_URL, { cache: 'no-store' })"), 'QA console must load the release manifest locally');
assert(qaJs.includes('Route checks do not count as gameplay passes.'), 'QA console must not confuse route checks with manual passes');
assert(qaJs.includes("schema: 'larriverse-release-qa'"), 'QA export must use a named schema');
assert(qaJs.includes('navigator.userAgent'), 'QA report should record the browser under test');
assert(!/geolocation|watchPosition|sendBeacon|XMLHttpRequest|WebSocket/i.test(qaJs), 'QA console must not request location or upload data');
assert(!/https?:\/\//i.test(qaHtml + qaCss + qaJs), 'QA console must not load external resources');

assert(workflow.includes("tags:\n      - 'v*'"), 'release workflow must run only on version tags');
assert(workflow.includes('permissions:\n  contents: write'), 'release workflow needs contents write permission');
assert(workflow.includes('npm run validate'), 'release workflow must run full validation before publishing');
assert(workflow.includes('test "$GITHUB_REF_NAME" = "$EXPECTED_TAG"'), 'release workflow must verify the tag matches package version');
assert(workflow.includes('test "$PACKAGE_VERSION" = "$MANIFEST_VERSION"'), 'release workflow must verify manifest version');
assert(workflow.includes('gh release create'), 'release workflow must create a GitHub release');
assert(workflow.includes('--verify-tag'), 'release workflow must verify the pushed tag');
assert(workflow.indexOf('npm run validate') < workflow.indexOf('gh release create'), 'validation must happen before release creation');
assert(notes.includes('Real-device gameplay') && notes.includes('remain human release gates'), 'release notes must disclose manual gates');
assert(checklist.includes('Release only after the unchecked manual items'), 'manual release gate must remain explicit');

console.log(`Release candidate validation passed ${checks} checks.`);
