# LarriVerse Automated Browser QA

Phase 12 adds a pinned Playwright/Chromium release gate for the complete 28-game arcade.

## What automation now proves

For the lobby and every cabinet at **1440×900** and **390×844**, the suite checks:

- the route returns a successful response
- the page renders visible content and at least one usable control
- the shared Arcade SDK v3 loads
- reduced motion, high contrast, and larger text classes apply
- keyboard focus can reach an interactive element
- the layout does not create page-level horizontal overflow
- the page exposes a route back to the arcade lobby
- no uncaught page error or meaningful console error appears
- no known map, nearby-place, advertising, or analytics endpoint is requested

The lobby test also performs a real device-local profile, settings, reward, backup, erase, and restore round trip.

The 1.0 polish suite also checks all 38 game, progress, lobby, and QA routes at **320px, 390px, 768px, 1024px, and 1440px**, with normal and **200% text**. It checks page reflow and that visible controls remain within the page, including shared comfort dialogs and keyboard focus restoration. Focused regressions exercise Creature Catcher questions/completion/replay, Road Trip's stationary reduced-motion collection and saved inventory, Bubble Resonance keyboard play and numbered cues, and Chill Brain/shared setting synchronization.

Discovery remains read-only and device-local. Additional downloads exercise backup restoration and rejection of unrelated storage, plus Passport and Family Report exports that exclude family notes and coordinate records. High-contrast navigation and print text are checked automatically; hands-on print review remains required.

Road Trip Quest GPS receives an extra check: geolocation permission is never granted and saved records contain no latitude, longitude, or coordinate fields.

## Screenshot evidence

Each run captures a clean viewport screenshot for the lobby and all 28 cabinets in both browser projects. GitHub Actions uploads these images with the HTML Playwright report and failure traces as a temporary artifact.

After keyboard checks, capture clears transient focus and scroll offsets so a skip-link focus ring cannot cover the header. `npm run gallery:build` assembles the 58 images; `npm run gallery:verify` checks their deterministic subject/view descriptions, PNG dimensions, sizes, and hashes. Mobile descriptions refer to the visible opening view instead of assuming an entire board fits above the fold.

The screenshot contexts begin with empty browser storage, reduced motion enabled, and no location permission. They are QA evidence, not automatically approved marketing images. A human must still inspect them before copying selected images into `docs/screenshots/`.

## What remains human

Automation does not decide whether a game is fun, instructions are understandable, touch targets feel comfortable, sound is appropriate, or a full gameplay path works on a physical phone. The manual QA console and release checklist remain required before the `v1.0.0` tag is created.
