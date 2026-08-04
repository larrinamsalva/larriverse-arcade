import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const checks = [];
const check = (condition, message) => (condition ? checks : failures).push(message);
const safeSlug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const unique = values => new Set(values).size === values.length;
const exists = async relative => { try { await access(path.join(root, relative)); return true; } catch { return false; } };

const bankPath = 'games/learning-question-bank.json';
check(await exists(bankPath), 'shared learning question bank exists');
const bank = JSON.parse(await readFile(path.join(root, bankPath), 'utf8'));
check(bank.schemaVersion === 1, 'question bank schema version is 1');
check(typeof bank.title === 'string' && bank.title.length > 10, 'question bank has a title');
check(bank.privacy?.deviceLocal === true, 'question bank is device-local content');
check(bank.privacy?.uploadsData === false, 'question bank does not upload data');
check(bank.review?.status === 'reviewed', 'question bank declares reviewed status');

const requiredSubjects = ['math','reading','science','nature','trivia'];
check(bank.subjects && typeof bank.subjects === 'object', 'question bank has subject data');
const ids = [];
let total = 0;
for (const subject of requiredSubjects) {
  const questions = bank.subjects?.[subject];
  check(Array.isArray(questions), `${subject}: question list exists`);
  check((questions || []).length >= 16, `${subject}: at least 16 questions exist`);
  total += questions?.length || 0;
  for (const question of questions || []) {
    ids.push(question.id);
    check(safeSlug(question.id), `${subject}: question id ${question.id} is safe`);
    check(typeof question.prompt === 'string' && question.prompt.trim().length >= 8, `${question.id}: prompt is useful`);
    check(Array.isArray(question.options) && question.options.length === 4, `${question.id}: four options exist`);
    check(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: answer index is valid`);
    check(typeof question.explanation === 'string' && question.explanation.trim().length >= 12, `${question.id}: explanation is useful`);
    check(['starter','growing','challenge'].includes(question.difficulty), `${question.id}: difficulty is supported`);
  }
}
check(total >= 80, 'shared bank contains at least 80 questions');
check(unique(ids), 'shared question IDs are unique');

const creatureHtml = await readFile(path.join(root, 'games/creature-catcher/index.html'), 'utf8');
const creatureJs = await readFile(path.join(root, 'games/creature-catcher/game.js'), 'utf8');
const roadJs = await readFile(path.join(root, 'games/road-trip-quest/game.js'), 'utf8');
for (const [label, code] of [['Creature Catcher', creatureJs], ['Road Trip Quest', roadJs]]) {
  check(code.includes("const QUESTION_SOURCE = '../learning-question-bank.json'"), `${label}: loads the shared question data`);
  check(code.includes('fetch(QUESTION_SOURCE)'), `${label}: fetches question data at runtime`);
  check(code.includes('shuffle('), `${label}: shuffles question decks`);
  check(!code.includes('const QUESTIONS ='), `${label}: old embedded question object is removed`);
  const syntax = spawnSync(process.execPath, ['--check', label === 'Creature Catcher'
    ? path.join(root, 'games/creature-catcher/game.js')
    : path.join(root, 'games/road-trip-quest/game.js')], { encoding: 'utf8' });
  check(syntax.status === 0, `${label}: engine passes node --check`);
}
check(creatureHtml.includes('<script src="game.js"></script>'), 'Creature Catcher uses external game.js');
check(!creatureHtml.includes('const questions=['), 'Creature Catcher no longer embeds a tiny question list');
check(creatureJs.includes("const QUESTION_SUBJECTS = ['math', 'reading', 'science', 'nature']"), 'Creature Catcher uses four subject banks');
check(creatureJs.includes('decks[subject] = shuffle'), 'Creature Catcher avoids repeats until a subject deck cycles');
check(roadJs.includes("const QUESTION_SUBJECTS = ['math', 'trivia', 'science', 'reading']"), 'Road Trip Quest uses four subject banks');
check(roadJs.includes('questionDecks[subject] = shuffle'), 'Road Trip Quest avoids repeats until a subject deck cycles');
check(roadJs.includes('question.explanation'), 'Road Trip Quest teaches with answer explanations');
check(creatureJs.includes('question.explanation'), 'Creature Catcher teaches with answer explanations');

if (failures.length) {
  console.error(`Learning question bank validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}
console.log(`Learning question bank validation passed: ${checks.length} checks, ${total} shared questions across ${requiredSubjects.length} subjects.`);
