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
const unique = values => new Set(values).size === values.length;
const safeSlug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

const baseBank = json('games/learning-question-bank.json');
const pack = json('games/learning-question-pack-2.json');
const family = json('games/kidscoin-family/family.json');
const familyPack = json('games/kidscoin-family/family-question-pack-2.json');
const learningPath = read('assets/learning-path.js');
const familyLoader = read('games/kidscoin-family/family-data-loader.js');
const creatureHtml = read('games/creature-catcher/index.html');
const roadHtml = read('games/road-trip-quest/index.html');
const kidsHtml = read('games/kidscoin-family/index.html');
const packageJson = json('package.json');

check(pack.schemaVersion === 1, 'shared expansion schema version is 1');
check(pack.packId === 'learning-expansion-2', 'shared expansion pack ID is stable');
check(pack.review?.status === 'reviewed', 'shared expansion is reviewed');
check(pack.privacy?.deviceLocal === true, 'shared expansion is device-local content');
check(pack.privacy?.uploadsData === false, 'shared expansion uploads no data');
check(pack.privacy?.requestsLocation === false, 'shared expansion requests no location');

const subjects = ['math', 'reading', 'science', 'nature', 'trivia'];
const allSharedIds = [];
let baseTotal = 0;
let packTotal = 0;
for (const subject of subjects) {
  const baseQuestions = baseBank.subjects?.[subject] || [];
  const additions = pack.subjects?.[subject] || [];
  baseTotal += baseQuestions.length;
  packTotal += additions.length;
  check(baseQuestions.length === 16, `${subject}: base bank keeps 16 questions`);
  check(additions.length === 8, `${subject}: expansion adds exactly 8 questions`);
  check(baseQuestions.length + additions.length === 24, `${subject}: combined bank has 24 questions`);
  const levels = new Set(additions.map(question => question.difficulty));
  check(levels.has('starter') && levels.has('growing') && levels.has('challenge'), `${subject}: expansion covers all difficulty levels`);
  for (const question of [...baseQuestions, ...additions]) {
    allSharedIds.push(question.id);
    check(safeSlug(question.id), `${question.id}: shared question ID is safe`);
    check(typeof question.prompt === 'string' && question.prompt.trim().length >= 8, `${question.id}: prompt is useful`);
    check(Array.isArray(question.options) && question.options.length === 4, `${question.id}: four options exist`);
    check(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: answer index is valid`);
    check(typeof question.explanation === 'string' && question.explanation.trim().length >= 12, `${question.id}: explanation is useful`);
    check(['starter', 'growing', 'challenge'].includes(question.difficulty), `${question.id}: difficulty is supported`);
  }
}
check(baseTotal === 80, 'base shared bank remains 80 questions');
check(packTotal === 40, 'shared expansion contains 40 questions');
check(baseTotal + packTotal === 120, 'combined shared bank contains 120 questions');
check(unique(allSharedIds), 'combined shared question IDs are unique');

check(familyPack.schemaVersion === 1, 'KidsCoin expansion schema version is 1');
check(familyPack.packId === 'kidscoin-family-expansion-2', 'KidsCoin expansion pack ID is stable');
check(familyPack.review?.status === 'reviewed', 'KidsCoin expansion is reviewed');
check(familyPack.privacy?.deviceLocal === true, 'KidsCoin expansion is device-local content');
check(familyPack.privacy?.uploadsData === false, 'KidsCoin expansion uploads no data');

const familyIds = [];
let familyBaseTotal = 0;
let familyPackTotal = 0;
for (const lesson of family.lessons) {
  const additions = familyPack.questionsByLesson?.[lesson.id] || [];
  familyBaseTotal += lesson.questions.length;
  familyPackTotal += additions.length;
  check(lesson.questions.length === 6, `${lesson.id}: base lesson keeps 6 questions`);
  check(additions.length === 4, `${lesson.id}: expansion adds exactly 4 questions`);
  check(lesson.questions.length + additions.length === 10, `${lesson.id}: combined lesson has 10 questions`);
  for (const question of [...lesson.questions, ...additions]) {
    familyIds.push(question.id);
    check(safeSlug(question.id), `${question.id}: KidsCoin question ID is safe`);
    check(Array.isArray(question.options) && question.options.length === 4, `${question.id}: four options exist`);
    check(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: answer index is valid`);
    check(typeof question.explanation === 'string' && question.explanation.trim().length >= 15, `${question.id}: explanation is useful`);
  }
}
check(familyBaseTotal === 36, 'KidsCoin base bank remains 36 questions');
check(familyPackTotal === 24, 'KidsCoin expansion contains 24 questions');
check(familyBaseTotal + familyPackTotal === 60, 'KidsCoin combined bank contains 60 questions');
check(unique(familyIds), 'combined KidsCoin question IDs are unique');

