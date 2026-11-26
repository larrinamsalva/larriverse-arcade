import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { CHAPTER_SCENES } from '../../games/creative-calm-cove/cove-art.js';

test('Creative Calm Cove pictures follow all eight chapters without painting over the canvas', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const screenshots = path.join('artifacts', 'screenshots', testInfo.project.name);
  mkdirSync(screenshots, { recursive: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/games/creative-calm-cove/');
  await page.locator('.hero-art img').evaluate(image => image.decode());

  for (const [chapter, scene] of CHAPTER_SCENES.entries()) {
    await page.selectOption('#promptSelect', String(chapter * 10));
    const illustration = page.locator('#chapterScene');
    await expect(illustration).toHaveAttribute('src', `art/${scene.file}`);
    await expect(illustration).toHaveAttribute('alt', scene.alt);
    await illustration.evaluate(image => image.decode());
    if ([0, 3, 6, 7].includes(chapter)) {
      await page.locator('.prompt-panel').screenshot({ path: path.join(screenshots, `creative-calm-chapter-${chapter + 1}.png`) });
    }
  }

  const canvasPixel = await page.locator('#artCanvas').evaluate(canvas =>
    [...canvas.getContext('2d').getImageData(360, 360, 1, 1).data]);
  expect(canvasPixel).toEqual([255, 255, 255, 255]);
  await page.reload();
  await expect(page.locator('#promptCounter')).toHaveText('71 / 80');
  await expect(page.locator('#chapterScene')).toHaveAttribute('src', 'art/open-studio.webp');

  const layout = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(layout.scroll).toBeLessThanOrEqual(layout.width + 4);
  expect(errors).toEqual([]);
});
