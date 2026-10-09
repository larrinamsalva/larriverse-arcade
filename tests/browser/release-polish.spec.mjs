import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const catalog = JSON.parse(fs.readFileSync('games/catalog.json', 'utf8'));
const utilityRoutes = ['index.html', 'today/index.html', 'goals/index.html', 'passport/index.html', 'report/index.html', 'qa/index.html', 'qa/readiness.html', 'qa/evidence-preflight.html', 'qa/release-room.html', 'qa/release-approval.html'];
const routes = [...utilityRoutes, ...catalog.map(game => game.href)];

async function checkReflow(page, label) {
  const layout = await page.evaluate(() => {
    const visibleControls = [...document.querySelectorAll('button,a,input,select,textarea')].filter(node =>
      !node.closest('[inert],[hidden],.hidden') && !node.matches('.skip-link') && node.getClientRects().length);
    return {
      scroll: document.documentElement.scrollWidth,
      width: document.documentElement.clientWidth,
      outside: visibleControls.filter(node => {
        const box = node.getBoundingClientRect();
        return box.right > innerWidth + 4 || box.left < -4;
      }).map(node => `${node.id || node.className}: ${node.textContent.trim().slice(0, 70)}`)
    };
  });
  expect(layout.scroll, `${label}: horizontal reflow`).toBeLessThanOrEqual(layout.width + 4);
  expect(layout.outside, `${label}: critical controls outside the page`).toEqual([]);
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`all ${routes.length} routes reflow at ${width}px with normal and 200% text`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const errors = [];
      const capture = error => errors.push(error.message);
      page.on('pageerror', capture);
      await page.goto(`/${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true, highContrast: false, largeText: false }));
      await checkReflow(page, `${route} normal`);
      await page.evaluate(() => {
        window.LarriVerseArcade.setSettings({ reducedMotion: true, highContrast: true, largeText: true });
        document.documentElement.style.setProperty('font-size', '32px', 'important');
      });
      await checkReflow(page, `${route} enlarged`);
      expect(errors, route).toEqual([]);
      page.off('pageerror', capture);
    }
  });
}

test('discovery stays local, and search and category filters keep their keyboard focus', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#gameGrid .game-card')).toHaveCount(catalog.length);
  await expect(page.locator('#continueGroup')).toBeHidden();
  await page.evaluate(() => window.LarriVerseArcade.award('scam-sleuth', { xp: 18, kc: 3, score: 70, completed: true }));
  await expect(page.locator('#continueGames')).toContainText('Scam Sleuth');
  await expect(page.locator('#recommendationReason')).toContainText('digital life');
  const before = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  await page.getByRole('button', { name: 'Money', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Money', exact: true })).toBeFocused();
  await expect(page.locator('#gameGrid .game-card')).toHaveCount(catalog.filter(game => game.topic === 'Money').length);
  await page.locator('#search').fill('no-such-cabinet');
  await page.locator('#clearSearch').click();
  await expect(page.locator('#search')).toBeFocused();
  await expect(page.locator('#gameGrid .game-card')).toHaveCount(catalog.length);
  await page.locator('#search').fill('Listening & boundaries');
  await expect(page.locator('#gameGrid .game-card')).toHaveCount(1);
  await expect(page.locator('#gameGrid')).toContainText('Kindness Quest');
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(before);
});

test('reduced motion and system preference stop spotlight rotation without changing the current link', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.goto('/');
  await expect(page.locator('#playableCount')).toHaveText(String(catalog.length));
  const first = await page.locator('#screenTitle').textContent();
  await page.clock.fastForward(13_000);
  await expect(page.locator('#screenTitle')).not.toHaveText(first);
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: true }));
  const stopped = await page.locator('#featuredPlay').getAttribute('href');
  await page.clock.fastForward(40_000);
  expect(await page.locator('#featuredPlay').getAttribute('href')).toBe(stopped);
  await expect(page.locator('#featureRotation')).toBeDisabled();
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const systemStopped = await page.locator('#featuredPlay').getAttribute('href');
  await page.clock.fastForward(40_000);
  expect(await page.locator('#featuredPlay').getAttribute('href')).toBe(systemStopped);
  await page.locator('[data-feature-step="1"]').click();
  expect(await page.locator('#featuredPlay').getAttribute('href')).not.toBe(systemStopped);
});

test('every cabinet offers working shared comfort controls and a clear arcade return', async ({ page }) => {
  test.setTimeout(90_000);
  for (const game of catalog) {
    await page.goto(`/${game.href}`);
    const opener = game.id === 'creature-catcher' ? page.locator('#startOverlay [data-lv-comfort]') : page.locator('[data-lv-comfort]').first();
    await opener.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#lvComfortDialog')).toBeVisible();
    await page.locator('[data-lv-setting="highContrast"]').check();
    await page.locator('[data-lv-setting="largeText"]').check();
    await expect(page.locator('html')).toHaveClass(/larriverse-high-contrast/);
    await expect(page.locator('html')).toHaveClass(/larriverse-large-text/);
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/larriverse-large-text/);
    await expect(page.locator('a[href="../../index.html"]').first()).toHaveAttribute('href', '../../index.html');
  }
});

test('narrow enlarged settings dialog round-trips a downloaded backup and rejects unrelated records', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('another-app.private', 'unrelated-secret');
    window.LarriVerseArcade.setIdentity({ name: 'Backup Tester', avatar: '🧪' });
    window.LarriVerseArcade.award('pocket-planet', { xp: 18, kc: 3, score: 82, completed: true });
    window.LarriVerseArcade.setSettings({ reducedMotion: true, highContrast: true, largeText: true });
    document.documentElement.style.setProperty('font-size', '32px', 'important');
  });
  await page.locator('.nav [data-open-control]').click();
  await expect(page.locator('#controlCenter')).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#exportSaves').click();
  const backup = JSON.parse(fs.readFileSync(await (await downloadEvent).path(), 'utf8'));
  expect(Object.keys(backup.records).every(key => key.startsWith('larriverse.'))).toBeTruthy();
  expect(JSON.stringify(backup)).not.toContain('unrelated-secret');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#clearSaves').click();
  await expect(page.locator('#controlMessage')).toContainText('erased');
  await page.locator('#importSaves').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator('#controlMessage')).toContainText('Restored');
  const restored = await page.evaluate(() => window.LarriVerseArcade.summary());
  expect(restored.name).toBe('Backup Tester');
  expect(restored.games['pocket-planet'].completions).toBe(1);
  const invalid = { ...backup, records: { ...backup.records, 'another-app.private': '{}' } };
  await page.locator('#importSaves').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(invalid)) });
  await expect(page.locator('#controlMessage')).toContainText('invalid record key');
  expect(await page.evaluate(() => localStorage.getItem('another-app.private'))).toBe('unrelated-secret');
  expect(await page.evaluate(() => window.LarriVerseArcade.summary().games['pocket-planet'].completions)).toBe(1);
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('#profileStat')).toContainText('Backup Tester');
});

test('downloaded Passport and Family Report exclude coordinates and private family records', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('larriverse.roadTripGps.v1', JSON.stringify({ coordinates: [1, 2], latitude: 1, longitude: 2 }));
    localStorage.setItem('larriverse.kidscoinFamily.v1', JSON.stringify({ pinDigest: 'private-pin', notes: 'private-family-note' }));
    localStorage.setItem('another-app.private', 'unrelated-secret');
  });
  for (const [route, button] of [['passport/', '#downloadPassport'], ['report/', '#downloadReport']]) {
    await page.goto(`/${route}`);
    await expect(page.locator(button)).toBeEnabled();
    const downloadEvent = page.waitForEvent('download');
    await page.locator(button).click();
    const text = fs.readFileSync(await (await downloadEvent).path(), 'utf8');
    expect(text).not.toMatch(/latitude|longitude|coordinates|pinDigest|private-pin|private-family-note|unrelated-secret/i);
    expect(await page.evaluate(() => localStorage.getItem('another-app.private'))).toBe('unrelated-secret');
  }
});

test('Creature Catcher keeps its keyboard question, completion and replay flow at narrow enlarged text', async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/games/creature-catcher/index.html');
  await expect(page.locator('#startButton')).toBeEnabled();
  await expect(page.locator('#startButton')).toHaveText('Start exploring');
  await expect(page.locator('#startOverlay a[href="../../index.html"]')).toHaveCount(1);
  expect(await page.locator('#startOverlay .learning-path__choices').evaluate(node =>
    getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
  await page.evaluate(() => {
    window.LarriVerseArcade.setSettings({ reducedMotion: true, highContrast: true, largeText: true });
    document.documentElement.style.setProperty('font-size', '32px', 'important');
  });
  const last = page.locator('#startOverlay [data-lv-comfort]');
  await last.focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#startOverlay .learning-path__choices button').first()).toBeFocused();
  await page.locator('#startButton').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#world')).toBeFocused();
  expect(await page.locator('#world').evaluate(node => node.clientHeight)).toBeGreaterThanOrEqual(420);
  await checkReflow(page, 'Creature meadow');
  await page.locator('.creature').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#questionOverlay')).toBeVisible();
  await checkReflow(page, 'Creature question');
  const questions = ['games/learning-question-bank.json', 'games/learning-question-pack-2.json']
    .flatMap(file => Object.values(JSON.parse(fs.readFileSync(file, 'utf8')).subjects).flat());
  const prompt = await page.locator('#questionText').textContent();
  const question = questions.find(item => item.prompt === prompt);
  expect(question, 'the played question belongs to the reviewed bank').toBeTruthy();
  await page.locator('#answers button').nth(question.answer).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#feedback')).not.toBeEmpty();
  await page.locator('#continueButton').focus();
  await page.keyboard.press('Enter');
  await page.clock.runFor(61_000);
  await expect(page.locator('#endOverlay')).toBeVisible();
  await checkReflow(page, 'Creature completion');
  expect(await page.evaluate(() => window.LarriVerseArcade.summary().games['creature-catcher'].completions)).toBe(1);
  await page.locator('#replayButton').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#endOverlay')).toBeHidden();
  await expect(page.locator('.creature').first()).toBeVisible();
});

test('reduced-motion Road Trip keeps same-lane collection, saved inventory and deliberate pause', async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 320, height: 700 });
  // Stable items and lanes make this regression repeatable, without bypassing collection.
  await page.addInitScript(() => { Math.random = () => .5; });
  await page.goto('/games/road-trip-quest/index.html');
  await expect(page.locator('#startButton')).toBeEnabled();
  await page.evaluate(() => {
    window.LarriVerseArcade.setSettings({ reducedMotion: true, highContrast: true, largeText: true });
    document.documentElement.style.setProperty('font-size', '32px', 'important');
  });
  await page.locator('#startButton').click();
  await expect(page.locator('#motionRoadNote')).toBeVisible();
  await page.clock.fastForward(1200);
  const item = page.locator('.road-item.stationary');
  await expect(item).toHaveCount(1);
  expect(await item.evaluate(node => getComputedStyle(node).animationName)).toBe('none');
  await page.locator('#leftButton').click();
  await item.click();
  await expect(page.locator('#itemsHud')).toHaveText('0');
  await page.locator('#rightButton').focus();
  await page.keyboard.press('Enter');
  await item.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#itemsHud')).toHaveText('1');
  await checkReflow(page, 'Road Trip collecting');
  await page.locator('[data-lv-comfort]').click();
  await expect(page.locator('#pauseButton')).toHaveText('Resume');
  await page.keyboard.press('Escape');
  await expect(page.locator('#pauseButton')).toHaveText('Resume');
  await page.reload();
  await page.locator('#startButton').click();
  await expect(page.locator('#itemsHud')).toHaveText('1');
  await page.locator('[data-panel="bagPanel"]').click();
  await expect(page.locator('#panelDialog')).toBeVisible();
  await expect(page.locator('#panelContent .inventory article')).toHaveCount(1);
  await checkReflow(page, 'Road Trip saved bag');
});

test('Bubble Resonance fills the play area, settles shallow bank shots, and keeps keyboard/comfort controls separate', async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    Math.random = () => ((calls++ % 6) + .25) / 6;
  });
  await page.goto('/games/bubble-resonance-phi369/index.html');
  await expect(page.locator('#legend .number-legend span')).toHaveCount(6);
  await expect(page.locator('#legend .power-legend span')).toHaveCount(3);
  await expect(page.locator('#legend .power-legend')).toContainText('Row Wave');
  await expect(page.locator('#legend .power-legend')).toContainText('Star Burst');
  await expect(page.locator('#legend .power-legend')).toContainText('Color Sweep');
  await expect(page.locator('#bubbleStatus')).toContainText('Match the numbers');
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#limit')).toHaveText('CLEAR');
  const bubbleSource = fs.readFileSync('games/bubble-resonance-phi369/game.js', 'utf8');
  expect(bubbleSource).not.toContain('grid[7].fill(null)');
  expect(bubbleSource).toContain('grid[ROWS-1].some(Boolean)');
  expect(bubbleSource).toContain('function bubble(');
  expect(bubbleSource).toContain('ctx.arc(x,y,r*.94');
  expect(bubbleSource).not.toContain('function hex(');
  await expect(page.locator('#level')).toHaveText('1 / 20');
  await expect(page.locator('#levelName')).toHaveText('First Ripple');

  const widthUse = await page.locator('#game').evaluate(node => {
    const canvas = node.getBoundingClientRect();
    const cabinet = node.closest('.cabinet').getBoundingClientRect();
    return canvas.width / cabinet.width;
  });
  expect(widthUse).toBeGreaterThan(.98);

  await page.locator('#game').focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect(page.locator('#game')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#game')).toHaveAttribute('aria-busy', 'false', { timeout: 5000 });
  await expect(page.locator('#limit')).toHaveText('CLEAR');

  const box = await page.locator('#game').boundingBox();
  await page.mouse.click(box.x + box.width * .95, box.y + box.height * .88);
  await expect(page.locator('#game')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#game')).toHaveAttribute('aria-busy', 'false', { timeout: 5000 });

  await page.locator('[data-lv-comfort]').click();
  const status = await page.locator('#bubbleStatus').textContent();
  await page.locator('[data-lv-setting="highContrast"]').focus();
  await page.keyboard.press('Space');
  expect(await page.locator('#bubbleStatus').textContent()).toBe(status);
  await expect(page.locator('#lvComfortDialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-lv-comfort]')).toBeFocused();
});

test('Bubble Resonance shooter and cabinet follow light and dark color modes', async ({ page }) => {
  await page.goto('/games/bubble-resonance-phi369/index.html');

  async function readThemeSample() {
    return page.locator('#game').evaluate(async canvas => {
      await new Promise(requestAnimationFrame);
      const pixel = [...canvas.getContext('2d').getImageData(460, 581, 1, 1).data];
      return {
        mode: canvas.dataset.colorMode,
        launcherPixel: pixel,
        pageBackground: getComputedStyle(document.body).backgroundImage,
        fieldBackground: getComputedStyle(canvas.closest('.playfield')).backgroundImage
      };
    });
  }

  await page.evaluate(() => window.LarriVerseArcade.setSettings({ theme: 'light' }));
  await expect(page.locator('html')).toHaveClass(/larriverse-light/);
  await expect(page.locator('#game')).toHaveAttribute('data-color-mode', 'light');
  const light = await readThemeSample();

  await page.evaluate(() => window.LarriVerseArcade.setSettings({ theme: 'dark' }));
  await expect(page.locator('html')).toHaveClass(/larriverse-dark/);
  await expect(page.locator('#game')).toHaveAttribute('data-color-mode', 'dark');
  const dark = await readThemeSample();

  expect(light.mode).toBe('light');
  expect(dark.mode).toBe('dark');
  expect(light.launcherPixel).not.toEqual(dark.launcherPixel);
  expect(light.pageBackground).not.toBe(dark.pageBackground);
  expect(light.fieldBackground).not.toBe(dark.fieldBackground);
});

test('Bubble Resonance advances through twenty round-bubble levels before declaring a win', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => { Math.random = () => .01; });
  await page.goto('/games/bubble-resonance-phi369/index.html');
  await expect(page.locator('#limit')).toHaveText('CLEAR');

  const game = page.locator('#game');
  const box = await game.boundingBox();
  for(let level=1;level<=20;level++) {
    await expect(page.locator('#level')).toHaveText(`${level} / 20`);
    await game.click({ position: { x: box.width * .5, y: box.height * .35 } });
    await expect(page.locator('#game')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('#game')).toHaveAttribute('aria-busy', 'false', { timeout: 5000 });
    if(level<20) {
      await expect(page.locator('#limit')).toHaveText('NEXT');
      await expect(page.locator('#message')).toContainText(`LEVEL ${level} CLEAR`);
      await expect(page.locator('#reset')).toHaveText(`Continue to level ${level+1}`);
      await page.locator('#reset').click();
    }
  }
  await expect(page.locator('#limit')).toHaveText('WIN');
  await expect(page.locator('#message')).toContainText('ALL 20 LEVELS CLEARED');
  await expect(page.locator('#message')).toContainText('round bubble');
  await expect(page.locator('#reset')).toHaveText('Play all 20 again');
  await expect(page.locator('#game')).toHaveAttribute('aria-busy', 'false');

  const result = await page.evaluate(() => window.LarriVerseArcade.summary().games['bubble-resonance-phi369']);
  expect(result.completions).toBe(1);
});

test('Bubble Resonance adds and animates a fresh top row after five misses', async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    Math.random = () => (++calls <= 96 ? .01 : .5);
  });
  await page.goto('/games/bubble-resonance-phi369/index.html');
  await expect(page.locator('#dropIn')).toHaveText('5');
  await expect(page.locator('#limit')).toHaveText('CLEAR');

  const game = page.locator('#game');
  const box = await game.boundingBox();
  for (const fraction of [.1, .3, .5, .7, .9]) {
    await game.click({ position: { x: box.width * fraction, y: box.height * .35 } });
    await expect(page.locator('#game')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('#game')).toHaveAttribute('aria-busy', 'false', { timeout: 5000 });
  }

  await expect(page.locator('#dropIn')).toHaveText('5');
  await expect(page.locator('#message')).toContainText('CEILING DROP');
  await expect(page.locator('#bubbleStatus')).toContainText('Row Wave power');
  await expect(page.locator('#limit')).toHaveText('CLEAR');

  const bubbleSource = fs.readFileSync('games/bubble-resonance-phi369/game.js', 'utf8');
  expect(bubbleSource).toContain('Fresh bubbles are moving the field down one row');
  expect(bubbleSource).toContain('dropOffset=-HEX');
  expect(bubbleSource).toContain('for(let c=0;c<COLS;c++)shifted[0][c]');
});

test('Bubble Resonance power bubbles activate a visible field-clearing effect', async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    Math.random = () => (++calls <= 96 ? .01 : .5);
  });
  await page.goto('/games/bubble-resonance-phi369/index.html');
  const game = page.locator('#game');
  const box = await game.boundingBox();
  for (const fraction of [.1, .3, .5, .7, .9]) {
    await game.click({ position: { x: box.width * fraction, y: box.height * .35 } });
    await expect(game).toHaveAttribute('aria-busy', 'true');
    await expect(game).toHaveAttribute('aria-busy', 'false', { timeout: 5000 });
  }
  await expect(page.locator('#bubbleStatus')).toContainText('Row Wave power');
  await game.click({ position: { x: box.width * .5, y: box.height * .35 } });
  await expect(game).toHaveAttribute('aria-busy', 'true');
  await expect(game).toHaveAttribute('aria-busy', 'false', { timeout: 5000 });
  await expect(page.locator('#message')).toContainText('ROW WAVE');
  await expect(page.locator('#score')).not.toHaveText('0');
});

test('Chill Brain cabinet and shared comfort choices stay in sync without enabling sound', async ({ page }) => {
  await page.goto('/games/chill-brain-rewards/index.html');
  await page.locator('#settingsButton').click();
  await expect(page.locator('#soundToggle')).not.toBeChecked();
  await page.locator('#contrastToggle').check();
  await page.locator('#textToggle').check();
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveClass(/larriverse-high-contrast/);
  await page.locator('[data-lv-comfort]').click();
  await expect(page.locator('[data-lv-setting="highContrast"]')).toBeChecked();
  await expect(page.locator('[data-lv-setting="largeText"]')).toBeChecked();
  await page.locator('[data-lv-setting="highContrast"]').uncheck();
  await page.keyboard.press('Escape');
  await page.locator('#settingsButton').click();
  await expect(page.locator('#contrastToggle')).not.toBeChecked();
  await expect(page.locator('#textToggle')).toBeChecked();
  await expect(page.locator('#soundToggle')).not.toBeChecked();
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/larriverse-large-text/);
  await expect(page.locator('html')).not.toHaveClass(/larriverse-high-contrast/);
});

test('Chill Brain light cards keep text dark and locked badge labels readable', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('larriverse.arcade.settings.v1', JSON.stringify({
      theme: 'light',
      reducedMotion: true,
      highContrast: false,
      largeText: false
    }));
    localStorage.setItem('larriverse.chillBrain.v1', JSON.stringify({
      onboardingComplete: true,
      guide: { name: 'Little Sprout', age: '', avatar: '🦋', profile: 'little' },
      sessions: 0,
      completedMissionIds: [],
      totalSeconds: 0,
      breathCycles: 0,
      soundSessions: 0,
      skills: {},
      badges: [],
      practiceDates: [],
      lastMissionId: null
    }));
  });
  await page.goto('/games/chill-brain-rewards/index.html');
  await expect(page.locator('.mission-card')).toHaveCount(4);

  const results = await page.evaluate(() => {
    const channels = color => (color.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = color => {
      const [red, green, blue] = channels(color).map(channel => {
        const value = channel / 255;
        return value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
      });
      return .2126 * red + .7152 * green + .0722 * blue;
    };
    const contrast = (foreground, background) => {
      const first = luminance(foreground);
      const second = luminance(background);
      return (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
    };
    const pairs = [
      ['profile detail', '.profile-row small', '.profile-row > div'],
      ['mission description', '.mission-card p', '.mission-card'],
      ['mission metadata', '.mission-meta span', '.mission-meta span'],
      ['skill label', '.skill-card b', '.skill-card'],
      ['locked badge label', '.badge.locked b', '.badge.locked'],
      ['privacy note', '.notice-card p', '.notice-card'],
      ['settings detail', '.toggle-row small', '.dialog-card']
    ];
    return {
      contrast: pairs.map(([label, textSelector, surfaceSelector]) => {
        const textStyle = getComputedStyle(document.querySelector(textSelector));
        const surfaceStyle = getComputedStyle(document.querySelector(surfaceSelector));
        return { label, ratio: contrast(textStyle.color, surfaceStyle.backgroundColor) };
      }),
      lockedOpacity: getComputedStyle(document.querySelector('.badge.locked')).opacity,
      lockedFilter: getComputedStyle(document.querySelector('.badge.locked')).filter,
      lockedIconOpacity: getComputedStyle(document.querySelector('.badge.locked span')).opacity
    };
  });

  for (const result of results.contrast) {
    expect(result.ratio, `${result.label} contrast`).toBeGreaterThanOrEqual(7);
  }
  expect(results.lockedOpacity).toBe('1');
  expect(results.lockedFilter).toBe('none');
  expect(Number(results.lockedIconOpacity)).toBeLessThan(1);
});

test('high contrast gives progress navigation a dark surface and keeps printed reports readable', async ({ page }) => {
  for (const route of ['today/', 'goals/', 'passport/', 'report/']) {
    await page.emulateMedia({ media: 'screen' });
    await page.goto(`/${route}`);
    await page.evaluate(() => window.LarriVerseArcade.setSettings({ highContrast: true }));
    const header = page.locator('body > header');
    expect(await header.evaluate(node => getComputedStyle(node).backgroundColor)).toBe('rgb(17, 17, 17)');
    expect(await header.locator('a').first().evaluate(node => getComputedStyle(node).color)).toBe('rgb(255, 255, 255)');
    await page.emulateMedia({ media: 'print' });
    await expect(header).toBeHidden();
    await expect(page.locator('main h1')).toBeVisible();
    expect(await page.locator('main h1').evaluate(node => getComputedStyle(node).color)).toBe('rgb(17, 17, 17)');
  }
});

test('keyboard cabinet links scroll clear of the mobile shortcut dock', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await expect(page.locator('#gameGrid .game-card')).toHaveCount(catalog.length);
  for (const target of [page.locator('#newGames .discovery-card').last(), page.locator('#gameGrid .launch').last()]) {
    await target.focus();
    await expect(target).toBeFocused();
    const control = await target.boundingBox();
    const dock = await page.locator('.mobile-dock').boundingBox();
    expect(control.y).toBeGreaterThanOrEqual(0);
    expect(control.y + control.height).toBeLessThanOrEqual(dock.y);
  }
});

test('progress views keep shared comfort controls visible on narrow screens with enlarged text', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const route of ['today/', 'goals/', 'passport/', 'report/']) {
    await page.goto(`/${route}`);
    await page.evaluate(() => {
      window.LarriVerseArcade.setSettings({ largeText: true, highContrast: true, reducedMotion: true });
      document.documentElement.style.setProperty('font-size', '32px', 'important');
    });
    const opener = page.locator('[data-lv-comfort]');
    await expect(opener).toBeVisible();
    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#lvComfortDialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
    await checkReflow(page, `${route} comfort access`);
  }
});

test('dimensional object models replace flat road-trip scenery and preserve sign identity', async ({ page }) => {
  await page.goto('/games/road-trip-quest/index.html');
  await expect(page.locator('#startButton')).toBeEnabled();
  await expect(page.locator('.road-demo .demo-object-art')).toHaveCount(3);
  await expect(page.locator('#car .player-car-art .object-model--car')).toHaveCount(1);
  await expect(page.locator('#car .player-car-art .object-depth--car')).toHaveCount(1);
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ reducedMotion: false }));
  await page.locator('#startButton').click();
  await expect(page.locator('#skyline .scenery-art').first()).toBeAttached({ timeout: 2_500 });

  await page.goto('/games/traffic-town/index.html');
  const sign = page.locator('.traffic-sign-art').first();
  await expect(sign).toBeVisible();
  await expect(sign.locator('.sign-depth')).toHaveCount(1);
  await expect(sign.locator('.sign-sheen')).toHaveCount(1);
  await expect(sign.locator('.sign-reflection')).toHaveCount(1);
  await expect(sign.locator('.sign-fastener')).toHaveCount(1);
  await expect(sign.locator('.sign-ground-shadow')).toHaveCount(1);

  await page.goto('/games/road-trip-quest-gps/index.html');
  await page.waitForFunction(() => window.RoadTripGpsContent);
  await expect(page.locator('#boundaryVehicle .boundary-car-art .object-model--car')).toHaveCount(1);
  await page.locator('#demoButton').click();
  await expect(page.locator('#player .gps-car-art .object-model--car')).toHaveCount(1);
  await expect(page.locator('.poi .poi-art').first()).toBeVisible();
  expect(await page.locator('.poi .poi-art').count()).toBeGreaterThan(5);
});
