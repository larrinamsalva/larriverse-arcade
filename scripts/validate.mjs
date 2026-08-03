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

async function readJson(relativePath, label) {
  try {
    return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
  } catch (error) {
    failures.push(`${label}: valid JSON (${error.message})`);
    return null;
  }
}

async function validateContent(game, label) {
  if (game.content === undefined) return;
  check(typeof game.content === 'string' && game.content.startsWith('games/') && !game.content.includes('..'), `${label}: content manifest path is safe`);
  if (typeof game.content !== 'string') return;

  const manifestExists = await exists(game.content);
  check(manifestExists, `${label}: content manifest exists at ${game.content}`);
  if (!manifestExists) return;

  const manifest = await readJson(game.content, `${label}: content manifest`);
  if (!manifest) return;
  check(Number.isInteger(manifest.schemaVersion) && manifest.schemaVersion >= 1, `${label}: content schema version is declared`);
  check(Array.isArray(manifest.worldFiles) && manifest.worldFiles.length > 0, `${label}: content manifest lists world files`);
  check(manifest.rewardModel && Number(manifest.rewardModel.correctKc) >= 0, `${label}: content reward model is present`);
  if (!Array.isArray(manifest.worldFiles)) return;

  const worldIds = new Set();
  const lessonIds = new Set();
  let totalLessons = 0;
  let reviewedLessons = 0;
  let playableQuestions = 0;

  for (const reference of manifest.worldFiles) {
    const local = safeLocalPath(game.content, reference);
    check(local !== false && typeof local === 'string', `${label}: content file ${reference} stays inside the repository`);
    if (!local || local === false) continue;
    const localExists = await exists(local);
    check(localExists, `${label}: content file exists at ${local}`);
    if (!localExists) continue;

    const world = await readJson(local, `${label}: ${reference}`);
    if (!world) continue;
    check(typeof world.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(world.id), `${label}: ${reference} has a safe world id`);
    check(!worldIds.has(world.id), `${label}: world id ${world.id} is unique`);
    worldIds.add(world.id);
    check(typeof world.title === 'string' && world.title.trim().length > 0, `${label}: ${world.id} has a title`);
    check(Array.isArray(world.lessons) && world.lessons.length > 0, `${label}: ${world.id} contains lessons`);
    if (!Array.isArray(world.lessons)) continue;

    for (const lesson of world.lessons) {
      totalLessons += 1;
      check(typeof lesson.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.id), `${label}: lesson id is a safe slug`);
      check(!lessonIds.has(lesson.id), `${label}: lesson id ${lesson.id} is unique`);
      lessonIds.add(lesson.id);
      check(['reviewed', 'review-queued'].includes(lesson.status), `${label}: ${lesson.id} has a supported review status`);
      check(Array.isArray(lesson.questions), `${label}: ${lesson.id} has a questions array`);
      if (!Array.isArray(lesson.questions)) continue;

      if (lesson.status === 'reviewed') {
        reviewedLessons += 1;
        playableQuestions += lesson.questions.length;
        check(lesson.questions.length >= 3, `${label}: reviewed lesson ${lesson.id} has at least three questions`);
        for (const [questionIndex, question] of lesson.questions.entries()) {
          const qLabel = `${label}: ${lesson.id} question ${questionIndex + 1}`;
          check(typeof question.prompt === 'string' && question.prompt.trim().length > 0, `${qLabel} has a prompt`);
          check(Array.isArray(question.options) && question.options.length === 4, `${qLabel} has four options`);
          check(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${qLabel} has a valid answer index`);
        }
      } else {
        check(lesson.questions.length === 0, `${label}: queued lesson ${lesson.id} does not publish unreviewed questions`);
        check(typeof lesson.reviewNote === 'string' && lesson.reviewNote.trim().length > 0, `${label}: queued lesson ${lesson.id} explains its review status`);
      }
    }
  }

  check(reviewedLessons > 0, `${label}: content includes reviewed lessons`);
  check(playableQuestions > 0, `${label}: content includes playable questions`);
  if (manifest.source && Number.isInteger(manifest.source.worldCount)) {
    check(manifest.source.worldCount === worldIds.size, `${label}: source world count matches content files`);
  }
  if (manifest.source && Number.isInteger(manifest.source.lessonCount)) {
    check(manifest.source.lessonCount === totalLessons, `${label}: source lesson count matches content files`);
  }
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
  check(typeof game.integration === 'string' && /^arcade-sdk-v\d+$/.test(game.integration), `${label}: declares an arcade SDK integration version`);

  const htmlExists = await exists(game.href);
  check(htmlExists, `${label}: playable file exists at ${game.href}`);
  if (!htmlExists) continue;

  const html = await readFile(path.join(root, game.href), 'utf8');
  check(/^<!doctype html>/i.test(html.trim()), `${label}: playable file has a doctype`);
  check(/<title>.+<\/title>/is.test(html), `${label}: playable file has a title`);
  check(/<\/html>\s*$/i.test(html), `${label}: playable file closes the document`);
  check(html.includes('../../index.html'), `${label}: provides a route back to the arcade lobby`);

  const scriptRefs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(match => match[1]);
  const styleRefs = [...html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map(match => match[1]);
  const sdkPosition = scriptRefs.findIndex(reference => reference.endsWith('assets/arcade-sdk.js'));
  const firstGameScript = scriptRefs.findIndex(reference => !reference.endsWith('assets/arcade-sdk.js') && !/^(?:https?:|data:)/i.test(reference));
  check(sdkPosition >= 0, `${label}: loads the shared arcade SDK`);
  check(firstGameScript < 0 || sdkPosition < firstGameScript, `${label}: loads the SDK before cabinet code`);

  for (const reference of [...scriptRefs, ...styleRefs]) {
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

  await validateContent(game, label);
}

check(playable > 0, 'at least one cabinet is playable');
check(await exists('assets/arcade-sdk.js'), 'shared arcade SDK exists');

for (const script of ['assets/arcade-sdk.js', 'assets/arcade.js']) {
  const syntax = spawnSync(process.execPath, ['--check', path.join(root, script)], { encoding: 'utf8' });
  check(syntax.status === 0, `${script} passes node --check`);
}

const lobby = await readFile(path.join(root, 'index.html'), 'utf8');
const lobbySdkPosition = lobby.indexOf('assets/arcade-sdk.js');
const lobbyPosition = lobby.indexOf('assets/arcade.js');
check(lobbySdkPosition >= 0, 'lobby loads the arcade SDK');
check(lobbyPosition > lobbySdkPosition, 'lobby loads the SDK before arcade.js');
check(lobby.includes('id="playableCount"'), 'lobby displays the playable cabinet count');

if (failures.length) {
  console.error(`\nLarriVerse validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}

console.log(`LarriVerse validation passed: ${catalog.length} concepts, ${playable} playable cabinets, ${checks.length} checks.`);
