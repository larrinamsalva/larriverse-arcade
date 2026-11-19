import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

async function build(page, type, count = 1) {
  for (let i = 0; i < count; i++) {
    await page.locator('[data-build="' + type + '"]').focus();
    await page.keyboard.press('Enter');
  }
}
async function moving(picture) {
  return picture.evaluate(node => new Promise(resolve => {
    const before = getComputedStyle(node).transform;
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(before !== getComputedStyle(node).transform)));
  }));
}
function outputFolder(testInfo) {
  const folder = path.join('artifacts', 'screenshots', testInfo.project.name);
  fs.mkdirSync(folder, { recursive: true });
  return folder;
}

test('Energy Island: moving machinery and house lights match the tested day and stored power', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/energy-island/');
  const intro = page.locator('[data-lv-world-motion="energy-island"]');
  await expect(intro.locator('.lv-motion-poses')).toHaveAttribute('src', /energy-technician\.webp$/);
  await expect(intro.locator('.lv-motion-prop')).toHaveAttribute('src', /energy-solar-panel\.webp$/);
  await intro.getByRole('button', { name: /Play scene/ }).click();
  expect(await intro.evaluate(node => node.getAnimations({ subtree: true }).map(animation => animation.effect.target.className)))
    .toEqual(expect.arrayContaining(['lv-motion-landscape', 'lv-motion-poses', 'lv-motion-prop']));
  const output = outputFolder(testInfo);
  await intro.screenshot({ path: path.join(output, 'energy-technician-scene.png') });
  const scene = page.locator('.energy-illustrated');
  await expect(scene).toHaveAttribute('data-energy-power', 'preview');
  await expect(page.locator('[data-energy-device]')).toHaveCount(0);
  await expect(page.locator('.energy-storage-label')).toHaveText('0 / 0 stored');
  await page.getByRole('button', { name: 'Test my power mix', exact: true }).click();
  await expect(page.locator('#feedback')).toContainText('Choose at least one');
  await build(page, 'solar');
  await expect(page.locator('[data-build="solar"]')).toBeFocused();
  await page.getByRole('button', { name: 'Clear build', exact: true }).click();
  await expect(page.locator('[data-energy-device]')).toHaveCount(0);
  await build(page, 'solar', 2); await build(page, 'wind', 2); await build(page, 'battery');
  for (const [type, count] of Object.entries({ solar: 2, wind: 2, battery: 1 }))
    await expect(page.locator('[data-energy-device="' + type + '"]')).toHaveCount(count);
  await build(page, 'solar');
  await expect(page.locator('#feedback')).toContainText('Not enough builder tokens');
  await expect(page.locator('[data-energy-device="solar"]')).toHaveCount(2);
  await page.locator('.energy-illustrated img, .energy-build-card img, .energy-weather-preview img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  expect(await moving(page.locator('.energy-installed--wind .energy-rotor-picture').first())).toBe(true);
  expect(await moving(page.locator('.energy-installed--wind .energy-tower-picture').first())).toBe(false);
  await page.getByRole('button', { name: 'Test my power mix', exact: true }).click();
  await expect(scene).toHaveAttribute('data-energy-weather', 'sunny');
  await expect(scene).toHaveAttribute('data-energy-power', 'on');
  await expect(page.locator('.forecast-current')).toContainText('Cloudy');
  await expect(page.locator('.energy-result-title')).toHaveText('Day 1 result · Sunny');
  await expect(page.locator('.energy-storage-label')).toHaveText('2 / 4 stored');
  expect(await page.locator('.energy-storage-fill').evaluate(node => node.style.width)).toBe('50%');
  await expect(page.locator('.energy-cottage-picture')).toHaveAttribute('src', /home-on\.webp$/);
  await expect(page.locator('[data-build="solar"]')).toBeDisabled();
  await page.locator('.energy-illustrated').screenshot({ path: path.join(output, 'energy-sunny-powered.png') });
  await page.getByRole('button', { name: 'Run cloudy day', exact: true }).click();
  await expect(scene).toHaveAttribute('data-energy-weather', 'cloudy');
  await page.getByRole('button', { name: 'Run night day', exact: true }).click();
  await expect(scene).toHaveAttribute('data-energy-weather', 'night');
  await expect(scene).toHaveAttribute('data-energy-solar-output', '0');
  await expect(scene).toHaveAttribute('data-energy-power', 'on');
  await expect(page.locator('.energy-storage-label')).toHaveText('0 / 4 stored');
  await expect(page.locator('.energy-installed--solar img').first()).toHaveCSS('animation-name', 'none');
  expect(await moving(page.locator('.energy-installed--wind .energy-rotor-picture').first())).toBe(true);
  await page.locator('.energy-landscape-picture').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await page.locator('.energy-illustrated').screenshot({ path: path.join(output, 'energy-night-powered.png') });
  for (const preference of ['site', 'system']) {
    if (preference === 'site') await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
    else { await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false })); await page.emulateMedia({ reducedMotion: 'reduce' }); }
    await expect(page.locator('.energy-installed--wind .energy-rotor-picture').first()).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.energy-installed--wind .energy-rotor-picture').first()).toHaveCSS('opacity', '1');
    await expect(intro.getByRole('button', { name: /Play scene/ })).toBeHidden();
  }
  await page.getByRole('button', { name: 'Run breezy day', exact: true }).click();
  await expect(page.locator('.ledger tbody tr').filter({ hasText: 'Glowing' })).toHaveCount(4);
  await page.locator('#restartButton').click();
  await build(page, 'solar', 2);
  await page.getByRole('button', { name: 'Test my power mix', exact: true }).click();
  await expect(scene).toHaveAttribute('data-energy-power', 'on');
  await page.getByRole('button', { name: 'Run cloudy day', exact: true }).click();
  await page.getByRole('button', { name: 'Run night day', exact: true }).click();
  await expect(scene).toHaveAttribute('data-energy-power', 'off');
  await expect(page.locator('.energy-cottage-picture')).toHaveAttribute('src', /home-off\.webp$/);
  await expect(page.locator('.energy-result-status')).toHaveText('Needs more power · 0 made · 6 needed');
  await expect(page.locator('.ledger tbody tr').last()).toContainText('Needs more');
  await page.locator('.energy-illustrated').screenshot({ path: path.join(output, 'energy-night-shortfall.png') });
  expect(errors).toEqual([]);
});

