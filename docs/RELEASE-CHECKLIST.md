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
- [x] KidsCoin combines six ten-question lessons for 60 open family-planning questions.
- [x] Shared learning packs combine into 120 unique reviewed questions across five subjects.
- [x] Creature Catcher and Road Trip Quest offer Starter, Growing, Challenge, and Mixed paths.
- [x] Learning-path choice, recent question IDs, and local accuracy stay in browser storage without collecting age.
- [x] Learning expansion loaders request no location and upload no answers.
- [x] Learning Goals supports six preset goal types, three slots, safe target choices, restart, remove, and clear.
- [x] Learning Goals counts only progress after the pinned baseline and blocks a fourth goal.
- [x] Learning Goals stores no free text, deadlines, streaks, grades, family records, or location data and uploads nothing.
- [x] Progress Passport publishes current goals, all eight cabinet stamps, adaptive-learning trails, achievements, level progress, and a suggested next mission.
- [x] Progress Passport is read-only, requests no location, uploads no data, and excludes raw family and location records from its summary export.
- [x] Family Learning Report publishes current goals, aggregate strengths, practice opportunities, learning paths, eight cabinet rows, recent activity, and conversation starters.
- [x] Family Learning Report requires at least two answers before describing a subject pattern, uses 80% for strengths and below 75% for practice, and explicitly rejects grading, diagnosis, ranking, and certification claims.
- [x] Family Learning Report is read-only, stores no review notes, requests no location, uploads no data, and excludes raw family and coordinate records from its export.
- [x] Road Trip Quest GPS defaults to Demo Mode and never saves or uploads coordinates.
- [x] Save backups accept only schema-checked `larriverse.*` browser records.
- [x] Import failures roll back to the pre-import browser records.
- [x] Reduced motion, high contrast, and larger text are shared through the SDK.
- [x] Release metadata matches package version, catalog routes, notes, and gallery targets.
- [x] Version tags validate the complete arcade before GitHub can publish a release.
- [x] Automated Chromium pass covers the lobby and all eight cabinets at 1440×900 and 390×844.
- [x] Browser automation performs a real profile/settings/reward/backup/restore round trip.
- [x] Browser automation changes an adaptive learning path, reloads it, and verifies local recent-question memory.
- [x] Browser automation pins three goals, advances local counters, reloads, verifies completion, checks safe storage and export, restarts one, removes one, and confirms Passport and Report stay read-only.
- [x] Browser automation seeds a realistic Progress Passport and verifies totals, eight stamps, accuracy, achievements, next mission, and safe export fields.
- [x] Browser automation seeds a realistic Family Learning Report and verifies strength, practice, neutral subject, eight cabinet rows, recent activity, healthy boundaries, and safe export fields.
- [x] Browser evidence is captured without granting location permission.
- [x] Successful Browser QA builds an offline gallery review with 18 hashed images.
- [x] The tag workflow requires a committed final approval JSON and exact approved image hashes.
- [x] Guided QA exports schema-v2 desktop and schema-v2 physical-phone reports with separate local records.
- [x] The physical-phone report requires touch capability and six completed device-wide checks.
- [x] The GitHub Pages workflow validates `main` and publishes only the allowlisted static arcade files.
- [x] The Pages build publishes `/goals/`, `/passport/`, and `/report/` and records them in the deployment manifest.
- [x] The Pages build excludes the final release approval record and private evidence files.
- [x] Every deployed build contains a tamper-evident deployment identity tied to its source commit.
- [x] Deployment Readiness checks HTTPS, release alignment, eight routes, and private-path exclusion.
- [x] Evidence Preflight validates three human evidence files without approving the release.
- [x] Evidence Preflight, Release Room, and Final Approval use one shared schema-v2 evidence contract.
- [x] The shared contract uses `deviceClass` and `environment.maxTouchPoints` and rejects obsolete device fields.
- [x] The Release Room creates a private `larriverse-evidence-bundle` that preserves all three original JSON texts and SHA-256 hashes.
- [x] The evidence bundle identifies the deployed candidate and explicitly cannot create release approval.

