import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const base = 'games/kidscoin-family';
const failures = [];
const checks = [];
const check = (value, message) => (value ? checks : failures).push(message);
const safeSlug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const unique = list => new Set(list).size === list.length;

const manifest = JSON.parse(await readFile(path.join(root, base, 'family.json'), 'utf8'));
const html = await readFile(path.join(root, base, 'index.html'), 'utf8');
const js = await readFile(path.join(root, base, 'game.js'), 'utf8');

check(manifest.schemaVersion === 1, 'family schema version is 1');
check(manifest.source?.file === 'KidsCoin_Family_App (5).html', 'manifest names the recovered source');
for (const key of ['profileSystem','parentMode','approvalQueue','customTasks','customRewards','messages','notifications','graceDays']) check(manifest.source?.[key] === true, `source feature ${key} is preserved`);
check(JSON.stringify(manifest.source?.streakMilestones) === JSON.stringify([3,7,14,30]), 'source streak milestones are preserved');
check(typeof manifest.source?.note === 'string' && manifest.source.note.length > 80, 'source/new-work distinction is documented');

const boundaries = manifest.boundaries || {};
check(boundaries.rewardUnit === 'fictional-family-kc', 'reward unit is fictional Family KC');
for (const key of ['deviceLocal','parentControlled']) check(boundaries[key] === true, `${key} is enabled`);
for (const key of ['realMoney','cryptocurrency','blockchain','marketPrice','staking','purchases','publicProfiles','cloudAccounts','ads','gambling']) check(boundaries[key] === false, `${key} is disabled`);
check(/convenience lock/i.test(boundaries.pinNote || ''), 'parent PIN limitation is explicit');

check(Array.isArray(manifest.avatars) && manifest.avatars.length === 8 && unique(manifest.avatars), 'eight unique source-inspired avatars exist');
check(Array.isArray(manifest.categories) && manifest.categories.length === 4, 'four source categories exist');
check(unique(manifest.categories.map(item => item.id)) && manifest.categories.every(item => safeSlug(item.id)), 'category IDs are unique safe slugs');

check(Array.isArray(manifest.tasks) && manifest.tasks.length === 12, 'twelve default tasks exist');
check(unique(manifest.tasks.map(item => item.id)), 'task IDs are unique');
for (const task of manifest.tasks) {
  check(safeSlug(task.id), `${task.id}: task id is safe`);
  check(manifest.categories.some(category => category.id === task.category), `${task.id}: category is known`);
  check([3,6,9].includes(task.kc), `${task.id}: reward follows 3·6·9`);
  check(task.xp === task.kc * 2, `${task.id}: XP is twice KC`);
  check(['easy','medium','hard'].includes(task.difficulty), `${task.id}: difficulty is supported`);
}

check(Array.isArray(manifest.lessons) && manifest.lessons.length === 6, 'six wallet-skill lessons exist');
check(unique(manifest.lessons.map(item => item.id)), 'lesson IDs are unique');
for (const lesson of manifest.lessons) {
  check(safeSlug(lesson.id), `${lesson.id}: lesson id is safe`);
  check(Array.isArray(lesson.options) && lesson.options.length === 4, `${lesson.id}: four answer options exist`);
  check(Number.isInteger(lesson.answer) && lesson.answer >= 0 && lesson.answer < 4, `${lesson.id}: answer index is valid`);
  check(lesson.kc === 3 && lesson.xp === 9, `${lesson.id}: reviewed lesson reward is 3 KC / 9 XP`);
}

check(Array.isArray(manifest.rewards) && manifest.rewards.length === 8, 'eight parent-approved rewards exist');
check(unique(manifest.rewards.map(item => item.id)), 'reward IDs are unique');
for (const reward of manifest.rewards) {
  check(safeSlug(reward.id), `${reward.id}: reward id is safe`);
  check(Number.isInteger(reward.cost) && reward.cost > 0 && reward.cost % 3 === 0, `${reward.id}: cost is a positive multiple of three`);
}

check(Array.isArray(manifest.milestones) && manifest.milestones.length === 4, 'four streak milestones exist');
check(JSON.stringify(manifest.milestones.map(item => item.days)) === JSON.stringify([3,7,14,30]), 'milestone days match the source');

check(html.includes('../../index.html'), 'cabinet routes back to the arcade');
check(html.indexOf('../../assets/arcade-sdk.js') < html.indexOf('game.js'), 'shared SDK loads before cabinet code');
check(/Family KC is fictional/i.test(html), 'fictional reward boundary is visible');
check(/convenience lock, not strong account security/i.test(html), 'PIN security limitation is visible');
check(/No cryptocurrency, blockchain, market price, staking, purchases, ads, public profiles or cloud accounts/i.test(html), 'excluded finance and privacy features are visible');

for (const required of ['localStorage','crypto.subtle.digest','approvals','redemptions','graceDays','LarriVerseArcade?.award']) check(js.includes(required), `game code includes ${required}`);
for (const forbidden of ['KIDZ_PRICE_BASE','livePrice(','staked *','Leaflet','navigator.geolocation']) check(!js.includes(forbidden), `game code excludes ${forbidden}`);

const syntax = spawnSync(process.execPath, ['--check', path.join(root, base, 'game.js')], { encoding: 'utf8' });
check(syntax.status === 0, 'KidsCoin game.js passes node --check');

if (failures.length) {
  console.error(`KidsCoin Family validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}
console.log(`KidsCoin Family validation passed: ${checks.length} checks, ${manifest.tasks.length} tasks, ${manifest.lessons.length} lessons, ${manifest.rewards.length} rewards.`);
