import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function outputFolder(info) {
  const folder = path.join('artifacts', 'screenshots', info.project.name);
  fs.mkdirSync(folder, { recursive: true }); return folder;
}
async function answer(page, name) {
  await page.getByRole('button', { name, exact: true }).focus();
  await page.keyboard.press('Enter');
}
async function movingFrames(picture, name) {
  return picture.evaluate((node, name) => {
    const animation = node.getAnimations().find(animation => animation.animationName === name);
    if (!animation || getComputedStyle(node).animationPlayState !== 'running') return false;
    const duration = animation.effect.getComputedTiming().duration;
    if (!Number.isFinite(duration) || duration <= 0) return false;
    const time = animation.currentTime, state = animation.playState;
    animation.pause();
    try {
      animation.currentTime = duration * .2;
      const before = getComputedStyle(node).transform;
      animation.currentTime = duration * .6;
      return before !== getComputedStyle(node).transform;
    } finally {
      animation.currentTime = time;
      if (state === 'running') animation.play();
      else if (state === 'finished') animation.finish();
    }
  }, name);
}

test('Reuse Rally: pictured objects and keyboard sorting reactions respect motion preferences and saved progress', async ({ page }, info) => {
  test.setTimeout(90_000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/reuse-rally/');
  const intro = page.locator('[data-lv-world-motion="reuse-rally"]');
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src', /reuse-helper\.webp$/);
  await expect(intro.locator('.lv-motion-prop')).toHaveAttribute('src', /reuse-tote\.webp$/);
  await intro.getByRole('button', { name: /Play scene/ }).click();
  expect(await intro.evaluate(node => node.getAnimations({ subtree: true }).map(animation => animation.effect.target.className)))
    .toEqual(expect.arrayContaining(['lv-motion-landscape', 'lv-motion-poses', 'lv-motion-prop']));
  const output = outputFolder(info);
  await intro.screenshot({ path: path.join(output, 'reuse-helper-scene.png') });
  const scene = page.locator('.reuse-picture-scene');
  await expect(scene).toHaveAttribute('data-reuse-result', 'ready');
  await expect(page.locator('.reuse-object-picture')).toHaveAttribute('data-reuse-object', 'Reusable bottle');
  await page.locator('.reuse-picture-scene img, .reuse-destination img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await expect(page.locator('.reuse-destination')).toHaveCount(4);
  await answer(page, 'Compost');
  await expect(scene).toHaveAttribute('data-reuse-result', 'review');
  await expect(scene).toHaveAttribute('data-reuse-destination', '0');
  await expect(page.locator('#feedback')).toContainText('Wash and use it again');
  await expect(page.getByRole('button', { name: 'Compost', exact: true })).toHaveClass(/wrong/);
  await expect(page.getByRole('button', { name: 'Reuse', exact: true })).toHaveClass(/correct/);
  await expect(page.locator('[data-answer]:disabled')).toHaveCount(4);
  expect(await movingFrames(page.locator('.reuse-object-picture'), 'reuse-object-review')).toBe(true);
  await expect(page.getByRole('button', { name: 'Next discovery', exact: true })).toBeFocused();
  await page.locator('.reuse-destinations').screenshot({ path: path.join(output, 'reuse-correct-route-after-mistake.png') });
  await page.getByRole('button', { name: 'Next discovery', exact: true }).click();
  await expect(page.locator('.reuse-object-picture')).toHaveAttribute('data-reuse-art', 'food-can');
  await answer(page, 'Recycle');
  await expect(scene).toHaveAttribute('data-reuse-result', 'correct');
  await expect(scene).toHaveAttribute('data-reuse-destination', '1');
  expect(await movingFrames(page.locator('.reuse-object-picture'), 'reuse-object-settle')).toBe(true);
  expect(await movingFrames(page.locator('.reuse-destination.correct img'), 'reuse-destination-nod')).toBe(true);
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
  await expect(page.locator('.reuse-object-picture')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.reuse-destination.correct img')).toHaveCSS('animation-name', 'none');
  await expect(intro.getByRole('button', { name: /Play scene/ })).toBeHidden();
  await page.getByRole('button', { name: 'Next discovery', exact: true }).click();
  await answer(page, 'Compost');
  await expect(page.locator('.reuse-object-picture')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.reuse-object-picture')).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Next discovery', exact: true }).click();
  await answer(page, 'Trash');
  await expect(page.locator('#feedback')).toContainText('Ask an adult to handle sharp broken pieces');
  await expect(page.locator('.reuse-object-picture')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.reuse-destination.correct img')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Next discovery', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('larriverse.mainCampaign.reuse-rally.v1')))).toEqual({ next: 4, correct: 3 });
  await page.reload();
  await expect(page.locator('#stageLabel')).toContainText('Challenge 5/60');
  await expect(page.locator('.reuse-object-picture')).toHaveAttribute('data-reuse-art', 'storybook');
  await expect(scene).toHaveAttribute('data-reuse-result', 'ready');
  expect(errors).toEqual([]);
});