Browser evidence does not replace the manual gameplay, real-device, print, and visual-approval checks below. See [`BROWSER-QA.md`](BROWSER-QA.md), [`GALLERY-APPROVAL.md`](GALLERY-APPROVAL.md), [`DEVICE-QA.md`](DEVICE-QA.md), [`DEPLOYMENT-REHEARSAL.md`](DEPLOYMENT-REHEARSAL.md), [`RELEASE-ROOM.md`](RELEASE-ROOM.md), [`LEARNING-GOALS.md`](LEARNING-GOALS.md), [`PROGRESS-PASSPORT.md`](PROGRESS-PASSPORT.md), and [`FAMILY-LEARNING-REPORT.md`](FAMILY-LEARNING-REPORT.md) for the exact boundary.

## Cabinet launch pass

- [ ] KidsCoin Family App — open a ten-question lesson bank without a PIN, finish one three-question round, assign a chore, approve its KC, and restore the save.
- [ ] Brain Sweat Expanded — complete one reviewed activity and confirm queued tiers remain locked.
- [ ] Brain Sweat Life Skills — complete one reviewed lesson and confirm world progress persists.
- [ ] Bubble Resonance Φ369 — finish one run with sound optional and medical boundary visible.
- [ ] Chill Brain Rewards — finish and leave-gently paths both save correctly.
- [ ] Creature Catcher — change the learning path, finish a round, reload, and confirm the path, recent memory, and field guide persist.
- [ ] Road Trip Quest — change the learning path, win one city battle, reload, and confirm path and route progress persist.
- [ ] Road Trip Quest GPS — complete one Demo Mode encounter and verify Live Movement remains opt-in.

## Learning Goals pass

- [ ] Open `/goals/` and confirm a new browser shows zero pinned goals without inventing an assignment.
- [ ] Pin a subject goal after answers already exist and confirm it begins at zero.
- [ ] Answer enough new questions to complete the goal and confirm older answers were not counted.
- [ ] Restart the completed goal and confirm its baseline returns to zero without erasing answer history.
- [ ] Pin three goals and confirm a fourth is blocked.
- [ ] Remove one goal and confirm a slot reopens.
- [ ] Clear the board and confirm profile XP, cabinet progress, learning history, and KidsCoin family data remain unchanged.
- [ ] Confirm suggestions never pin themselves and use invitation language instead of assignments or punishments.
- [ ] Print or save the print preview and confirm the builder, suggestions, management buttons, and toast are hidden without clipping current goals.
- [ ] Download the `larriverse-learning-goals-summary` JSON and confirm it contains no free text, deadline, streak, family, PIN, note, or coordinate fields.
- [ ] Confirm Passport and Family Report show the same goal count and progress but cannot modify goals.
- [ ] Confirm `/goals/` remains usable on a physical phone with larger text, high contrast, and reduced motion.

## Progress Passport pass

- [ ] Open `/passport/` after playing multiple cabinets and confirm all eight stamps appear.
- [ ] Confirm current goals, XP, level, Arcade KC, session totals, completions, achievements, and last-played dates match the local saves.
- [ ] Confirm Creature Catcher and Road Trip Quest show the selected learning paths, recent-question counts, and correct per-subject accuracy.
- [ ] Print or save the print preview and confirm no navigation, mission prompt, or private-data warning is clipped.
- [ ] Download the `larriverse-progress-passport` summary and confirm it contains no raw KidsCoin family records or location data.
- [ ] Confirm an empty/new browser shows a friendly first-adventure state instead of invented progress.

## Family Learning Report pass

