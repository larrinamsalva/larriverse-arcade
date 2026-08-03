import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const base = 'games/road-trip-quest-gps';
const failures = [];
const checks = [];
const check = (condition, message) => (condition ? checks : failures).push(message);
const read = relative => readFile(path.join(root, relative), 'utf8');

const manifest = JSON.parse(await read(`${base}/world.json`));
const html = await read(`${base}/index.html`);
const js = await read(`${base}/game.js`);
const css = await read(`${base}/game.css`);
const catalog = JSON.parse(await read('games/catalog.json'));

check(manifest.schemaVersion === 1, 'GPS manifest schema is version 1');
check(manifest.source?.file === 'road-trip-quest-gps.html', 'GPS manifest names the recovered source');
check(manifest.source?.placeTypeCount === 15, 'GPS source preserves 15 place categories');
check(manifest.source?.rewardCount === 41, 'GPS source preserves 41 collectible rewards');
check(manifest.source?.questionCount === 28, 'GPS source preserves 28 learning questions');
check(manifest.source?.subjectCount === 4, 'GPS source preserves four question subjects');
check(manifest.source?.levelCount === 11, 'GPS source preserves eleven level thresholds');

const placeTypes = Object.keys(manifest.placeTypes || {});
check(placeTypes.length === 15, 'GPS manifest exposes 15 place types');
check(Object.keys(manifest.rewards || {}).length === 15, 'GPS rewards cover all 15 place types');

const rewardIds = new Set();
let rewardCount = 0;
for (const [type, rewards] of Object.entries(manifest.rewards || {})) {
  check(placeTypes.includes(type), `reward group ${type} uses a known place type`);
  check(Array.isArray(rewards) && rewards.length > 0, `reward group ${type} contains rewards`);
  for (const reward of rewards || []) {
    rewardCount += 1;
    const id = `${type}:${reward.name}`;
    check(!rewardIds.has(id), `reward ${id} is unique`);
    rewardIds.add(id);
    check(typeof reward.emoji === 'string' && reward.emoji.trim(), `reward ${id} has an emoji`);
    check(typeof reward.desc === 'string' && reward.desc.trim(), `reward ${id} has a description`);
    check(['character', 'outfit', 'item'].includes(reward.type), `reward ${id} has a supported collection type`);
    check(Number.isInteger(reward.xp) && reward.xp > 0, `reward ${id} has positive source XP`);
  }
}
check(rewardCount === 41, 'reward payload totals 41 collectibles');

let questionCount = 0;
for (const [subject, questions] of Object.entries(manifest.questions || {})) {
  check(['math', 'science', 'reading', 'trivia'].includes(subject), `question subject ${subject} is supported`);
  check(Array.isArray(questions) && questions.length > 0, `question subject ${subject} has questions`);
  for (const [index, question] of (questions || []).entries()) {
    questionCount += 1;
    check(typeof question.q === 'string' && question.q.trim(), `${subject} question ${index + 1} has a prompt`);
    check(Array.isArray(question.a) && question.a.length === 4, `${subject} question ${index + 1} has four options`);
    check(Number.isInteger(question.c) && question.c >= 0 && question.c < 4, `${subject} question ${index + 1} has a valid answer index`);
  }
}
check(questionCount === 28, 'question payload totals 28 questions');
check(Array.isArray(manifest.levelThresholds) && manifest.levelThresholds.length === 11, 'level thresholds total eleven');
check(Array.isArray(manifest.levelUnlocks) && manifest.levelUnlocks.length === 11, 'level unlocks total eleven');
check(manifest.levelThresholds.every((value, index, values) => Number.isInteger(value) && (index === 0 || value > values[index - 1])), 'level thresholds are strictly increasing');

