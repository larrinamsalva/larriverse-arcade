import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '_site');
const files = ['index.html', 'release.json', 'LICENSE'];
const directories = ['assets', 'games', 'qa', 'docs'];
const forbidden = ['.git', '.github', 'node_modules', 'scripts', 'tests', 'artifacts', 'playwright-report', 'test-results'];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const name of files) {
  const source = path.join(root, name);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(out, name));
}
for (const name of directories) {
  const source = path.join(root, name);
  if (fs.existsSync(source)) fs.cpSync(source, path.join(out, name), { recursive: true });
}
fs.rmSync(path.join(out, 'docs', 'release-approval.json'), { force: true });
fs.writeFileSync(path.join(out, '.nojekyll'), '');

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolute = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(absolute) : [absolute];
});
const published = walk(out).map((absolute) => path.relative(out, absolute).replaceAll(path.sep, '/'));
for (const name of forbidden) {
  if (published.some((file) => file === name || file.startsWith(`${name}/`))) throw new Error(`Forbidden preview path published: ${name}`);
}
for (const required of ['index.html', 'release.json', 'qa/index.html', 'qa/release-approval.html', 'games/catalog.json']) {
  if (!published.includes(required)) throw new Error(`Preview is missing ${required}`);
}
if (published.some((file) => /(^|\/)(\.env|id_rsa|credentials|release-approval\.json)$/i.test(file))) throw new Error('Preview contains a private evidence or credential file');

console.log(`GitHub Pages site built with ${published.length} public static files.`);
