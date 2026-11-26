import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { timeTrailLevelsWithGoals } from '../assets/time-trail-level.js';
import { trailBackdropPaths, trailScene, trailTilePicture } from '../games/time-trail/trail-art.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packaged = new Set(trailBackdropPaths);
for (const prop of [
  'games/time-trail/art/hiker-stand.webp',
  'games/time-trail/art/hiker-step.webp',
  'games/time-trail/art/mission-flag.webp',
  'games/robot-rover/art/rock-meadow.webp',
  'assets/world-motion/objects/picnic-basket.webp'
]) packaged.add(prop);

assert.equal(timeTrailLevelsWithGoals.length, 60);
assert.ok(trailBackdropPaths.length >= 6, 'The route regions need distinct landscapes');
for (const relative of packaged) {
  const file = fs.readFileSync(path.join(root, relative));
  assert.equal(file.toString('ascii', 0, 4), 'RIFF', `${relative}: RIFF header`);
  assert.equal(file.toString('ascii', 8, 12), 'WEBP', `${relative}: WebP format`);
  assert.ok(file.byteLength > 1000 && file.byteLength < 1_000_000, `${relative}: useful phone-sized art`);
}
for (const level of timeTrailLevelsWithGoals) {
  const scene = trailScene(level, 0);
  assert.match(scene, /Illustrative landscape/);
  assert.ok(scene.includes('trail-landscape-background'));
}
for (const kind of ['hiker', 'rock', 'flag', 'basket', 'collected', 'path']) {
  assert.ok(trailTilePicture(kind).includes('aria-hidden="true"'));
}
console.log('Time Trail art: 60 maps, distinct packaged landscapes and local tile markers validated.');
