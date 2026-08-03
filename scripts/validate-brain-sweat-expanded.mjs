import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const checks = [];
const check = (condition, message) => (condition ? checks : failures).push(message);
const file = relative => path.join(root, relative);

async function exists(relative) {
  try { await access(file(relative)); return true; }
  catch { return false; }
}

async function readJson(relative, label) {
  try { return JSON.parse(await readFile(file(relative), 'utf8')); }
  catch (error) { failures.push(`${label}: valid JSON (${error.message})`); return null; }
}

const gamePath = 'games/brain-sweat-expanded';
const catalog = await readJson('games/catalog.json', 'catalog');
const entry = Array.isArray(catalog) ? catalog.find(game => game.id === 'brain-sweat-expanded') : null;
check(Boolean(entry), 'catalog includes Brain Sweat Expanded');
check(entry?.available === true, 'Brain Sweat Expanded is playable');
check(entry?.integration === 'arcade-sdk-v2', 'Brain Sweat Expanded uses Arcade SDK v2');
check(entry?.activities === `${gamePath}/activities.json`, 'catalog declares the activity manifest');

const manifest = await readJson(`${gamePath}/activities.json`, 'Brain Sweat Expanded manifest');
if (manifest) {
  check(manifest.schemaVersion === 1, 'activity schema version is 1');
  check(manifest.source?.file === 'brain_sweat_full_expanded.html', 'manifest names the recovered source');
  check(manifest.source?.skillWorldCount === 14, 'source declares 14 skill worlds');
  check(manifest.source?.toolWorldCount === 8, 'source declares eight tool worlds');
  check(manifest.source?.actionWorldCount === 4, 'source declares four action worlds');
  check(manifest.source?.checkbookTransactionCount === 24, 'source declares 24 checkbook transactions');
  check(manifest.source?.voltageCircuitCount === 12, 'source declares 12 voltage circuits');
  check(manifest.source?.activityCount === 219, 'source declares 219 activities');
  check(manifest.source?.guideCount === 3, 'source declares three guides');
  check(manifest.source?.dailyQuestCount === 4, 'source declares four daily quests');
  check(manifest.integration?.playableWorldCount === 6, 'integration declares six reviewed worlds');
  check(manifest.integration?.playableActivityCount === 69, 'integration declares 69 playable activities');
  check(typeof manifest.integration?.reviewPolicy === 'string' && manifest.integration.reviewPolicy.includes('no actionable content'), 'review policy excludes queued activity payloads');
  check(typeof manifest.integration?.progressMeaning === 'string' && /not professional competence/i.test(manifest.integration.progressMeaning), 'progress boundary is explicit');
  check(Array.isArray(manifest.guides) && manifest.guides.length === 3, 'three source guides are present');
  check(Array.isArray(manifest.dailyQuests) && manifest.dailyQuests.length === 4, 'four safe daily quests are present');
  check(Array.isArray(manifest.worldFiles) && manifest.worldFiles.length === 4, 'manifest splits worlds into four bundles');

  const worldLists = [];
  for (const reference of manifest.worldFiles || []) {
    check(typeof reference === 'string' && reference.startsWith('content/') && !reference.includes('..'), `${reference}: bundle path is safe`);
    const relative = `${gamePath}/${reference}`;
    check(await exists(relative), `${reference}: bundle exists`);
    const data = await readJson(relative, reference);
    check(Array.isArray(data), `${reference}: bundle contains a world array`);
    if (Array.isArray(data)) worldLists.push(...data);
  }

  const sourceOrder = ['plumbing','checkbook','voltage','caregiving','retail','welding','roofing','hvac','landscaping','community','emergency','cooking','farming','coding'];
  const ids = new Set();
  const activityIds = new Set();
  let sourceTotal = 0;
  let reviewedWorlds = 0;
  let playableTotal = 0;

  check(worldLists.length === 14, 'world bundles contain exactly 14 worlds');
  check(sourceOrder.every(id => worldLists.some(world => world.id === id)), 'all source world IDs are represented');

  for (const world of worldLists) {
    check(typeof world.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(world.id), `${world.id}: world ID is safe`);
    check(!ids.has(world.id), `${world.id}: world ID is unique`);
    ids.add(world.id);
    check(typeof world.title === 'string' && world.title.trim(), `${world.id}: title is present`);
    check(['tool-sequence','choice','ledger','virtual-circuit'].includes(world.mode), `${world.id}: mode is supported`);
    check(Number.isInteger(world.sourceCount) && world.sourceCount > 0, `${world.id}: source count is positive`);
    check(Array.isArray(world.tiers) && world.tiers.length === 3, `${world.id}: beginner, intermediate, and advanced tiers exist`);
    sourceTotal += Number(world.sourceCount) || 0;

    const hasReviewed = world.tiers?.some(tier => tier.status === 'reviewed');
    if (hasReviewed) reviewedWorlds += 1;
    let worldTierTotal = 0;

    for (const tier of world.tiers || []) {
      check(['beg','int','adv'].includes(tier.id), `${world.id}/${tier.id}: tier ID is supported`);
      check(['reviewed','review-queued'].includes(tier.status), `${world.id}/${tier.id}: review status is supported`);
      check(Number.isInteger(tier.sourceCount) && tier.sourceCount > 0, `${world.id}/${tier.id}: source count is positive`);
      check([3,6,9].includes(tier.reward?.kc), `${world.id}/${tier.id}: KC reward follows 3·6·9`);
      check(Number(tier.reward?.xp) > 0, `${world.id}/${tier.id}: XP reward is positive`);
      worldTierTotal += Number(tier.sourceCount) || 0;

      const payload = tier.scenarios || tier.transactions || [];
      check(Array.isArray(payload), `${world.id}/${tier.id}: payload is an array`);
      if (tier.status === 'review-queued') {
        check(payload.length === 0, `${world.id}/${tier.id}: queued tier publishes no activities`);
        check(typeof tier.reviewNote === 'string' && tier.reviewNote.trim().length > 30, `${world.id}/${tier.id}: review gate is explained`);
        continue;
      }

      check(payload.length === tier.sourceCount, `${world.id}/${tier.id}: reviewed payload matches source count`);
      playableTotal += payload.length;
      for (const item of payload) {
        check(typeof item.id === 'string' && item.id.startsWith(`${world.id}-`), `${world.id}: activity ID is namespaced`);
        check(!activityIds.has(item.id), `${item.id}: activity ID is unique`);
        activityIds.add(item.id);

        if (world.mode === 'ledger') {
          check(typeof item.description === 'string' && item.description.trim(), `${item.id}: transaction description is present`);
          check(Number(item.amount) > 0, `${item.id}: transaction amount is positive`);
          check(['deposit','withdrawal'].includes(item.type), `${item.id}: transaction type is valid`);
        } else if (world.mode === 'tool-sequence') {
          check(typeof item.title === 'string' && item.title.trim(), `${item.id}: title is present`);
          check(typeof item.description === 'string' && item.description.trim(), `${item.id}: description is present`);
          check(typeof item.hint === 'string' && item.hint.trim(), `${item.id}: source hint is present`);
          check(Array.isArray(item.requiredTools) && item.requiredTools.length >= 2, `${item.id}: tool sequence has at least two steps`);
          const toolIds = new Set((world.tools || []).map(tool => tool.id));
          check(item.requiredTools.every(toolId => toolIds.has(toolId)), `${item.id}: tool sequence uses known tools`);
        } else if (world.mode === 'choice') {
          check(typeof item.title === 'string' && item.title.trim(), `${item.id}: title is present`);
          check(typeof item.description === 'string' && item.description.trim(), `${item.id}: description is present`);
          check(typeof item.hint === 'string' && item.hint.trim(), `${item.id}: source hint is present`);
          check(Array.isArray(item.actions) && item.actions.length === 4, `${item.id}: choice activity has four actions`);
          check(item.actions.some(action => action.id === item.correct), `${item.id}: marked answer exists among actions`);
        }
      }
    }
    check(worldTierTotal === world.sourceCount, `${world.id}: tier counts match the world source count`);
  }

  check(sourceTotal === 219, 'world source counts add to 219');
  check(reviewedWorlds === 6, 'exactly six worlds contain reviewed activities');
  check(playableTotal === 69, 'reviewed payloads add to 69 activities');
  check(activityIds.size === 69, 'all 69 playable activity IDs are unique');
  for (const quest of manifest.dailyQuests || []) {
    check(ids.has(quest.worldId), `${quest.id}: daily quest references a known world`);
    const world = worldLists.find(item => item.id === quest.worldId);
    check(world?.tiers.some(tier => tier.status === 'reviewed'), `${quest.id}: daily quest references a reviewed world`);
  }
}

const html = await readFile(file(`${gamePath}/index.html`), 'utf8');
const sdkPosition = html.indexOf('../../assets/arcade-sdk.js');
const loaderPosition = html.indexOf('loader.js');
const gamePosition = html.indexOf('game.js');
check(sdkPosition >= 0 && loaderPosition > sdkPosition && gamePosition > loaderPosition, 'cabinet loads SDK, bundle loader, then game engine');
check(/Practice is not permission/i.test(html), 'cabinet states that practice is not permission');
check(/does not certify real-world competence/i.test(html), 'cabinet rejects competence claims');
check(/electrical, medical, emergency, roofing, welding, plumbing, HVAC, animal-care/i.test(html), 'hazard categories are named explicitly');

for (const script of [`${gamePath}/loader.js`, `${gamePath}/game.js`]) {
  check(await exists(script), `${script}: script exists`);
}

if (failures.length) {
  console.error(`\nBrain Sweat Expanded validation failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`);
  failures.forEach(message => console.error(`  ✗ ${message}`));
  process.exit(1);
}
console.log(`Brain Sweat Expanded validation passed: 14 worlds, 219 source activities, 69 reviewed activities, ${checks.length} checks.`);