for (const required of [
  "const STORAGE_KEY = 'larriverse.learningPath.v1'",
  "starter: { label: 'Starter'",
  "growing: { label: 'Growing'",
  "challenge: { label: 'Challenge'",
  "mixed: { label: 'Mixed'",
  'mergeBanks(base, pack)',
  'prepareBank(bank)',
  'rememberSeen(info)',
  'rememberAttempt(info, correct)',
  'window.LarriVerseLearningPath',
  'Progress stays in this browser'
]) check(learningPath.includes(required), `learning path includes ${required}`);
check(learningPath.includes("../games/learning-question-pack-2.json"), 'learning path loads the expansion pack');
check(learningPath.includes('const minimumDeck = Math.min(3, eligible.length)'), 'recent-question history resets only when fewer than three unseen questions remain');
check(learningPath.includes('localStorage.setItem'), 'learning path saves device-local progress');
check(learningPath.includes('location.reload()'), 'changing learning level reloads the prepared bank');
check(!/navigator\.geolocation|watchPosition|sendBeacon|WebSocket|XMLHttpRequest/.test(learningPath), 'learning path has no location or upload APIs');
check(!/fetch\([^)]*https?:\/\//.test(learningPath), 'learning path makes no external fetches');

for (const required of [
  'family-question-pack-2.json',
  'mergeQuestions(manifest, pack)',
  'window.KidsCoinFamilyData',
  'questions: totalQuestions',
  'window.fetch = nativeFetch'
]) check(familyLoader.includes(required), `KidsCoin loader includes ${required}`);
check(!/navigator\.geolocation|sendBeacon|WebSocket|XMLHttpRequest/.test(familyLoader), 'KidsCoin loader has no location or upload APIs');

check(creatureHtml.includes('id="learningPathControl"'), 'Creature Catcher has a learning-path host');
check(roadHtml.includes('id="learningPathControl"'), 'Road Trip Quest has a learning-path host');
check(creatureHtml.includes('96-question'), 'Creature Catcher describes its 96-question pool');
check(roadHtml.includes('96-question'), 'Road Trip Quest describes its 96-question pool');
check(kidsHtml.includes('60 family-planning questions'), 'KidsCoin describes its 60-question bank');
check(creatureHtml.indexOf('../../assets/learning-path.js') < creatureHtml.indexOf('game.js'), 'Creature Catcher loads the learning path before its engine');
check(roadHtml.indexOf('../../assets/learning-path.js') < roadHtml.indexOf('game.js'), 'Road Trip Quest loads the learning path before its engine');
check(kidsHtml.indexOf('family-data-loader.js') < kidsHtml.indexOf('game.js'), 'KidsCoin loads its data pack before its engine');

for (const relative of ['assets/learning-path.js', 'games/kidscoin-family/family-data-loader.js']) {
  const syntax = spawnSync(process.execPath, ['--check', path.join(root, relative)], { encoding: 'utf8' });
  check(syntax.status === 0, `${relative} passes node --check`);
}
check(packageJson.scripts.validate.includes('validate-adaptive-learning-paths.mjs'), 'normal validation includes adaptive learning paths');

if (failures.length) {
  console.error(`Adaptive learning validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}
console.log(`Adaptive learning validation passed: ${checks.length} checks, ${baseTotal + packTotal} shared questions, ${familyBaseTotal + familyPackTotal} KidsCoin questions.`);
