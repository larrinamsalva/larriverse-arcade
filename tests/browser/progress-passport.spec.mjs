import { test, expect } from '@playwright/test';

const PROFILE_KEY = 'larriverse.arcade.profile.v1';
const LEARNING_KEY = 'larriverse.learningPath.v1';

const seededProfile = {
  version: 3,
  name: 'Trail Tester',
  avatar: '🦊',
  xp: 180,
  kc: 42,
  streak: 4,
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
  achievements: ['first-flight', 'three-is-magic', 'coin-spark', 'creature-catcher-score-90'],
  updatedAt: '2026-08-03T18:00:00.000Z'
};

const seededLearning = {
  version: 1,
  games: {
    'creature-catcher': {
      mode: 'growing',
      seen: {
        math: ['math-place-value-1', 'math-fractions-1'],
        reading: ['reading-context-1']
      },
      stats: {
        math: { attempts: 4, correct: 2 },
        reading: { attempts: 2, correct: 2 }
      }
    },
    'road-trip-quest': {
      mode: 'challenge',
      seen: {},
      stats: {}
    }
  }
};

test.describe('LarriVerse Progress Passport', () => {
  test('turns device-local saves into a private eight-cabinet progress view', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.addInitScript(({ profileKey, profile, learningKey, learning }) => {
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(learningKey, JSON.stringify(learning));
    }, {
      profileKey: PROFILE_KEY,
      profile: seededProfile,
      learningKey: LEARNING_KEY,
      learning: seededLearning
    });

    await page.goto('/passport/');

    await expect(page.locator('h1')).toContainText('Trail Tester');
    await expect(page.locator('#identityAvatar')).toHaveText('🦊');
    await expect(page.locator('#levelValue')).toHaveText('3');
    await expect(page.locator('#totalXp')).toHaveText('180');
    await expect(page.locator('#totalKc')).toHaveText('42');
    await expect(page.locator('#totalSessions')).toHaveText('7');
    await expect(page.locator('#totalCompletions')).toHaveText('5');
    await expect(page.locator('.progress-track')).toHaveAttribute('aria-valuenow', '20');

    await expect(page.locator('.cabinet-stamp')).toHaveCount(8);
    await expect(page.locator('.cabinet-stamp.played')).toHaveCount(2);
    await expect(page.locator('.cabinet-stamp.completed')).toHaveCount(2);
    await expect(page.locator('#cabinetSummary')).toContainText('2 of 8 cabinets visited');

    await expect(page.locator('.learning-card')).toHaveCount(2);
    await expect(page.locator('.learning-card').first()).toContainText('Growing');
    await expect(page.locator('.learning-card').first()).toContainText('50%');
    await expect(page.locator('.learning-card').first()).toContainText('100%');

    await expect(page.locator('.achievement:not(.locked)')).toHaveCount(4);
    await expect(page.locator('#missionHeading')).toContainText('Practice Math');
    await expect(page.locator('#missionLink')).toHaveAttribute('href', '../games/creature-catcher/');

    const summary = await page.evaluate(() => window.LarriVerseProgressPassport.summary());
    expect(summary.schema).toBe('larriverse-progress-passport');
    expect(summary.version).toBe(1);
    expect(summary.player).toEqual(expect.objectContaining({ name: 'Trail Tester', level: 3, xp: 180 }));
    expect(summary.cabinets).toHaveLength(8);
    expect(summary.learning).toHaveLength(2);
    expect(summary.privacy).toEqual(expect.objectContaining({
      deviceLocalSource: true,
      uploadsData: false,
      includesRawFamilyRecords: false,
      includesLocationData: false
    }));
    expect(JSON.stringify(summary)).not.toMatch(/pinDigest|latitude|longitude|coordinates|familyTasks/i);

    await expect(page.locator('input, textarea, select')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
