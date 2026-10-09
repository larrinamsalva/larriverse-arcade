import { test, expect } from '@playwright/test';
import { streetSafetyScenarios } from '../../games/street-safety-scout/scenarios.js';

const byId = new Map(streetSafetyScenarios.map(item => [item.id, item]));

async function answerCurrent(page, chooseWrong = false) {
  const panel = page.locator('#challengePanel');
  const id = await panel.getAttribute('data-scenario-id');
  const item = byId.get(id);
  expect(item, `known scenario ${id}`).toBeTruthy();
  const choice = chooseWrong ? (item.answer + 1) % item.options.length : item.answer;
  await page.locator(`.answer-button[data-answer="${choice}"]`).click();
  await expect(page.locator('#feedback')).toContainText(item.why);
  await expect(page.locator('.answer-button.correct')).toHaveCount(1);
  return item;
}

test('Game 30 completes a balanced visual safety route and saves local progress', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/games/street-safety-scout/index.html');
  await expect(page.locator('body')).toHaveAttribute('data-game-ready', 'true');
  await expect(page.locator('#soundButton')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#startButton').focus();
  await page.keyboard.press('Enter');

  const categories = new Map();
  for (let index = 0; index < 15; index += 1) {
    const item = await answerCurrent(page, index === 0);
    categories.set(item.category, (categories.get(item.category) || 0) + 1);
    const visual = page.locator('#scenarioVisual svg');
    await expect(visual).toHaveCount(1);
    await expect(visual).toHaveAttribute('role', 'img');
    await expect(visual).toHaveAttribute('aria-label', item.title);
    await page.locator('#nextButton').click();
  }

  expect(Object.fromEntries(categories)).toEqual({
    'Signal lights': 3,
    'Caution signs': 3,
    'Emergency awareness': 3,
    'Vehicle & road hazards': 3,
    'Roadside caution': 3
  });
  await expect(page.locator('#resultDialog')).toBeVisible();
  await expect(page.locator('#resultMessage')).toContainText('14 of 15');
  const saved = await page.evaluate(() => window.LarriVerseArcade.summary().games['street-safety-scout']);
  expect(saved.completions).toBe(1);
  expect(saved.metrics.safetyStops).toBe(15);
  expect(saved.metrics.safetyClues).toBe(14);
  expect(errors).toEqual([]);
});

test('four routes cover all sixty scenes before repeating and reflow at 320 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('/games/street-safety-scout/index.html');
  await page.locator('#startButton').click();
  const poolSizes = Object.fromEntries([...new Set(streetSafetyScenarios.map(item => item.category))]
    .map(category => [category, streetSafetyScenarios.filter(item => item.category === category).length]));
  const cycleSeen = new Map(Object.keys(poolSizes).map(category => [category, new Set()]));
  const routes = [];

  for (let routeIndex = 0; routeIndex < 4; routeIndex += 1) {
    const route = [];
    for (let index = 0; index < 15; index += 1) {
      const item = await answerCurrent(page);
      route.push(item);
      await page.locator('#nextButton').click();
    }
    routes.push(route);
    for (const category of Object.keys(poolSizes)) {
      const selected = route.filter(item => item.category === category).map(item => item.id);
      expect(new Set(selected).size).toBe(3);
      const seen = cycleSeen.get(category);
      const repeated = selected.filter(id => seen.has(id));
      if (repeated.length) {
        expect(new Set([...seen, ...selected]).size, `${category} completes its pool before repeating`).toBe(poolSizes[category]);
        cycleSeen.set(category, new Set(repeated));
      } else {
        selected.forEach(id => seen.add(id));
      }
    }
    if (routeIndex < 3) await page.locator('#playAgainButton').click();
  }
  expect(routes[1].filter(item => routes[0].some(first => first.id === item.id))).toEqual([]);
  const allIds = routes.flat().map(item => item.id);
  expect(new Set(allIds).size).toBe(streetSafetyScenarios.length);
  for (const category of Object.keys(poolSizes)) {
    expect(cycleSeen.get(category).size, `${category} covers its complete twelve-scene pool`).toBe(poolSizes[category]);
  }
  const layout = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 4);
});
