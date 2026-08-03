import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const checks = [];
const check = (condition, message) => (condition ? checks : failures).push(message);

async function exists(relativePath) {
  try { await access(path.join(root, relativePath)); return true; }
  catch { return false; }
}

function safeLocalPath(fromFile, reference) {
  if (!reference || /^(?:https?:|data:|#)/i.test(reference)) return null;
  const resolved = path.normalize(path.join(path.dirname(fromFile), reference));
  return resolved.startsWith('..') || path.isAbsolute(resolved) ? false : resolved;
}

const catalog = JSON.parse(await readFile(path.join(root, 'games/catalog.json'), 'utf8'));
check(Array.isArray(catalog), 'catalog is an array');
check(catalog.length > 0, 'catalog contains at least one cabinet');

const ids = new Set(), hrefs = new Set();
let playable = 0;

for (const [index, game] of catalog.entries()) {
  const label = game.title || `entry ${index + 1}`;
  check(typeof game.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(game.id), `${label}: id is a safe slug`);
  check(!ids.has(game.id), `${label}: id is unique`); ids.add(game.id);
  check(typeof game.title === 'string' && game.title.trim().length > 0, `${label}: title is present`);
  check(typeof game.desc === 'string' && game.desc.trim().length >= 20, `${label}: description is meaningful`);
  check(typeof game.category === 'string' && game.category.trim().length > 0, `${label}: category is present`);
  check(typeof game.status === 'string' && game.status.trim().length > 0, `${label}: status is present`);
  check(typeof game.available === 'boolean', `${label}: available is boolean`);
  check(typeof game.href === 'string' && game.href.startsWith('games/') && !game.href.includes('..'), `${label}: href stays inside games/`);
  check(!hrefs.has(game.href), `${label}: href is unique`); hrefs.add(game.href);

  if (!game.available) continue;
  playable += 1;
  const htmlExists = await exists(game.href);
  check(htmlExists, `${label}: playable file exists at ${game.href}`);
  if (!htmlExists) continue;

  const html = await readFile(path.join(root, game.href), 'utf8');
  check(/^<!doctype html>/i.test(html.trim()), `${label}: playable file has a doctype`);
  check(/<title>.+<\/title>/is.test(html), `${label}: playable file has a title`);
  check(/<\/html>\s*$/i.test(html), `${label}: playable file closes the document`);

  const refs = [
    ...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi),
    ...html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)
  ].map(match => match[1]);

  for (const reference of refs) {
    const local = safeLocalPath(game.href, reference);
    check(local !== false, `${label}: ${reference} stays inside the repository`);
    if (!local) continue;
    const localExists = await exists(local);
    check(localExists, `${label}: local dependency exists at ${local}`);
    if (localExists && local.endsWith('.js')) {
      const syntax = spawnSync(process.execPath, ['--check', path.join(root, local)], { encoding: 'utf8' });
      check(syntax.status === 0, `${label}: ${local} passes node --check`);
    }
  }
}

check(playable > 0, 'at least one cabinet is playable');
check(await exists('assets/arcade-sdk.js'), 'shared arcade SDK exists');

for (const script of ['assets/arcade-sdk.js', 'assets/arcade.js']) {
  const syntax = spawnSync(process.execPath, ['--check', path.join(root, script)], { encoding: 'utf8' });
  check(syntax.status === 0, `${script} passes node --check`);
}

const lobby = await readFile(path.join(root, 'index.html'), 'utf8');
const sdkPosition = lobby.indexOf('assets/arcade-sdk.js');
const lobbyPosition = lobby.indexOf('assets/arcade.js');
check(sdkPosition >= 0, 'lobby loads the arcade SDK');
check(lobbyPosition > sdkPosition, 'lobby loads the SDK before arcade.js');
check(lobby.includes('id="playableCount"'), 'lobby displays the playable cabinet count');

if (failures.length) {
  console.error(`\nLarriVerse validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}

console.log(`LarriVerse validation passed: ${catalog.length} concepts, ${playable} playable cabinets, ${checks.length} checks.`);
