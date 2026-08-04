import { test, expect } from '@playwright/test';

async function cleanDevice(page, context) {
  await context.clearPermissions();
  await page.addInitScript(() => {
    const marker = 'larriverse.qa.storage-cleared-once';
    if (sessionStorage.getItem(marker)) return;
    localStorage.clear();
    sessionStorage.setItem(marker, 'true');
  });
}

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/favicon\.ico|Failed to load resource/i.test(text)) return;
    errors.push(text);
  });
  return errors;
}

test.describe('LarriVerse adaptive learning paths', () => {
  test('expansion packs publish 120 shared and 60 KidsCoin questions', async ({ request }) => {
    const [baseResponse, packResponse, familyResponse, familyPackResponse] = await Promise.all([
      request.get('/games/learning-question-bank.json'),
      request.get('/games/learning-question-pack-2.json'),
      request.get('/games/kidscoin-family/family.json'),
      request.get('/games/kidscoin-family/family-question-pack-2.json')
    ]);
    for (const response of [baseResponse, packResponse, familyResponse, familyPackResponse]) expect(response.ok()).toBeTruthy();

    const [base, pack, family, familyPack] = await Promise.all([
      baseResponse.json(), packResponse.json(), familyResponse.json(), familyPackResponse.json()
    ]);
    const sharedTotal = Object.values(base.subjects).flat().length + Object.values(pack.subjects).flat().length;
    const familyTotal = family.lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0)
      + Object.values(familyPack.questionsByLesson).flat().length;

    expect(sharedTotal).toBe(120);
    expect(Object.values(pack.subjects).every(questions => questions.length === 8)).toBeTruthy();
    expect(familyTotal).toBe(60);
    expect(Object.values(familyPack.questionsByLesson).every(questions => questions.length === 4)).toBeTruthy();
  });

  test('KidsCoin merges its expansion into six open ten-question lessons', async ({ page, context }) => {
    await cleanDevice(page, context);
    const errors = watchErrors(page);
    const response = await page.goto('/games/kidscoin-family/index.html', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    await expect.poll(() => page.evaluate(() => window.KidsCoinFamilyData?.questions)).toBe(60);
    await page.locator('[data-tab="learn"]').click();
    await expect(page.locator('.lesson-card')).toHaveCount(6);
    const labels = await page.locator('.lesson-card .pill').allTextContents();
    expect(labels.every(label => label.includes('10 questions'))).toBeTruthy();
    await page.locator('[data-lesson]').first().click();
    await expect(page.locator('#lessonQuestion')).toContainText('Question 1 of 3');
    await expect(page.locator('#parentGate')).not.toHaveAttribute('open', '');
    expect(errors).toEqual([]);
  });

  test('Creature Catcher remembers a selected level and recent learning locally', async ({ page, context }) => {
    await cleanDevice(page, context);
    const errors = watchErrors(page);
    const response = await page.goto('/games/creature-catcher/index.html', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('[data-learning-mode]')).toHaveCount(4);
    await expect.poll(() => page.evaluate(() => window.LarriVerseLearningPath?.summary().loaded?.total)).toBe(120);
    await expect(page.locator('#profileLine')).toContainText('96 learning questions loaded');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.locator('[data-learning-mode="starter"]').click()
    ]);
    await expect.poll(() => page.evaluate(() => window.LarriVerseLearningPath?.mode())).toBe('starter');
    const prepared = await page.evaluate(async () => {
      const bank = await fetch('../learning-question-bank.json').then(response => response.json());
      return Object.values(bank.subjects).flat().map(question => question.difficulty);
    });
    expect(prepared.length).toBeGreaterThanOrEqual(30);
    expect(prepared.every(level => level === 'starter')).toBeTruthy();

    const localSummary = await page.evaluate(() => {
      window.LarriVerseLearningPath.remember('math-17', 'math', true);
      return window.LarriVerseLearningPath.summary();
    });
    expect(localSummary.mode).toBe('starter');
    expect(localSummary.seen).toBe(1);
    expect(localSummary.attempts).toBe(1);
    expect(localSummary.correct).toBe(1);
    expect(localSummary.accuracy).toBe(100);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.evaluate(() => window.LarriVerseLearningPath?.summary().seen)).toBe(1);
    await expect(page.locator('[data-learning-mode="starter"]')).toHaveAttribute('aria-pressed', 'true');
    expect(errors).toEqual([]);
  });
});
