import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const failures = [];
const checks = [];
const check = (condition, message) => (condition ? checks : failures).push(message);
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const json = relative => JSON.parse(read(relative));

const html = read('report/index.html');
const css = read('report/report.css');
const js = read('report/report.js');
const lobby = read('index.html');
const passport = read('passport/index.html');
const build = read('scripts/build-pages-site.mjs');
const packageJson = json('package.json');
const catalog = json('games/catalog.json');
const browserTest = read('tests/browser/family-learning-report.spec.mjs');
const documentation = read('docs/FAMILY-LEARNING-REPORT.md');

for (const relative of [
  'report/index.html',
  'report/report.css',
  'report/report.js',
  'docs/FAMILY-LEARNING-REPORT.md',
  'tests/browser/family-learning-report.spec.mjs'
]) check(fs.existsSync(path.join(root, relative)), `${relative} exists`);

for (const required of [
  '<main id="reportMain">',
  'id="identityName"',
  'id="strengthCards"',
  'id="practiceCards"',
  'id="subjectGrid"',
  'id="learningPathGrid"',
  'id="cabinetReport"',
  'id="recentActivity"',
  'id="conversationStarters"',
  'id="printReport"',
  'id="downloadReport"',
  'aria-live="polite"',
  '../assets/arcade-sdk.js',
  'report.js'
]) check(html.includes(required), `report HTML includes ${required}`);

check(html.includes('it is not a grade, diagnosis, ranking, or certification'), 'report visibly rejects high-stakes interpretation');
check(html.includes('Local and read-only'), 'report visibly states its local read-only boundary');
check(html.includes('does not create an account'), 'report visibly rejects account creation');
check(html.includes('save review notes'), 'report visibly states that review notes are not saved');
check(html.includes('practice suggestions as invitations'), 'report frames practice as optional invitations');
check((html.match(/<section/g) || []).length >= 7, 'report has a substantial section structure');
check((html.match(/<h2/g) || []).length >= 5, 'report has a clear heading hierarchy');
check(!/<input|<textarea|<select/.test(html), 'report collects no form data or notes');

for (const required of [
  "const LEARNING_KEY = 'larriverse.learningPath.v1'",
  "const REPORT_SCHEMA = 'larriverse-family-learning-report'",
  'const REPORT_VERSION = 1',
  'function learningPaths()',
  'function aggregateSubjects(paths)',
  'function cabinetSummary(profile)',
  'function learningInsights(subjects)',
  'function recentActivity(cabinets)',
  'function conversationStarters(insights, cabinets, subjects)',
  'function buildReport()',
  'subject.attempts >= 2',
  'subject.accuracy >= 80',
  'subject.accuracy < 75',
  'includesRawFamilyRecords: false',
  'includesLocationData: false',
  'storesReviewNotes: false',
  'uploadsData: false',
  'notAGrade: true',
  'notADiagnosis: true',
  'notARanking: true',
  'notACertification: true',
  'window.LarriVerseFamilyLearningReport',
  "fetch('../games/catalog.json')",
  'catalog.length !== 8',
  'window.print()'
]) check(js.includes(required), `report logic includes ${required}`);

check(!/localStorage\.setItem|localStorage\.removeItem|localStorage\.clear/.test(js), 'report never changes browser progress or stores notes');
check(!/navigator\.geolocation|watchPosition|getCurrentPosition/.test(js), 'report requests no location');
check(!/sendBeacon|WebSocket|XMLHttpRequest/.test(js), 'report uses no upload or socket APIs');
check(!/fetch\([^)]*https?:\/\//.test(js), 'report makes no external fetches');
check((js.match(/fetch\(/g) || []).length === 1, 'report fetches only the local cabinet catalog');
check(!/larriverse\.kidscoin|family\.json|family-question|pinDigest|familyTasks|rewardRequests/i.test(js), 'report does not read raw KidsCoin family records');
check(!/coordinates|latitude|longitude|password/i.test(js), 'report export logic contains no sensitive family or coordinate fields');
check(js.includes("event.key?.startsWith('larriverse.')"), 'report refreshes after local LarriVerse storage changes');
check(js.includes('.slice(0, 5)'), 'report limits recent activity to five cabinet timestamps');
check(js.includes('conversationStarters: starters'), 'report export includes the generated conversation prompts');

check(css.includes('@media(max-width:700px)'), 'report has a mobile layout');
check(css.includes('@media print'), 'report has a print layout');
check(css.includes('button:focus-visible,a:focus-visible'), 'report has visible keyboard focus');
check(css.includes('body.high-contrast'), 'report responds to shared high contrast');
check(css.includes('body.large-text'), 'report responds to shared larger text');
check(css.includes('body.reduce-motion'), 'report responds to shared reduced motion');
check(css.includes('.subject-grid'), 'report styles subject summaries');
check(css.includes('.cabinet-report'), 'report styles cabinet participation');

check(catalog.length === 8, 'catalog still contains eight cabinets');
check(catalog.every(game => game.available), 'all eight report cabinets are playable');
check(lobby.includes('href="report/"'), 'lobby links to the Family Learning Report');
check(lobby.includes('Family Learning Report'), 'lobby names the Family Learning Report');
check(passport.includes('../report/'), 'Progress Passport links to the Family Learning Report');
check(build.includes("directories.splice(3, 0, 'report')"), 'Pages build inserts the report directory into the allowlist');
check(build.includes("familyLearningReport: 'report/index.html'"), 'deployment manifest exposes the report route');
for (const file of ['report/index.html', 'report/report.css', 'report/report.js']) {
  check(build.includes(`'${file}'`), `Pages build requires ${file}`);
}
check(packageJson.scripts.validate.includes('validate-family-learning-report.mjs'), 'normal validation includes the report validator');

for (const required of [
  "page.goto('/report/')",
  "toHaveCount(8)",
  "toContainText('Math')",
  "toContainText('Reading')",
  "larriverse-family-learning-report",
  'includesRawFamilyRecords: false',
  'storesReviewNotes: false',
  'notAGrade: true'
]) check(browserTest.includes(required), `browser test includes ${required}`);

check(documentation.includes('not a grade, diagnosis, ranking, aptitude test, certification'), 'documentation states the healthy interpretation boundary');
check(documentation.includes('at least two answers and at least 80% accuracy'), 'documentation explains the strength threshold');
check(documentation.includes('at least two answers and below 75% accuracy'), 'documentation explains the practice threshold');
check(documentation.includes('excludes raw KidsCoin chores'), 'documentation explains excluded family records');

const syntax = spawnSync(process.execPath, ['--check', path.join(root, 'report/report.js')], { encoding: 'utf8' });
check(syntax.status === 0, 'report JavaScript passes node --check');

if (failures.length) {
  console.error(`Family Learning Report validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}

console.log(`Family Learning Report validation passed ${checks.length} checks for ${catalog.length} cabinet rows.`);
