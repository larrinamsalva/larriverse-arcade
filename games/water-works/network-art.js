const settings = ['meadow', 'mountain', 'orchard', 'coast'];
const names = ['Meadow village', 'Mountain valley', 'Orchard gardens', 'Coastal town'];
const objects = new Set(['reservoir', 'town', 'filter', 'shrub', 'tree']);
const endpoint = [[50, 5], [95, 50], [50, 95], [5, 50]];
const directions = ['north', 'east', 'south', 'west'];
const art = name => new URL('./art/' + name + '.webp', import.meta.url).href;

export function waterObject(name) {
  return objects.has(name) ? '<img class="water-object-picture" src="' + art(name) + '" width="256" height="256" alt="" aria-hidden="true">' : '';
}
export function waterNetworkScene(index) {
  const section = Math.min(3, Math.max(0, Math.floor(index / 20)));
  const source = new URL('../../assets/world-motion/backgrounds/water-' + settings[section] + '.webp', import.meta.url).href;
  return '<figure class="water-landscape" data-water-setting="' + settings[section] + '"><img src="' + source + '" width="832" height="468" alt=""><figcaption>' + names[section] + '</figcaption></figure>';
}

// Geometry remains native SVG. Textured metal and fittings follow the exact
// authored ports, including the actual incoming side of a traced water route.
export function waterPipeDrawing(pair, index, flow = []) {
  const [a, b] = pair.map(direction => endpoint[direction]);
  const straight = (pair[0] + 2) % 4 === pair[1];
  const near = point => point.map(value => 50 + (value - 50) * .36);
  const an = near(a), bn = near(b);
  const route = straight ? 'M' + a.join(' ') + 'L' + b.join(' ')
    : 'M' + a.join(' ') + 'L' + an.join(' ') + 'Q50 50 ' + bn.join(' ') + 'L' + b.join(' ');
  const step = flow.indexOf(index);
  const incoming = step < 0 ? pair[0] : step === 0 ? 3 : [-5, 1, 5, -1].indexOf(flow[step - 1] - index);
  const reverse = pair[0] !== incoming;
  const material = 'water-steel-' + index;
  const fittings = pair.map(direction => '<g transform="rotate(' + direction * 90 + ' 50 50)"><rect x="34" y="7" width="32" height="11" rx="3" fill="url(#' + material + ')" stroke="#3e5360" stroke-width="2"/><circle cx="38" cy="12" r="1.6" fill="#f4faff"/><circle cx="62" cy="12" r="1.6" fill="#f4faff"/></g>').join('');
  return '<defs><pattern id="' + material + '" patternUnits="userSpaceOnUse" width="100" height="100"><image href="' + art('steel') + '" width="100" height="100" preserveAspectRatio="xMidYMid slice"/></pattern></defs>' +
    '<path class="pipe-shadow" d="' + route + '" fill="none" stroke="#344c59" stroke-width="33" stroke-linejoin="round"/>' +
    '<path class="pipe-shell" d="' + route + '" fill="none" style="stroke:url(#' + material + ')" stroke-width="26" stroke-linejoin="round"/>' +
    '<path class="pipe-highlight" d="' + route + '" fill="none" stroke="#eaf7ff" stroke-width="4" opacity=".65"/>' + fittings +
    '<circle class="pipe-joint" cx="50" cy="50" r="10" style="fill:url(#' + material + ')" stroke="#4d626e" stroke-width="2"/>' +
    '<path class="pipe-flow' + (reverse ? ' water-flow-backward' : '') + '" d="' + route + '" fill="none" stroke="#009bd0" stroke-width="9" data-water-incoming="' + directions[incoming] + '"/>' +
    (index === 12 ? '<circle class="pipe-filter-ring" cx="50" cy="50" r="22" fill="#bca9dc" stroke="#695083" stroke-width="4"/><circle cx="50" cy="50" r="13" fill="#f6efff"/><text x="50" y="57" text-anchor="middle" fill="#4e366b" font-size="20" font-weight="bold">F</text>' : '');
}
