import assert from 'node:assert/strict';
import fs from 'node:fs';
import { encode } from '../assets/expedition-logic.js';
import { cipherLevels } from '../assets/expedition-worlds.js';
import { cipherRotor, rotorPairs } from '../games/cipher-club/decoder-art.js';

const image = fs.readFileSync('games/cipher-club/art/clubhouse-workshop.webp');
assert.equal(image.toString('ascii', 0, 4), 'RIFF');
assert.equal(image.toString('ascii', 8, 12), 'WEBP');
assert.ok(image.byteLength > 40_000 && image.byteLength < 200_000);
assert.equal(cipherLevels.length, 80);
for (const level of cipherLevels) {
  const alphabet = level.alphabet || 'ABCDEFGH';
  const pairs = rotorPairs(alphabet, level.shift);
  assert.equal(pairs.length, alphabet.length);
  assert.ok(pairs.every(([plain, coded]) => coded === encode(plain, level.shift, alphabet)));
  const svg = cipherRotor(alphabet, level.shift);
  assert.ok(svg.includes(`data-rotor-size="${alphabet.length}"`));
  assert.equal((svg.match(/<text /g) || []).length, alphabet.length * 2 + 2);
}
assert.throws(() => rotorPairs('ABC', 1), RangeError);
console.log('Cipher Club art: clubhouse asset and exact rotor mapping validated across all 80 messages.');
