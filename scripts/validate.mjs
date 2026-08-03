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
  try { return JSON.parse(await readFile(path.join(root, relativePath), 'utf8')); }
  catch (error) { failures.push(`${label}: valid JSON (${error.message})`); return null; }
}

function safeSlug(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
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

    check(safeSlug(world.id), `${label}: ${reference} has a safe world id`);
    check(!worldIds.has(world.id), `${label}: world id ${world.id} is unique`);
    worldIds.add(world.id);
    check(typeof world.title === 'string' && world.title.trim().length > 0, `${label}: ${world.id} has a title`);
    check(Array.isArray(world.lessons) && world.lessons.length > 0, `${label}: ${world.id} contains lessons`);
    if (!Array.isArray(world.lessons)) continue;

    for (const lesson of world.lessons) {
      totalLessons += 1;
      check(safeSlug(lesson.id), `${label}: lesson id is a safe slug`);
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
  if (manifest.source && Number.isInteger(manifest.source.worldCount)) check(manifest.source.worldCount === worldIds.size, `${label}: source world count matches content files`);
  if (manifest.source && Number.isInteger(manifest.source.lessonCount)) check(manifest.source.lessonCount === totalLessons, `${label}: source lesson count matches content files`);
}

async function validateSessions(game, label) {
  if (game.sessions === undefined) return;
  check(typeof game.sessions === 'string' && game.sessions.startsWith('games/') && !game.sessions.includes('..'), `${label}: session manifest path is safe`);
  if (typeof game.sessions !== 'string') return;
  const manifestExists = await exists(game.sessions);
  check(manifestExists, `${label}: session manifest exists at ${game.sessions}`);
  if (!manifestExists) return;
  const manifest = await readJson(game.sessions, `${label}: session manifest`);
  if (!manifest) return;

  check(Number.isInteger(manifest.schemaVersion) && manifest.schemaVersion >= 1, `${label}: session schema version is declared`);
  check(manifest.source && manifest.source.file === game.source, `${label}: session manifest names the recovered source file`);
  check(manifest.source?.onboardingSteps === 6, `${label}: preserves six onboarding steps`);
  check(manifest.source?.profilePaths === 4, `${label}: preserves four profile paths`);
  check(manifest.source?.avatarCount === 8, `${label}: preserves eight source avatars`);
  check(manifest.source?.skillTracks === 6, `${label}: preserves six skill tracks`);
  check(manifest.source?.badgeConcepts === 12, `${label}: preserves twelve badge concepts`);
  check(typeof manifest.source?.note === 'string' && manifest.source.note.trim().length > 20, `${label}: distinguishes source material from new integration work`);

  check(manifest.privacy?.storage === 'device-local', `${label}: profile data is device-local`);
  check(manifest.privacy?.publicProfiles === false, `${label}: public profiles are disabled`);
  check(manifest.privacy?.cloudAccounts === false, `${label}: cloud accounts are disabled`);
  check(typeof manifest.privacy?.note === 'string' && manifest.privacy.note.trim().length > 0, `${label}: privacy behavior is explained`);

  check(manifest.audio?.defaultEnabled === false, `${label}: sound defaults off`);
  check(manifest.audio?.medicalClaims === false, `${label}: audio makes no medical claims`);
  check(manifest.audio?.kind === 'simple-generated-ambience', `${label}: audio is simple generated ambience`);
  check(typeof manifest.audio?.note === 'string' && /does not include Hemi-Sync/i.test(manifest.audio.note), `${label}: Hemi-Sync boundary is explicit`);

  check(Array.isArray(manifest.avatars) && manifest.avatars.length === manifest.source?.avatarCount, `${label}: avatar count matches the source`);
  check(new Set(manifest.avatars || []).size === (manifest.avatars || []).length, `${label}: avatars are unique`);

  const profileIds = new Set();
  const missionIds = new Set();
  const skillIds = new Set();
  const badgeIds = new Set();

  check(Array.isArray(manifest.profiles) && manifest.profiles.length === manifest.source?.profilePaths, `${label}: profile count matches the source`);
  for (const profile of manifest.profiles || []) {
    check(safeSlug(profile.id), `${label}: profile id is a safe slug`);
    check(!profileIds.has(profile.id), `${label}: profile id ${profile.id} is unique`);
    profileIds.add(profile.id);
    check(typeof profile.title === 'string' && profile.title.trim().length > 0, `${label}: ${profile.id} has a title`);
    check(typeof profile.recommendedMission === 'string', `${label}: ${profile.id} has a recommended mission`);
  }

  check(Array.isArray(manifest.skills) && manifest.skills.length === manifest.source?.skillTracks, `${label}: skill count matches the source`);
  for (const skill of manifest.skills || []) {
    check(typeof skill.id === 'string' && /^[a-z][a-zA-Z0-9]{0,39}$/.test(skill.id), `${label}: skill id ${skill.id} is safe`);
    check(!skillIds.has(skill.id), `${label}: skill id ${skill.id} is unique`);
    skillIds.add(skill.id);
    check(typeof skill.title === 'string' && skill.title.trim().length > 0, `${label}: ${skill.id} has a title`);
  }

  check(Array.isArray(manifest.missions) && manifest.missions.length === manifest.source?.profilePaths, `${label}: one source mission exists for each profile path`);
  for (const mission of manifest.missions || []) {
    check(safeSlug(mission.id), `${label}: mission id is a safe slug`);
    check(!missionIds.has(mission.id), `${label}: mission id ${mission.id} is unique`);
    missionIds.add(mission.id);
    check(typeof mission.name === 'string' && mission.name.trim().length > 0, `${label}: ${mission.id} has a name`);
    check(typeof mission.world === 'string' && mission.world.trim().length > 0, `${label}: ${mission.id} has a world`);
    check(Number.isInteger(mission.durationSeconds) && mission.durationSeconds >= 60 && mission.durationSeconds <= 600, `${label}: ${mission.id} has a safe source duration`);
    check(Number(mission.sourceXp) > 0 && Number(mission.kc) > 0, `${label}: ${mission.id} declares positive rewards`);
    check(Array.isArray(mission.steps) && mission.steps.length === 4 && mission.steps.every(step => typeof step === 'string' && step.trim()), `${label}: ${mission.id} preserves four readable steps`);
    check(mission.cue && ['inhale', 'hold', 'exhale', 'rest'].every(key => Number.isFinite(Number(mission.cue[key])) && Number(mission.cue[key]) >= 0), `${label}: ${mission.id} has nonnegative breathing cues`);
    check(Number(mission.cue?.inhale) > 0 && Number(mission.cue?.exhale) > 0, `${label}: ${mission.id} includes inhale and exhale cues`);
    check(mission.skillWeights && Object.keys(mission.skillWeights).length > 0, `${label}: ${mission.id} awards practice skills`);
    for (const [skillId, weight] of Object.entries(mission.skillWeights || {})) {
      check(skillIds.has(skillId), `${label}: ${mission.id} references known skill ${skillId}`);
      check(Number(weight) > 0, `${label}: ${mission.id} skill weight for ${skillId} is positive`);
    }
  }

  for (const profile of manifest.profiles || []) check(missionIds.has(profile.recommendedMission), `${label}: ${profile.id} recommends a known mission`);

  check(Array.isArray(manifest.badges) && manifest.badges.length === manifest.source?.badgeConcepts, `${label}: badge count matches the source`);
  for (const badge of manifest.badges || []) {
    check(safeSlug(badge.id), `${label}: badge id is a safe slug`);
    check(!badgeIds.has(badge.id), `${label}: badge id ${badge.id} is unique`);
    badgeIds.add(badge.id);
    check(typeof badge.name === 'string' && badge.name.trim().length > 0, `${label}: ${badge.id} has a name`);
    check(typeof badge.rule === 'string' && badge.rule.trim().length > 0, `${label}: ${badge.id} has an unlock rule`);
  }
}

const catalog = JSON.parse(await readFile(path.join(root, 'games/catalog.json'), 'utf8'));
check(Array.isArray(catalog), 'catalog is an array');
check(catalog.length > 0, 'catalog contains at least one cabinet');

const ids = new Set();
const hrefs = new Set();
let playable = 0;

for (const [index, game] of catalog.entries()) {
  const label = game.title || `entry ${index + 1}`;
  check(safeSlug(game.id), `${label}: id is a safe slug`);
  check(!ids.has(game.id), `${label}: id is unique`);
  ids.add(game.id);
  check(typeof game.title === 'string' && game.title.trim().length > 0, `${label}: title is present`);
  check(typeof game.desc === 'string' && game.desc.trim().length >= 20, `${label}: description is meaningful`);
  check(typeof game.category === 'string' && game.category.trim().length > 0, `${label}: category is present`);
  check(typeof game.status === 'string' && game.status.trim().length > 0, `${label}: status is present`);
  check(typeof game.available === 'boolean', `${label}: available is boolean`);
  check(typeof game.href === 'string' && game.href.startsWith('games/') && !game.href.includes('..'), `${label}: href stays inside games/`);
  check(!hrefs.has(game.href), `${label}: href is unique`);
  hrefs.add(game.href);

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
  await validateSessions(game, label);
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
