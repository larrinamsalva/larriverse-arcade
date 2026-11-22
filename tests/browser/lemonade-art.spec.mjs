import { test, expect } from '@playwright/test';
import { marketMissions, bestMarketPlan } from '../../assets/creative-missions.js';
import fs from 'node:fs';
import path from 'node:path';

function outputFolder(info) {
  const folder = path.join('artifacts', 'screenshots', info.project.name);
  fs.mkdirSync(folder, { recursive: true }); return folder;
}
async function movingFrames(picture, name) {
  return picture.evaluate((node, name) => {
    const animation = node.getAnimations().find(animation => animation.animationName === name);
    if (!animation || getComputedStyle(node).animationPlayState !== 'running') return false;
    const duration = animation.effect.getComputedTiming().duration;
    if (!Number.isFinite(duration) || duration <= 0) return false;
    const time = animation.currentTime, state = animation.playState;
    animation.pause();
    try {
      animation.currentTime = duration * .2;
      const before = getComputedStyle(node).transform;
      animation.currentTime = duration * .6;
      return before !== getComputedStyle(node).transform;
    } finally {
      animation.currentTime = time;
      if (state === 'running') animation.play();
      else if (state === 'finished') animation.finish();
    }
  }, name);
}
async function plan(page, stock, price) {
  await page.locator('#stockInput').selectOption(String(stock));
  await page.locator('#priceInput').selectOption(String(price));
}

