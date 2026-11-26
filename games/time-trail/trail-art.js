// Scenery is thematic. The native grid, labels and authored level data define the exact route.
const scenicBackdrops = Object.freeze({
  meadow: 'assets/world-motion/backgrounds/countryside.webp',
  river: 'assets/world-motion/backgrounds/bridge-creek.webp',
  pines: 'assets/world-motion/backgrounds/cove-woodland.webp',
  ridge: 'assets/world-motion/backgrounds/cove-highland.webp',
  creek: 'assets/world-motion/backgrounds/bridge-creek.webp',
  forest: 'assets/world-motion/backgrounds/cove-woodland.webp',
  valley: 'assets/world-motion/backgrounds/cove-highland.webp',
  cloud: 'assets/world-motion/backgrounds/weather-puffy-clouds.webp',
  mountain: 'assets/world-motion/backgrounds/bridge-mountain.webp',
  summit: 'assets/world-motion/backgrounds/energy-mountain-night.webp'
});

const art = Object.freeze({
  hikerStand: 'games/time-trail/art/hiker-stand.webp',
  hikerStep: 'games/time-trail/art/hiker-step.webp',
  rock: 'games/robot-rover/art/rock-meadow.webp',
  flag: 'games/time-trail/art/mission-flag.webp',
  basket: 'assets/world-motion/objects/picnic-basket.webp'
});

const source = path => new URL('../../' + path, import.meta.url).href;
const escapeHtml = value => String(value).replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
);

export function trailScene(level, moves) {
  const backdrop = scenicBackdrops[level.zone];
  if (!backdrop) throw new Error(`Unknown trail landscape: ${level.zone}`);
  return `<section class="trail-landscape" data-trail-zone="${escapeHtml(level.zone)}">
    <div class="trail-landscape-stage" aria-hidden="true">
      <img class="trail-landscape-background" src="${source(backdrop)}" alt="" decoding="async" draggable="false">
      <img class="trail-landscape-hiker" src="${source(moves % 2 ? art.hikerStep : art.hikerStand)}" alt="" decoding="async" draggable="false">
    </div>
    <div class="trail-landscape-caption"><strong>Chapter ${level.chapter + 1}: ${escapeHtml(level.rank)}</strong>
      <span>Illustrative landscape · Follow the exact route on the grid below.</span></div>
  </section>`;
}

export function trailTilePicture(kind, moves = 0) {
  if (kind === 'collected') return '<span class="trail-collected" aria-hidden="true">✓</span>';
  if (kind === 'path') return '<span class="trail-path-dot" aria-hidden="true"></span>';
  const path = kind === 'hiker' ? (moves % 2 ? art.hikerStep : art.hikerStand) : art[kind];
  if (!path) throw new Error(`Unknown trail tile art: ${kind}`);
  return `<img class="trail-tile-picture trail-tile-picture--${kind}" src="${source(path)}" alt="" aria-hidden="true" decoding="async" draggable="false">`;
}

export function trailLegend() {
  return `<div class="route-legend">
    <span>${trailTilePicture('hiker')}You</span>
    <span>${trailTilePicture('flag')}Mission flag</span>
    <span>${trailTilePicture('basket')}Picnic finish</span>
    <span>✨ Glowing = next move</span>
  </div>`;
}

export const trailBackdropPaths = Object.freeze([...new Set(Object.values(scenicBackdrops))]);
