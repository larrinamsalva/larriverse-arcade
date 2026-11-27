import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const cooking = JSON.parse(readFileSync('games/brain-sweat-life-skills/content/cooking.json', 'utf8'));
const firstLesson = cooking.lessons[0];

test('Brain Sweat Life Skills keeps neutral illustrations with playable questions and locked review areas', async ({ page }, info) => {
  const output = path.join('artifacts', 'screenshots', info.project.name);
  mkdirSync(output, { recursive: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (info.project.name.includes('mobile')) await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/games/brain-sweat-life-skills/');
  await expect(page.locator('#worldGrid .world-card')).toHaveCount(6);
  await expect(page.locator('.world-setting')).toHaveCount(4);
  await expect(page.locator('.life-settings img')).toHaveCount(4);
  await page.locator('.life-settings img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await page.locator('.hero').screenshot({ path: path.join(output, 'life-skills-introduction.png') });

  await page.locator(`[data-lesson="${firstLesson.id}"]`).click();
  await expect(page.locator('#lessonDialog')).toBeVisible();
  await expect(page.locator('#lessonSettingImage')).toHaveAttribute('src', 'art/cooking.webp');
  await page.locator('#lessonSettingImage').evaluate(image => image.decode());
  await page.locator('.question-card').screenshot({ path: path.join(output, 'life-skills-cooking-question.png') });
  for (const question of firstLesson.questions) {
    await expect(page.locator('#questionText')).toHaveText(question.prompt);
    await expect(page.locator('#lessonSettingImage')).toHaveAttribute('src', 'art/cooking.webp');
    await page.locator('#answerGrid button').nth(question.answer).click();
    await expect(page.locator('#feedback')).toContainText('Correct');
    await page.locator('#nextQuestion').click();
  }
  await expect(page.locator('#resultDialog')).toBeVisible();
  await expect(page.locator('#completedCount')).toHaveText('1');
  await page.locator('#resultHome').click();

  for (const [id, file] of [
    ['household-management-budgeting', 'home2.webp'],
    ['navigation-without-technology', 'nature.webp'],
    ['how-your-brain-actually-works', 'mind.webp']
  ]) {
    await page.locator(`[data-lesson="${id}"]`).click();
    await expect(page.locator('#lessonSettingImage')).toHaveAttribute('src', `art/${file}`);
    await page.locator('#lessonSettingImage').evaluate(image => image.decode());
    await page.locator('.question-card').screenshot({ path: path.join(output, `life-skills-${file.replace('.webp', '')}-question.png`) });
    await page.locator('#lessonDialog button[value="cancel"]').click();
  }

  await page.locator('#filters [data-filter="review-queued"]').click();
  await expect(page.locator('.world-setting')).toHaveCount(0);
  await expect(page.locator('#worldGrid .lesson.ready')).toHaveCount(0);
  await expect(page.locator('#worldGrid .lesson.locked')).toHaveCount(12);
  await page.reload();
  await expect(page.locator('#completedCount')).toHaveText('1');
  const size = await page.evaluate(() => ({ view: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(size.page).toBeLessThanOrEqual(size.view + 4);
  expect(errors).toEqual([]);
});
