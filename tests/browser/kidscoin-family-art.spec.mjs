import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

test('KidsCoin Family shows local art across the dashboard, chores, lessons and missions', async ({ page }, testInfo) => {
  const output = path.join('artifacts', 'screenshots', testInfo.project.name);
  mkdirSync(output, { recursive: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/games/kidscoin-family/');
  await expect(page.locator('#view')).not.toContainText('Loading the family ledger');
  await expect(page.locator('.boundary')).toContainText('Family KC is fictional');

  const hero = page.locator('.family-hero-illustration img');
  await expect(hero).toHaveAttribute('src', 'art/planning.webp');
  await hero.evaluate(image => image.decode());
  await page.locator('.hero').screenshot({ path: path.join(output, 'kidscoin-family-planning.png') });

  await page.locator('[data-tab="tasks"]').click();
  const chores = page.locator('.family-story-scene--chores img');
  await expect(chores).toHaveAttribute('src', 'art/chores.webp');
  await chores.scrollIntoViewIfNeeded();
  await chores.evaluate(image => image.decode());
  await page.locator('.family-story-scene--chores').screenshot({ path: path.join(output, 'kidscoin-family-chores.png') });
  const box = await page.locator('.family-story-scene--chores').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(321);

  await page.locator('[data-tab="learn"]').click();
  const learning = page.locator('.family-story-scene--learning img');
  await expect(learning).toHaveAttribute('src', 'art/learning.webp');
  await learning.scrollIntoViewIfNeeded();
  await learning.evaluate(image => image.decode());
  await page.locator('.family-story-scene--learning').screenshot({ path: path.join(output, 'kidscoin-family-learning.png') });
  await expect(page.locator('.lesson-card button').first()).toBeEnabled();

  await page.locator('[data-adventure-mission="kidscoin-family"]').click();
  const dialog = page.locator('#adventureMissionDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.kidscoin-mission-art')).toHaveAttribute('src', './art/learning.webp');
  await dialog.locator('.kidscoin-mission-art').evaluate(image => image.decode());
  await expect(dialog.locator('#adventurePrompt')).toBeVisible();
  await dialog.locator('.lv-adventure-question').screenshot({ path: path.join(output, 'kidscoin-family-mission.png') });
  await dialog.locator('#adventureClose').click();
  await expect(page.locator('#parentButton')).toBeVisible();
  expect(errors).toEqual([]);
});
