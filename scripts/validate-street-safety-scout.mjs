import assert from 'node:assert/strict';
import fs from 'node:fs';
import { streetSafetyCategories, streetSafetyScenarios } from '../games/street-safety-scout/scenarios.js';

const read = file => fs.readFileSync(file, 'utf8');
const html = read('games/street-safety-scout/index.html');
const game = read('games/street-safety-scout/game.js');
const css = read('games/street-safety-scout/game.css');
const catalog = JSON.parse(read('games/catalog.json'));
const release = JSON.parse(read('release.json'));

assert.equal(streetSafetyScenarios.length, 120, 'Street Safety Scout needs exactly 120 scenarios');
assert.deepEqual(streetSafetyCategories, [
  'Signal lights',
  'Caution signs',
  'Emergency awareness',
  'Vehicle & road hazards',
  'Roadside caution'
]);
assert.equal(new Set(streetSafetyScenarios.map(item => item.id)).size, 120, 'scenario ids must be unique');
assert.ok(new Set(streetSafetyScenarios.map(item => item.visual)).size >= 60, 'expanded scenarios keep the original dimensional visual vocabulary');

for (const category of streetSafetyCategories) {
  assert.equal(streetSafetyScenarios.filter(item => item.category === category).length, 24, `${category} needs twenty-four scenes for eight balanced routes`);
}

for (const item of streetSafetyScenarios) {
  assert.ok(streetSafetyCategories.includes(item.category), `${item.id} has a known category`);
  assert.equal(item.options.length, 3, `${item.id} has three choices`);
  assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.options.length, `${item.id} has a valid answer`);
  assert.ok(item.title.length >= 5 && item.prompt.length >= 30, `${item.id} has useful question copy`);
  assert.ok(item.why.length >= 45 && item.hint.length >= 25, `${item.id} teaches with an explanation and hint`);
}

assert.equal(catalog.filter(item => item.id === 'street-safety-scout').length, 1, 'catalog includes Game 30 once');
assert.match(catalog.find(item => item.id === "street-safety-scout").mission, /120 distinct scenarios/, "catalog mission agrees with the 120-scenario game");
assert.equal(release.cabinets.filter(item => item.id === 'street-safety-scout').length, 1, 'release manifest includes Game 30 once');
assert.equal(release.cabinetCount, catalog.length, 'release and catalog counts agree');
assert.ok(html.includes('Game 30') && html.includes('120 safety stops') && html.includes('Eight connected routes'), 'page explains the full eight-route 120-stop mission');
assert.ok(html.includes('Practice only:') && html.includes('Never use this game while driving'), 'page keeps its real-world safety boundary');
assert.ok(game.includes('ROUND_SIZE = 120') && game.includes('selected.length < 24'), 'main campaign draws all twenty-four distinct scenes per safety category');
assert.ok(game.includes('larriverse.streetSafetyScout.longRoute.v1') && game.includes('writeJourney(step)'), 'all 120 missions are saved locally after each stop');
assert.ok(game.includes("sdk.award(GAME_ID") && game.includes('larriverse:bloom-message'), 'completion saves locally and reaches Bloom');
assert.ok(game.includes('role="img"') && game.includes('aria-label='), 'generated scenes retain accessible image semantics');
assert.ok(css.includes('html.larriverse-dark') && css.includes('html.larriverse-high-contrast'), 'shared theme and contrast modes are styled');
assert.ok(css.includes('prefers-reduced-motion') && css.includes('max-width: 420px'), 'motion and small-screen modes are styled');
assert.ok(!game.includes('fetch(') && !game.includes('WebSocket'), 'the game stays local-only');

console.log('Street Safety Scout validated: 120 distinct scenarios, five balanced twenty-four-scene safety zones, eight saved routes, accessible visuals, and local-only progress.');
