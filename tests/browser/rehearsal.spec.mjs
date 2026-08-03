import { test, expect } from '@playwright/test';

async function assertNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 4);
}

function watchPage(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !/favicon\.ico|Failed to load resource/i.test(message.text())) errors.push(message.text());
  });
  return errors;
}

test.describe('LarriVerse deployment and evidence rehearsal', () => {
  test('readiness verifies the generated static deployment', async ({ page }) => {
    const errors = watchPage(page);
    const response = await page.goto('/qa/readiness.html', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('#score')).toHaveText('5/5');
    await expect(page.locator('#summaryTitle')).toHaveText('Deployment is ready for human rehearsal');
    await expect(page.locator('#routeState')).toHaveText('8/8');
    await expect(page.locator('#privateState')).toHaveText('Hidden');
    await assertNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('evidence preflight stays blocked without three human files', async ({ page }) => {
    const errors = watchPage(page);
    const response = await page.goto('/qa/evidence-preflight.html', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('#export')).toBeDisabled();
    await expect(page.locator('#approvalLink')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#status')).toContainText('blocked');
    await expect(page.locator('body')).toContainText('No uploads. No repository writes. No release decision.');
    await assertNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });
});
