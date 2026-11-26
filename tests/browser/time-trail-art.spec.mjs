import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { timeTrailLevelsWithGoals as levels } from '../../assets/time-trail-level.js';

const saveKey = 'larriverse.timeTrail.progress.v2';

test('Time Trail shows matching scenery and clear map markers across all six chapters', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const output = path.join('artifacts', 'screenshots', testInfo.project.name);
  mkdirSync(output, { recursive: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/games/time-trail/');

  for (const index of [0, 1, 2, 3, 4, 20, 30, 40, 50, 59]) {
    if (index) {
      await page.evaluate(({ key, index }) =>
        localStorage.setItem(key, JSON.stringify({ nextLevel: index, stars: Array(60).fill(0) })),
        { key: saveKey, index });
      await page.reload();
    }
    const level = levels[index];
    const scene = page.locator('.trail-landscape');
    await expect(scene).toHaveAttribute('data-trail-zone', level.zone);
    await expect(scene).toContainText('Follow the exact route on the grid below');
    await expect(page.locator('.route-map .tile')).toHaveCount(level.width * level.width);
    await expect(page.locator('.tile.flag .trail-tile-picture--flag')).toHaveCount(level.flags.length);
    await expect(page.locator('.tile.rock .trail-tile-picture--rock')).toHaveCount(level.rocks.length);
    await expect(page.locator('.tile.player .trail-tile-picture--hiker')).toHaveCount(1);
    await scene.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await page.locator('.route-map .tile img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const bounds = await page.locator('.route-map').boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(-1);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(321);
    if ([0, 20, 50].includes(index)) {
      await scene.screenshot({ path: path.join(output, `time-trail-landscape-${index + 1}.png`) });
      await page.locator('.route-map').screenshot({ path: path.join(output, `time-trail-map-${index + 1}.png`) });
    }
    await page.locator('.tile.route-reachable').first().click();
    await expect(page.locator('.tile.player .trail-tile-picture--hiker')).toHaveAttribute('src', /hiker-step\.webp$/);
  }

  await page.evaluate(() => window.LarriVerseArcade.setSettings({ theme: 'dark', highContrast: true, reducedMotion: true }));
  await expect(page.locator('.trail-landscape-hiker')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.route-legend')).toContainText('Picnic finish');
  expect(errors).toEqual([]);
});
