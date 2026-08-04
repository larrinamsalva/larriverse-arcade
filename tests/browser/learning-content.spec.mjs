import { test, expect } from '@playwright/test';

function watchPage(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !/favicon\.ico|Failed to load resource/i.test(message.text())) errors.push(message.text());
  });
  return errors;
}

async function cleanDevice(page, context) {
  await context.clearPermissions();
  await page.addInitScript(() => localStorage.clear());
}

test.describe('LarriVerse unlocked learning and question data', () => {
  test('shared question bank publishes five deep subject pools', async ({ request }) => {
    const response = await request.get('/games/learning-question-bank.json');
    expect(response.ok()).toBeTruthy();
    const bank = await response.json();
    expect(bank.schemaVersion).toBe(1);
    expect(Object.keys(bank.subjects).sort()).toEqual(['math', 'nature', 'reading', 'science', 'trivia']);
    expect(Object.values(bank.subjects).every(questions => questions.length >= 16)).toBeTruthy();
    expect(Object.values(bank.subjects).flat()).toHaveLength(80);
  });

  test('KidsCoin opens learning and lets parents assign chores per explorer', async ({ page, context }) => {
    await cleanDevice(page, context);
    const errors = watchPage(page);
    const response = await page.goto('/games/kidscoin-family/index.html', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('#view')).toContainText('Learning is always unlocked');

    await page.locator('[data-tab="learn"]').click();
    await expect(page.locator('.lesson-card')).toHaveCount(6);
    await expect(page.locator('#parentGate')).not.toHaveAttribute('open', '');
    await page.locator('[data-lesson]').first().click();
    await expect(page.locator('#lessonDialog')).toHaveAttribute('open', '');
    await expect(page.locator('#lessonQuestion')).toContainText('Question 1 of 3');
    await expect(page.locator('#lessonOptions button')).toHaveCount(4);
    await page.locator('#closeLesson').click();

    await page.locator('#parentButton').click();
    await page.locator('#pinInput').fill('3690');
    await page.locator('#pinForm button[type="submit"]').click();
    await expect(page.locator('#parentDialog')).toHaveAttribute('open', '');

    await page.locator('[data-parent-tab="profiles"]').click();
    await page.locator('#newName').fill('Second Explorer');
    await page.locator('#addProfile button').click();
    await expect(page.locator('#activeName')).toHaveText('Second Explorer');

    await page.locator('[data-parent-tab="tasks"]').click();
    const firstAssignment = page.locator('[data-assignment]').first();
    await firstAssignment.selectOption('explorer-1');
    await page.locator('#closeParent').click();

    await page.locator('[data-tab="tasks"]').click();
    await expect(page.locator('.task-card')).toHaveCount(11);
    await page.locator('#profileButton').click();
    await page.locator('[data-profile="explorer-1"]').click();
    await expect(page.locator('.task-card')).toHaveCount(12);
    expect(errors).toEqual([]);
  });
});
