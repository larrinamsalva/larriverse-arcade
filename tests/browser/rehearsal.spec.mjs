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
    await expect(page.locator('#releaseRoomLink')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#status')).toContainText('blocked');
    await expect(page.locator('body')).toContainText('No uploads. No repository writes. No release decision.');
    await assertNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('Release Room verifies routes but blocks private bundle export on local HTTP', async ({ page }) => {
    const errors = watchPage(page);
    const response = await page.goto('/qa/release-room.html', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('#routeState')).toHaveText('8/8');
    await expect(page.locator('#privateState')).toHaveText('not published');
    await expect(page.locator('#secureState')).toHaveText('local rehearsal');
    await expect(page.locator('#exportBundle')).toBeDisabled();
    await expect(page.locator('#approvalLink')).toHaveAttribute('aria-disabled', 'true');
    await assertNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('final approval offers bundle import but keeps the human decision blocked', async ({ page }) => {
    const errors = watchPage(page);
    const response = await page.goto('/qa/release-approval.html', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('#bundleFile')).toBeVisible();
    await expect(page.locator('#export')).toBeDisabled();
    await expect(page.locator('#decisionSummary')).toHaveText('blocked');
    await expect(page.locator('body')).toContainText('No automatic approval');
    await assertNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('shared evidence contract accepts schema-v2 device reports and round-trips a bundle', async ({ page }) => {
    const response = await page.goto('/qa/release-room.html', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    const result = await page.evaluate(async () => {
      const release = await fetch('../release.json').then((entry) => entry.json());
      const contract = window.LarriVerseEvidence;
      const projects = ['desktop-chromium', 'mobile-chromium'];
      const subjects = ['lobby', ...release.cabinets.map((cabinet) => cabinet.id)];
      const gallery = {
        schema: 'larriverse-gallery-approval',
        schemaVersion: 1,
        release: release.version,
        candidate: release.candidate,
        sourceCommit: 'a'.repeat(40),
        reviewer: 'Browser QA',
        reviewedAt: new Date().toISOString(),
        checks: { privacy: true, layout: true, accuracy: true, altText: true, humanBoundary: true },
        entries: projects.flatMap((project) => subjects.map((subjectId) => ({
          project,
          subjectId,
          status: 'approved',
          sha256: 'b'.repeat(64),
          alt: `Approved descriptive screenshot of ${subjectId} in ${project}.`
        })))
      };
      const makeQa = (deviceClass) => ({
        schema: 'larriverse-release-qa',
        schemaVersion: 2,
        release: release.version,
        candidate: release.candidate,
        deviceClass,
        deviceName: deviceClass === 'desktop' ? 'QA desktop browser' : 'QA physical phone',
        tester: 'Browser QA',
        userAgent: navigator.userAgent,
        environment: {
          viewportWidth: innerWidth,
          viewportHeight: innerHeight,
          maxTouchPoints: deviceClass === 'physical-phone' ? 5 : 0
        },
        deviceChecks: Object.fromEntries(release.deviceQa.requiredDeviceChecks.map((key) => [key, true])),
        locationGrantedDuringEvidence: false,
        exportedAt: new Date().toISOString(),
        results: release.cabinets.map((cabinet) => ({ id: cabinet.id, title: cabinet.title, route: 'reachable', result: 'pass' }))
      });
      const documents = {
        gallery: JSON.stringify(gallery),
        desktop: JSON.stringify(makeQa('desktop')),
        physicalPhone: JSON.stringify(makeQa('physical-phone'))
      };
      const items = {};
      for (const [kind, text] of Object.entries(documents)) {
        items[kind] = { kind, text, value: JSON.parse(text), sha256: await contract.digestText(text), bytes: text.length };
      }
      contract.validateGallery(items.gallery.value, release);
      contract.validateQa(items.desktop.value, release, 'desktop');
      contract.validateQa(items.physicalPhone.value, release, 'physical-phone');
      const deployment = {
        schema: 'larriverse-deployment', schemaVersion: 1, release: release.version, candidate: release.candidate,
        sourceCommit: 'c'.repeat(40), builtAt: new Date().toISOString(), repository: 'larrinamsalva/larriverse-arcade',
        workflowRunId: '123', workflowRunNumber: '16', releaseManifestSha256: 'd'.repeat(64)
      };
      const bundle = contract.createBundle({ release, deployment, items });
      const checked = await contract.validateBundle(bundle, release);
      return {
        schema: bundle.schema,
        desktopClass: checked.items.desktop.value.deviceClass,
        phoneClass: checked.items.physicalPhone.value.deviceClass,
        touch: checked.items.physicalPhone.value.environment.maxTouchPoints,
        distinct: checked.items.desktop.sha256 !== checked.items.physicalPhone.sha256
      };
    });
    expect(result).toEqual({
      schema: 'larriverse-evidence-bundle',
      desktopClass: 'desktop',
      phoneClass: 'physical-phone',
      touch: 5,
      distinct: true
    });
  });
});
