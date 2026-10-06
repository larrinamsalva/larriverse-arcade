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
  test('shared question bank publishes five twenty-plus subject pools after expansion', async ({ request }) => {
    const [baseResponse, expansionResponse] = await Promise.all([
      request.get('/games/learning-question-bank.json'),
      request.get('/games/learning-question-pack-2.json')
    ]);
    expect(baseResponse.ok()).toBeTruthy();
    expect(expansionResponse.ok()).toBeTruthy();
    const [bank, expansion] = await Promise.all([
      baseResponse.json(),
      expansionResponse.json()
    ]);
    expect(bank.schemaVersion).toBe(1);
    expect(expansion.schemaVersion).toBe(1);
    expect(Object.keys(bank.subjects).sort()).toEqual(['math', 'nature', 'reading', 'science', 'trivia']);
    const mergedCounts = Object.fromEntries(
      Object.keys(bank.subjects).map(subject => [
        subject,
        bank.subjects[subject].length + (expansion.subjects?.[subject]?.length || 0)
      ])
    );
    expect(Object.values(mergedCounts).every(count => count >= 20)).toBeTruthy();
    expect(Object.values(mergedCounts).reduce((sum, count) => sum + count, 0)).toBeGreaterThanOrEqual(120);
  });

  test('KidsCoin opens learning and lets parents assign chores per explorer', async ({ page, context }) => {
    await cleanDevice(page, context);
    const errors = watchPage(page);
    const response = await page.goto('/games/kidscoin-family/index.html', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('#view')).toContainText('Learning is always unlocked');

    await page.locator('[data-tab="learn"]').click();
    await expect(page.locator('.lesson-card')).toHaveCount(6);
    await expect(page.locator('#view')).toContainText('6 lessons · 120 questions');
    const lessonQuestionLabels = await page.locator('.lesson-card .pill').allTextContents();
    expect(lessonQuestionLabels.every(label => /20 questions|mastered/.test(label))).toBeTruthy();
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

  test('legacy learning cabinets load twenty-plus questions in every live section', async ({ page, context }) => {
    await cleanDevice(page, context);

    await page.goto('/games/creature-catcher/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.CreatureCatcherContent);
    const creature = await page.evaluate(() => window.CreatureCatcherContent);
    expect(Object.values(creature.questionsBySubject).every(count => count >= 20)).toBeTruthy();

    await page.goto('/games/road-trip-quest/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.RoadTripQuestContent);
    const road = await page.evaluate(() => window.RoadTripQuestContent);
    expect(Object.values(road.questionsBySubject).every(count => count >= 20)).toBeTruthy();

    await page.goto('/games/road-trip-quest-gps/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.RoadTripGpsContent);
    const gps = await page.evaluate(() => window.RoadTripGpsContent);
    expect(gps.sourceQuestions).toBe(28);
    expect(Object.values(gps.questionsBySubject).every(count => count >= 20)).toBeTruthy();
  });
});
