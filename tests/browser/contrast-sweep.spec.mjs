import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const games = JSON.parse(fs.readFileSync('games/catalog.json', 'utf8'));

test('every cabinet keeps painted text surfaces readable in day and night modes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Color contrast is viewport independent.');
  test.setTimeout(180_000);
  const failures = [];

  for (const game of games) {
    await page.goto(`/${game.href}`, { waitUntil: 'domcontentloaded' });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(selectedTheme => {
        window.LarriVerseArcade.setSettings({
          theme: selectedTheme,
          highContrast: false,
          largeText: false,
          reducedMotion: true,
        });
      }, theme);
      await expect(page.locator('html')).toHaveClass(new RegExp(`larriverse-${theme}`));

      const findings = await page.evaluate(() => {
        const parse = value => {
          const numbers = value?.match(/[\d.]+/g)?.map(Number) || [];
          if (numbers.length < 3) return null;
          return { channels: numbers.slice(0, 3), alpha: numbers[3] ?? 1 };
        };
        const luminance = channels => channels.map(channel => {
          const value = channel / 255;
          return value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
        }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
        const contrast = (foreground, background) => {
          const first = luminance(foreground), second = luminance(background);
          return (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
        };
        const paintedSurface = node => {
          for (let current = node; current; current = current.parentElement) {
            const style = getComputedStyle(current);
            const color = parse(style.backgroundColor);
            if (style.backgroundImage !== 'none' || (color && color.alpha > .05)) return { node: current, style };
          }
          return null;
        };
        const label = node => {
          const id = node.id ? `#${node.id}` : '';
          const classes = [...node.classList].slice(0, 2).map(name => `.${name}`).join('');
          return `${node.tagName.toLowerCase()}${id}${classes}`;
        };
        const checked = new Set();
        const results = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const text = walker.currentNode.textContent.replace(/\s+/g, ' ').trim();
          const node = walker.currentNode.parentElement;
          if (!node || !/[a-z0-9]{2}/i.test(text) || node.closest('svg,[hidden],[aria-hidden="true"],.skip-link')) continue;
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < .5 || rect.width < 2 || rect.height < 2) continue;
          const surface = paintedSurface(node);
          if (!surface) continue;
          const key = `${label(node)}|${label(surface.node)}|${text}`;
          if (checked.has(key)) continue;
          checked.add(key);
          const foreground = parse(style.color);
          if (!foreground) continue;
          const layers = [];
          let depth = 0, start = 0;
          for (let index = 0; index < surface.style.backgroundImage.length; index += 1) {
            const character = surface.style.backgroundImage[index];
            if (character === '(') depth += 1;
            if (character === ')') depth -= 1;
            if (character === ',' && depth === 0) {
              layers.push(surface.style.backgroundImage.slice(start, index));
              start = index + 1;
            }
          }
          layers.push(surface.style.backgroundImage.slice(start));
          const baseLayer = [...layers].reverse().find(layer => /gradient\(/.test(layer)) || '';
          const stops = [...baseLayer.matchAll(/rgba?\([^)]+\)/g)]
            .map(match => parse(match[0]))
            .filter(color => color && color.alpha >= .8);
          const solid = parse(surface.style.backgroundColor);
          const backgrounds = stops.length ? stops : (solid && solid.alpha >= .8 ? [solid] : []);
          if (!backgrounds.length) continue;
          const ratio = Math.min(...backgrounds.map(background => contrast(foreground.channels, background.channels)));
          const fontSize = Number.parseFloat(style.fontSize);
          const weight = Number.parseInt(style.fontWeight, 10) || (style.fontWeight === 'bold' ? 700 : 400);
          const threshold = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700) ? 3 : 4.5;
          if (ratio + .01 < threshold) results.push({
            text: text.slice(0, 55),
            textNode: label(node),
            surface: label(surface.node),
            ratio: Number(ratio.toFixed(2)),
            threshold,
          });
        }
        return results;
      });
      failures.push(...findings.map(finding => ({ game: game.id, theme, ...finding })));
    }
  }

  const grouped = [...failures.reduce((groups, failure) => {
    const key = [failure.theme, failure.textNode, failure.surface, failure.ratio, failure.threshold].join('|');
    const current = groups.get(key) || { ...failure, games: [] };
    current.games.push(failure.game);
    groups.set(key, current);
    return groups;
  }, new Map()).values()].map(({ game, ...finding }) => finding);
  await testInfo.attach('contrast-findings.json', {
    body: Buffer.from(JSON.stringify(grouped, null, 2)),
    contentType: 'application/json',
  });
  expect(grouped, JSON.stringify(grouped, null, 2)).toEqual([]);
});
