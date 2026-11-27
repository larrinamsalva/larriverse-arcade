import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { BUBBLE_SCENES, sceneForLevel } from '../../games/bubble-resonance-phi369/scene-art.js';

const source = readFileSync('games/bubble-resonance-phi369/game.js', 'utf8');

test('Bubble Resonance changes illustrated settings every twenty levels without covering the bubble controls', async ({ page }, info) => {
  const output = path.join('artifacts', 'screenshots', info.project.name);
  mkdirSync(output, { recursive: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (info.project.name.includes('mobile')) await page.setViewportSize({ width: 320, height: 780 });
  await page.route('**/games/bubble-resonance-phi369/game.js', route => route.fulfill({
    status: 200, contentType: 'text/javascript',
    body: `${source}\nwindow.__bubbleSceneQA = n => { level=n; gameOver=false; levelCleared=false; shot=null; dropAnimation=null; current=null; next=null; initGrid(); nextBubble(); hud(); };`
  }));
  await page.goto('/games/bubble-resonance-phi369/');
  await expect(page.locator('#level')).toHaveText('1 / 80');
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#legend .number-legend span')).toHaveCount(6);
  await expect(page.locator('#legend .power-legend span')).toHaveCount(3);

  for (const level of [1,20,21,40,41,60,61,80]) {
    await page.evaluate(n => window.__bubbleSceneQA(n), level);
    const scene = sceneForLevel(level);
    await expect(page.locator('#sceneBackdrop')).toHaveAttribute('src', `art/${scene.file}`);
    await expect(page.locator('#sceneBackdrop')).toHaveAttribute('data-scene', scene.id);
    await expect(page.locator('#sceneCaption')).toContainText(scene.name);
    await page.locator('#sceneBackdrop').evaluate(image => image.decode());
    if ([1,21,41,61].includes(level)) {
      await page.locator('.playfield').screenshot({ path: path.join(output, `bubble-${scene.id}.png`) });
    }
  }

  expect(BUBBLE_SCENES).toHaveLength(4);
  const layers = await page.locator('.playfield').evaluate(field => {
    const image = field.querySelector('img'), canvas = field.querySelector('canvas');
    const scene = image.getBoundingClientRect(), board = canvas.getBoundingClientRect();
    return {
      imageWidth: scene.width, canvasWidth: board.width,
      imageHeight: scene.height, canvasHeight: board.height,
      pointerEvents: getComputedStyle(image).pointerEvents,
      imageLayer: Number(getComputedStyle(image).zIndex), canvasLayer: Number(getComputedStyle(canvas).zIndex)
    };
  });
  expect(Math.abs(layers.imageWidth - layers.canvasWidth)).toBeLessThan(2);
  expect(Math.abs(layers.imageHeight - layers.canvasHeight)).toBeLessThan(2);
  expect(layers.pointerEvents).toBe('none');
  expect(layers.imageLayer).toBeLessThan(layers.canvasLayer);

  await page.evaluate(() => window.LarriVerseArcade.setSettings({ theme: 'light' }));
  await expect(page.locator('#game')).toHaveAttribute('data-color-mode', 'light');
  await expect(page.locator('#sceneBackdrop')).toHaveCSS('opacity', '0.8');
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ highContrast: true }));
  await expect(page.locator('#sceneBackdrop')).toHaveCSS('opacity', '0');
  await expect(page.locator('#sceneCaption')).toHaveCSS('color', 'rgb(255, 255, 255)');
  const size = await page.evaluate(() => ({ view: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(size.page).toBeLessThanOrEqual(size.view + 4);
  expect(errors).toEqual([]);
});
