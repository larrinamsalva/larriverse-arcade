import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

async function enter(page, commands) {
  for (const command of commands) {
    await page.locator('[data-command="' + command + '"]').focus();
    await page.keyboard.press('Enter');
  }
}

test('Robot Rover: directional pictures travel between cells and stop with motion preferences', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/robot-rover/');
  const intro = page.locator('[data-lv-world-motion="robot-rover"]');
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src', /rover-explorer\.webp$/);
  await expect(intro.locator('.lv-motion-prop')).toHaveAttribute('src', /rover-sample-case\.webp$/);
  await intro.getByRole('button', { name: /Play scene/ }).click();
  const layers = await intro.evaluate(node => node.getAnimations({ subtree: true }).map(animation => animation.effect.target.className));
  expect(layers).toEqual(expect.arrayContaining(['lv-motion-landscape', 'lv-motion-poses', 'lv-motion-prop']));

  await enter(page, 'F');
  const travel = await page.evaluate(() => {
    const before = document.querySelector('.rover-character-art').getBoundingClientRect();
    [...document.querySelectorAll('#gameActions button')].find(button => button.textContent === 'Run my code').click();
    const rover = document.querySelector('.rover-character-art');
    const animations = rover.getAnimations();
    return { before: before.left, start: rover.getBoundingClientRect().left, destination: rover.parentElement.getBoundingClientRect().left, animations: animations.length };
  });
  expect(travel.animations).toBe(1);
  expect(Math.abs(travel.start - travel.before)).toBeLessThan(2);
  expect(travel.start).toBeLessThan(travel.destination);
  await expect(page.locator('#feedback')).toContainText('followed all 1 commands');
  await expect(page.locator('.rover-character-art')).toHaveAttribute('data-rover-facing', 'east');
  await expect(page.locator('.tile.player')).toHaveAccessibleName('Row 3, column 4: rover facing East');
  await page.getByRole('button', { name: 'Clear code', exact: true }).click();

  for (const [commands, direction] of [['LF', 'north'], ['RF', 'south'], ['RRF', 'west']]) {
    await enter(page, commands);
    await page.getByRole('button', { name: 'Run my code', exact: true }).click();
    await expect(page.locator('#feedback')).toContainText('followed all ' + commands.length + ' commands');
    await expect(page.locator('.rover-character-art')).toHaveAttribute('data-rover-facing', direction);
    await page.locator('.rover-character-art').evaluate(image => image.decode());
    await page.getByRole('button', { name: 'Clear code', exact: true }).click();
  }

  await enter(page, 'F');
  const cancellation = await page.evaluate(() => {
    [...document.querySelectorAll('#gameActions button')].find(button => button.textContent === 'Run my code').click();
    const rover = document.querySelector('.rover-character-art');
    const before = rover.getAnimations().length;
    window.LarriVerseArcade.setSettings({ reducedMotion: true });
    return { before, after: rover.getAnimations().length };
  });
  expect(cancellation).toEqual({ before: 1, after: 0 });
  await expect(page.locator('#feedback')).toContainText('followed all 1 commands');
  await expect(page.locator('.rover-beacon-art')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Clear code', exact: true }).click();
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enter(page, 'F');
  const deviceAnimations = await page.evaluate(() => {
    [...document.querySelectorAll('#gameActions button')].find(button => button.textContent === 'Run my code').click();
    return document.querySelector('.rover-character-art').getAnimations().length;
  });
  expect(deviceAnimations).toBe(0);
  await expect(page.locator('#feedback')).toContainText('followed all 1 commands');
  await expect(page.locator('.tile.player')).toHaveAccessibleName('Row 3, column 4: rover facing East');
  await expect(page.locator('.rover-beacon-art')).toHaveCSS('animation-name', 'none');
  const folder = path.join('artifacts', 'screenshots', testInfo.project.name);
  fs.mkdirSync(folder, { recursive: true });
  await page.locator('.rover-terrain img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await page.locator('.rover-terrain').screenshot({ path: path.join(folder, 'rover-meadow-path.png') });
});

test('Robot Rover: terrain grid and command controls fit contrast modes and enlarged text', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/games/robot-rover/');
  for (const mode of ['larriverse-dark', 'larriverse-high-contrast']) {
    await page.evaluate(className => {
      document.documentElement.classList.remove('larriverse-dark', 'larriverse-high-contrast');
      document.documentElement.classList.add(className);
    }, mode);
    for (const command of ['F', 'L', 'R']) {
      const button = page.locator('[data-command="' + command + '"]');
      await expect(button).toBeEnabled();
      expect(await button.evaluate(node => getComputedStyle(node).color !== getComputedStyle(node).backgroundColor)).toBe(true);
    }
    await expect(page.locator('.rover-character-art')).toBeVisible();
    await expect(page.locator('.rover-beacon-art')).toBeVisible();
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%', 'important'));
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    columns: getComputedStyle(document.querySelector('.rover-grid')).gridTemplateColumns.split(' ').length,
    controls: [...document.querySelectorAll('.command-bar button')].map(node => { const r = node.getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width, height: r.height }; })
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 4);
  expect(dimensions.columns).toBe(5);
  await expect(page.locator('.rover-grid .tile')).toHaveCount(25);
  for (const button of dimensions.controls) {
    expect(button.left).toBeGreaterThanOrEqual(0);
    expect(button.right).toBeLessThanOrEqual(dimensions.width);
    expect(button.width).toBeGreaterThanOrEqual(44);
    expect(button.height).toBeGreaterThanOrEqual(44);
  }
  await enter(page, 'F');
  await expect(page.locator('.command-list [data-remove]')).toHaveCount(1);
  const folder = path.join('artifacts', 'screenshots', testInfo.project.name);
  fs.mkdirSync(folder, { recursive: true });
  await page.locator('.rover-terrain').screenshot({ path: path.join(folder, 'rover-large-text.png') });
});