- [ ] Open `/report/` after playing multiple cabinets and confirm current goals, profile totals, and the visited-cabinet count match the local saves.
- [ ] Confirm subject totals agree with Creature Catcher and Road Trip Quest history.
- [ ] Confirm strengths require at least two answers and at least 80% accuracy.
- [ ] Confirm practice opportunities require at least two answers and below 75% accuracy.
- [ ] Confirm subjects with too little history show “more data needed” instead of an ability conclusion.
- [ ] Confirm all eight cabinet rows appear and recent activity is ordered by real local timestamps.
- [ ] Confirm conversation starters are optional, supportive, and contain no punishment or ranking language.
- [ ] Print or save the print preview and confirm navigation, action buttons, and toast messages are hidden without clipping report content.
- [ ] Download the `larriverse-family-learning-report` JSON and confirm it contains no chores, approvals, parent-control material, family notes, review notes, or coordinate records.
- [ ] Confirm an empty/new browser shows friendly empty states instead of invented strengths or weaknesses.

## Accessibility pass

- [ ] Keyboard-only navigation reaches the skip link, search, filters, cabinet launches, goal builder and controls, learning-path controls, Passport sections, Family Report sections, settings, and save tools.
- [ ] Focus indicators remain visible in normal and high-contrast modes.
- [ ] Reduced motion stops lobby rotation and decorative animation.
- [ ] Larger text does not hide launch buttons, goal controls, Passport actions, Family Report actions, or dialog controls at 320px width.
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
- [ ] Restoring a backup restores the profile, adaptive-learning history, and `larriverse.learningGoals.v1` baselines used by Goals, Passport, and Family Report.

## Visual gallery approval

- [ ] Download the successful `larriverse-gallery-review-<run>` artifact and open its offline `index.html`.
- [ ] Review all 18 desktop/mobile images and their SHA-256 digests.
- [ ] No personal names, family notes, location prompts, coordinates, or real saved progress appear.
- [ ] Useful alt text is approved for every image.
- [ ] Export the `larriverse-gallery-approval` JSON.

## Guided device QA

- [ ] Confirm **Deploy LarriVerse Arcade** completed successfully for the merged `main` commit.
- [ ] Open the published QA route over HTTPS on both devices.
- [ ] Open the guided QA route on the actual desktop/laptop and export a complete schema-v2 desktop report.
- [ ] Send the QA link to one physical phone and export a complete schema-v2 physical-phone report.
- [ ] Confirm the phone report names the real phone, reports touch capability, and is not desktop emulation.
- [ ] Confirm both reports contain eight reachable routes, eight cabinet passes, and six device-wide checks.

## Deployment and evidence rehearsal

- [ ] Open `qa/readiness.html` on the deployed site and confirm its deployment identity matches the merged commit.
- [ ] Confirm Readiness shows all five checks passed and all eight cabinet routes reachable.
- [ ] Confirm the Learning Goals, Progress Passport, and Family Learning Report routes are published and the final approval record, repository scripts, and workflow files are not publicly reachable.
- [ ] Load the gallery, desktop, and phone files through evidence preflight and resolve every structural issue.

## Release Room handoff

- [ ] Open `qa/release-room.html` from the live HTTPS deployment.
- [ ] Confirm the exact deployment commit, release digest, 8/8 cabinet routes, and private-path exclusion.
- [ ] Load the approved gallery JSON, desktop QA JSON, and physical-phone QA JSON.
- [ ] Export the private evidence bundle and keep it out of the public Pages artifact.
- [ ] Import the evidence bundle into `qa/release-approval.html` and confirm the three original hashes are preserved.

## Final human approval

- [ ] Import the Release Room evidence bundle—or both device QA reports and the gallery approval—into `qa/release-approval.html`.
- [ ] Complete the sound, touch, gameplay, accessibility, backup, privacy, and release-decision confirmations.
- [ ] Export the final approval JSON.
- [ ] Commit it as `docs/release-approval.json` with the exact 18 approved images under `docs/screenshots/`.

## Release decision

**Release only after the unchecked manual items above are complete.** GitHub Actions confirms structural, syntax, content, privacy, safety, browser, Learning Goals, Progress Passport, Family Learning Report, approval-record, device-label, static-preview, shared-evidence-contract, evidence-bundle, and tag-publishing contracts; it does not replace hands-on play testing. The tag workflow verifies the final approval JSON, image hashes, approved-code ancestry, structural validation, and fresh desktop/mobile Chromium before publication. It still does not invent human judgment or physical-device results.
