import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

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

  for (let index = 0; index < 80; index++) {
    const scene = page.locator('.garden-learning-art');
    const choices = page.locator('button[data-learning-answer]');
    await expect(scene).toHaveAttribute('role', 'img');
    await expect(choices).toHaveCount(3);
    await expect(choices.first()).toBeEnabled();
    await expect(page.locator('.garden-choice-art')).toHaveCount(3);
    const sceneDescription = await scene.getAttribute('aria-label');
    expect(sceneDescription).toContain('Illustrated garden lesson about');
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
