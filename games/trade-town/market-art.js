import { iconSvg } from '../../assets/arcade-scenes.js';

// Only use illustrated item pictures when they show the named goods.
// Other requests retain their familiar, clearly labeled icon rather than a misleading picture.
const photographs = [
  [/^Apples for /, 'games/pantry-picnic/art/apple.webp'],
  [/^Carrots for /, 'games/pantry-picnic/art/carrot.webp'],
  [/^Bread rolls for /, 'games/pantry-picnic/art/bread.webp'],
  [/^Notebooks for |^Recycled sketchbooks |^Science notebooks /, 'games/repair-cafe/art/notebook.webp'],
  [/^Water bottles for |^Reusable bottles /, 'games/reuse-rally/art/reusable-bottle.webp'],
  [/^Reusable shopping bags /, 'assets/world-motion/objects/shopping-bag.webp'],
  [/^Garden gloves |^Beach cleanup gloves /, 'games/repair-cafe/art/glove.webp'],
  [/^Berry baskets /, 'games/pantry-picnic/art/berries.webp'],
  [/^Classroom rulers /, 'games/repair-cafe/art/ruler.webp'],
  [/^Community lanterns /, 'assets/world-motion/objects/lantern.webp'],
  [/^Picnic napkins /, 'games/pantry-picnic/art/cloth.webp']
];

const backdrops = [
  'assets/world-motion/backgrounds/market.webp',
  'assets/world-motion/backgrounds/lemon-neighborhood-market.webp',
  'assets/world-motion/backgrounds/lemon-school-fair.webp',
  'assets/world-motion/backgrounds/lemon-summer-camp.webp',
  'assets/world-motion/backgrounds/lemon-community-parade.webp',
  'assets/world-motion/backgrounds/lemon-art-walk.webp'
];
const escaped = value => String(value).replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]
);
const localAsset = path => new URL('../../' + path, import.meta.url).href;

export function tradeProductPhoto(level) {
  const match = photographs.find(([pattern]) => pattern.test(level.name));
  return match ? localAsset(match[1]) : null;
}

export function tradeItemPicture(level) {
  const photo = tradeProductPhoto(level);
  return `<span class="trade-item-picture" role="img" aria-label="${escaped(level.name)}">
    ${photo
      ? `<img class="trade-item-image" src="${photo}" alt="" decoding="async" draggable="false">`
      : `<span class="trade-item-symbol" aria-hidden="true">${iconSvg(level.icon)}</span>`}
  </span>`;
}

export function tradeMarketScene(level, levelIndex, quantity, cost, passed) {
  const district = Math.min(6, Math.floor(levelIndex / 10) + 1);
  const fill = Math.min(100, Math.round(quantity / level.need * 100));
  const overBudget = cost > level.budget;
  const ready = quantity >= level.need && !overBudget;
  const photo = tradeProductPhoto(level);
  const product = photo
    ? `<img class="trade-market-item" src="${photo}" alt="" draggable="false" decoding="async">`
    : `<span class="trade-market-item trade-market-item--symbol">${iconSvg(level.icon)}</span>`;
  return `<section class="trade-illustrated-market" data-trade-level="${levelIndex + 1}" data-trade-district="${district}"
    data-basket-ready="${ready}" data-completed="${Boolean(passed)}"
    aria-label="Market district ${district}: ${escaped(level.name)}. ${quantity} of ${level.need} items in basket, ${cost} of ${level.budget} coins.">
    <div class="trade-market-heading"><b>District ${district} · Market day</b><span>${escaped(level.name)}</span></div>
    <div class="trade-market-stage">
      <img class="trade-market-background" src="${localAsset(backdrops[district - 1])}" alt="" decoding="async" draggable="false">
      <div class="trade-market-vendor" aria-hidden="true">
        <img src="${localAsset('assets/world-motion/characters/baker.webp')}" alt="" draggable="false">
      </div>
      <div class="trade-market-display" aria-hidden="true">${product}</div>
      <div class="trade-market-basket" aria-hidden="true">
        <img src="${localAsset('assets/world-motion/objects/shopping-bag.webp')}" alt="">
        <span class="trade-market-basket-count">${quantity} / ${level.need}</span>
        <i style="--trade-basket-fill:${fill}%"></i>
      </div>
    </div>
    <div class="trade-market-summary" aria-live="off">
      <span>${quantity} of ${level.need} items</span>
      <span class="${overBudget ? 'trade-market-over-budget' : ready ? 'trade-market-ready' : ''}">
        ${cost} / ${level.budget} coins${overBudget ? ' · Over budget' : passed ? ' · Checked out!' : ready ? ' · Ready to check out' : ''}
      </span>
    </div>
  </section>`;
}
