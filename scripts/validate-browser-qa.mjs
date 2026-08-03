import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let checks = 0;
const assert = (condition, message) => {
  checks += 1;
  if (!condition) throw new Error(`Browser QA validation failed: ${message}`);
};
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const json = relative => JSON.parse(read(relative));
const exists = relative => fs.existsSync(path.join(root, relative));

const required = [
  'playwright.config.mjs',
  'tests/browser/arcade.spec.mjs',
  '.github/workflows/browser-qa.yml',
  'docs/BROWSER-QA.md'
];
for (const file of required) assert(exists(file), `missing ${file}`);

const config = read('playwright.config.mjs');
const tests = read('tests/browser/arcade.spec.mjs');
const workflow = read('.github/workflows/browser-qa.yml');
const releaseWorkflow = read('.github/workflows/release.yml');
const docs = read('docs/BROWSER-QA.md');
const checklist = read('docs/RELEASE-CHECKLIST.md');
const release = json('release.json');
const packageJson = json('package.json');

assert(config.includes("testDir: './tests/browser'"), 'Playwright test directory must be explicit');
assert(config.includes("name: 'desktop-chromium'"), 'desktop Chromium project missing');
assert(config.includes("name: 'mobile-chromium'"), 'mobile Chromium project missing');
assert(config.includes('width: 1440, height: 900'), 'desktop viewport must match gallery target');
assert(config.includes('width: 390, height: 844'), 'mobile viewport must match gallery target');
assert(config.includes("python3 -m http.server 4173 --bind 127.0.0.1"), 'QA must use a local static server');
assert(config.includes("reducedMotion: 'reduce'"), 'browser contexts must request reduced motion');
assert(config.includes("trace: 'retain-on-failure'"), 'failure traces must be retained');
assert(config.includes("['html', { outputFolder: 'playwright-report'"), 'HTML report must be generated');

assert(tests.includes("const release = JSON.parse(fs.readFileSync(path.join(root, 'release.json')"), 'tests must use the release manifest');
assert(tests.includes('for (const cabinet of release.cabinets)'), 'tests must cover every release cabinet');
assert(tests.includes('window.LarriVerseArcade?.version'), 'tests must verify the shared SDK');
assert(tests.includes('window.LarriVerseArcade.exportData()'), 'tests must exercise backup export');
assert(tests.includes('window.LarriVerseArcade.importData(backup)'), 'tests must exercise backup restore');
assert(tests.includes('larriverse-reduced-motion'), 'tests must verify reduced motion');
assert(tests.includes('larriverse-high-contrast'), 'tests must verify high contrast');
assert(tests.includes('larriverse-large-text'), 'tests must verify larger text');
assert(tests.includes("page.keyboard.press('Tab')"), 'tests must include keyboard focus');
assert(tests.includes('assertNoHorizontalOverflow(page)'), 'tests must check viewport overflow');
assert(tests.includes("cabinet.id === 'road-trip-quest-gps'"), 'GPS cabinet must receive additional checks');
assert(tests.includes("navigator.permissions.query({ name: 'geolocation' })"), 'GPS permission state must be checked');
assert(tests.includes('takeCleanScreenshot'), 'tests must capture screenshots');
assert(tests.includes("page.on('pageerror'"), 'tests must collect page errors');
assert(tests.includes("message.type() !== 'error'"), 'tests must collect console errors');
assert(tests.includes('forbiddenRequest.test(url)'), 'tests must watch forbidden endpoints');
assert(!/grantPermissions|setGeolocation|watchPosition\s*\(/.test(tests), 'tests must not grant or start location tracking');

assert(workflow.includes('node-version: 22'), 'browser workflow must use Node 22');
assert(workflow.includes('@playwright/test@1.55.0'), 'Playwright version must be pinned');
assert(workflow.includes('playwright install --with-deps chromium'), 'Chromium dependencies must be installed');
assert(workflow.includes('playwright test --config=playwright.config.mjs'), 'workflow must run the configured suite');
assert(workflow.includes('actions/upload-artifact@v4'), 'browser evidence must be uploaded');
assert(workflow.includes('artifacts/screenshots/'), 'screenshot artifact path missing');
assert(workflow.includes('playwright-report/'), 'HTML report artifact path missing');
assert(workflow.includes('test-results/'), 'failure evidence path missing');
assert(workflow.includes('retention-days: 14'), 'QA evidence retention must be bounded');

assert(releaseWorkflow.includes('node-version: 22'), 'release workflow must use Node 22');
assert(releaseWorkflow.includes('@playwright/test@1.55.0'), 'release workflow must install pinned Playwright');
assert(releaseWorkflow.includes('playwright install --with-deps chromium'), 'release workflow must install Chromium');
assert(releaseWorkflow.includes('playwright test --config=playwright.config.mjs'), 'release workflow must run browser QA');
assert(releaseWorkflow.indexOf('playwright test --config=playwright.config.mjs') < releaseWorkflow.indexOf('gh release create'), 'browser QA must happen before release publication');

assert(packageJson.scripts.validate.includes('validate-browser-qa.mjs'), 'normal validation must include browser QA contract checks');
assert(release.candidate === 'rc.1', 'release manifest candidate must remain rc.1 until human QA is complete');
assert(release.browserQa?.runner === 'Playwright Chromium 1.55.0', 'release manifest must name the browser runner');
assert(release.browserQa?.projects?.length === 2, 'release manifest must declare two browser projects');
assert(release.browserQa?.grantsLocation === false, 'browser QA must not grant location');
assert(release.browserQa?.humanApprovalRequired === true, 'screenshots must still require human approval');
assert(docs.includes('not automatically approved marketing images'), 'docs must separate evidence from approved gallery images');
assert(docs.includes('physical phone'), 'docs must preserve the real-device human gate');
assert(checklist.includes('Automated Chromium pass'), 'release checklist must document the browser gate');
assert(checklist.includes('Browser evidence does not replace'), 'release checklist must preserve human judgment');

console.log(`Browser QA contract validation passed ${checks} checks.`);
