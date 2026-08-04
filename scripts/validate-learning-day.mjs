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
  'assets/learning-day.js',
  'today/index.html',
  'today/today.css',
  'today/today.js',
  'docs/MY-LEARNING-DAY.md',
  'tests/browser/learning-day.spec.mjs'
];
for (const file of requiredFiles) check(exists(file), `${file} exists`);

const goalEngine = read('assets/learning-goals.js');
const engine = read('assets/learning-day.js');
const html = read('today/index.html');
const css = read('today/today.css');
const page = read('today/today.js');
const lobby = read('index.html');
const goalsPage = read('goals/index.html');
const build = read('scripts/build-pages-site.mjs');
const packageJson = JSON.parse(read('package.json'));
const docs = read('docs/MY-LEARNING-DAY.md');
const browserTest = read('tests/browser/learning-day.spec.mjs');

for (const required of [
  '<main id="todayMain">',
  'id="pacePicker"',
  'value="quick"',
  'value="steady"',
  'value="deep"',
  'id="activeStep"',
  'id="choiceGrid"',
  'id="finishStep"',
  'id="releaseStep"',
  'id="historyGrid"',
  'id="downloadDay"',
  'aria-live="polite"',
  '../assets/learning-day.js',
  'today.js'
]) check(html.includes(required), `Learning Day HTML includes ${required}`);
check((html.match(/name="pace"/g) || []).length === 3, 'Learning Day exposes exactly three pace choices');
check(html.includes('This is a choice board, not a schedule.'), 'Learning Day visibly rejects scheduling pressure');
check(html.includes('Releasing it is a change of direction, not a failure.'), 'Learning Day visibly rejects failure framing');
check(html.includes('Missing a day changes nothing.'), 'Learning Day visibly rejects missed-day penalties');
check(!/<textarea|type="text"|type="date"|type="time"|type="email"/.test(html), 'Learning Day collects no free text, dates, times, or email');

