# LarriVerse Arcade 1.0 — Release Checklist

This checklist covers the complete eight-cabinet recovered browser collection.

Open `qa/index.html` from the deployed site to record device-local route checks, manual cabinet results, browser notes, and an exportable QA report. The console does not upload results or convert a reachable route into a gameplay pass.

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

Browser evidence does not replace the manual gameplay, real-device, and visual-approval checks below. See [`BROWSER-QA.md`](BROWSER-QA.md) for the exact automated boundary.

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

## Visual gallery capture

Review the temporary Chromium screenshots first, then capture or approve each cabinet at 1440×900 and 390×844 after its opening screen loads. Use Demo Mode for Road Trip GPS and do not grant live location during screenshots.

- [ ] Desktop and mobile images approved for all eight cabinets.
- [ ] No personal names, family notes, location prompts, or real saved progress appear.
- [ ] Approved images are compressed and placed under `docs/screenshots/`.
- [ ] Gallery links and alt text are added to `docs/CABINET-GALLERY.md`.

## Release decision

Release only after the unchecked manual items above have been tested on a desktop browser and one physical mobile browser. GitHub Actions confirms structural, syntax, content, privacy, automated Chromium, safety, release-metadata, and tag-publishing contracts; it does not replace hands-on play testing.
