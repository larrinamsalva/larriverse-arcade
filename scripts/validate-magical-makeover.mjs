import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const catalog = JSON.parse(read('games/catalog.json'));
const sdk = read('assets/arcade-sdk.js');
const shell = read('assets/cabinet-shell.js');
const accessibility = read('assets/arcade-accessibility.css');
const scenes = read('assets/arcade-scenes.js');
const game = read('assets/skill-games.js');
const expedition = read('assets/expedition-games.js');
const expeditionCss = read('assets/expedition-games.css');
const [{ trafficSignSvg }, { trafficQuestions }] = await Promise.all([
  import('../assets/arcade-scenes.js'),
  import('../assets/expanded-scenarios.js')
]);
const failures = [];
let checks = 0;

function check(condition, message) {
  checks++;
  if (!condition) failures.push(message);
}

check(catalog.length === 29, 'makeover contract expects all 29 preserved cabinets');
for (const cabinet of catalog) {
  check(sdk.includes(`'${cabinet.id}':`), `Bloom needs contextual guidance for ${cabinet.id}`);
  const html = read(cabinet.href.replace(/^\.\//, ''));
  check(html.includes('arcade-sdk.js'), `${cabinet.id} must load the shared theme and Bloom foundation`);
}

check(sdk.includes("theme: 'system'"), 'settings default to following the device theme');
check(sdk.includes("THEME_ORDER = ['light', 'dark', 'system']"), 'light, dark, and device choices stay explicit');
check(sdk.includes("bloomHidden: false"), 'Bloom visibility is locally configurable');
check(sdk.includes("prefers-color-scheme: dark"), 'device color preference is observed');
check(shell.includes('data-lv-theme'), 'cabinet comfort dialog exposes the three-way theme control');
check(shell.includes('data-lv-theme-cycle'), 'every cabinet receives a visible theme shortcut');
check(accessibility.includes('.bloom-guide'), 'Bloom has a reusable shared visual component');
check(accessibility.includes('html.larriverse-dark'), 'shared dark-theme styles exist');
check(accessibility.includes('prefers-reduced-motion: reduce'), 'Bloom and scenery respect reduced motion');

for (const token of ['bridgePartDrawing', 'bridgeCartSvg', 'lemonadeStandSvg', 'musicStudioSvg', 'trafficSignSvg']) {
  check(scenes.includes(`function ${token}`) || scenes.includes(`const ${token}`), `${token} detailed artwork is present`);
}
for (const detail of ['wood-grain', 'bridge-structure', 'bridge-abutment', 'bridge-river']) {
  check(scenes.includes(detail) || expedition.includes(detail) || expeditionCss.includes(detail), `Bridge Buddies retains ${detail} detail`);
}
check(game.includes('trafficSignSvg(item.title)'), 'Traffic Town renders recognizable sign artwork');
const renderedSigns = trafficQuestions.map(question => trafficSignSvg(question.title));
const signSymbols = renderedSigns.map(svg => svg.replace(/ aria-label="[^"]+"/, ''));
check(trafficQuestions.length === 30, 'Traffic Town keeps its complete 30-sign learning set');
check(new Set(signSymbols).size === trafficQuestions.length, 'every Traffic Town sign has distinct identifying artwork');
check(renderedSigns.every(svg => /<svg class="traffic-sign-art"[^>]+role="img"/.test(svg)), 'traffic sign artwork retains accessible image semantics');
check(game.includes('lemonadeStandSvg(forecast.name)'), 'Lemonade Lab renders its detailed stand and weather');
check(game.includes('musicStudioSvg()'), 'Beat Builder renders the illustrated studio');
check(game.includes('iconSvg("robot", "rover-token")'), 'Robot Rover uses a detailed mechanical rover instead of an emoji');
check(game.includes('larriverse:bloom-message'), 'game feedback reaches Bloom locally');
check(!sdk.includes('fetch(') && !sdk.includes('WebSocket'), 'Bloom remains scripted, local, and network-free');

if (failures.length) {
  console.error(`Magical makeover validation failed (${failures.length}/${checks}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Magical makeover validated: ${checks} checks across ${catalog.length} cabinets, three themes, Bloom, and detailed priority-game art.`);
