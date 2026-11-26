import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const name of ['planning', 'chores', 'learning']) {
  const relative = `games/kidscoin-family/art/${name}.webp`;
  const file = fs.readFileSync(path.join(root, relative));
  if (file.toString('ascii', 0, 4) !== 'RIFF' || file.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`${relative} is not a WebP image`);
  }
  if (file.byteLength < 40_000 || file.byteLength > 500_000) {
    throw new Error(`${relative} is incomplete or too large for a phone`);
  }
}
console.log('KidsCoin Family: three optimized local illustrations are packaged.');
