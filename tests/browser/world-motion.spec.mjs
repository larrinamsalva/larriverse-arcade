import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { WORLD_MOTION_SCENES } from '../../assets/world-motion-scenes.js';

const catalog = JSON.parse(fs.readFileSync(new URL('../../games/catalog.json', import.meta.url), 'utf8'));
const completedArt = new Set(['dino-discovery-world', 'helping-hands']);

test('Remaining worlds load their local scene layers with reduced motion enabled', async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const ids = catalog.map(game => game.id).filter(id => !completedArt.has(id));
  expect(Object.keys(WORLD_MOTION_SCENES).sort()).toEqual([...ids].sort());
  for (const id of ids) {
    await test.step(id, async () => {
      await page.goto(`/games/${id}/index.html`);
      await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
      const frame = page.locator(`[data-lv-world-motion="${id}"]`);
      await expect(frame).toBeAttached();
      const layers = await frame.locator('img').evaluateAll(images => images.map(image => ({
        local: new URL(image.src).origin === location.origin,
        loaded: image.complete && image.naturalWidth > 0
      })));
      expect(layers).toEqual(Array(3).fill({ local: true, loaded: true }));
      await expect(frame.getByRole('button', { name: /Play scene/ })).toBeHidden();
      expect(await frame.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
      const bounds = await frame.evaluate(node => {
        const { left, right, width } = node.getBoundingClientRect();
        return width === 0 || (left >= -1 && right <= document.documentElement.clientWidth + 1);
      });
      expect(bounds).toBe(true);
    });
  }
});

test('Repair Café animates the background, character pose and wrench after a correct repair step', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/games/repair-cafe/index.html');
  const frame = page.locator('[data-lv-world-motion="repair-cafe"]');
  await frame.scrollIntoViewIfNeeded();
  const button = frame.getByRole('button', { name: /Play scene/ });
  await button.focus();
  await page.keyboard.press('Enter');
  const layers = await frame.evaluate(node => node.getAnimations({ subtree: true })
    .map(animation => animation.effect.target.className));
  expect(layers).toEqual(expect.arrayContaining([
    'lv-motion-landscape', 'lv-motion-character', 'lv-motion-poses', 'lv-motion-prop'
  ]));
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
  await expect(button).toBeHidden();
  await expect.poll(() => frame.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await frame.evaluate(node => node.scrollIntoView({ block: 'end' }));
  await page.locator('[data-repair="0"]').click();
  await expect(page.locator('#feedback')).toHaveClass(/good/);
  await frame.scrollIntoViewIfNeeded();
  await expect.poll(() => frame.evaluate(node => node.getAnimations({ subtree: true })
    .some(animation => animation.effect.target.className === 'lv-motion-prop'))).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(button).toBeHidden();
  await expect.poll(() => frame.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
});
