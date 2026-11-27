import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = 'games/brain-sweat-life-skills';
const manifest = JSON.parse(fs.readFileSync(`${root}/content-manifest.json`, 'utf8'));
const worlds = manifest.worldFiles.map(file => JSON.parse(fs.readFileSync(`${root}/${file}`, 'utf8')));
const reviewed = worlds.filter(world => world.lessons.some(lesson => lesson.status === 'reviewed')).map(world => world.id).sort();
const game = fs.readFileSync(`${root}/game.js`, 'utf8');
const mapping = game.match(/const WORLD_ART = Object\.freeze\(\{([\s\S]*?)\n  \}\);/);
assert.ok(mapping, 'neutral art mapping exists');
const entries = [...mapping[1].matchAll(/^    ([a-z0-9]+): \{ file: '([^']+)', alt: '([^']+)' \},?$/gm)];
assert.deepEqual(entries.map(entry => entry[1]).sort(), reviewed, 'one setting for each reviewed world and none for queued-only worlds');

const html = fs.readFileSync(`${root}/index.html`, 'utf8');
const css = fs.readFileSync(`${root}/life-art.css`, 'utf8');
assert.match(html, /id="lessonSettingImage"/);
assert.match(game, /readyCount && filter !== 'review-queued' \? WORLD_ART\[world\.id\]/);
assert.match(game, /found\.lesson\.status !== 'reviewed'/);
assert.match(css, /\.lesson-setting\[hidden\]\{display:none\}/);
assert.match(css, /larriverse-high-contrast/);
for (const [, id, file, alt] of entries) {
  assert.equal(file, `${id}.webp`);
  assert.ok(alt.length >= 55, `${id}: descriptive alternative text`);
  assert.ok(html.includes(`src="art/${file}"`), `${id}: intro includes local art`);
  const image = fs.readFileSync(`${root}/art/${file}`);
  assert.equal(image.toString('ascii', 0, 4), 'RIFF');
  assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  assert.ok(image.byteLength > 20_000 && image.byteLength < 200_000, `${file}: phone-sized art`);
}
console.log('Brain Sweat Life Skills art: four reviewed world settings are local; queued-only worlds have no artwork.');
