import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

test('Brain Sweat Expanded pictures match reviewed worlds without changing answers or review gates', async ({ page }, testInfo) => {
  const output = path.join('artifacts', 'screenshots', testInfo.project.name);
  mkdirSync(output, { recursive: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (testInfo.project.name.includes('mobile')) await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/games/brain-sweat-expanded/');
  await expect(page.locator('#worldGrid .world-card')).toHaveCount(14);
  await expect(page.locator('.world-setting')).toHaveCount(6);
  await expect(page.locator('.skill-lab-preview img')).toHaveCount(6);
  await page.locator('.skill-lab-preview img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await page.locator('.world-setting').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await page.locator('.hero').screenshot({ path: path.join(output, 'brain-sweat-skill-lab.png') });

  await page.locator('[data-world="checkbook"]').click();
  await expect(page.locator('#worldDialog')).toBeVisible();
  await expect(page.locator('#scenarioArtImage')).toHaveAttribute('src', 'art/checkbook.webp');
  await page.locator('#scenarioArtImage').evaluate(image => image.decode());
  await expect(page.locator('#challengeBody .ledger-button')).toHaveCount(2);
  await page.locator('#challengePanel').screenshot({ path: path.join(output, 'brain-sweat-checkbook-challenge.png') });
  await page.locator('#nextChallenge').click();
  await expect(page.locator('#scenarioArtImage')).toHaveAttribute('src', 'art/checkbook.webp');
  await page.locator('#closeWorld').click();

  await page.locator('[data-world="coding"]').click();
  await page.locator('#tierTabs [data-tier="adv"]').click();
  await expect(page.locator('#scenarioArtImage')).toHaveAttribute('src', 'art/coding.webp');
  await page.locator('#scenarioArtImage').evaluate(image => image.decode());
  await expect(page.locator('#challengeBody .tool-button')).toHaveCount(6);
  await page.locator('#challengePanel').screenshot({ path: path.join(output, 'brain-sweat-coding-challenge.png') });
  await page.locator('#closeWorld').click();

  await page.locator('[data-world="voltage"]').click();
  await expect(page.locator('#lockedPanel')).toBeVisible();
  await expect(page.locator('#scenarioArt')).toBeHidden();
  await expect(page.locator('#challengeBody')).toBeHidden();
  const size = await page.evaluate(() => ({ view: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(size.page).toBeLessThanOrEqual(size.view + 4);
  expect(errors).toEqual([]);
});
