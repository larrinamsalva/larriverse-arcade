# LarriVerse Arcade 1.0 — Guided Device QA

The guided QA console creates two separate human reports:

- `desktop`
- `physical-phone`

A desktop report cannot be imported as phone evidence. A physical-phone report must come from a touch-capable browser and records its screen, viewport, touch-point, browser, device-name, and device-wide confirmation metadata.

## Publish the project test link

The arcade is public source code, and the QA console uploads no test data. GitHub Pages gives the phone a normal HTTPS link without adding a server or database.

The existing **Deploy LarriVerse Arcade** workflow publishes validated `main` automatically. It can also be run manually from the Actions tab. If GitHub Pages is ever disabled, restore it in **Settings → Pages → Build and deployment → GitHub Actions**.

Expected site root after a successful deployment:

`https://larrinamsalva.github.io/larriverse-arcade/`

Guided QA route:

`https://larrinamsalva.github.io/larriverse-arcade/qa/`

Only `main` can deploy automatically. The workflow validates the complete arcade, builds an allowlisted `_site` folder, and deploys that artifact; pull-request branches are never published. Manual `workflow_dispatch` remains available for a controlled redeploy.

## Desktop report

1. Open the guided QA route on the desktop or laptop being tested.
2. Select **Desktop or laptop browser**.
3. Enter the actual computer/browser description and tester name.
4. Check all routes.
5. Complete each cabinet focus task and mark all eight results.
6. Complete the six device-wide checks.
7. Export the `desktop` QA JSON.

## Physical-phone report

1. Use **Send test link** on the desktop or copy the QA URL to the phone.
2. Open it in the phone's normal browser—not desktop device emulation.
3. Select **Physical phone browser**.
4. Enter the actual phone/browser description and tester name.
5. Complete all eight cabinet focus tasks with touch controls.
6. Check scrolling, orientation, narrow layout, sound behavior, backup/restore, privacy, and accessibility.
7. Export the `physical-phone` QA JSON from the phone.
8. Move that JSON to the computer using the user's normal trusted file-sharing method.

## Final approval

Open `qa/release-approval.html` and import:

1. The approved gallery JSON.
2. The complete desktop QA JSON.
3. The complete physical-phone QA JSON.

The console rejects swapped device types, incomplete device-wide checks, duplicate evidence files, phone reports without touch capability, failed cabinets, unreachable routes, and mismatched release candidates.

The QA and approval pages:

- upload nothing;
- request no location;
- access no contacts, camera, microphone, or clipboard without a button press;
- do not create tags or releases;
- do not contain arcade saves in their exported reports.