check(manifest.privacy?.defaultMode === 'demo', 'demo mode is the default');
check(manifest.privacy?.locationPermission === 'explicit-button-only', 'location requires an explicit button');
check(manifest.privacy?.backgroundTracking === false, 'background tracking is disabled');
check(manifest.privacy?.coordinateStorage === false, 'coordinate storage is disabled');
check(manifest.privacy?.coordinateUpload === false, 'coordinate upload is disabled');
check(manifest.privacy?.externalMapTiles === false, 'external map tiles are disabled');
check(manifest.privacy?.externalPlaceLookup === false, 'external place lookup is disabled');
check(manifest.privacy?.stopOnPageExit === true, 'location stops on page exit');
check(manifest.safety?.passengerOrParkedOnly === true, 'passenger-or-parked safety rule is enabled');
check(manifest.safety?.notNavigation === true, 'cabinet is explicitly not navigation');
check(manifest.safety?.notEmergencyService === true, 'cabinet is explicitly not an emergency service');

check(/^<!doctype html>/i.test(html.trim()), 'GPS cabinet has a doctype');
check(html.includes('../../index.html'), 'GPS cabinet links back to the arcade');
check(html.indexOf('../../assets/arcade-sdk.js') < html.indexOf('game.js'), 'GPS cabinet loads the SDK before cabinet code');
check(/Start Demo Mode/.test(html), 'GPS cabinet offers Demo Mode first');
check(/Use Live Movement/.test(html), 'GPS cabinet offers explicit Live Movement');
check(/Never play while driving/i.test(html), 'GPS cabinet displays the driving safety rule');
check(/never written to saves/i.test(html), 'GPS cabinet explains that coordinates are not saved');
check(/not navigation/i.test(html), 'GPS cabinet states that it is not navigation');

check(!/leaflet/i.test(html + css + js), 'GPS cabinet does not load Leaflet');
check(!/overpass-api|openstreetmap|cartocdn/i.test(html + css + js), 'GPS cabinet does not query external maps or places');
check(!/https?:\/\//i.test(html + css + js), 'GPS cabinet contains no external network URL');
check(!/fetch\s*\(\s*[`'"]https?:/i.test(js), 'GPS cabinet makes no external fetch');
check(/fetch\('world\.json'\)/.test(js), 'GPS cabinet fetches only its local world manifest');
check(/getCurrentPosition/.test(js), 'GPS cabinet supports explicit one-time location permission');
check(/watchPosition/.test(js), 'GPS cabinet supports temporary live movement');
check(/clearWatch/.test(js), 'GPS cabinet can stop live movement');
check(/pagehide/.test(js) && /visibilitychange/.test(js), 'GPS cabinet stops location on exit or hidden tab');
check(/liveOrigin = null/.test(js) && /liveCurrent = null/.test(js), 'GPS cabinet clears in-memory coordinates');
check(/const fresh = \(\) => \(\{[\s\S]*collection:/m.test(js), 'GPS persistent state is progression-oriented');
check(!/latitude\s*:|longitude\s*:|coords\s*:/i.test(js.match(/const fresh = \(\) => \(\{[\s\S]*?\}\);/)?.[0] || ''), 'GPS persistent state contains no coordinate fields');

const entry = catalog.find(item => item.id === 'road-trip-quest-gps');
check(Boolean(entry), 'GPS cabinet exists in the catalog');
check(entry?.available === true, 'GPS cabinet is playable');
check(entry?.integration === 'arcade-sdk-v2', 'GPS cabinet declares Arcade SDK v2');
check(entry?.world === `${base}/world.json`, 'GPS cabinet declares its world manifest');

const syntax = spawnSync(process.execPath, ['--check', path.join(root, `${base}/game.js`)], { encoding: 'utf8' });
check(syntax.status === 0, 'GPS cabinet JavaScript passes node --check');

if (failures.length) {
  console.error(`Road Trip Quest GPS validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}
console.log(`Road Trip Quest GPS validation passed: ${checks.length} checks, 15 place types, 41 rewards, 28 questions.`);
