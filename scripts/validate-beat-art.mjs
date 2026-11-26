import assert from 'node:assert/strict';
import fs from 'node:fs';
import { beatMissions } from '../assets/creative-missions.js';
import { BEAT_INSTRUMENTS, beatStudioScene, beatInstrumentPicture } from '../games/beat-builder/studio-art.js';

assert.equal(beatMissions.length, 80);
assert.deepEqual(BEAT_INSTRUMENTS.map(instrument => instrument.name), ['Kick','Clap','Hi-hat']);
assert.equal(new Set(BEAT_INSTRUMENTS.map(instrument => instrument.file)).size, 3);
for (const file of ['music-studio.webp', ...BEAT_INSTRUMENTS.map(instrument => instrument.file)]) {
  const image = fs.readFileSync(`games/beat-builder/art/${file}`);
  assert.equal(image.toString('ascii', 0, 4), 'RIFF');
  assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  assert.ok(image.byteLength > 10_000 && image.byteLength < 200_000);
}
assert.match(beatStudioScene(), /sixteen-pad drum machine/);
for (const [row, instrument] of BEAT_INSTRUMENTS.entries()) {
  assert.ok(beatInstrumentPicture(row).includes(instrument.file));
}
console.log('Beat Builder art: local studio and three real-instrument row pictures validated for 80 missions.');
