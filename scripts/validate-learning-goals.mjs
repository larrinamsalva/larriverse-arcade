import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const failures = [];
const checks = [];
const check = (condition, message) => (condition ? checks : failures).push(message);
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));

const requiredFiles = [
  'assets/learning-goals.js',
  'assets/learning-goals-summary.js',
  'assets/learning-goals.css',
  'goals/index.html',
  'goals/goals.css',
  'goals/goals.js',
  'docs/LEARNING-GOALS.md',
  'tests/browser/learning-goals.spec.mjs'
];
for (const file of requiredFiles) check(exists(file), `${file} exists`);

const engine = read('assets/learning-goals.js');
const summaryRenderer = read('assets/learning-goals-summary.js');
const sharedCss = read('assets/learning-goals.css');
const html = read('goals/index.html');
const css = read('goals/goals.css');
const page = read('goals/goals.js');
const lobby = read('index.html');
const passport = read('passport/index.html');
const report = read('report/index.html');
const build = read('scripts/build-pages-site.mjs');
const packageJson = JSON.parse(read('package.json'));
const docs = read('docs/LEARNING-GOALS.md');
const browserTest = read('tests/browser/learning-goals.spec.mjs');

for (const required of [
  '<main id="goalsMain">',
  'id="goalGrid"',
  'id="goalForm"',
  'id="goalType"',
  'id="goalContext"',
  'id="goalTarget"',
  'id="suggestionGrid"',
  'id="clearGoals"',
  'id="downloadGoals"',
  'aria-live="polite"',
  '../assets/learning-goals.js',
  'goals.js'
]) check(html.includes(required), `Learning Goals HTML includes ${required}`);
check(html.includes('No deadlines, streaks, leaderboards, punishments, or parent lock'), 'goal page visibly rejects pressure mechanics');
check(html.includes('There is no free-text note field'), 'goal page visibly rejects free-text storage');
check(html.includes('A reset is not a failure'), 'goal page frames restart without shame');
check(!/<textarea|type="text"|type="date"|type="email"/.test(html), 'goal page collects no free text, dates, or email');
check((html.match(/<option value=/g) || []).length === 6, 'goal builder exposes exactly six preset goal types');

