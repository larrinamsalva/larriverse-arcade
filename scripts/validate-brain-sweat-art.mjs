import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = 'games/brain-sweat-expanded';
const core = JSON.parse(fs.readFileSync(`${root}/activities.json`, 'utf8'));
const worlds = core.worldFiles.flatMap(file => JSON.parse(fs.readFileSync(`${root}/${file}`, 'utf8')));
const reviewed = worlds.filter(world => world.tiers.some(tier => tier.status === 'reviewed')).map(world => world.id).sort();
const game = fs.readFileSync(`${root}/game.js`, 'utf8');
const mapping = game.match(/const WORLD_ART = Object\.freeze\(\{([\s\S]*?)\n  \}\);/);
assert.ok(mapping, 'world art mapping exists');
const entries = [...mapping[1].matchAll(/^    ([a-z]+): \{ file: '([^']+)', alt: '([^']+)' \},?$/gm)];
assert.deepEqual(entries.map(entry => entry[1]).sort(), reviewed, 'every reviewed world has exactly one neutral scene; queued worlds have none');

const html = fs.readFileSync(`${root}/index.html`, 'utf8');
const css = fs.readFileSync(`${root}/skill-art.css`, 'utf8');
assert.match(html, /id="scenarioArt" hidden/);
assert.match(html, /id="scenarioArtImage"/);
assert.match(css, /\.scenario-art\[hidden\]\{display:none\}/);
for (const [, id, file, alt] of entries) {
  assert.equal(file, `${id}.webp`);
  assert.ok(alt.length >= 50, `${id}: picture has useful alternative text`);
  assert.ok(html.includes(`src="art/${file}"`), `${id}: hero preview uses the local image`);
  const bytes = fs.readFileSync(`${root}/art/${file}`);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${file}: RIFF header`);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${file}: WebP image`);
  assert.ok(bytes.byteLength > 20_000 && bytes.byteLength < 200_000, `${file}: compact enough for phone use`);
}
assert.match(game, /const art = status\.ready \? WORLD_ART\[world\.id\] : null/);
assert.match(game, /const art = WORLD_ART\[activeWorld\.id\]/);
console.log('Brain Sweat Expanded art: six local settings match reviewed worlds; queued worlds remain unillustrated.');
