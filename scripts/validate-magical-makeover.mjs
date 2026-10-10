import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const catalog = JSON.parse(read('games/catalog.json'));
const release = JSON.parse(read('release.json'));
const sdk = read('assets/arcade-sdk.js');
const shell = read('assets/cabinet-shell.js');
const accessibility = read('assets/arcade-accessibility.css');
const scenes = read('assets/arcade-scenes.js');
const game = read('assets/skill-games.js');
const expedition = read('assets/expedition-games.js');
const expeditionCss = read('assets/expedition-games.css');
const bubbleGame = read('games/bubble-resonance-phi369/game.js');
const bubbleCss = read('games/bubble-resonance-phi369/game.css');
const bubbleHtml = read('games/bubble-resonance-phi369/index.html');
const chillCss = read('games/chill-brain-rewards/game.css');
const roadTripGame = read('games/road-trip-quest/game.js');
const roadTripHtml = read('games/road-trip-quest/index.html');
const gpsGame = read('games/road-trip-quest-gps/game.js');
const gpsHtml = read('games/road-trip-quest-gps/index.html');
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

check(catalog.length === release.cabinetCount, 'makeover contract covers every declared cabinet');
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

for (const token of ['bridgePartDrawing', 'bridgeCartSvg', 'lemonadeStandSvg', 'musicStudioSvg', 'trafficSignSvg', 'placeSvg']) {
  check(scenes.includes(`function ${token}`) || scenes.includes(`const ${token}`), `${token} detailed artwork is present`);
}
for (const object of ['tree', 'boat', 'car', 'truck', 'airplane', 'trafficLight', 'fuel', 'house', 'pine', 'mountain']) {
  check(scenes.includes(`${object}: '`), `${object} has a code-native dimensional model`);
}
check(scenes.includes('object-ground-shadow') && scenes.includes('object-model--'), 'shared object drawings include cast shadows and model-specific groups');
for (const detail of ['wood-grain', 'bridge-structure', 'bridge-abutment', 'bridge-river', 'bridge-tool-art', 'bridge-piers', 'bridge-load-plaque', 'bridge-vehicle--']) {
  check(scenes.includes(detail) || expedition.includes(detail) || expeditionCss.includes(detail), `Bridge Buddies retains ${detail} detail`);
}
check(game.includes('trafficSignSvg(item.title)'), 'Traffic Town renders recognizable sign artwork');
const renderedSigns = trafficQuestions.map(question => trafficSignSvg(question.title));
const signSymbols = renderedSigns.map(svg => svg.replace(/ aria-label="[^"]+"/, ''));
check(trafficQuestions.length === 60, 'Traffic Town keeps its complete 60-sign learning set');
check(new Set(signSymbols).size === trafficQuestions.length, 'every Traffic Town sign has distinct identifying artwork');
check(renderedSigns.every(svg => /<svg class="traffic-sign-art"[^>]+role="img"/.test(svg)), 'traffic sign artwork retains accessible image semantics');
check(renderedSigns.every(svg => svg.includes('sign-depth') && svg.includes('sign-sheen') && svg.includes('sign-ground-shadow')), 'every traffic sign includes depth, reflected light, and a cast shadow');
check(game.includes('lemonadeStandSvg(forecast.name)'), 'Lemonade Lab renders its detailed stand and weather');
check(game.includes('musicStudioSvg()'), 'Beat Builder renders the illustrated studio');
check(game.includes('iconSvg("robot", "rover-token")'), 'Robot Rover uses a detailed mechanical rover instead of an emoji');
check(bubbleGame.includes('CANVAS_THEMES') && bubbleGame.includes('drawShooter'), 'Bubble Resonance has a theme-aware illustrated launcher');
check(bubbleGame.includes('canvas.dataset.colorMode'), 'Bubble Resonance exposes the resolved canvas color mode for QA');
check(bubbleGame.includes('const BUBBLE_LEVELS=[') && bubbleGame.includes("['Grand Resonance Finale',6,6,3"), 'Bubble Resonance has sixty stages ending at Grand Resonance Finale');
check(bubbleGame.includes('function bubble(') && bubbleGame.includes('ctx.arc(x,y,r*.94') && !bubbleGame.includes('function hex('), 'Bubble Resonance uses circular bubble artwork instead of hexagons');
check(bubbleGame.includes("row:{name:'Row Wave'") && bubbleGame.includes("burst:{name:'Star Burst'") && bubbleGame.includes("sweep:{name:'Color Sweep'"), 'Bubble Resonance includes row, neighbor-burst, and matching-number power bubbles');
check(bubbleGame.includes('POWER_INTERVAL=5') && bubbleGame.includes('function activatePower('), 'Bubble Resonance delivers and activates special bubbles on a predictable cadence');
check(bubbleHtml.includes('id="levelAction"') && bubbleGame.includes('setLevelAction(`Next level') && bubbleCss.includes('.message.actionable'), 'Bubble Resonance exposes a prominent working next-level action after a clear');
check(bubbleCss.includes('html.larriverse-light') && bubbleCss.includes('--bubble-field'), 'Bubble Resonance cabinet has a complete light-theme palette');
check(chillCss.includes('--chill-ink: #173b32') && chillCss.includes('--chill-copy: #304d45'), 'Chill Brain light cards use a deliberately dark reading palette');
check(chillCss.includes('.badge.locked span') && chillCss.includes('filter: grayscale(1)') && chillCss.includes('opacity: 1'), 'Chill Brain keeps locked badge labels fully opaque while muting only their icons');
check(chillCss.includes('html.larriverse-dark body[data-classic="chill-brain-rewards"]'), 'Chill Brain card contrast stays intentional in dark mode');
check(roadTripGame.includes("import { iconSvg }") && roadTripGame.includes("icon:'airplane'") && roadTripGame.includes("icon:'truck'"), 'Road Trip Quest uses dimensional shared vehicle and scenery models');
check(!roadTripHtml.includes('<div class="car" id="car" aria-label="Player car">🚗'), 'Road Trip Quest no longer uses a flat emoji player car');
check(gpsGame.includes('placeSvg(poi.type') && gpsGame.includes("iconSvg('car', 'gps-car-art')"), 'Road Trip GPS renders dimensional place markers and player vehicle');
check(!gpsHtml.includes('aria-label="Player position">🚙'), 'Road Trip GPS no longer uses a flat emoji player vehicle');
check(game.includes('larriverse:bloom-message'), 'game feedback reaches Bloom locally');
check(!sdk.includes('fetch(') && !sdk.includes('WebSocket'), 'Bloom remains scripted, local, and network-free');

if (failures.length) {
  console.error(`Magical makeover validation failed (${failures.length}/${checks}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Magical makeover validated: ${checks} checks across ${catalog.length} cabinets, three themes, Bloom, and detailed priority-game art.`);
