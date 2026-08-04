import { test, expect } from '@playwright/test';

const PROFILE_KEY = 'larriverse.arcade.profile.v1';
const LEARNING_KEY = 'larriverse.learningPath.v1';
const GOALS_KEY = 'larriverse.learningGoals.v1';

const seededProfile = {
  version: 3,
  name: 'Goal Tester',
  avatar: '🎯',
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

async function setStorage(page, key, value) {
  await page.evaluate(({ storageKey, storageValue }) => {
    localStorage.setItem(storageKey, JSON.stringify(storageValue));
  }, { storageKey: key, storageValue: value });
}

test.describe('LarriVerse Learning Goals', () => {
  test('tracks three pressure-free goals from local progress and shares them read-only', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/');
    await setStorage(page, PROFILE_KEY, seededProfile);
    await setStorage(page, LEARNING_KEY, seededLearning);
    await page.evaluate(key => localStorage.removeItem(key), GOALS_KEY);
    await page.goto('/goals/');

    await expect(page.locator('h1')).toContainText('Goal Tester');
    await expect(page.locator('#identityAvatar')).toHaveText('🎯');
    await expect(page.locator('#goalGrid .goal-card')).toHaveCount(0);
    await expect(page.locator('#suggestionGrid')).toContainText('Math');
    await expect(page.locator('#suggestionGrid')).toContainText('50%');

    await page.locator('#goalType').selectOption('subject-answers');
    await page.locator('#goalContext').selectOption('math');
    await page.locator('#goalTarget').selectOption('3');
    await page.locator('#addGoalButton').click();
    await expect(page.locator('#goalGrid .goal-card')).toHaveCount(1);
    await expect(page.locator('#goalGrid .goal-card')).toContainText('Answer 3 Math questions');
    await expect(page.locator('#goalGrid .goal-card')).toContainText('0 of 3');

    const progressedLearning = structuredClone(seededLearning);
    progressedLearning.games['creature-catcher'].stats.math = { attempts: 7, correct: 5 };
    await setStorage(page, LEARNING_KEY, progressedLearning);
    await page.evaluate(() => window.LarriVerseLearningGoalsBoard.refresh());
    await expect(page.locator('#goalGrid .goal-card').first()).toHaveClass(/complete/);
    await expect(page.locator('#goalGrid .goal-card').first()).toContainText('3 of 3');

    await page.locator('#goalType').selectOption('cabinet-sessions');
    await page.locator('#goalContext').selectOption('creature-catcher');
    await page.locator('#goalTarget').selectOption('1');
    await page.locator('#addGoalButton').click();

    await page.locator('#goalType').selectOption('xp-growth');
    await page.locator('#goalTarget').selectOption('18');
    await page.locator('#addGoalButton').click();
    await expect(page.locator('#goalGrid .goal-card')).toHaveCount(3);
    await expect(page.locator('#addGoalButton')).toBeDisabled();

    const progressedProfile = structuredClone(seededProfile);
    progressedProfile.xp = 198;
    progressedProfile.sessions = 8;
    progressedProfile.games['creature-catcher'].sessions = 5;
    progressedProfile.updatedAt = '2026-08-04T18:00:00.000Z';
    await setStorage(page, PROFILE_KEY, progressedProfile);
    await page.reload();

    await expect(page.locator('#goalGrid .goal-card.complete')).toHaveCount(3);
    await expect(page.locator('#completeCount')).toHaveText('3 / 3');
    await expect(page.locator('#doneCount')).toHaveText('3');
    await expect(page.locator('#slotCount')).toHaveText('0');

    const exported = await page.evaluate(() => window.LarriVerseLearningGoalsBoard.summary());
    expect(exported.schema).toBe('larriverse-learning-goals-summary');
    expect(exported.board.goals).toHaveLength(3);
    expect(exported.board.totals).toEqual(expect.objectContaining({ pinned: 3, complete: 3, openSlots: 0 }));
    expect(exported.privacy).toEqual(expect.objectContaining({
      uploadsData: false,
      includesFreeText: false,
      includesDeadlines: false,
      includesStreaks: false,
      includesRawFamilyRecords: false,
      includesLocationData: false
    }));
    expect(JSON.stringify(exported)).not.toMatch(/pinDigest|familyTasks|rewardRequests|latitude|longitude|coordinates|password|noteText|deadlineAt|dueDate|overdueAt/i);

    const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), GOALS_KEY);
    expect(stored.schema).toBe('larriverse-learning-goals');
    expect(stored.goals).toHaveLength(3);
    expect(JSON.stringify(stored)).not.toMatch(/note|deadline|overdue|streak/i);

    await page.goto('/passport/');
    await expect(page.locator('[data-learning-goals-summary] .shared-goal-card')).toHaveCount(3);
    await expect(page.locator('[data-learning-goals-count]')).toHaveText('3/3 complete');
    await expect(page.locator('[data-learning-goals-summary]')).toContainText('Math');

    await page.goto('/report/');
    await expect(page.locator('[data-learning-goals-summary] .shared-goal-card')).toHaveCount(3);
    await expect(page.locator('[data-learning-goals-count]')).toHaveText('3/3 complete');
    await expect(page.locator('[data-learning-goals-summary] button')).toHaveCount(0);

    await page.goto('/goals/');
    await page.locator('[data-action="restart"]').first().click();
    await expect(page.locator('#goalGrid .goal-card').first()).not.toHaveClass(/complete/);
    await expect(page.locator('#goalGrid .goal-card').first()).toContainText('0 of 3');
    await page.locator('[data-action="remove"]').first().click();
    await expect(page.locator('#goalGrid .goal-card')).toHaveCount(2);
    await expect(page.locator('#slotCount')).toHaveText('1');
    await expect(page.locator('#addGoalButton')).toBeEnabled();

    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(noOverflow).toBeTruthy();
    expect(errors).toEqual([]);
  });
});
