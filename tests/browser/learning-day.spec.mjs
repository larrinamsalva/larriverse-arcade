import { test, expect } from '@playwright/test';

const PROFILE_KEY = 'larriverse.arcade.profile.v1';
const LEARNING_KEY = 'larriverse.learningPath.v1';
const GOALS_KEY = 'larriverse.learningGoals.v1';
const DAY_KEY = 'larriverse.learningDay.v1';

const seededProfile = {
  version: 3,
  name: 'Day Tester',
  avatar: '🌤️',
  xp: 180,
  kc: 42,
  streak: 0,
  sessions: 7,
  completedSessions: 5,
  games: {
    'creature-catcher': {
      sessions: 4,
      completions: 3,
      highScore: 96,
      totalScore: 250,
      catches: 12,
      metrics: {},
      lastPlayedAt: '2026-08-03T18:00:00.000Z'
    },
    'road-trip-quest': {
      sessions: 3,
      completions: 2,
      highScore: 72,
      totalScore: 150,
      catches: 0,
      metrics: { bossesDefeated: 2 },
      lastPlayedAt: '2026-08-02T18:00:00.000Z'
    }
  },
  achievements: ['first-flight', 'three-is-magic', 'coin-spark'],
  updatedAt: '2026-08-03T18:00:00.000Z'
};

const seededLearning = {
  version: 1,
  games: {
    'creature-catcher': {
      mode: 'growing',
      seen: { math: ['math-place-value-1', 'math-fractions-1'] },
      stats: { math: { attempts: 4, correct: 2 } }
    },
    'road-trip-quest': {
      mode: 'challenge',
      seen: { science: ['science-force-1'] },
      stats: { science: { attempts: 2, correct: 2 } }
    }
  }
};

const seededGoals = {
  schema: 'larriverse-learning-goals',
  version: 1,
  goals: [{
    id: 'goal-11111111-1111-1111-1111-111111111111',
    type: 'subject-answers',
    subject: 'math',
    target: 6,
    baseline: 4,
    createdAt: '2026-08-04T17:00:00.000Z'
  }]
};

async function setStorage(page, key, value) {
  await page.evaluate(({ storageKey, storageValue }) => {
    localStorage.setItem(storageKey, JSON.stringify(storageValue));
  }, { storageKey: key, storageValue: value });
}

