const escape = value => String(value).replace(/[&"<>]/g, character => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]);
const source = path => new URL(path, import.meta.url).href;
export const MARKET_SETTINGS = Object.freeze(['school-fair', 'park-picnic', 'neighborhood-market', 'summer-camp', 'reading-festival', 'garden-party', 'sports-day', 'community-parade', 'art-walk', 'library-lawn']);
const forecasts = {
  'Sunny park day': 'lab-sunny',
  'Rainy afternoon': 'lab-rainy',
  'Busy festival': 'lab-festival',
  'Quiet neighborhood day': 'lab-quiet',
};

function cupPicture() {
  return '<img class="lemon-cup-picture" src="' + source('./art/filled-cup.webp') + '" width="256" height="256" alt="" aria-hidden="true">';
}
function batch(stock) {
  return '<section class="lemon-batch" aria-label="Selected batch" data-lemon-stock="' + stock + '"><strong>Selected batch · ' + stock + ' cups</strong><div class="lemon-batch-cups" aria-hidden="true">' + Array.from({ length: stock }, cupPicture).join('') + '</div></section>';
}
function scene({ setting, label, stock, result = 'plan', forecast = '' }) {
  return '<figure class="lemon-market-picture" data-lemon-setting="' + setting + '" data-lemon-result="' + result + '"><div class="lemon-scene-art" aria-hidden="true">'
    + '<img class="lemon-landscape-picture" src="' + source('../../assets/world-motion/backgrounds/lemon-' + setting + '.webp') + '" width="832" height="468" alt="">'
    + '<div class="lemon-vendor"><img class="lemon-vendor-poses" src="' + source('../../assets/world-motion/characters/lemon-vendor.webp') + '" width="640" height="320" alt=""></div>'
    + '<div class="lemon-cart"><img class="lemon-cart-picture" src="' + source('./art/stand.webp') + '" width="384" height="384" alt="">'
    + '<img class="lemon-counter-pitcher" src="' + source('../../assets/world-motion/objects/lemon-pitcher.webp') + '" width="256" height="256" alt="">'
    + '<img class="lemon-counter-box" src="' + source('./art/cashbox.webp') + '" width="256" height="256" alt="">'
    + '<img class="lemon-counter-fruit" src="' + source('./art/lemons.webp') + '" width="256" height="256" alt=""></div></div>'
    + '<figcaption class="lemon-scene-caption"><strong class="lemon-setting-label">' + escape(label) + '</strong>' + (forecast ? '<p>' + escape(forecast) + '</p>' : '') + '</figcaption>' + batch(stock) + '</figure>';
}

export function missionScene(mission, index, stock, result) {
  return scene({ setting: MARKET_SETTINGS[index % MARKET_SETTINGS.length], label: mission.name.split(' · ')[0], stock, result: result ? result.profit >= mission.goal ? 'goal' : 'retry' : 'plan' });
}
export function labScene(forecast, stock, day) {
  if (!Object.hasOwn(forecasts, forecast.name)) return '';
  // Free play retains its original NEXT-day forecast. Sales stay in the ledger;
  // the cup pictures always describe the currently selected batch.
  return scene({ setting: forecasts[forecast.name], label: (day < 4 ? 'Forecast · ' : 'Final forecast · ') + forecast.name, stock, result: day ? 'served' : 'plan', forecast: forecast.base + ' customers at a 2-coin price' });
}
export function updateBatch(board, stock) {
  const panel = board.querySelector('.lemon-batch');
  if (panel) panel.outerHTML = batch(stock);
}
