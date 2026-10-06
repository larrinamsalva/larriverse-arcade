import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { galleryMetadata } from './gallery-metadata.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const release = JSON.parse(fs.readFileSync(path.join(root, 'release.json'), 'utf8'));
const galleryRoot = path.join(root, 'artifacts/gallery-review');
const manifest = JSON.parse(fs.readFileSync(path.join(galleryRoot, 'manifest.json'), 'utf8'));
assert.equal(manifest.schema, 'larriverse-gallery-review');
assert.equal(manifest.schemaVersion, 1);
assert.equal(manifest.release, release.version);
assert.equal(manifest.candidate, release.candidate);
assert.equal(manifest.expectedEntries, release.galleryReview.expectedImages);
const subjects = [{ id: 'lobby', title: `${release.title} lobby` }, ...release.cabinets];
const expected = new Map();
for (const project of release.galleryReview.projects) {
  for (const subject of subjects) expected.set(`${project}/${subject.id}`, { project: { id: project }, subject });
}
assert.equal(manifest.humanApprovalRequired, true, 'candidate evidence still needs human approval');
assert.equal(manifest.uploadsData, false);
assert.equal(manifest.grantsLocation, false);
assert.equal(manifest.entries.length, release.galleryReview.expectedImages);
const seen = new Set();
for (const entry of manifest.entries) {
  const pair = expected.get(entry.key);
  assert.ok(pair, `unknown image ${entry.key}`);
  assert.ok(!seen.has(entry.key), `duplicate image ${entry.key}`);
  seen.add(entry.key);
  const metadata = galleryMetadata(pair.subject, pair.project);
  assert.equal(entry.title, metadata.title);
  assert.equal(entry.defaultAlt, metadata.defaultAlt);
  assert.equal(entry.project, pair.project.id);
  assert.equal(entry.subjectId, pair.subject.id);
  assert.equal(entry.path, `images/${entry.project}/${entry.subjectId}.png`);
  assert.equal(entry.cssViewport, entry.project === 'desktop-chromium' ? '1440x900' : '390x844');
  const buffer = fs.readFileSync(path.join(galleryRoot, entry.path));
  assert.ok(buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `invalid PNG ${entry.key}`);
  assert.equal(buffer.length, entry.bytes);
  assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'), entry.sha256);
  assert.equal(buffer.readUInt32BE(16), entry.pixelWidth);
  assert.equal(buffer.readUInt32BE(20), entry.pixelHeight);
  assert.ok(entry.pixelWidth > 0 && entry.pixelHeight > 0);
}
assert.equal(seen.size, expected.size);
console.log(`Verified ${seen.size} gallery images: exact coverage, deterministic titles and alt text, viewports, dimensions, byte counts, and SHA-256 hashes. Human approval remains pending.`);