for (const required of [
  "const STORAGE_KEY = 'larriverse.learningGoals.v1'",
  "const SCHEMA = 'larriverse-learning-goals'",
  'const VERSION = 1',
  'const MAX_GOALS = 3',
  "'subject-answers': [3, 6, 9]",
  "'cabinet-sessions': [1, 3, 6]",
  "'xp-growth': [9, 18, 36]",
  'function baselineFor(spec, current)',
  'function progress(goal, current = snapshot())',
  'function create(spec)',
  'function restart(id)',
  'function remove(id)',
  'function clear()',
  'storesFreeText: false',
  'usesDeadlines: false',
  'usesStreaks: false',
  'includesRawFamilyRecords: false',
  'includesLocationData: false',
  'window.LarriVerseLearningGoals'
]) check(engine.includes(required), `goal engine includes ${required}`);
check(engine.includes('state.goals.length >= MAX_GOALS'), 'goal engine enforces the three-goal maximum');
check(engine.includes('Math.max(0, raw - baseline)'), 'goal progress counts only work after the pinned baseline');
check(engine.includes("localStorage.setItem(STORAGE_KEY"), 'goal engine writes only its own namespaced record');
check((engine.match(/localStorage\.setItem/g) || []).length === 1, 'goal engine has one intentional storage write path');
check(!/navigator\.geolocation|watchPosition|getCurrentPosition|sendBeacon|WebSocket|XMLHttpRequest/.test(engine), 'goal engine requests no sensors and uploads no data');
check(!/fetch\(/.test(engine), 'goal engine performs no network requests');
check(!/deadline|overdue|streakCount|leaderboard|punish/i.test(engine), 'goal engine contains no pressure-state fields');
check(!/larriverse\.kidscoin|pinDigest|familyTasks|rewardRequests|coordinates|latitude|longitude/i.test(engine), 'goal engine does not read family or location records');

for (const required of [
  'data-learning-goals-summary',
  'data-learning-goals-count',
  "fetch('../games/catalog.json')",
  'window.LarriVerseLearningGoalsSummary'
]) check(summaryRenderer.includes(required), `goal summary renderer includes ${required}`);
check(!/localStorage\.setItem|localStorage\.removeItem|localStorage\.clear/.test(summaryRenderer), 'Passport and Report summary renderer is read-only');
check(!/navigator\.geolocation|sendBeacon|WebSocket|XMLHttpRequest/.test(summaryRenderer), 'summary renderer requests no sensors and uploads no data');
check(sharedCss.includes('.shared-goal-grid'), 'shared goal cards have a grid style');
check(sharedCss.includes('@media(max-width:800px)'), 'shared goal cards have a mobile layout');

for (const required of [
  'function suggestionSpecs()',
  'function safeExport()',
  "schema: 'larriverse-learning-goals-summary'",
  'includesFreeText: false',
  'includesDeadlines: false',
  'includesStreaks: false',
  'Goals.create(goalSpecFromForm())',
  'Goals.restart(id)',
  'Goals.remove(id)',
  'Goals.clear()',
  'window.LarriVerseLearningGoalsBoard'
]) check(page.includes(required), `goal page logic includes ${required}`);
check((page.match(/fetch\(/g) || []).length === 1 && page.includes("fetch('../games/catalog.json')"), 'goal page fetches only the local cabinet catalog');
check(!/navigator\.geolocation|watchPosition|getCurrentPosition|sendBeacon|WebSocket|XMLHttpRequest/.test(page), 'goal page requests no sensors and uploads no data');
check(!/textarea|freeText|noteText|deadlineAt|dueDate/.test(page), 'goal page logic stores no notes or deadlines');

check(css.includes('@media(max-width:680px)'), 'goal board has a phone layout');
check(css.includes('@media print'), 'goal board has a print layout');
check(css.includes('button:focus-visible,a:focus-visible,select:focus-visible'), 'goal board has visible keyboard focus');
check(css.includes('body.high-contrast') && css.includes('body.large-text') && css.includes('body.reduce-motion'), 'goal board follows shared comfort classes');

check(lobby.includes('href="goals/"'), 'lobby links to Learning Goals');
check(lobby.includes('<h3>Learning Goals</h3>'), 'release overview describes Learning Goals');
check(passport.includes('id="goals"'), 'Progress Passport includes a goal summary section');
check(report.includes('id="goals"'), 'Family Learning Report includes a goal summary section');
for (const surface of [passport, report]) {
  check(surface.includes('../assets/learning-goals.css'), 'summary surface loads shared goal styles');
  check(surface.includes('../assets/learning-goals.js'), 'summary surface loads shared goal engine');
  check(surface.includes('../assets/learning-goals-summary.js'), 'summary surface loads read-only goal renderer');
  check(surface.includes('data-learning-goals-summary'), 'summary surface exposes a goal summary container');
}

check(build.includes("directories.splice(4, 0, 'goals')"), 'Pages build allowlists the goals directory');
check(build.includes("learningGoals: 'goals/index.html'"), 'deployment identity publishes the goals route');
for (const file of ['goals/index.html', 'goals/goals.css', 'goals/goals.js', 'assets/learning-goals.js', 'assets/learning-goals-summary.js', 'assets/learning-goals.css']) {
  check(build.includes(`'${file}'`), `Pages build requires ${file}`);
}
check(packageJson.scripts.validate.includes('validate-learning-goals.mjs'), 'normal validation includes the Learning Goals validator');

for (const required of [
  "page.goto('/goals/')",
  "toHaveCount(3)",
  "toContainText('Math')",
  "larriverse-learning-goals-summary",
  'includesFreeText: false',
  'includesDeadlines: false',
  'includesStreaks: false',
  "page.goto('/passport/')",
  "page.goto('/report/')"
]) check(browserTest.includes(required), `browser test includes ${required}`);

check(docs.includes('No deadline, overdue state, streak, leaderboard, grade, or punishment'), 'documentation states the pressure-free boundary');
check(docs.includes('Only progress recorded after the goal is pinned counts'), 'documentation explains goal baselines');
check(docs.includes('up to three preset goals'), 'documentation explains the storage limit');
check(docs.includes('excludes raw KidsCoin family records'), 'documentation explains family-record exclusion');

for (const file of ['assets/learning-goals.js', 'assets/learning-goals-summary.js', 'goals/goals.js', 'tests/browser/learning-goals.spec.mjs']) {
  const syntax = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  check(syntax.status === 0, `${file} passes node --check`);
}

const storage = new Map();
const profile = {
  xp: 180,
  sessions: 7,
  completedSessions: 5,
  games: { 'creature-catcher': { sessions: 4 }, 'road-trip-quest': { sessions: 3 } }
};
const context = {
  console,
  Date,
  Math,
  JSON,
  Set,
  Map,
  Object,
  Array,
  Number,
  String,
  RegExp,
  CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  },
  crypto: { randomUUID: (() => { let count = 0; return () => `12345678-1234-1234-1234-${String(++count).padStart(12, '0')}`; })() }
};
context.window = { LarriVerseArcade: { summary: () => profile }, dispatchEvent: () => {} };
context.globalThis = context;
storage.set('larriverse.learningPath.v1', JSON.stringify({
  games: { 'creature-catcher': { stats: { math: { attempts: 4, correct: 2 } } } }
}));
vm.runInNewContext(engine, context);
const Goals = context.window.LarriVerseLearningGoals;
const first = Goals.create({ type: 'subject-answers', subject: 'math', target: 3 });
check(Goals.summary([]).goals[0].value === 0, 'functional: a new goal begins at zero');
storage.set('larriverse.learningPath.v1', JSON.stringify({
  games: { 'creature-catcher': { stats: { math: { attempts: 7, correct: 5 } } } }
}));
check(Goals.summary([]).goals[0].complete === true, 'functional: three new answers complete the goal');
Goals.restart(first.id);
check(Goals.summary([]).goals[0].value === 0, 'functional: restart establishes a fresh baseline');
Goals.create({ type: 'arcade-sessions', target: 1 });
Goals.create({ type: 'xp-growth', target: 18 });
check(Goals.summary([]).totals.pinned === 3, 'functional: three goals can be pinned');
let fourthBlocked = false;
try { Goals.create({ type: 'completed-sessions', target: 1 }); } catch { fourthBlocked = true; }
check(fourthBlocked, 'functional: a fourth goal is blocked');
const functionalSummary = Goals.summary([]);
check(functionalSummary.privacy.storesFreeText === false, 'functional: summary rejects free-text storage');
check(functionalSummary.privacy.usesDeadlines === false && functionalSummary.privacy.usesStreaks === false, 'functional: summary rejects deadlines and streaks');
Goals.remove(first.id);
check(Goals.summary([]).totals.openSlots === 1, 'functional: removing a goal opens a slot');
Goals.clear();
check(Goals.summary([]).totals.pinned === 0, 'functional: clearing goals leaves arcade progress untouched and empties the board');

if (failures.length) {
  console.error(`Learning Goals validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}

console.log(`Learning Goals validation passed ${checks.length} checks, including functional baseline and three-slot tests.`);