test('Energy Island: labeled equipment and energy log reflow with contrast and enlarged text', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/games/energy-island/');
  for (const theme of ['light', 'dark', 'high-contrast']) {
    await page.evaluate(theme => window.LarriVerseArcade.setSettings({ theme: theme === 'high-contrast' ? 'dark' : theme, highContrast: theme === 'high-contrast', reducedMotion: true }), theme);
    await expect(page.locator('[data-build="solar"]')).toHaveAccessibleName(/Solar panel.*2 tokens.*Built 0/);
    if (theme === 'high-contrast') {
      const colors = await page.locator('.energy-result-scene figcaption').evaluate(node => ({ background: getComputedStyle(node).backgroundColor, image: getComputedStyle(node).backgroundImage, text: [...node.querySelectorAll('strong,p')].map(node => getComputedStyle(node).color) }));
      expect(colors.background).toBe('rgb(17, 17, 17)'); expect(colors.image).toBe('none');
      expect(colors.text).toEqual(['rgb(255, 255, 255)', 'rgb(255, 255, 255)']);
    }
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => document.documentElement.style.setProperty('font-size', '200%', 'important'));
  const skip = page.locator('body > .skip-link');
  expect(await skip.evaluate(node => node.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await skip.focus();
  expect(await skip.evaluate(node => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
  await page.keyboard.press('Enter');
  await expect(page.locator('#playArea')).toBeFocused();
  expect(await skip.evaluate(node => node.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  const bounds = await page.locator('.energy-build-card').evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect(), picture = node.querySelector('.item-icon').getBoundingClientRect(), label = node.querySelector('b').getBoundingClientRect();
    return { left: box.left, right: box.right, width: box.width, height: box.height, pictureBottom: picture.bottom, labelTop: label.top };
  }));
  for (const box of bounds) {
    expect(box.left).toBeGreaterThanOrEqual(0); expect(box.right).toBeLessThanOrEqual(320);
    expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.labelTop).toBeGreaterThanOrEqual(box.pictureBottom);
  }
  const output = outputFolder(testInfo);
  await page.locator('[data-build="wind"]').screenshot({ path: path.join(output, 'energy-large-text-build.png') });
  await build(page, 'solar', 6);
  await expect(page.locator('[data-energy-device="solar"]')).toHaveCount(6);
  await page.getByRole('button', { name: 'Test my power mix', exact: true }).click();
  const region = page.getByRole('region', { name: 'Energy log', exact: true });
  expect(await region.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true);
  await region.focus(); await page.keyboard.press('ArrowRight');
  await expect.poll(() => region.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(4);
  await page.locator('.energy-storage-panel').screenshot({ path: path.join(output, 'energy-large-text-storage.png') });
});
