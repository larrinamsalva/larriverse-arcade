# LarriVerse 1.0 polish — candidate QA evidence

Automated and agent-inspected evidence only. **This document does not approve a release or replace a human desktop/physical-phone report.** The collection contains 32 games, `1.0.0 rc.1`, with `releaseState: candidate` and mandatory human checks.

## Source and environment

- Review baseline: `c1b66763046561d3e4a94dfc1ff877e0da9d4636`.
- Tested local implementation: `781700cd8936a38d043acfa14ecaece5ef6b2995`.
- Published implementation: [`9895725`](https://github.com/larrinamsalva/larriverse-arcade/commit/989572590f11b477732d94c3c0124e905016bf09), reproducing the exact tested Git tree `5efcde2ccbcbeb3020a2cba4127ddafc93d7646b`. The following evidence commit changes documentation only.
- Date: 2026-10-05.
- Local runner: Node 24.19.0, Playwright 1.55.0, Chromium 140.
- Chromium projects: desktop at 1440×900 CSS pixels and touch-enabled mobile emulation at 390×844 CSS pixels. Mobile emulation is **not** physical-phone QA.
- QA uses fresh or synthetic browser records. No personal gameplay records are uploaded.

## Completed checks

| Check | Result |
| --- | --- |
| `npm run validate` | All 21 validation scripts pass; existing content, safety, privacy, release, and approval contracts retained. |
| Complete `npm run test:browser` | 166 passed: 83 desktop and 83 mobile. Zero failed, skipped, or flaky results; 245.2 seconds. |
| Route/reflow coverage | All 32 game routes and the lobby, My Learning Day, Goals, Passport, Family Report, and five QA pages load at the required viewport and enlarged-text widths; high contrast and reduced motion are included. |
| Gameplay | Existing twelve practice-world and eight expedition suites pass. Focused original-cabinet checks cover questions, keyboard aiming, same-lane collection, completion/replay, saved inventory, shared comfort, and sound defaults. |
| Progress and backups | Profile/settings/game progress persists across reloads. Download, erase, restore, invalid-import handling, and unrelated-storage preservation pass. |
| Export privacy | Backups exclude unrelated localStorage. Passport/Family Report downloads exclude raw family records, PIN data, and location coordinates. |
| Comfort/accessibility | Shared dialog focus/escape, keyboard navigation, narrow completion views, larger text, contrast, OS/shared reduced motion, stopped lobby rotation, and print CSS checks pass. |
| Gallery | Fresh 66-image desktop/mobile pack generated. Exactly 66 unique deterministic descriptions, no undefined/null metadata, and valid paths/viewports/PNG dimensions/byte counts/SHA-256 hashes. All 66 PNGs decode. |
| Release gate negative check | `npm run verify:release-approval` exits 1 because the real human approval JSON is missing, as required. |

The existing Harbor Helpers capacity/delivery test keeps all assertions. It now uses two independent taps because the shelf button is replaced after each tap. Screenshot capture clears temporary focus/scroll artifacts after keyboard checks and waits for question-driven start controls to be ready.

Agent inspection covered the opening images and focused narrow/enlarged-text views. It corrected the stale Creature Catcher loading label, cramped phone learning-path buttons, duplicate opening return link, contrast issues, and hidden mobile Passport comfort controls. This inspection is candidate evidence, **not human visual approval**.

## Reproduce

Install the workflow's pinned Playwright runner and Chromium, then run:

```sh
npm install --no-save --no-package-lock @playwright/test@1.55.0
npx playwright install --with-deps chromium
npm run validate
npm run test:browser -- --workers=2
LARRIVERSE_SOURCE_SHA=$(git rev-parse HEAD) npm run gallery:build
npm run gallery:verify
```

Browser QA creates screenshots under `artifacts/screenshots/` and the offline human review pack under `artifacts/gallery-review/`. GitHub's Browser QA workflow independently runs both Chromium projects, verifies the gallery, and uploads the review artifact. Unapproved evidence is not committed as approved screenshots.

## Required human release gates

Still pending:

- Hands-on desktop and **real physical-phone** gameplay for all 32 cabinets, plus all six device-wide checks on each device: 64 cabinet results total.
- Human visual/privacy inspection and alt-text approval of all 66 gallery images.
- Real touch, orientation, scrolling, sound comfort, instruction clarity, gameplay feel, accessibility, backup/restore, and print-output review.
- Actual guided device reports and gallery approval, final human release decision, committed `docs/release-approval.json`, and the exact 66 approved images with the existing hash and code-ancestry checks.

No approval JSON, device result, screenshot approval, release tag, merge, or deployment is fabricated here. Follow [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md), [DEVICE-QA.md](DEVICE-QA.md), and [GALLERY-APPROVAL.md](GALLERY-APPROVAL.md).
