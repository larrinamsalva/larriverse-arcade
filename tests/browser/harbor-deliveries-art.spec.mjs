import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('Harbor Helpers: illustrated supplies load and unload and the boat sails with motion controls', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/harbor-helpers/');
  const intro = page.locator('[data-lv-world-motion="harbor-helpers"]');
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src', /harbor-helper\.webp$/);
  await expect(intro.locator('.lv-motion-prop')).toHaveAttribute('src', /harbor-life-ring\.webp$/);
  await intro.getByRole('button', { name: /Play scene/ }).click();
  const layers = await intro.evaluate(node => node.getAnimations({ subtree: true }).map(animation => animation.effect.target.className));
  expect(layers).toEqual(expect.arrayContaining(['lv-motion-landscape', 'lv-motion-poses', 'lv-motion-prop']));
  await page.locator('.harbor-map img, .harbor-cargo-shelf img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await expect(page.locator('.harbor-cargo-shelf .harbor-cargo-picture')).toHaveCount(6);
  await expect(page.locator('#stageLabel')).toContainText('Chapter 1/8');
  for (const type of ['water', 'water', 'seeds']) {
    await page.locator('[data-cargo="' + type + '"]').focus();
    await page.keyboard.press('Enter');
  }
  await expect(page.locator('.harbor-manifest-crates button')).toHaveCount(3);
  await expect(page.locator('.harbor-manifest-crates [data-harbor-cargo="water"]')).toHaveCount(2);
  await page.locator('[data-cargo="wood"]').click();
  await expect(page.locator('#feedback')).toContainText('holds 3 crates');
  await page.getByRole('button', { name: 'Unload one Water barrels', exact: true }).first().click();
  await expect(page.locator('.harbor-manifest-crates button')).toHaveCount(2);
  await expect(page.locator('.expedition-stats')).toContainText('Cargo load2/3');
  await page.locator('[data-cargo="water"]').click();
  await page.getByRole('button', { name: 'Sail to Sprout Island', exact: true }).click();
  await expect(page.locator('#feedback')).toContainText('Delivery arrived at Sprout Island');
  const vessel = page.locator('.harbor-vessel');
  await expect(vessel).toHaveCSS('animation-name', 'harbor-delivery-sail');
  await expect.poll(() => vessel.evaluate(node => node.offsetLeft > node.parentElement.clientWidth * .4)).toBe(true);
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
  await expect(vessel).toHaveCSS('animation-name', 'none');
  const fits = await vessel.evaluate(node => {
    const ship = node.getBoundingClientRect(), scene = node.parentElement.getBoundingClientRect();
    return ship.left >= scene.left && ship.right <= scene.right && ship.bottom <= scene.bottom;
  });
  expect(fits).toBe(true);
  await expect(page.locator('.harbor-water-glint')).toHaveCSS('animation-name', 'none');
  await expect(page.getByRole('button', { name: 'Next challenge', exact: true })).toBeEnabled();
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await expect(vessel).toHaveCSS('animation-name', 'harbor-delivery-sail');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(vessel).toHaveCSS('animation-name', 'none');
  await expect.poll(() => page.locator('.harbor-map').evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  const folder = path.join('artifacts', 'screenshots', testInfo.project.name);
  fs.mkdirSync(folder, { recursive: true });
  await page.locator('.harbor-map').screenshot({ path: path.join(folder, 'harbor-arrived-skiff.png') });
  await page.locator('.harbor-cargo-shelf').screenshot({ path: path.join(folder, 'harbor-cargo-pictures.png') });
});

test('Harbor Helpers: cargo labels and controls fit contrast modes and enlarged text', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/games/harbor-helpers/');
  for (const mode of ['larriverse-dark', 'larriverse-high-contrast']) {
    await page.evaluate(className => {
      document.documentElement.classList.remove('larriverse-dark', 'larriverse-high-contrast');
      document.documentElement.classList.add(className);
    }, mode);
    const button = page.locator('[data-cargo="water"]');
    await expect(button).toBeEnabled();
    await expect(button).toContainText('Water barrels');
    expect(await button.evaluate(node => getComputedStyle(node).color !== getComputedStyle(node).backgroundColor)).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%', 'important'));
  await page.locator('[data-cargo="water"]').click();
  await expect(page.getByRole('button', { name: 'Unload one Water barrels', exact: true })).toBeEnabled();
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    controls: [...document.querySelectorAll('[data-cargo], [data-unload-cargo]')].map(node => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width, height: rect.height, clipped: node.scrollWidth > node.clientWidth + 1 };
    })
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 4);
  for (const button of dimensions.controls) {
    expect(button.left).toBeGreaterThanOrEqual(0);
    expect(button.right).toBeLessThanOrEqual(dimensions.width);
    expect(button.width).toBeGreaterThanOrEqual(44);
    expect(button.height).toBeGreaterThanOrEqual(44);
    expect(button.clipped).toBe(false);
  }
  const folder = path.join('artifacts', 'screenshots', testInfo.project.name);
  fs.mkdirSync(folder, { recursive: true });
  await page.locator('.harbor-manifest').screenshot({ path: path.join(folder, 'harbor-large-text-manifest.png') });
});
