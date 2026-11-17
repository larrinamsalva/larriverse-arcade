import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { gardenGrowthChallenges } from '../../assets/skill-worlds.js';

const phases = {
  wood: /sunny bed|raised bed|garden path/,
  planting: /seed depth|spacing|carrot row/,
  watering: /watering can|root watering|soil test/,
  growing: /tomato transplant|tomato support|tomato flower/,
  harvesting: /ripe tomato|carrot harvest|lettuce harvest|berry storage/
};

test('Garden Grow & Harvest: all 80 illustrated challenges remain playable', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const browserErrors = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.goto('/games/garden-grow-harvest/');
  await expect(page.locator('.garden-learning-art')).toBeVisible();
  const dir = path.join('artifacts', 'screenshots', testInfo.project.name);
  fs.mkdirSync(dir, { recursive: true });
  const captured = new Set();
  const settings = new Set();

  for (let index = 0; index < 80; index++) {
    const scene = page.locator('.garden-learning-art');
    const choices = page.locator('button[data-learning-answer]');
    await expect(scene).toHaveAttribute('role', 'img');
    await expect(choices).toHaveCount(3);
    await expect(choices.first()).toBeEnabled();
    await expect(page.locator('.garden-choice-art')).toHaveCount(3);
    const sceneDescription = await scene.getAttribute('aria-label');
    expect(sceneDescription).toContain('Illustrated garden lesson about');
    settings.add(await scene.getAttribute('data-garden-setting'));
    await scene.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    for (const [phase, matcher] of Object.entries(phases)) {
      if (captured.has(phase) || !matcher.test(sceneDescription)) continue;
      await scene.screenshot({ path: path.join(dir, 'garden-after-' + phase + '.png'), animations: 'disabled' });
      await page.locator('.picture-choice-grid').screenshot({
        path: path.join(dir, 'garden-answers-after-' + phase + '.png'), animations: 'disabled'
      });
      captured.add(phase);
    }
    const width = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(width[0]).toBeLessThanOrEqual(width[1] + 4);
    await choices.first().click();
    await expect(page.locator('#feedback')).not.toBeEmpty();
    const action = page.locator('#gameActions button').last();
    await expect(action).toBeEnabled();
    await action.click();
  }
  await expect(page.locator('#finishDialog')).toBeVisible();
  expect([...captured].sort()).toEqual(Object.keys(phases).sort());
  expect([...settings].sort()).toEqual(['growing', 'kitchen', 'planting', 'potting']);
  expect(browserErrors).toEqual([]);
});

test('Garden answer cards stay readable in dark and high-contrast modes', async ({ page }) => {
  await page.goto('/games/garden-grow-harvest/');
  for (const className of ['larriverse-dark', 'larriverse-high-contrast']) {
    await page.evaluate(name => {
      document.documentElement.classList.remove('larriverse-dark', 'larriverse-high-contrast');
      document.documentElement.classList.add(name);
    }, className);
    const button = page.locator('button[data-learning-answer]').first();
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    const colors = await button.evaluate(element => {
      const style = getComputedStyle(element);
      return { color: style.color, background: style.backgroundColor, width: element.getBoundingClientRect().width };
    });
    expect(colors.width).toBeGreaterThan(70);
    expect(colors.color).not.toBe(colors.background);
    await expect(button.locator('span')).not.toBeEmpty();
  }
});

test('Garden scenes animate the gardener and tools and follow both motion preferences', async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/garden-grow-harvest/');
  const introduction = page.locator('[data-lv-world-motion="garden-grow-harvest"]');
  await expect(introduction.locator('.lv-motion-poses')).toHaveAttribute('src', /garden-grow-gardener\.webp$/);
  await introduction.getByRole('button', { name: /Play scene/ }).click();
  const movingLayers = await introduction.evaluate(element => element.getAnimations({ subtree: true })
    .map(animation => animation.effect.target.className));
  expect(movingLayers).toEqual(expect.arrayContaining(['lv-motion-landscape', 'lv-motion-poses', 'lv-motion-prop']));

  for (let index = 0; index < 20; index++) {
    if (await page.locator('.garden-season-tool').count()) break;
    const title = await page.locator('#learningQuestionTitle').textContent();
    const challenge = gardenGrowthChallenges.find(item => item.title === title);
    await page.getByRole('button', { name: challenge.options[challenge.answer].label, exact: true }).click();
    await page.locator('#gameActions button').click();
  }
  const tool = page.locator('.garden-season-tool');
  await expect(tool).toBeVisible();
  await expect(tool).toHaveCSS('animation-name', 'garden-tool-tilt');
  const scene = page.locator('.garden-season-scene');
  expect(await scene.evaluate(element => getComputedStyle(element, '::after').animationName)).toBe('garden-daylight');
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
  await expect(tool).toHaveCSS('animation-name', 'none');
  expect(await scene.evaluate(element => getComputedStyle(element, '::after').animationName)).toBe('none');
  await expect(page.locator('button[data-learning-answer]').first()).toBeEnabled();
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await expect(tool).toHaveCSS('animation-name', 'garden-tool-tilt');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(tool).toHaveCSS('animation-name', 'none');
});
