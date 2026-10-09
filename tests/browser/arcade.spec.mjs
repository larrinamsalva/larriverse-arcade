import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const release = JSON.parse(fs.readFileSync(path.join(root, 'release.json'), 'utf8'));
const screenshotRoot = path.join(root, 'artifacts', 'screenshots');
const forbiddenRequest = /(openstreetmap|overpass|cartodb|google-analytics|doubleclick|sentry|api\.mapbox|locationiq)/i;

function watchPage(page) {
  const errors = [];
  const forbidden = [];

  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/Failed to load resource|favicon\.ico/i.test(text)) return;
    errors.push(`console: ${text}`);
  });
  page.on('request', request => {
    const url = request.url();
    if (forbiddenRequest.test(url)) forbidden.push(url);
  });

  return { errors, forbidden };
}

async function prepareCleanDevice(page, context) {
  await context.clearPermissions();
  await page.addInitScript(() => {
    if (sessionStorage.getItem('larriverse.browserQaPrepared') === 'true') return;
    sessionStorage.setItem('larriverse.browserQaPrepared', 'true');
    localStorage.clear();
    localStorage.setItem('larriverse.arcade.settings.v1', JSON.stringify({
      reducedMotion: true,
      highContrast: false,
      largeText: false,
      theme: 'system',
      bloomHidden: false
    }));
  });
}

async function visibleInteractiveCount(page) {
  return page.locator('a,button,input,select,textarea,[tabindex]').evaluateAll(nodes => nodes.filter(node => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
  }).length);
}