test.describe('LarriVerse My Learning Day', () => {
  test('turns goals and real local progress into one pressure-free next step', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/');
    await setStorage(page, PROFILE_KEY, seededProfile);
    await setStorage(page, LEARNING_KEY, seededLearning);
    await setStorage(page, GOALS_KEY, seededGoals);
    await page.evaluate(key => localStorage.removeItem(key), DAY_KEY);
    await page.goto('/today/');

    await expect(page.locator('h1')).toContainText('Day Tester');
    await expect(page.locator('#identityAvatar')).toHaveText('🌤️');
    await expect(page.locator('#choiceGrid .choice-card')).toHaveCount(3);
    await expect(page.locator('#choiceGrid .choice-card').first()).toContainText('From a pinned goal');
    await expect(page.locator('#choiceGrid .choice-card').first()).toContainText('Answer 3 Math questions');
    await expect(page.locator('#activeEmpty')).toBeVisible();
    await expect(page.locator('#activeStep')).toBeHidden();

    await page.locator('input[name="pace"][value="quick"]').check();
    await expect(page.locator('#choiceGrid .choice-card').first()).toContainText('Answer 1 Math question');
    await page.locator('input[name="pace"][value="deep"]').check();
    await expect(page.locator('#choiceGrid .choice-card').first()).toContainText('Answer 6 Math questions');
    await page.locator('input[name="pace"][value="steady"]').check();
    await expect(page.locator('#choiceGrid .choice-card').first()).toContainText('Answer 3 Math questions');

    await page.locator('#choiceGrid button[data-choice="0"]').click();
    await expect(page.locator('#activeStep')).toBeVisible();
    await expect(page.locator('#activeLabel')).toHaveText('Answer 3 Math questions');
    await expect(page.locator('#activeProgress')).toHaveText('0 of 3');
    await expect(page.locator('#finishStep')).toBeDisabled();
    await expect(page.locator('#choiceGrid button')).toBeDisabled();

    const initialDay = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), DAY_KEY);
    expect(initialDay.schema).toBe('larriverse-learning-day');
    expect(initialDay.active).toEqual(expect.objectContaining({
      source: 'goal',
      sourceGoalId: seededGoals.goals[0].id,
      pace: 'steady',
      type: 'subject-answers',
      subject: 'math',
      target: 3,
      baseline: 4
    }));
    expect(initialDay.history).toEqual([]);

    const progressedLearning = structuredClone(seededLearning);
    progressedLearning.games['creature-catcher'].stats.math = { attempts: 7, correct: 5 };
    await setStorage(page, LEARNING_KEY, progressedLearning);
    await page.locator('#refreshDay').click();
    await expect(page.locator('#activeStep')).toHaveClass(/complete/);
    await expect(page.locator('#activeProgress')).toHaveText('3 of 3');
    await expect(page.locator('#activePercent')).toHaveText('100%');
    await expect(page.locator('#finishStep')).toBeEnabled();

    const exported = await page.evaluate(() => window.LarriVerseLearningDayBoard.summary());
    expect(exported.schema).toBe('larriverse-learning-day-summary');
    expect(exported.learningDay.active).toEqual(expect.objectContaining({
      value: 3,
      target: 3,
      complete: true,
      paceLabel: 'Steady Quest'
    }));
    expect(exported.privacy).toEqual(expect.objectContaining({
      uploadsData: false,
      includesFreeText: false,
      includesTimers: false,
      includesSchedules: false,
      includesDeadlines: false,
      includesStreaks: false,
      includesGrades: false,
      includesRawFamilyRecords: false,
      includesLocationData: false
    }));
    const exportedText = JSON.stringify(exported);
    expect(exportedText).not.toMatch(/pinDigest|familyTasks|rewardRequests|latitude|longitude|coordinates|password|noteText|timerSeconds|deadlineAt|dueDate|overdueAt|gradeValue|missedDay/i);

    await page.reload();
    await expect(page.locator('#activeProgress')).toHaveText('3 of 3');
    await expect(page.locator('#finishStep')).toBeEnabled();
    await page.locator('#finishStep').click();
    await expect(page.locator('#activeEmpty')).toBeVisible();
    await expect(page.locator('#historyGrid .history-card')).toHaveCount(1);
    await expect(page.locator('#historyGrid')).toContainText('Answer 3 Math questions');
    await expect(page.locator('#celebrationCount')).toHaveText('1');

    await page.locator('input[name="pace"][value="quick"]').check();
    await page.locator('#choiceGrid button[data-choice="0"]').click();
    await expect(page.locator('#activeProgress')).toHaveText('0 of 1');
    const profileBeforeRelease = await page.evaluate(key => localStorage.getItem(key), PROFILE_KEY);
    const goalsBeforeRelease = await page.evaluate(key => localStorage.getItem(key), GOALS_KEY);
    await page.locator('#releaseStep').click();
    await expect(page.locator('#activeEmpty')).toBeVisible();
    expect(await page.evaluate(key => localStorage.getItem(key), PROFILE_KEY)).toBe(profileBeforeRelease);
    expect(await page.evaluate(key => localStorage.getItem(key), GOALS_KEY)).toBe(goalsBeforeRelease);

    const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), DAY_KEY);
    expect(stored.active).toBeNull();
    expect(stored.history).toHaveLength(1);
    expect(JSON.stringify(stored)).not.toMatch(/noteText|timerSeconds|deadlineAt|dueDate|overdueAt|streakCount|gradeValue|familyTasks|rewardRequests|coordinates|latitude|longitude/i);

    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(noOverflow).toBeTruthy();
    expect(errors).toEqual([]);
  });
});