test('Lemonade Lab artwork: selected cup counts, retry and goal reactions respect motion preferences', async ({ page }, info) => {
  test.setTimeout(90_000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/lemonade-lab/');
  const intro = page.locator('[data-lv-world-motion="lemonade-lab"]');
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src', /lemon-vendor\.webp$/);
  await expect(intro.locator('.lv-motion-prop')).toHaveAttribute('src', /lemon-pitcher\.webp$/);
  await intro.getByRole('button', { name: /Play scene/ }).click();
  expect(await intro.evaluate(node => node.getAnimations({ subtree: true }).map(animation => animation.effect.target.className)))
    .toEqual(expect.arrayContaining(['lv-motion-landscape', 'lv-motion-poses', 'lv-motion-prop']));
  const output = outputFolder(info);
  await intro.screenshot({ path: path.join(output, 'lemon-vendor-introduction.png') });
  await page.locator('.lemon-market-picture img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await expect(page.locator('.lemon-market-picture')).toHaveAttribute('data-lemon-setting', 'school-fair');
  await expect(page.locator('.lemon-cup-picture')).toHaveCount(6);
  await page.locator('#stockInput').focus();
  await page.locator('#stockInput').selectOption('12');
  await expect(page.locator('#stockInput')).toBeFocused();
  await expect(page.locator('.lemon-cup-picture')).toHaveCount(12);
  await expect(page.locator('.lemon-batch strong')).toHaveText('Selected batch · 12 cups');
  await page.locator('#priceInput').selectOption('1');
  await page.getByRole('button', { name: 'Run my mission stand', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.lemon-market-picture')).toHaveAttribute('data-lemon-result', 'retry');
  await expect(page.locator('.creative-result')).toContainText('Customers: 7 · Sold: 7 · Left over: 5');
  await expect(page.locator('.creative-result')).toContainText('Revenue 7 − cost 12 = -5 coins profit');
  expect(await movingFrames(page.locator('.lemon-vendor-poses'), 'lemon-vendor-wave')).toBe(true);
  expect(await movingFrames(page.locator('.lemon-cup-picture').first(), 'lemon-cup-serve')).toBe(true);
  await page.locator('.lemon-market-picture').screenshot({ path: path.join(output, 'lemon-retry-scene.png') });
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
  await expect(page.locator('.lemon-vendor-poses')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.lemon-cup-picture').first()).toHaveCSS('animation-name', 'none');
  await expect(intro.getByRole('button', { name: /Play scene/ })).toBeHidden();
  const best = bestMarketPlan(marketMissions[0]);
  await plan(page, best.stock, best.price);
  await expect(page.locator('.lemon-cup-picture')).toHaveCount(best.stock);
  await page.getByRole('button', { name: 'Run my mission stand', exact: true }).click();
  await expect(page.locator('.lemon-market-picture')).toHaveAttribute('data-lemon-result', 'goal');
  await expect(page.locator('.creative-result')).toContainText('Goal reached!');
  await expect(page.locator('.lemon-vendor-poses')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('#stockInput')).toBeDisabled();
  await page.reload();
  await expect(page.locator('[data-market-mission]')).toHaveAttribute('data-market-mission', 'market-02');
  await expect(page.locator('.lemon-market-picture')).toHaveAttribute('data-lemon-setting', 'park-picnic');
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const nextBest = bestMarketPlan(marketMissions[1]);
  await plan(page, nextBest.stock, nextBest.price);
  await page.getByRole('button', { name: 'Run my mission stand', exact: true }).click();
  await expect(page.locator('.lemon-vendor-poses')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.lemon-cup-picture').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.lemon-vendor-poses')).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test('Lemonade Lab artwork: four forecasts, ledger arithmetic and mission budgets keep their rules', async ({ page }, info) => {
  test.setTimeout(90_000);
  await page.goto('/games/lemonade-lab/');
  await page.getByRole('button', { name: 'Return to four-day lab', exact: true }).click();
  const scenes = ['lab-sunny', 'lab-rainy', 'lab-festival', 'lab-quiet'];
  const names = ['Sunny park day', 'Rainy afternoon', 'Busy festival', 'Quiet neighborhood day'];
  const output = outputFolder(info);
  for (let day = 0; day < 4; day++) {
    await expect(page.locator('.lemon-market-picture')).toHaveAttribute('data-lemon-setting', scenes[day]);
    await expect(page.locator('.lemon-setting-label')).toHaveText('Forecast · ' + names[day]);
    await page.locator('.lemon-landscape-picture').evaluate(image => image.decode());
    await page.locator('.lemon-market-picture').screenshot({ path: path.join(output, 'lemon-' + scenes[day] + '.png') });
    if (day === 2) {
      await plan(page, 12, 1);
      await page.getByRole('button', { name: 'Open for the day', exact: true }).click();
      await expect(page.locator('#feedback')).toContainText('That batch costs more than you have');
      await expect(page.locator('.ledger tbody tr')).toHaveCount(2);
      await expect(page.locator('.lemon-market-picture')).toHaveAttribute('data-lemon-setting', 'lab-festival');
    }
    const stock = [12, 12, 8, 6][day], price = day < 2 ? 1 : 3;
    await plan(page, stock, price);
    await expect(page.locator('.lemon-cup-picture')).toHaveCount(stock);
    await page.getByRole('button', { name: 'Open for the day', exact: true }).click();
  }
  const rows = await page.locator('.ledger tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.textContent.trim())));
  expect(rows).toEqual([['1', '12 / 12', '12', '12', '0'], ['2', '12 / 7', '12', '7', '-5'], ['3', '8 / 8', '8', '24', '16'], ['4', '6 / 6', '6', '18', '12']]);
  await expect(page.locator('.stat-chip').first()).toContainText('37');
  await expect(page.locator('.lemon-setting-label')).toHaveText('Final forecast · Quiet neighborhood day');
  await page.getByRole('button', { name: 'Read my ledger', exact: true }).click();
  await expect(page.locator('#finishDialog')).toBeVisible();
  await expect(page.locator('#finishMessage')).toContainText('37 coins');
  await page.evaluate(() => localStorage.setItem('larriverse.creative.market.v1', JSON.stringify({ nextLevel: 30 })));
  await page.reload();
  await expect(page.locator('[data-market-mission]')).toHaveAttribute('data-market-mission', 'market-31');
  await plan(page, 12, 3);
  await page.getByRole('button', { name: 'Run my mission stand', exact: true }).click();
  await expect(page.locator('#feedback')).toContainText('supplies cost more than your available budget');
  await expect(page.locator('.creative-result')).toHaveCount(0);
  await expect(page.locator('.lemon-market-picture')).toHaveAttribute('data-lemon-result', 'plan');
});

test('Lemonade Lab artwork: stand, batch and ledger fit enlarged text and contrast themes', async ({ page }, info) => {
  test.setTimeout(60_000);
  await page.goto('/games/lemonade-lab/');
  for (const mode of ['light', 'dark', 'high-contrast']) {
    await page.evaluate(mode => window.LarriVerseArcade.setSettings({ theme: mode === 'high-contrast' ? 'dark' : mode, highContrast: mode === 'high-contrast', reducedMotion: true }), mode);
    await expect(page.getByLabel('Cups to make')).toBeVisible();
    if (mode === 'high-contrast') {
      const colors = await page.locator('.lemon-batch').evaluate(node => ({ background: getComputedStyle(node).backgroundColor, image: getComputedStyle(node).backgroundImage, text: getComputedStyle(node.querySelector('strong')).color }));
      expect(colors).toEqual({ background: 'rgb(17, 17, 17)', image: 'none', text: 'rgb(255, 255, 255)' });
    }
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%', 'important'));
  const skip = page.locator('body > .skip-link');
  expect(await skip.evaluate(node => node.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await skip.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#playArea')).toBeFocused();
  expect(await skip.evaluate(node => node.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  const layout = await page.locator('.lemon-scene-art').evaluate(node => {
    const frame = node.getBoundingClientRect();
    return { left: frame.left, right: frame.right, top: frame.top, bottom: frame.bottom, pieces: [...node.querySelectorAll('.lemon-vendor, .lemon-cart')].map(node => { const r = node.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; }) };
  });
  for (const piece of layout.pieces) {
    expect(piece.left).toBeGreaterThanOrEqual(layout.left); expect(piece.right).toBeLessThanOrEqual(layout.right + 1);
    expect(piece.top).toBeGreaterThanOrEqual(layout.top); expect(piece.bottom).toBeLessThanOrEqual(layout.bottom);
  }
  for (const selector of ['#stockInput', '#priceInput']) {
    const bounds = await page.locator(selector).boundingBox();
    expect(bounds.width).toBeGreaterThanOrEqual(44); expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  }
  const output = outputFolder(info);
  await page.locator('.lemon-batch').screenshot({ path: path.join(output, 'lemon-large-text-batch.png') });
  await page.getByRole('button', { name: 'Return to four-day lab', exact: true }).click();
  await plan(page, 8, 3); await page.getByRole('button', { name: 'Open for the day', exact: true }).click();
  const ledger = page.getByRole('region', { name: 'Business ledger', exact: true });
  expect(await ledger.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true);
  await ledger.focus(); await page.keyboard.press('ArrowRight');
  await expect.poll(() => ledger.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(4);
});