async function assertNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(dimensions.scrollWidth, `horizontal overflow: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(dimensions.clientWidth + 4);
}

async function takeCleanScreenshot(page, projectName, name) {
  const folder = path.join(screenshotRoot, projectName);
  fs.mkdirSync(folder, { recursive: true });
  if (name === 'creature-catcher' || name === 'road-trip-quest') {
    await expect(page.locator('#startButton')).toBeEnabled();
    await expect(page.locator('#startButton')).not.toContainText(/loading/i);
  }
  await page.evaluate(() => document.fonts.ready);
  // Keyboard focus was checked above. Capture a stable opening view without a
  // focused skip link obscuring the header or a previous focus scroll offset.
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
    document.querySelectorAll('.overlay .card').forEach(card => { card.scrollTop = 0; });
  });
  await page.screenshot({
    path: path.join(folder, `${name}.png`),
    animations: 'disabled',
    caret: 'hide',
    fullPage: false
  });
}

test.describe('LarriVerse browser release gate', () => {
  test('lobby loads, applies shared settings, and round-trips a backup', async ({ page, context }, testInfo) => {
    await prepareCleanDevice(page, context);
    const observed = watchPage(page);
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('#playableCount')).toHaveText(String(release.cabinetCount));
    await expect(page.locator('.game-card')).toHaveCount(release.cabinetCount);
    await expect.poll(() => page.evaluate(() => window.LarriVerseArcade?.version)).toBe(3);

    const restored = await page.evaluate(() => {
      window.LarriVerseArcade.setIdentity({ name: 'QA Player', avatar: '🧪' });
      window.LarriVerseArcade.setSettings({ reducedMotion: true, highContrast: true, largeText: true });
      window.LarriVerseArcade.award('browser-qa', { xp: 36, kc: 3, score: 90, completed: true });
      const backup = window.LarriVerseArcade.exportData();
      window.LarriVerseArcade.clearData({ keepSettings: false });
      window.LarriVerseArcade.importData(backup);
      return {
        profile: window.LarriVerseArcade.summary(),
        settings: window.LarriVerseArcade.settings(),
        keys: window.LarriVerseArcade.dataKeys()
      };
    });

    expect(restored.profile.name).toBe('QA Player');
    expect(restored.profile.games['browser-qa'].highScore).toBe(90);
    expect(restored.settings).toEqual({
      reducedMotion: true,
      highContrast: true,
      largeText: true,
      theme: 'system',
      bloomHidden: false
    });
    expect(restored.keys.every(key => key.startsWith('larriverse.'))).toBeTruthy();
    await expect(page.locator('html')).toHaveClass(/larriverse-reduced-motion/);
    await expect(page.locator('html')).toHaveClass(/larriverse-high-contrast/);
    await expect(page.locator('html')).toHaveClass(/larriverse-large-text/);

    await page.evaluate(() => {
      window.LarriVerseArcade.clearData({ keepSettings: false });
      window.LarriVerseArcade.setSettings({ reducedMotion: true, highContrast: false, largeText: false });
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#playableCount')).toHaveText(String(release.cabinetCount));
    await assertNoHorizontalOverflow(page);
    await takeCleanScreenshot(page, testInfo.project.name, 'lobby');

    expect(observed.forbidden).toEqual([]);
    expect(observed.errors).toEqual([]);
  });

  test('day, night, device theme, and Bloom controls persist without blocking play', async ({ page, context }) => {
    await prepareCleanDevice(page, context);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.bloom-guide[data-bloom-for="arcade-home"]')).toBeVisible();
    await page.locator('[data-open-control]:visible').first().click();
    await expect(page.locator('#controlCenter')).toBeVisible();
    await page.locator('#themePreference').selectOption('dark');
    await expect(page.locator('html')).toHaveClass(/larriverse-dark/);
    await expect(page.locator('html')).toHaveAttribute('data-larriverse-theme-preference', 'dark');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/larriverse-dark/);

    await page.locator('[data-open-control]:visible').first().click();
    await page.locator('#themePreference').selectOption('system');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveClass(/larriverse-dark/);
    await expect(page.locator('html')).toHaveAttribute('data-larriverse-theme-preference', 'system');

    await page.goto('/games/bridge-buddies/index.html', { waitUntil: 'domcontentloaded' });
    const guide = page.locator('.bloom-guide[data-bloom-for="bridge-buddies"]');
    await expect(guide).toBeVisible();
    await expect(guide.locator('.bloom-message')).toContainText(/planks, beams, and triangle braces/i);
    await guide.locator('.bloom-hint').click();
    await expect(guide).toHaveAttribute('data-pose', 'thinking');
    await guide.locator('.bloom-hide').click();
    await expect(guide).toBeHidden();
    await expect(page.locator('[data-bloom-peek="bridge-buddies"]')).toBeVisible();
    await page.locator('[data-bloom-peek="bridge-buddies"]').click();
    await expect(guide).toBeVisible();
    await expect(page.locator('[data-lv-theme-cycle]')).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  for (const cabinet of release.cabinets) {
    test(`${cabinet.title} opens cleanly`, async ({ page, context }, testInfo) => {
      await prepareCleanDevice(page, context);
      const observed = watchPage(page);
      const response = await page.goto(`/${cabinet.route}`, { waitUntil: 'domcontentloaded' });

      expect(response?.ok()).toBeTruthy();
      await expect(page.locator('body')).toBeVisible();
      await expect.poll(() => page.title()).not.toBe('');
      await expect.poll(() => page.evaluate(() => window.LarriVerseArcade?.version)).toBe(3);
      await expect.poll(() => visibleInteractiveCount(page)).toBeGreaterThan(0);

      const hasLobbyRoute = await page.locator('a').evaluateAll(links => links.some(link => {
        const href = link.getAttribute('href') || '';
        return /(?:\.\.\/)+index\.html(?:#.*)?$/.test(href) || href === '/';
      }));
      expect(hasLobbyRoute, `${cabinet.id} needs a route back to the lobby`).toBeTruthy();

      await page.evaluate(() => window.LarriVerseArcade.setSettings({
        reducedMotion: true,
        highContrast: true,
        largeText: true
      }));
      await expect(page.locator('html')).toHaveClass(/larriverse-reduced-motion/);
      await expect(page.locator('html')).toHaveClass(/larriverse-high-contrast/);
      await expect(page.locator('html')).toHaveClass(/larriverse-large-text/);

      await page.keyboard.press('Tab');
      const activeElement = await page.evaluate(() => {
        const node = document.activeElement;
        return { tag: node?.tagName || '', tabindex: node?.getAttribute?.('tabindex') || '' };
      });
      expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(activeElement.tag) || activeElement.tabindex !== '').toBeTruthy();

      await page.evaluate(() => window.LarriVerseArcade.setSettings({ highContrast: false, largeText: false }));
      await page.waitForTimeout(350);
      await assertNoHorizontalOverflow(page);

      if (cabinet.id === 'road-trip-quest-gps') {
        const storageDump = await page.evaluate(() => JSON.stringify(Object.fromEntries(
          Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])
        )));
        expect(storageDump).not.toMatch(/"(?:latitude|longitude|coords)"\s*:/i);
        const permission = await page.evaluate(async () => navigator.permissions?.query
          ? (await navigator.permissions.query({ name: 'geolocation' })).state
          : 'unsupported');
        expect(permission).not.toBe('granted');
      }

      await takeCleanScreenshot(page, testInfo.project.name, cabinet.id);
      expect(observed.forbidden).toEqual([]);
      expect(observed.errors).toEqual([]);
    });
  }
});
