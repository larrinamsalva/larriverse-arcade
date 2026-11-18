import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pipePaths, directions } from '../../assets/expedition-worlds.js';

async function solve(page, route) {
  const dir = (from, to) => [-5, 1, 5, -1].indexOf(to - from);
  for (const [step, tile] of route.entries()) {
    const pair = [step ? dir(tile, route[step - 1]) : 3, step < route.length - 1 ? dir(tile, route[step + 1]) : 1];
    const button = page.locator('[data-pipe="' + tile + '"]');
    for (let turn = 0; turn < 4; turn++) {
      const label = await button.getAttribute('aria-label');
      if (pair.every(value => label.includes(directions[value]))) break;
      await button.focus();
      await page.keyboard.press('Enter');
    }
  }
}

test('Water Works: textured pipes follow the traced route and both motion preferences', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/water-works/');
  const intro = page.locator('[data-lv-world-motion="water-works"]');
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src', /water-helper\.webp$/);
  await expect(intro.locator('.lv-motion-prop')).toHaveAttribute('src', /water-paddle-wheel\.webp$/);
  await intro.getByRole('button', { name: /Play scene/ }).click();
  const layers = await intro.evaluate(node => node.getAnimations({ subtree: true }).map(animation => animation.effect.target.className));
  expect(layers).toEqual(expect.arrayContaining(['lv-motion-landscape', 'lv-motion-poses', 'lv-motion-prop']));
  await page.locator('.water-landscape img, .pipe-labels img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await expect(page.locator('.pipe-labels img')).toHaveCount(3);
  await expect(page.locator('.pipe-labels')).toContainText('Toy filter, pipe 13');
  const source = page.locator('[data-pipe="10"]');
  const before = await source.getAttribute('aria-label');
  await source.focus();
  await page.keyboard.press('Enter');
  expect(await source.getAttribute('aria-label')).not.toBe(before);
  await page.getByRole('button', { name: 'Send the water', exact: true }).click();
  await expect(page.locator('#feedback')).toHaveClass(/try/);
  await expect(page.locator('.pipe-tile.leak')).toHaveCount(1);
  await solve(page, pipePaths[0]);
  await page.getByRole('button', { name: 'Send the water', exact: true }).click();
  await expect(page.locator('#feedback')).toHaveClass(/good/);
  await expect(page.locator('.pipe-tile.flowing')).toHaveCount(pipePaths[0].length);
  for (const [step, tile] of pipePaths[0].entries()) {
    const incoming = step ? [-5, 1, 5, -1].indexOf(pipePaths[0][step - 1] - tile) : 3;
    await expect(page.locator('[data-pipe="' + tile + '"] .pipe-flow')).toHaveAttribute('data-water-incoming', directions[incoming]);
  }
  const current = source.locator('.pipe-flow');
  const moved = await current.evaluate(node => new Promise(resolve => {
    const first = getComputedStyle(node).strokeDashoffset;
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(first !== getComputedStyle(node).strokeDashoffset)));
  }));
  expect(moved).toBe(true);
  expect(await source.locator('.pipe-shell').evaluate(node => getComputedStyle(node).stroke)).toContain('#water-steel-10');
  await expect(source).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
  await expect(current).toHaveCSS('animation-name', 'none');
  await expect(current).toHaveCSS('opacity', '1');
  await expect(page.locator('.water-landscape > img')).toHaveCSS('animation-name', 'none');
  await expect(page.getByRole('button', { name: 'Next challenge', exact: true })).toBeEnabled();
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  expect(await current.evaluate(node => getComputedStyle(node).animationName.startsWith('water-current-'))).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(current).toHaveCSS('animation-name', 'none');
  await expect(current).toHaveCSS('opacity', '1');
  const folder = path.join('artifacts', 'screenshots', testInfo.project.name);
  fs.mkdirSync(folder, { recursive: true });
  await page.locator('.pipe-grid').screenshot({ path: path.join(folder, 'water-connected-pipes.png') });
});

test('Water Works: pipe controls and illustrated legend fit contrast modes and enlarged text', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/games/water-works/');
  for (const mode of ['larriverse-dark', 'larriverse-high-contrast']) {
    await page.evaluate(className => {
      document.documentElement.classList.remove('larriverse-dark', 'larriverse-high-contrast');
      document.documentElement.classList.add(className);
    }, mode);
    await expect(page.locator('.pipe-tile.filter')).toBeEnabled();
    await expect(page.locator('.pipe-tile.filter')).toHaveAccessibleName(/toy filter/);
    await expect(page.locator('.small-note')).toContainText('Real water safety needs real treatment and testing.');
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%', 'important'));
  const button = page.locator('[data-pipe="10"]');
  const before = await button.getAttribute('aria-label');
  await button.focus();
  await page.keyboard.press('Enter');
  expect(await button.getAttribute('aria-label')).not.toBe(before);
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    columns: getComputedStyle(document.querySelector('.pipe-grid')).gridTemplateColumns.split(' ').length,
    pipes: [...document.querySelectorAll('.pipe-tile')].map(node => {
      const r = node.getBoundingClientRect(), drawing = node.querySelector('svg').getBoundingClientRect(), label = node.querySelector('.tile-number').getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width, drawingBottom: drawing.bottom, labelTop: label.top };
    })
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 4);
  expect(dimensions.columns).toBe(5);
  for (const pipe of dimensions.pipes) {
    expect(pipe.left).toBeGreaterThanOrEqual(0);
    expect(pipe.right).toBeLessThanOrEqual(dimensions.width);
    expect(pipe.width).toBeGreaterThanOrEqual(24);
    expect(pipe.labelTop).toBeGreaterThanOrEqual(pipe.drawingBottom);
  }
  const folder = path.join('artifacts', 'screenshots', testInfo.project.name);
  fs.mkdirSync(folder, { recursive: true });
  await page.locator('.pipe-grid').screenshot({ path: path.join(folder, 'water-large-text-grid.png') });
});
