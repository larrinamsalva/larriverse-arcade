import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tradeLevels } from '../assets/expedition-worlds.js';
import { tradeProductPhoto, tradeMarketScene, tradeItemPicture } from '../games/trade-town/market-art.js';

// Protect the 60 authored requests, the six save districts, and exact product imagery.
assert.equal(tradeLevels.length, 60, 'Trade Town must keep its 60 saved challenges');
const districtScenes = new Set();
let photographedGoods = 0;
for (const [index, level] of tradeLevels.entries()) {
  assert.equal(level.deals.length, 3, level.name + ': each request needs three offers');
  assert.ok(level.need > 0 && level.budget > 0, level.name + ': keep the budget rules');
  const district = Math.floor(index / 10) + 1;
  const scene = tradeMarketScene(level, index, 0, 0, false);
  const offerArt = tradeItemPicture(level);
  assert.ok(scene.includes(level.name), 'Name the actual goods in the market scene: ' + level.name);
  assert.ok(offerArt.includes(level.name), 'Name the actual goods in each offer: ' + level.name);
  assert.match(scene, new RegExp('data-trade-level="' + (index + 1) + '"'));
  assert.match(scene, new RegExp('data-trade-district="' + district + '"'));
  assert.match(scene, /class="trade-market-background"/);
  assert.match(scene, /class="trade-market-summary"/);
  assert.match(scene, /data-basket-ready="false"/);
  assert.doesNotMatch(scene + offerArt, /undefined|NaN/, 'No missing scene fields: ' + level.name);
  const background = scene.match(/<img class="trade-market-background" src="([^"]+)"/)?.[1];
  assert.ok(background?.startsWith('file:'), 'A packaged background is required: ' + level.name);
  assert.ok(existsSync(fileURLToPath(background)), 'Background file is missing: ' + background);
  districtScenes.add(background);
  const item = tradeProductPhoto(level);
  if (item) {
    assert.ok(existsSync(fileURLToPath(item)), 'Product image file is missing: ' + level.name);
    assert.match(offerArt, /class="trade-item-image"/);
    photographedGoods++;
  } else {
    assert.match(offerArt, /class="trade-item-symbol"/, 'Unmatched goods keep a labeled icon');
  }
}
assert.equal(districtScenes.size, 6, 'Six market districts must have six distinct illustrated backgrounds');
assert.ok(photographedGoods >= 8, 'Retain the accurate illustrated product choices');
const priced = tradeMarketScene(tradeLevels[0], 0, 6, 6, false);
assert.match(priced, /data-basket-ready="true"/);
assert.match(priced, /Ready to check out/);
const tooCostly = tradeMarketScene(tradeLevels[0], 0, 6, 9, false);
assert.match(tooCostly, /data-basket-ready="false"/);
assert.match(tooCostly, /Over budget/);
console.log('Trade Town market artwork validated: 60 challenges, 6 districts, ' + photographedGoods + ' matched product illustrations.');
