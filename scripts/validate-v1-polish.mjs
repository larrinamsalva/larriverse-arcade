import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { galleryMetadata } from './gallery-metadata.mjs';
import { discoverGames } from '../assets/arcade-discovery.js';

const release = JSON.parse(fs.readFileSync('release.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('games/catalog.json', 'utf8'));
assert.equal(catalog.length, release.cabinetCount, 'the polish pass must cover every declared game');
assert.equal(release.releaseState, 'candidate', 'automation cannot complete the formal release');
assert.equal(release.humanChecksRequired, true);
assert.equal(release.deviceQa.physicalPhoneTouchRequired, true);
assert.equal(release.galleryReview.humanApprovalRequired, true);

const subjects = [{ id: 'lobby', title: `${release.title} lobby` }, ...release.cabinets];
const descriptions = [];
for (const project of release.galleryReview.projects) {
  for (const subject of subjects) {
    const metadata = galleryMetadata(subject, { id: project });
    assert.deepEqual(metadata, galleryMetadata(subject, { id: project }), 'metadata must be deterministic');
    assert.equal(metadata.title, subject.title);
    assert.ok(metadata.defaultAlt.length >= 40 && metadata.defaultAlt.length <= 300);
    assert.doesNotMatch(metadata.defaultAlt, /\b(undefined|null)\b/i);
    descriptions.push(metadata.defaultAlt);
  }
}
assert.equal(descriptions.length, release.galleryReview.expectedImages);
assert.equal(new Set(descriptions).size, release.galleryReview.expectedImages, 'each image needs its own subject and viewport description');
assert.throws(() => galleryMetadata({ id: 'game-30', title: 'Unknown game' }, { id: 'desktop-chromium' }), /Missing gallery description/);
assert.throws(() => galleryMetadata({ id: 'lobby', title: '' }, { id: 'desktop-chromium' }), /Invalid gallery title/);
assert.throws(() => galleryMetadata(subjects[0], { id: 'unknown' }), /Unknown gallery project/);

const fresh = discoverGames(catalog);
assert.equal(fresh.recent.length, 0, 'new devices cannot have invented continuation history');
assert.equal(fresh.recommended.length, 3);
assert.equal(fresh.unvisited.length, 3);
const profile = { games: {
  'pocket-planet': { sessions: 2, lastPlayedAt: '2026-01-01T00:00:00Z' },
  'scam-sleuth': { sessions: 1, lastPlayedAt: '2026-01-02T00:00:00Z' }
} };
const before = JSON.stringify(profile);
const local = discoverGames(catalog, profile);
assert.equal(local.recent[0].id, 'scam-sleuth');
assert.equal(local.recommended[0].topic, 'Digital life');
assert.ok(local.unvisited.every(game => !profile.games[game.id]));
assert.equal(JSON.stringify(profile), before, 'discovery must not mutate learner progress');
assert.deepEqual(discoverGames(catalog, profile), local, 'suggestions do not rotate or create pressure');
assert.equal(discoverGames(catalog, { games: Object.fromEntries(catalog.map(game => [game.id, { sessions: 1 }])) }).unvisited.length, 0);

for (const game of catalog) {
  const page = fs.readFileSync(game.href, 'utf8');
  assert.ok(page.includes('arcade-accessibility.css'));
  assert.ok(page.includes('cabinet-shell.js'));
  assert.ok(page.includes('data-lv-comfort'));
  assert.ok(page.includes('favicon.svg'));
  if (page.includes('data-classic=')) {
    assert.ok(page.includes('class="lv-cabinet-shell"'));
    assert.ok(page.includes(game.skill.replaceAll('&', '&amp;')));
    assert.ok(page.includes('Back to Arcade'));
  }
}
for (const name of ['gallery-metadata.mjs', 'verify-gallery-review.mjs']) {
  assert.equal(spawnSync(process.execPath, ['--check', `scripts/${name}`]).status, 0);
}
for (const name of ['arcade-discovery.js', 'cabinet-shell.js']) {
  assert.equal(spawnSync(process.execPath, ['--check', `assets/${name}`]).status, 0);
}
console.log(`LarriVerse 1.0 polish validated: ${catalog.length} routes, ${release.galleryReview.expectedImages} deterministic gallery descriptions, local optional discovery, and shared comfort access.`);
