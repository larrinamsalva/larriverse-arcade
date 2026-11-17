import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const cropTypes = ['carrot', 'bean', 'flower'];
const decode = locator => locator.evaluateAll(images => Promise.all(images.map(image => image.decode())));

test('Garden Guardians: crops grow through three pictured stages and watering follows comfort settings', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/garden-guardians/');
  const intro = page.locator('[data-lv-world-motion="garden-guardians"]');
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src', /guardian-robin\.webp$/);
  await expect(intro.locator('.lv-motion-prop')).toHaveAttribute('src', /garden-grow-watering-can\.webp$/);
  await intro.getByRole('button', { name: /Play scene/ }).click();
  expect(await intro.evaluate(node => node.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
  await decode(page.locator('.guardian-backdrop, .garden-plant-picker img'));

  for (const [typeIndex, type] of cropTypes.entries()) {
    await page.locator('[data-plant="' + type + '"]').click();
    for (let offset = 0; offset < 2; offset++) {
      const plot = page.locator('[data-plot="' + (typeIndex * 2 + offset) + '"]');
      await plot.focus();
      await page.keyboard.press('Enter');
      await expect(plot.locator('img')).toHaveAttribute('src', new RegExp('/' + type + '-0\\.webp$'));
    }
  }
  const field = page.locator('.guardian-garden');
  const folder = path.join('artifacts', 'screenshots', testInfo.project.name);
  fs.mkdirSync(folder, { recursive: true });
  await decode(field.locator('img'));
  await field.screenshot({ path: path.join(folder, 'guardians-seedlings.png') });
  await page.getByRole('button', { name: 'Start growing', exact: true }).click();
  const first = page.locator('[data-plot="0"]');
  await first.click();
  await expect(first).toHaveAccessibleName('Plot 1, Carrot, growth 1 of 2');
  await expect(first.locator('.guardian-watering')).toHaveCSS('animation-name', 'guardian-water-visit');
  await expect(first.locator('.garden-growth-art')).toHaveCSS('animation-name', 'guardian-plant-grow');
  const toolFits = await first.evaluate(plot => {
    const tool = plot.querySelector('.guardian-watering').getBoundingClientRect();
    const label = plot.querySelector('small').getBoundingClientRect();
    const bounds = plot.getBoundingClientRect();
    return tool.left >= bounds.left && tool.right <= bounds.right && tool.bottom < label.top;
  });
  expect(toolFits).toBe(true);
  await first.click();
  await expect(page.locator('#feedback')).toContainText('already watered');
  await expect(page.locator('.stat-row')).toContainText('Water drops11');
  for (let index = 1; index < 6; index++) await page.locator('[data-plot="' + index + '"]').click();
  await expect(field.locator('[data-guardian-growth="1"]')).toHaveCount(6);
  await decode(field.locator('img'));
  await page.getByRole('button', { name: 'Next day', exact: true }).click();
  for (let index = 0; index < 6; index++) await page.locator('[data-plot="' + index + '"]').click();
  await expect(field.locator('[data-guardian-growth="2"]')).toHaveCount(6);
  await decode(field.locator('img'));
  await expect(page.locator('.stat-row')).toContainText('Ready plants6/6');
  await expect(first.locator('.guardian-plant-art')).toHaveCSS('animation-name', 'guardian-plant-sway');

  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
  await expect(first.locator('.guardian-plant-art')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.guardian-watering')).toBeHidden();
  await expect.poll(() => field.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(first).toContainText('Carrot · 2/2');
  await expect(first).toHaveClass(/selected/);
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await expect(first.locator('.guardian-plant-art')).toHaveCSS('animation-name', 'guardian-plant-sway');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => field.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(first).toContainText('Carrot · 2/2');
  await field.screenshot({ path: path.join(folder, 'guardians-grown-garden.png') });
  expect(errors).toEqual([]);
});

test('Garden Guardians: plot labels fit dark, high contrast and enlarged text on narrow phones', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/games/garden-guardians/');
  for (const mode of ['larriverse-dark', 'larriverse-high-contrast']) {
    await page.evaluate(className => {
      document.documentElement.classList.remove('larriverse-dark', 'larriverse-high-contrast');
      document.documentElement.classList.add(className);
    }, mode);
    for (const type of cropTypes) {
      const choice = page.locator('[data-plant="' + type + '"]');
      await expect(choice).toBeEnabled();
      await expect(choice).toHaveAccessibleName(new RegExp(type, 'i'));
      const distinct = await choice.evaluate(node => {
        const style = getComputedStyle(node);
        return style.color !== style.backgroundColor;
      });
      expect(distinct).toBe(true);
    }
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%', 'important'));
  await page.locator('[data-plant="flower"]').click();
  await page.locator('[data-plot="0"]').click();
  await expect(page.locator('[data-plot="0"]')).toHaveAccessibleName('Plot 1, Flower, growth 0 of 2');
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    plots: [...document.querySelectorAll('.garden-plot')].map(node => {
      const rect = node.getBoundingClientRect();
      const label = node.querySelector('small');
      const labelLines = label.getBoundingClientRect().height / parseFloat(getComputedStyle(label).lineHeight);
      return { left: rect.left, right: rect.right, width: rect.width, clipped: node.scrollWidth > node.clientWidth + 1, labelLines };
    })
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 4);
  for (const plot of dimensions.plots) {
    expect(plot.left).toBeGreaterThanOrEqual(0);
    expect(plot.right).toBeLessThanOrEqual(dimensions.width);
    expect(plot.width).toBeGreaterThanOrEqual(44);
    expect(plot.clipped).toBe(false);
    expect(plot.labelLines).toBeLessThanOrEqual(3);
  }
});
