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

check(creature.includes('questionBank.subjects[subject].length < 3'), 'Creature Catcher must accept adaptive subject pools of three');
check(!creature.includes('questionBank.subjects[subject].length < 12'), 'Creature Catcher must not restore the fixed twelve-question floor');
check(creature.includes('Question bank needs at least three ${subject} questions'), 'Creature Catcher must explain its adaptive minimum');
check(road.includes('questionBank.subjects[subject].length < 3'), 'Road Trip Quest must accept adaptive subject pools of three');
check(!road.includes('questionBank.subjects[subject].length < 12'), 'Road Trip Quest must not restore the fixed twelve-question floor');
check(road.includes('Question bank needs at least three ${subject} questions'), 'Road Trip Quest must explain its adaptive minimum');
check(packageJson.scripts.validate.includes('validate-adaptive-engine-pools.mjs'), 'normal validation must include adaptive engine pool compatibility');

if (failures.length) {
  console.error(`Adaptive engine pool validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}

console.log(`Adaptive engine pool validation passed ${checks} checks.`);
