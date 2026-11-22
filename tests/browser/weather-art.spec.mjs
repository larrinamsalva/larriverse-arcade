import { test, expect } from '@playwright/test';
import { weatherChallenges } from '../../assets/skill-worlds.js';

const scenes = new Set(weatherChallenges.map(challenge => challenge.scene));
const reports = new Set(['rain-chance', 'high-low', 'hourly-rain', 'wind-report', 'sun-times', 'current-later', 'three-day']);

test('Weather Watchers pictures match all 60 sky and forecast questions', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/weather-watchers/');
  const intro = page.locator('[data-lv-world-motion="weather-watchers"]');
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src', /weather-guide\.webp$/);
  await expect(intro.locator('.lv-motion-landscape')).toHaveAttribute('src', /weather-sunny\.webp$/);
  const seen = new Set();
  const seenIds = new Set();
  let checkedMotion = false;
  for (let i = 0; i < weatherChallenges.length; i++) {
    const title = await page.locator('#learningQuestionTitle').innerText();
    const challenge = weatherChallenges.find(item => item.title === title);
    expect(challenge, `level ${i + 1} is authored`).toBeTruthy();
    expect(seenIds.has(challenge.id), `${challenge.id} appears once`).toBe(false);
    seenIds.add(challenge.id);
    seen.add(challenge.scene);
    const art = page.locator('.weather-panorama');
    await expect(art).toHaveAttribute('role', 'img');
    await expect(art).toHaveAttribute('data-weather-scene', challenge.scene);
    const expected = reports.has(challenge.scene) ? 'forecast-day' : challenge.scene;
    await expect(art.locator('.weather-landscape')).toHaveAttribute('src', new RegExp(`weather-${expected}\\.webp$`));
    await art.locator('img').evaluate(image => image.decode());
    const choicePictures = page.locator('.picture-choice img');
    await choicePictures.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await expect(page.locator('.picture-choice')).toHaveCount(3);
    if (reports.has(challenge.scene)) {
      await expect(art.locator('.weather-forecast-overlay')).toBeVisible();
      if (challenge.scene === 'high-low') await expect(art.locator('svg')).toContainText('HIGH 75°');
    } else await expect(art.locator('.weather-forecast-overlay')).toHaveCount(0);
    if (!checkedMotion && challenge.scene === 'wispy-clouds') {
      await expect(art.locator('.weather-landscape')).toHaveCSS('animation-name', 'weather-sky-drift');
      await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
      await expect(art.locator('.weather-landscape')).toHaveCSS('animation-name', 'none');
      await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(art.locator('.weather-landscape')).toHaveCSS('animation-name', 'none');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      checkedMotion = true;
    }
    await page.getByRole('button', { name: challenge.options[challenge.answer].label, exact: true }).click();
    await expect(page.locator('#feedback')).toHaveClass(/good/);
    await page.locator('#gameActions button').click();
  }
  expect([...seen].sort()).toEqual([...scenes].sort());
  expect(seenIds.size).toBe(60);
  expect(checkedMotion).toBe(true);
  await expect(page.locator('#finishDialog')).toBeVisible();
  expect(errors).toEqual([]);
});

test('Weather Watchers fits a small phone with enlarged text and keeps picture choices readable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/games/weather-watchers/');
  await page.evaluate(() => {
    window.LarriVerseArcade.setSettings({ theme: 'dark', highContrast: true, reducedMotion: true });
    document.documentElement.style.setProperty('font-size', '200%', 'important');
  });
  const result = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    picture: document.querySelector('.weather-panorama').getBoundingClientRect().toJSON(),
    choices: [...document.querySelectorAll('.picture-choice')].map(node => node.getBoundingClientRect().toJSON())
  }));
  expect(result.scroll).toBeLessThanOrEqual(result.width + 4);
  for (const box of [result.picture, ...result.choices]) {
    expect(box.width).toBeGreaterThan(44);
    expect(box.left).toBeGreaterThanOrEqual(-1);
    expect(box.right).toBeLessThanOrEqual(result.width + 1);
  }
  await expect(page.locator('.weather-landscape')).toBeVisible();
  const title = await page.locator('#learningQuestionTitle').innerText();
  const item = weatherChallenges.find(challenge => challenge.title === title);
  await page.getByRole('button', { name: item.options[item.answer].label, exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#feedback')).toContainText(item.why);
});