for (const required of [
  "const STORAGE_KEY = 'larriverse.learningDay.v1'",
  "const SCHEMA = 'larriverse-learning-day'",
  'const VERSION = 1',
  'const MAX_HISTORY = 6',
  "label: 'Quick Spark'",
  "label: 'Steady Quest'",
  "label: 'Deep Dive'",
  'function suggestions(catalog = [], pace = \'steady\')',
  'function start(choice)',
  'function release()',
  'function complete(catalog = [])',
  'function clearHistory()',
  'function progress(active, current = currentSnapshot())',
  'storesFreeText: false',
  'usesTimers: false',
  'usesSchedules: false',
  'usesDeadlines: false',
  'usesStreaks: false',
  'usesGrades: false',
  'includesRawFamilyRecords: false',
  'includesLocationData: false',
  'window.LarriVerseLearningDay'
]) check(engine.includes(required), `Learning Day engine includes ${required}`);
check((engine.match(/localStorage\.setItem/g) || []).length === 1, 'Learning Day engine has one intentional storage-write path');
check(engine.includes('if (state.active) throw new Error'), 'Learning Day enforces one active step');
check(engine.includes('if (!status.complete) throw new Error'), 'Learning Day blocks premature celebration');
check(engine.includes('Math.max(0, raw - baseline)'), 'Learning Day counts only activity after the chosen baseline');
check(engine.includes('.slice(0, MAX_HISTORY)'), 'Learning Day limits celebration history');
check(!/setInterval|setTimeout|requestAnimationFrame/.test(engine), 'Learning Day engine contains no timer loop');
check(!/navigator\.geolocation|watchPosition|getCurrentPosition|sendBeacon|WebSocket|XMLHttpRequest/.test(engine), 'Learning Day engine requests no sensors and uploads no data');
check(!/fetch\(/.test(engine), 'Learning Day engine performs no network requests');
check(!/deadlineAt|dueDate|overdueAt|missedDay|streakCount|leaderboardRank|gradeValue|punishment/i.test(engine), 'Learning Day engine contains no pressure-state fields');
check(!/larriverse\.kidscoin|pinDigest|familyTasks|rewardRequests|coordinates|latitude|longitude|password/i.test(engine), 'Learning Day engine does not read family, credential, or location records');

for (const required of [
  'function renderChoices(summary)',
  'function renderActive(summary)',
  'function renderHistory(summary)',
  'function safeExport()',
  "schema: 'larriverse-learning-day-summary'",
  'includesFreeText: false',
  'includesTimers: false',
  'includesSchedules: false',
  'includesDeadlines: false',
  'includesStreaks: false',
  'includesGrades: false',
  'Day.start(choice)',
  'Day.complete(catalog)',
  'Day.release()',
  'Day.clearHistory()',
  'window.LarriVerseLearningDayBoard'
]) check(page.includes(required), `Learning Day page logic includes ${required}`);
check((page.match(/fetch\(/g) || []).length === 1 && page.includes("fetch('../games/catalog.json')"), 'Learning Day page fetches only the local cabinet catalog');
check(!/navigator\.geolocation|watchPosition|getCurrentPosition|sendBeacon|WebSocket|XMLHttpRequest/.test(page), 'Learning Day page requests no sensors and uploads no data');
check(!/textarea|freeText|noteText|deadlineAt|dueDate|setInterval/.test(page), 'Learning Day page stores no notes, deadlines, or timer loops');
check(page.includes("$('#finishStep').disabled = !active.complete"), 'Learning Day UI disables celebration until measured completion');

check(css.includes('@media (max-width: 640px)'), 'Learning Day has a physical-phone layout');
check(css.includes('@media print'), 'Learning Day has a print layout');
check(css.includes('button:focus-visible') && css.includes('a:focus-visible') && css.includes('input:focus-visible'), 'Learning Day has visible keyboard focus');
check(css.includes('html.larriverse-large-text') && css.includes('html.larriverse-high-contrast') && css.includes('html.larriverse-reduced-motion'), 'Learning Day follows shared comfort classes');
check(css.includes('@media (prefers-reduced-motion: reduce)'), 'Learning Day respects operating-system reduced motion');

check(lobby.includes('href="today/"'), 'lobby links to My Learning Day');
check(lobby.includes('<h3>My Learning Day</h3>'), 'release overview describes My Learning Day');
check(lobby.includes('small preset goal and Learning Day records'), 'lobby backup description includes Learning Day');
check(goalsPage.includes('../today/'), 'Learning Goals links to My Learning Day');
check(build.includes("directories.splice(5, 0, 'today')"), 'Pages build allowlists the today directory');
check(build.includes("learningDay: 'today/index.html'"), 'deployment identity publishes the Learning Day route');
for (const file of ['assets/learning-day.js', 'today/index.html', 'today/today.css', 'today/today.js']) {
  check(build.includes(`'${file}'`), `Pages build requires ${file}`);
}
check(packageJson.scripts.validate.includes('validate-learning-day.mjs'), 'normal validation includes the Learning Day validator');

for (const required of [
  "page.goto('/today/')",
  "toHaveCount(3)",
  "toBeDisabled()",
  "larriverse.learningDay.v1",
  "larriverse-learning-day-summary",
  'includesTimers: false',
  'includesSchedules: false',
  'includesDeadlines: false',
  'includesStreaks: false',
  'includesGrades: false'
]) check(browserTest.includes(required), `browser test includes ${required}`);

check(docs.includes('Three optional choices'), 'documentation explains the three-choice model');
check(docs.includes('Quick Spark'), 'documentation explains Quick Spark');
check(docs.includes('Steady Quest'), 'documentation explains Steady Quest');
check(docs.includes('Deep Dive'), 'documentation explains Deep Dive');
check(docs.includes('Only activity after that baseline counts'), 'documentation explains the active-step baseline');
check(docs.includes('at most one preset active step'), 'documentation explains the one-step limit');
check(docs.includes('contains no custom notes'), 'documentation states the privacy boundary');
check(docs.includes('requests no sensors and uploads nothing'), 'documentation states the network and sensor boundary');

for (const file of ['assets/learning-day.js', 'today/today.js', 'tests/browser/learning-day.spec.mjs']) {
  const syntax = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  check(syntax.status === 0, `${file} passes node --check`);
}

const storage = new Map();
const profile = {
  name: 'Day Tester',
  avatar: '🌤️',
  level: 3,
  xp: 180,
  sessions: 7,
  completedSessions: 5,
  games: {
    'creature-catcher': { sessions: 4 },
    'road-trip-quest': { sessions: 3 }
  }
};
let uuidCount = 0;
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
  crypto: { randomUUID: () => `12345678-1234-1234-1234-${String(++uuidCount).padStart(12, '0')}` }
};
context.window = { LarriVerseArcade: { summary: () => profile }, dispatchEvent: () => {} };
context.globalThis = context;
storage.set('larriverse.learningPath.v1', JSON.stringify({
  games: { 'creature-catcher': { stats: { math: { attempts: 4, correct: 2 } } } }
}));
vm.runInNewContext(goalEngine, context);
vm.runInNewContext(engine, context);
const Goals = context.window.LarriVerseLearningGoals;
const Day = context.window.LarriVerseLearningDay;
Goals.create({ type: 'subject-answers', subject: 'math', target: 6 });
const catalog = [
  { id: 'creature-catcher', title: 'Creature Catcher', href: 'games/creature-catcher/index.html', icon: '🦊' },
  { id: 'road-trip-quest', title: 'Road Trip Quest', href: 'games/road-trip-quest/index.html', icon: '🚐' }
];
const choices = Day.suggestions(catalog, 'steady');
check(choices.length === 3, 'functional: exactly three optional choices are generated');
check(choices[0].source === 'goal' && choices[0].type === 'subject-answers', 'functional: an incomplete pinned goal is considered first');
check(choices[0].target === 3, 'functional: Steady Quest sizes the pinned-goal step to three answers');
Day.start(choices[0]);
check(Day.summary(catalog).active.value === 0, 'functional: a chosen step begins at zero');
let prematureBlocked = false;
try { Day.complete(catalog); } catch { prematureBlocked = true; }
check(prematureBlocked, 'functional: celebration is blocked before real progress');
storage.set('larriverse.learningPath.v1', JSON.stringify({
  games: { 'creature-catcher': { stats: { math: { attempts: 7, correct: 5 } } } }
}));
check(Day.summary(catalog).active.complete === true, 'functional: three new answers complete the active step');
Day.complete(catalog);
check(Day.summary(catalog).active === null, 'functional: celebration clears the active step');
check(Day.summary(catalog).history.length === 1, 'functional: celebration adds one recent win');
const xpBefore = profile.xp;
Day.start({ source: 'suggestion', pace: 'quick', type: 'xp-growth', target: 9 });
check(Day.summary(catalog).active.value === 0, 'functional: a second step records a fresh baseline');
check(Day.release() === true, 'functional: an active step can be released');
check(Day.summary(catalog).active === null, 'functional: release leaves no failure state');
check(profile.xp === xpBefore, 'functional: release does not change arcade progress');
const privacy = Day.summary(catalog).privacy;
check(privacy.storesFreeText === false && privacy.usesTimers === false && privacy.usesSchedules === false, 'functional: summary rejects notes, timers, and schedules');
check(privacy.usesDeadlines === false && privacy.usesStreaks === false && privacy.usesGrades === false, 'functional: summary rejects deadlines, streaks, and grades');
Day.clearHistory();
check(Day.summary(catalog).history.length === 0, 'functional: celebration history clears without touching goals or arcade progress');
check(Goals.summary(catalog).totals.pinned === 1, 'functional: Learning Day actions do not change pinned goals');

if (failures.length) {
  console.error(`My Learning Day validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}

console.log(`My Learning Day validation passed ${checks.length} checks, including measured baseline, completion-lock, release, and privacy tests.`);
