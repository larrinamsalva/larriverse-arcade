# LarriVerse Automated Browser QA

Phase 12 adds a pinned Playwright/Chromium release gate for the complete eight-cabinet arcade.

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

Road Trip Quest GPS receives an extra check: geolocation permission is never granted and saved records contain no latitude, longitude, or coordinate fields.

## Screenshot evidence

Each run captures a clean viewport screenshot for the lobby and all eight cabinets in both browser projects. GitHub Actions uploads these images with the HTML Playwright report and failure traces as a temporary artifact.

The screenshot contexts begin with empty browser storage, reduced motion enabled, and no location permission. They are QA evidence, not automatically approved marketing images. A human must still inspect them before copying selected images into `docs/screenshots/`.

## What remains human

Automation does not decide whether a game is fun, instructions are understandable, touch targets feel comfortable, sound is appropriate, or a full gameplay path works on a physical phone. The manual QA console and release checklist remain required before the `v1.0.0` tag is created.
