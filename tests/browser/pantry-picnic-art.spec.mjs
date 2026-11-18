import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

async function pack(page, id) {
  await page.locator('[data-food="' + id + '"]').focus();
  await page.keyboard.press('Enter');
}
function screenshotFolder(testInfo) {
  const folder = path.join('artifacts', 'screenshots', testInfo.project.name);
  fs.mkdirSync(folder, { recursive: true });
  return folder;
}

test('Pantry Picnic: illustrated food packs, unpacks and honors both motion preferences', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/pantry-picnic/');
  const intro = page.locator('[data-lv-world-motion="pantry-picnic"]');
  await expect(intro.locator('.lv-motion-landscape')).toHaveAttribute('src', /picnic-welcome\.webp$/);
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src', /picnic-helper\.webp$/);
  await expect(intro.locator('.lv-motion-prop')).toHaveAttribute('src', /picnic-basket\.webp$/);
  await intro.getByRole('button', { name: /Play scene/ }).click();
  const layers = await intro.evaluate(node => node.getAnimations({ subtree: true }).map(animation => animation.effect.target.className));
  expect(layers).toEqual(expect.arrayContaining(['lv-motion-landscape', 'lv-motion-poses', 'lv-motion-prop']));
  await page.locator('.pantry-landscape img, .pantry-food-card img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  const folder = screenshotFolder(testInfo);
  await intro.screenshot({ path: path.join(folder, 'picnic-helper-scene.png') });
  await expect(page.locator('.picnic-basket')).toHaveCSS('background-image', /wicker\.webp/);
  await page.getByRole('button', { name: 'Check this picnic', exact: true }).click();
  await expect(page.locator('#feedback')).toContainText('exactly three portions');

  await pack(page, 'bread');
  const packed = page.locator('.picnic-slot.is-packing .pantry-food-picture');
  await expect(packed).toHaveAttribute('data-pantry-food', 'bread');
  const moved = await packed.evaluate(node => new Promise(resolve => {
    const first = getComputedStyle(node).transform;
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(first !== getComputedStyle(node).transform)));
  }));
  expect(moved).toBe(true);
  await expect(page.locator('[data-food="bread"]')).toBeDisabled();
  await expect(page.locator('[data-food="bread"]')).toContainText('0 available');
  await expect(page.locator('[data-food="bread"]')).toHaveCSS('opacity', '1');
  const remove = page.getByRole('button', { name: 'Remove Bread sandwich from the picnic box', exact: true });
  await remove.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.picnic-slot.filled')).toHaveCount(0);
  await expect(page.locator('[data-food="bread"]')).toBeEnabled();
  await expect(page.locator('[data-food="bread"]')).toContainText('1 available');

  for (const id of ['apple', 'apple', 'cucumber']) await pack(page, id);
  await pack(page, 'bread');
  await expect(page.locator('#feedback')).toContainText('holds three portions');
  await expect(page.locator('.picnic-slot.filled')).toHaveCount(3);
  await page.getByRole('button', { name: 'Check this picnic', exact: true }).click();
  await expect(page.locator('#feedback')).toHaveClass(/try/);
  await page.getByRole('button', { name: 'Clear my box', exact: true }).click();

  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
  await pack(page, 'bread');
  await expect(page.locator('.is-packing .pantry-food-picture')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.is-packing .pantry-food-picture')).toHaveCSS('opacity', '1');
  await expect(page.locator('.pantry-landscape > img')).toHaveCSS('animation-name', 'none');
  await expect(intro.getByRole('button', { name: /Play scene/ })).toBeHidden();
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await pack(page, 'carrot');
  await expect(page.locator('.is-packing .pantry-food-picture')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.is-packing .pantry-food-picture')).toHaveCSS('opacity', '1');
  await pack(page, 'apple');
  await page.getByRole('button', { name: 'Check this picnic', exact: true }).click();
  await expect(page.locator('#feedback')).toHaveClass(/good/);
  await expect(page.getByRole('button', { name: 'Next picnic', exact: true })).toBeEnabled();
  await expect(page.locator('.picnic-slot.filled .pantry-food-picture')).toHaveCount(3);
  const checkpoint = await page.evaluate(() => JSON.parse(localStorage.getItem('larriverse.pantryPicnic.sixty.v1')));
  expect(checkpoint.next).toBe(1);
  await page.locator('.picnic-basket').screenshot({ path: path.join(folder, 'picnic-packed-box.png') });
  expect(errors).toEqual([]);
});

test('Pantry Picnic: food names and use-first labels fit contrast modes and enlarged text', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/games/pantry-picnic/');
  await page.locator('.pantry-food-card img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  for (const mode of ['larriverse-dark', 'larriverse-high-contrast']) {
    await page.evaluate(className => {
      document.documentElement.classList.remove('larriverse-dark', 'larriverse-high-contrast');
      document.documentElement.classList.add(className);
    }, mode);
    await expect(page.locator('[data-food="bread"]')).toHaveAccessibleName(/Bread sandwich.*1 available.*Use first/);
    await expect(page.locator('.small-note')).toContainText('Ask an adult about allergies, real food preparation, and safe storage.');
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%', 'important'));
  await pack(page, 'bread');
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    controls: [...document.querySelectorAll('.pantry-food-card, .picnic-slot.filled')].map(node => {
      const r = node.getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width, height: r.height };
    }),
    shelf: [...document.querySelectorAll('.pantry-food-card')].map(node => ({ imageBottom: node.querySelector('img').getBoundingClientRect().bottom, nameTop: node.querySelector('b').getBoundingClientRect().top })),
    packed: [...document.querySelectorAll('.picnic-slot.filled')].map(node => {
      const control=node.getBoundingClientRect(), image=node.querySelector('img').getBoundingClientRect(), name=node.querySelector('b').getBoundingClientRect(), hint=node.querySelector('small').getBoundingClientRect();
      return { imageRight:image.right, nameLeft:name.left, top:control.top, bottom:control.bottom, nameTop:name.top, hintBottom:hint.bottom };
    })
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 4);
  for (const control of dimensions.controls) {
    expect(control.left).toBeGreaterThanOrEqual(0);
    expect(control.right).toBeLessThanOrEqual(dimensions.width);
    expect(control.width).toBeGreaterThanOrEqual(44);
    expect(control.height).toBeGreaterThanOrEqual(44);
  }
  for (const food of dimensions.shelf) expect(food.nameTop).toBeGreaterThanOrEqual(food.imageBottom);
  for (const food of dimensions.packed) {
    expect(food.nameLeft).toBeGreaterThanOrEqual(food.imageRight);
    expect(food.nameTop).toBeGreaterThanOrEqual(food.top);
    expect(food.hintBottom).toBeLessThanOrEqual(food.bottom);
  }
  const folder = screenshotFolder(testInfo);
  await page.locator('.picnic-basket').screenshot({ path: path.join(folder, 'picnic-large-text-box.png') });
  await page.locator('.pantry-food-card').first().screenshot({ path: path.join(folder, 'picnic-large-text-food.png') });
});
