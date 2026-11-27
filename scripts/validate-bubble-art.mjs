import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BUBBLE_SCENES, sceneForLevel } from '../games/bubble-resonance-phi369/scene-art.js';

const root = 'games/bubble-resonance-phi369';
assert.equal(BUBBLE_SCENES.length, 4);
assert.equal(new Set(BUBBLE_SCENES.map(scene => scene.id)).size, 4);
for (const [level, expected] of [[1,0],[20,0],[21,1],[40,1],[41,2],[60,2],[61,3],[80,3]]) {
  assert.equal(sceneForLevel(level), BUBBLE_SCENES[expected], `level ${level} uses the intended chapter setting`);
}
for (const scene of BUBBLE_SCENES) {
  assert.equal(scene.file, `${scene.id}.webp`);
  assert.ok(scene.alt.length >= 55 && scene.name.length >= 8);
  const image = fs.readFileSync(`${root}/art/${scene.file}`);
  assert.equal(image.toString('ascii', 0, 4), 'RIFF');
  assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  assert.ok(image.byteLength > 20_000 && image.byteLength < 200_000, `${scene.id}: compact local backdrop`);
}
const html = fs.readFileSync(`${root}/index.html`, 'utf8');
const game = fs.readFileSync(`${root}/game.js`, 'utf8');
const css = fs.readFileSync(`${root}/bubble-art.css`, 'utf8');
assert.match(html, /id="sceneBackdrop"[^>]*src="art\/coastal-cove\.webp"[^>]*aria-hidden="true"/);
assert.match(html, /id="sceneCaption"/);
assert.match(game, /const scene=sceneForLevel\(level\)/);
assert.match(game, /function hud\(\)\{const stage=currentStage\(\),progress=[^;]+;syncScene\(\)/);
assert.match(css, /pointer-events:none/);
assert.match(css, /larriverse-light/);
assert.match(css, /larriverse-high-contrast/);
console.log('Bubble Resonance art: four local settings map to 80 levels; canvas controls and high-contrast fallback remain separate.');
