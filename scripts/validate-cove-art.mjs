import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CREATIVE_CHAPTERS } from '../games/creative-calm-cove/prompts.js';
import { CHAPTER_SCENES } from '../games/creative-calm-cove/cove-art.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
assert.deepEqual(CHAPTER_SCENES.map(scene => scene.id), CREATIVE_CHAPTERS.map(chapter => chapter.id));
const files = ['cove-studio.webp', ...CHAPTER_SCENES.map(scene => scene.file)];
assert.equal(new Set(files).size, 9);
for (const file of files) {
  const image = fs.readFileSync(path.join(root, 'games/creative-calm-cove/art', file));
  assert.equal(image.toString('ascii', 0, 4), 'RIFF', `${file}: RIFF header`);
  assert.equal(image.toString('ascii', 8, 12), 'WEBP', `${file}: WebP format`);
  assert.ok(image.byteLength > 20_000 && image.byteLength < 200_000, `${file}: useful phone-sized illustration`);
}
for (const scene of CHAPTER_SCENES) {
  assert.ok(scene.alt.length > 35, `${scene.id}: descriptive alternative text`);
}
console.log('Creative Calm Cove art: eight matched chapter scenes and a locally bundled cove studio validated.');
