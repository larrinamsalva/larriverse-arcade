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

const html = read('passport/index.html');
const css = read('passport/passport.css');
const js = read('passport/passport.js');
const lobby = read('index.html');
const build = read('scripts/build-pages-site.mjs');
const packageJson = json('package.json');
const catalog = json('games/catalog.json');

for (const relative of ['passport/index.html', 'passport/passport.css', 'passport/passport.js']) {
  check(fs.existsSync(path.join(root, relative)), `${relative} exists`);
}

for (const required of [
  '<main id="passportMain">',
  'id="identityName"',
  'id="learningGrid"',
  'id="cabinetGrid"',
  'id="achievementGrid"',
  'id="missionHeading"',
  'id="printPassport"',
  'id="downloadPassport"',
  'aria-live="polite"',
  '../assets/arcade-sdk.js',
  'passport.js'
]) check(html.includes(required), `passport HTML includes ${required}`);

check(html.includes('No account, age field, leaderboard, analytics, or cloud upload'), 'passport visibly explains its privacy boundary');
check(html.includes('not raw family tasks, location data, passwords'), 'passport visibly explains safe summary contents');
check((html.match(/<section/g) || []).length >= 7, 'passport has a substantial section structure');
check((html.match(/<h2/g) || []).length >= 6, 'passport has a clear heading hierarchy');
check(!/<input|<textarea|<select/.test(html), 'passport is read-only and collects no form data');

for (const required of [
  "const LEARNING_KEY = 'larriverse.learningPath.v1'",
  "const PASSPORT_SCHEMA = 'larriverse-progress-passport'",
  'function learningSummary()',
  'function cabinetSummary(profile)',
  'function achievementSummary(profile)',
  'function nextMission(profile, cabinets, learning)',
  'function buildSummary()',
  'includesRawFamilyRecords: false',
  'includesLocationData: false',
  'uploadsData: false',
  'window.LarriVerseProgressPassport',
  "fetch('../games/catalog.json')",
  'catalog.length !== 8',
  'window.print()'
]) check(js.includes(required), `passport logic includes ${required}`);

check(!/navigator\.geolocation|watchPosition|getCurrentPosition/.test(js), 'passport requests no location');
check(!/sendBeacon|WebSocket|XMLHttpRequest/.test(js), 'passport uses no upload or socket APIs');
check(!/fetch\([^)]*https?:\/\//.test(js), 'passport makes no external fetches');
check(!/larriverse\.kidscoin|family\.json|family-question/.test(js), 'passport does not read raw KidsCoin family records');
check(!/password|pinDigest|coordinates|latitude|longitude/i.test(js), 'passport summary logic contains no sensitive family or location fields');
check(js.includes("event.key?.startsWith('larriverse.')"), 'passport refreshes after local LarriVerse storage changes');
check(js.includes('Math.pow(level - 1, 2) * 36'), 'passport uses the shared level threshold formula');
check(js.includes('weakSubject.accuracy < 75'), 'passport next mission can recommend gentle practice');
check(js.includes('cabinets.find(game => game.sessions === 0)'), 'passport next mission can recommend an unvisited cabinet');

check(css.includes('@media(max-width:680px)'), 'passport has a mobile layout');
check(css.includes('@media print'), 'passport has a print layout');
check(css.includes('button:focus-visible,a:focus-visible'), 'passport has visible keyboard focus');
check(css.includes('.learning-grid'), 'passport styles learning trails');
check(css.includes('.cabinet-grid'), 'passport styles cabinet stamps');
check(css.includes('.achievement-grid'), 'passport styles achievements');

check(catalog.length === 8, 'catalog still contains eight cabinets');
check(catalog.every(game => game.available), 'all eight passport cabinet stamps are playable');
check(lobby.includes('href="passport/"'), 'lobby links to the Progress Passport');
check(lobby.includes('View my Progress Passport'), 'lobby hero promotes the Progress Passport');
check(lobby.includes('<h3>Progress Passport</h3>'), 'release section describes the Progress Passport');
check(build.includes("const directories = ['assets', 'games', 'qa', 'docs']"), 'Pages build preserves the established directory allowlist');
check(build.includes("directories.splice(2, 0, 'passport')"), 'Pages build inserts the passport directory into the allowlist');
check(build.includes("progressPassport: 'passport/index.html'"), 'deployment manifest exposes the passport route');
for (const file of ['passport/index.html', 'passport/passport.css', 'passport/passport.js']) {
  check(build.includes(`'${file}'`), `Pages build requires ${file}`);
}
check(packageJson.scripts.validate.includes('validate-progress-passport.mjs'), 'normal validation includes the passport validator');

const syntax = spawnSync(process.execPath, ['--check', path.join(root, 'passport/passport.js')], { encoding: 'utf8' });
check(syntax.status === 0, 'passport JavaScript passes node --check');

if (failures.length) {
  console.error(`Progress Passport validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}

console.log(`Progress Passport validation passed ${checks.length} checks for ${catalog.length} cabinet stamps.`);
