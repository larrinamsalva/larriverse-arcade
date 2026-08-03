# LarriVerse Arcade 1.0 — Release Checklist

This checklist covers the complete eight-cabinet recovered browser collection.

Open `qa/index.html` from the deployed site to record device-local route checks, manual cabinet results, browser notes, and an exportable QA report. The console does not upload results or convert a reachable route into a gameplay pass. Desktop and physical-phone progress are stored as separate local records.

## Required automated checks

- [x] Root catalog contains exactly eight unique cabinets.
- [x] All eight cabinets are marked playable.
- [x] Every cabinet has a route back to the arcade lobby.
- [x] Every playable cabinet loads the shared Arcade SDK before its own engine.
- [x] Shared JavaScript and every cabinet engine pass `node --check`.
- [x] Brain Sweat Life Skills keeps unreviewed high-stakes lessons locked.
- [x] Brain Sweat Expanded keeps queued hazardous activity payloads physically absent.
- [x] Chill Brain keeps sound optional and avoids health claims.
- [x] KidsCoin Family keeps family data local and parent controlled.
- [x] Road Trip Quest GPS defaults to Demo Mode and never saves or uploads coordinates.
- [x] Save backups accept only schema-checked `larriverse.*` browser records.
- [x] Import failures roll back to the pre-import browser records.
- [x] Reduced motion, high contrast, and larger text are shared through the SDK.
- [x] Release metadata matches package version, catalog routes, notes, and gallery targets.
- [x] Version tags validate the complete arcade before GitHub can publish a release.
- [x] Automated Chromium pass covers the lobby and all eight cabinets at 1440×900 and 390×844.
- [x] Browser automation performs a real profile/settings/reward/backup/restore round trip.
- [x] Browser evidence is captured without granting location permission.
- [x] Successful Browser QA builds an offline gallery review with 18 hashed images.
- [x] The tag workflow requires a committed final approval JSON and exact approved image hashes.
- [x] Guided QA exports schema-v2 desktop and schema-v2 physical-phone reports with separate local records.
- [x] The physical-phone report requires touch capability and six completed device-wide checks.
- [x] The GitHub Pages workflow validates `main` and publishes only the allowlisted static arcade files.
- [x] The Pages build excludes the final release approval record and private evidence files.
- [x] Every Pages build generates a deployment identity with source commit, build time, workflow run, and release-manifest digest.
- [x] The readiness page checks HTTPS, release alignment, all eight cabinet routes, and private-path exclusion.
- [x] Evidence preflight validates gallery, desktop, and physical-phone files without creating release approval.
- [x] Browser QA serves the same allowlisted `_site` shape used by GitHub Pages and tests the readiness and preflight tools.

Browser evidence does not replace the manual gameplay, real-device, and visual-approval checks below. See [`BROWSER-QA.md`](BROWSER-QA.md), [`GALLERY-APPROVAL.md`](GALLERY-APPROVAL.md), [`DEVICE-QA.md`](DEVICE-QA.md), and [`DEPLOYMENT-REHEARSAL.md`](DEPLOYMENT-REHEARSAL.md) for the exact boundary.

## Cabinet launch pass

- [ ] KidsCoin Family App — create a profile, request a task, approve it, and restore its save.
- [ ] Brain Sweat Expanded — complete one reviewed activity and confirm queued tiers remain locked.
- [ ] Brain Sweat Life Skills — complete one reviewed lesson and confirm world progress persists.
- [ ] Bubble Resonance Φ369 — finish one run with sound optional and medical boundary visible.
- [ ] Chill Brain Rewards — finish and leave-gently paths both save correctly.
- [ ] Creature Catcher — finish a round and confirm the field guide persists.
- [ ] Road Trip Quest — win a city battle and confirm route progress persists.
- [ ] Road Trip Quest GPS — complete one Demo Mode encounter and verify Live Movement remains opt-in.

## Accessibility pass

- [ ] Keyboard-only navigation reaches the skip link, search, filters, cabinet launches, settings, and save tools.
- [ ] Focus indicators remain visible in normal and high-contrast modes.
- [ ] Reduced motion stops lobby rotation and decorative animation.
- [ ] Larger text does not hide launch buttons or dialog controls at 320px width.
- [ ] Mobile dock does not cover interactive content.
- [ ] Dialogs close with their close button and Escape.
- [ ] Status messages are announced through `aria-live`.

## Save backup pass

- [ ] Downloaded file uses the `larriverse-save-backup` schema.
- [ ] Backup contains no keys outside the `larriverse.` prefix.
- [ ] Restore rejects malformed JSON.
- [ ] Restore rejects unsupported schema versions.
- [ ] Restore rejects invalid record keys and oversized files.
- [ ] Erase progress keeps accessibility settings when requested.
- [ ] No location coordinates appear in exported Road Trip GPS data.

## Visual gallery approval

- [ ] Download the successful `larriverse-gallery-review-<run>` artifact and open its offline `index.html`.
- [ ] Review all 18 desktop/mobile images and their SHA-256 digests.
- [ ] No personal names, family notes, location prompts, coordinates, or real saved progress appear.
- [ ] Useful alt text is approved for every image.
- [ ] Export the `larriverse-gallery-approval` JSON.

## Deployment rehearsal

- [ ] Open `qa/readiness.html` on the deployed site and confirm all five checks pass.
- [ ] Confirm the readiness source commit matches the merged release-candidate commit intended for testing.
- [ ] Confirm all eight routes are reachable and private approval/workflow/script paths remain unavailable.
- [ ] Do not use search-engine indexing or a route-only result as gameplay evidence.

## Guided device QA

- [ ] Confirm **Deploy LarriVerse Arcade** completed successfully for the merged `main` commit.
- [ ] Open the published QA route over HTTPS on both devices.
- [ ] Open the guided QA route on the actual desktop/laptop and export a complete schema-v2 desktop report.
- [ ] Send the QA link to one physical phone and export a complete schema-v2 physical-phone report.
- [ ] Confirm the phone report names the real phone, reports touch capability, and is not desktop emulation.
- [ ] Confirm both reports contain eight reachable routes, eight cabinet passes, and six device-wide checks.

## Evidence preflight

- [ ] Load the gallery, desktop, and physical-phone JSON files into `qa/evidence-preflight.html`.
- [ ] Confirm the files match release `1.0.0 rc.1`, have distinct desktop/phone hashes, and pass every structural check.
- [ ] Treat the optional `larriverse-evidence-rehearsal` summary as rehearsal only—not release approval.

## Final human approval

- [ ] Import both device QA reports and the gallery approval into `qa/release-approval.html`.
- [ ] Complete the sound, touch, gameplay, accessibility, backup, privacy, and release-decision confirmations.
- [ ] Export the final approval JSON.
- [ ] Commit it as `docs/release-approval.json` with the exact 18 approved images under `docs/screenshots/`.

## Release decision

**Release only after the unchecked manual items above are complete.** GitHub Actions confirms structural, syntax, content, privacy, safety, browser, deployment-identity, evidence-preflight, approval-record, device-label, static-preview, and tag-publishing contracts; it does not replace hands-on play testing. The tag workflow verifies the final approval JSON, image hashes, approved-code ancestry, structural validation, and fresh desktop/mobile Chromium before publication. It still does not invent human judgment or physical-device results.
