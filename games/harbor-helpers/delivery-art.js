const settingFor = new Map([
  ['tree', 'garden'], ['apple', 'garden'], ['seed', 'garden'], ['sun', 'garden'],
  ['hut', 'workshop'], ['wood', 'workshop'], ['metal', 'workshop'],
  ['lighthouse', 'beacon'], ['book', 'learning'], ['drop', 'community'],
  ['bread', 'community'], ['mountain', 'mountain'], ['market', 'market'],
  ['music', 'festival'], ['star', 'festival']
]);
const transports = ['skiff', 'supply', 'cargo', 'large-supply', 'dock-ferry', 'hauler-ferry', 'coastal-convoy', 'grand-convoy'];
const widths = ['30%', '33%', '36%', '38%', '40%', '42%', '42%', '44%'];
const supplies = new Set(['water', 'seeds', 'wood', 'books', 'food', 'tools', 'fruit', 'lights', 'market', 'music']);
const artwork = name => new URL('./art/' + name + '.webp', import.meta.url).href;
const background = name => new URL('../../assets/world-motion/backgrounds/harbor-' + name + '.webp', import.meta.url).href;

export function harborCargoPicture(id) {
  return supplies.has(id) ? '<img class="harbor-cargo-picture" src="' + artwork(id) + '" width="256" height="256" alt="" aria-hidden="true" data-harbor-cargo="' + id + '">' : '';
}

export function harborDeliveryScene(level, arrived = false) {
  const setting = settingFor.get(level.icon);
  const transport = transports[level.chapter - 1];
  if (!setting || !transport) return '';
  return '<div class="harbor-map harbor-map--illustrated' + (arrived ? ' harbor-arrived' : '') + '" data-harbor-setting="' + setting + '" data-harbor-transport="' + transport + '" style="--harbor-vessel-width:' + widths[level.chapter - 1] + '" aria-hidden="true">' +
    '<img class="harbor-island-backdrop" src="' + background(setting) + '" width="832" height="468" alt="">' +
    '<span class="harbor-water-glint"></span>' +
    '<div class="harbor-vessel"><span class="harbor-vessel-wake"></span><img class="harbor-transport-picture" src="' + artwork(transport) + '" width="400" height="240" alt=""></div>' +
    '<img class="harbor-dock-bollard" src="' + artwork('bollard') + '" width="256" height="256" alt=""></div>';
}
