import { test, expect } from '@playwright/test';
import { tradeLevels } from '../../assets/expedition-worlds.js';

const saveKey = 'larriverse.tradeTown.roadmap.v1';

test('Trade Town shows accurate merchandise and updates its animated market with the basket', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/games/trade-town/');
  const art = page.locator('.trade-illustrated-market');
  await expect(art).toBeVisible();
  await expect(art).toHaveAttribute('data-trade-level', '1');
  await expect(art).toHaveAttribute('data-trade-district', '1');
  await expect(art).toContainText('Apples for the picnic');
  await expect(page.locator('.trade-market-item')).toHaveAttribute('src', /apple\.webp$/);
  await expect(page.locator('.trade-item-picture')).toHaveCount(3);
  await page.locator('.trade-market-stage img').evaluateAll(images =>
    Promise.all(images.map(image => image.decode()))
  );
  await page.locator('[data-shop="1,1"]').click();
  await expect(art.locator('.trade-market-summary')).toContainText('3 of 6 items');
  await page.locator('[data-shop="1,1"]').click();
  await expect(art).toHaveAttribute('data-basket-ready', 'true');
  await expect(art.locator('.trade-market-summary')).toContainText('Ready to check out');
  await page.getByRole('button', { name: 'Check out', exact: true }).click();
  await expect(art).toHaveAttribute('data-completed', 'true');
  await page.getByRole('button', { name: 'Next challenge', exact: true }).click();
  await expect(art).toHaveAttribute('data-trade-level', '2');
  await expect(art).toContainText('Pencils for the clubhouse');
  await expect(page.locator('.trade-market-item--symbol')).toHaveCount(1);
  const checkpoint = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey);
  expect(checkpoint.next).toBe(1);
  expect(checkpoint.quality).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('Trade Town has distinct district scenes, safe saves, and readable small-phone controls', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/games/trade-town/');
  for (const index of [0, 9, 20, 37, 50, 59]) {
    await page.evaluate(({ key, index }) =>
      localStorage.setItem(key, JSON.stringify({ next: index, quality: Array(index).fill(100) })),
      { key: saveKey, index }
    );
    await page.reload();
    const art = page.locator('.trade-illustrated-market');
    await expect(art).toHaveAttribute('data-trade-level', String(index + 1));
    await expect(art).toHaveAttribute('data-trade-district', String(Math.floor(index / 10) + 1));
    await expect(art).toContainText(tradeLevels[index].name);
    await expect(art.locator('.trade-market-background')).toHaveAttribute('src', /\.webp$/);
    await expect(art.locator('.trade-market-vendor img')).toHaveAttribute('src', /baker\.webp$/);
    const images = await art.locator('img').evaluateAll(images =>
      Promise.all(images.map(async image => {
        await image.decode();
        return image.naturalWidth;
      }))
    );
    expect(images.every(width => width > 0)).toBe(true);
    const box = await art.boundingBox();
    expect(box.width).toBeGreaterThan(200);
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(321);
    await expect(page.locator('.trade-quantity-stepper button')).toHaveCount(6);
  }
  await page.evaluate(() => window.LarriVerseArcade.setSettings({
    theme: 'dark', highContrast: true, reducedMotion: true
  }));
  await expect(page.locator('.trade-market-vendor img')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.trade-market-heading')).toBeVisible();
  expect((await page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey)).next).toBe(59);
});
