import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
let checks = 0;
const check = (condition, message) => {
  checks += 1;
  if (!condition) failures.push(message);
};
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const creature = read('games/creature-catcher/game.js');
const road = read('games/road-trip-quest/game.js');
const packageJson = JSON.parse(read('package.json'));

check(creature.includes('questionBank.subjects[subject].length < 20'), 'Creature Catcher requires twenty-question live subject pools');
check(creature.includes('Question bank needs at least twenty ${subject} questions'), 'Creature Catcher explains its twenty-question minimum');
check(creature.includes("const QUESTION_EXPANSION = '../learning-question-pack-2.json'"), 'Creature Catcher keeps the adaptive expansion source');
check(road.includes('questionBank.subjects[subject].length < 20'), 'Road Trip Quest requires twenty-question live subject pools');
check(road.includes('Question bank needs at least twenty ${subject} questions'), 'Road Trip Quest explains its twenty-question minimum');
check(road.includes("const QUESTION_EXPANSION = '../learning-question-pack-2.json'"), 'Road Trip Quest keeps the adaptive expansion source');
check(packageJson.scripts.validate.includes('validate-adaptive-engine-pools.mjs'), 'normal validation must include adaptive engine pool compatibility');

if (failures.length) {
  console.error(`Adaptive engine pool validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}

console.log(`Adaptive engine pool validation passed ${checks} checks.`);
