import assert from 'node:assert/strict';
import fs from 'node:fs';
import { newsCards } from '../assets/skill-worlds.js';
import { NEWSROOM_SCENES, newsroomSceneForStep } from '../games/fact-finder/newsroom-art.js';

assert.equal(newsCards.length, 60);
assert.equal(NEWSROOM_SCENES.length, 3);
assert.equal(new Set(NEWSROOM_SCENES.map(scene => scene.file)).size, 3);
for (const [index, scene] of NEWSROOM_SCENES.entries()) {
  const image = fs.readFileSync(`games/fact-finder/art/${scene.file}`);
  assert.equal(image.toString('ascii', 0, 4), 'RIFF');
  assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  assert.ok(image.byteLength > 40_000 && image.byteLength < 200_000);
  assert.ok(scene.alt.length > 45);
  for (let step = index * 20; step < (index + 1) * 20; step++) {
    assert.equal(newsroomSceneForStep(step), scene);
  }
}
console.log('Fact Finder art: three neutral chapter settings cover all 60 claim cards.');