test('Reuse Rally: destination labels and object questions fit contrast modes and enlarged text', async ({ page }, info) => {
  test.setTimeout(60_000);
  await page.goto('/games/reuse-rally/');
  for (const mode of ['light', 'dark', 'high-contrast']) {
    await page.evaluate(mode => window.LarriVerseArcade.setSettings({ theme: mode === 'high-contrast' ? 'dark' : mode, highContrast: mode === 'high-contrast', reducedMotion: true }), mode);
    for (const name of ['Reuse', 'Recycle', 'Compost', 'Trash']) await expect(page.getByRole('button', { name, exact: true })).toBeEnabled();
    if (mode === 'high-contrast') {
      const colors = await page.locator('.message-copy').evaluate(node => ({ background: getComputedStyle(node).backgroundColor, image: getComputedStyle(node).backgroundImage, text: [...node.querySelectorAll('h2,p')].map(node => getComputedStyle(node).color) }));
      expect(colors.background).toBe('rgb(17, 17, 17)'); expect(colors.image).toBe('none');
      expect(colors.text).toEqual(['rgb(255, 255, 255)', 'rgb(255, 255, 255)']);
    }
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%', 'important'));
  const skip = page.locator('body > .skip-link');
  expect(await skip.evaluate(node => node.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await skip.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#playArea')).toBeFocused();
  expect(await skip.evaluate(node => node.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  const sceneBounds = await page.locator('.reuse-picture-scene').evaluate(node => {
    const frame = node.getBoundingClientRect(), landscape = node.querySelector('.reuse-display-scene').getBoundingClientRect(), object = node.querySelector('.reuse-object-picture').getBoundingClientRect();
    return { frameRight: frame.right, landscapeRight: landscape.right, objectLeft: object.left, objectRight: object.right, objectTop: object.top, objectBottom: object.bottom, landscapeLeft: landscape.left, landscapeTop: landscape.top, landscapeBottom: landscape.bottom, centerDifference: Math.abs((object.left + object.right - frame.left - frame.right) / 2) };
  });
  expect(sceneBounds.landscapeRight).toBeLessThanOrEqual(sceneBounds.frameRight + 1);
  expect(sceneBounds.objectLeft).toBeGreaterThanOrEqual(sceneBounds.landscapeLeft);
  expect(sceneBounds.objectRight).toBeLessThanOrEqual(sceneBounds.frameRight);
  expect(sceneBounds.objectTop).toBeGreaterThanOrEqual(sceneBounds.landscapeTop);
  expect(sceneBounds.objectBottom).toBeLessThanOrEqual(sceneBounds.landscapeBottom);
  expect(sceneBounds.centerDifference).toBeLessThanOrEqual(1);
  const boxes = await page.locator('.reuse-destination').evaluateAll(nodes => nodes.map(node => {
    const r = node.getBoundingClientRect(), picture = node.querySelector('img').getBoundingClientRect(), label = node.querySelector('b').getBoundingClientRect();
    return { left: r.left, right: r.right, width: r.width, height: r.height, pictureBottom: picture.bottom, labelTop: label.top };
  }));
  for (const box of boxes) {
    expect(box.left).toBeGreaterThanOrEqual(0); expect(box.right).toBeLessThanOrEqual(320);
    expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.labelTop).toBeGreaterThanOrEqual(box.pictureBottom);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(4);
  const output = outputFolder(info);
  await page.getByRole('button', { name: 'Recycle', exact: true }).screenshot({ path: path.join(output, 'reuse-large-text-destination.png') });
  await answer(page, 'Trash');
  await expect(page.getByRole('button', { name: 'Reuse', exact: true })).toBeDisabled();
  await expect(page.locator('.reuse-destination.correct')).toHaveCSS('opacity', '1');
  await page.locator('.reuse-message').screenshot({ path: path.join(output, 'reuse-large-text-question.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(4);
});
