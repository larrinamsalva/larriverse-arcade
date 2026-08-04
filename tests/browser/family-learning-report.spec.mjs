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
  achievements: ['first-flight', 'three-is-magic', 'coin-spark'],
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
      seen: {
        science: ['science-force-1', 'science-energy-1']
      },
      stats: {
        science: { attempts: 4, correct: 3 }
      }
    }
  }
};

test.describe('LarriVerse Family Learning Report', () => {
  test('summarizes local learning without grading or family-record leakage', async ({ page }) => {
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

    await page.goto('/report/');

    await expect(page.locator('h1')).toContainText('Trail Tester');
    await expect(page.locator('#identityAvatar')).toHaveText('🦊');
    await expect(page.locator('#levelValue')).toHaveText('3');
    await expect(page.locator('#totalXp')).toHaveText('180');
    await expect(page.locator('#totalSessions')).toHaveText('7');
    await expect(page.locator('#totalCompletions')).toHaveText('5');
    await expect(page.locator('#cabinetsVisited')).toHaveText('2 / 8');

    await expect(page.locator('#strengthCards .insight-card')).toHaveCount(1);
    await expect(page.locator('#strengthCards')).toContainText('Reading');
    await expect(page.locator('#strengthCards')).toContainText('100%');
    await expect(page.locator('#practiceCards .insight-card')).toHaveCount(1);
    await expect(page.locator('#practiceCards')).toContainText('Math');
    await expect(page.locator('#practiceCards')).toContainText('50%');

    await expect(page.locator('.subject-card')).toHaveCount(3);
    await expect(page.locator('.subject-card[data-subject="science"]')).toContainText('75%');
    await expect(page.locator('.path-card')).toHaveCount(2);
    await expect(page.locator('.path-card').first()).toContainText('Growing');
    await expect(page.locator('.path-card').last()).toContainText('Challenge');

    await expect(page.locator('.cabinet-row')).toHaveCount(8);
    await expect(page.locator('.cabinet-row:not(.unvisited)')).toHaveCount(2);
    await expect(page.locator('#cabinetSummary')).toContainText('2 of 8 visited');
    await expect(page.locator('#recentActivity li')).toHaveCount(2);
    await expect(page.locator('#recentActivity li').first()).toContainText('Creature Catcher');
    await expect(page.locator('#conversationStarters li')).toHaveCount(3);

    const report = await page.evaluate(() => window.LarriVerseFamilyLearningReport.report());
    expect(report.schema).toBe('larriverse-family-learning-report');
    expect(report.version).toBe(1);
    expect(report.learner).toEqual(expect.objectContaining({ name: 'Trail Tester', level: 3, xp: 180 }));
    expect(report.overview).toEqual(expect.objectContaining({
      cabinetCount: 8,
      visitedCabinets: 2,
      completedCabinets: 2,
      learningAttempts: 10,
      learningCorrect: 7,
      learningAccuracy: 70
    }));
    expect(report.strengths).toHaveLength(1);
    expect(report.practiceOpportunities).toHaveLength(1);
    expect(report.subjects).toHaveLength(3);
    expect(report.cabinets).toHaveLength(8);
    expect(report.recentActivity).toHaveLength(2);
    expect(report.privacy).toEqual(expect.objectContaining({
      deviceLocalSource: true,
      uploadsData: false,
      includesRawFamilyRecords: false,
      includesLocationData: false,
      storesReviewNotes: false
    }));
    expect(report.boundaries).toEqual(expect.objectContaining({
      notAGrade: true,
      notADiagnosis: true,
      notARanking: true,
      notACertification: true
    }));
    expect(JSON.stringify(report)).not.toMatch(/pinDigest|familyTasks|rewardRequests|latitude|longitude|coordinates|password/i);

    await expect(page.locator('input, textarea, select')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
