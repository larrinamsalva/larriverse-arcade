# LarriVerse Arcade 1.0 — Release Checklist

This checklist covers the 32-game arcade, including the original eight recovered browser concepts.

For the order of testing and the files to keep, start with [RELEASE-TESTING.md](RELEASE-TESTING.md).

Open `qa/index.html` from the deployed site to record device-local route checks, manual cabinet results, browser notes, and an exportable QA report. The console does not upload results or convert a reachable route into a gameplay pass. Desktop and physical-phone progress are stored as separate local records.

## Required automated checks

- [x] Root catalog contains exactly 32 unique cabinets.
- [x] All 32 cabinets are marked playable.
- [x] Every cabinet has a route back to the arcade lobby.
- [x] Every playable cabinet loads the shared Arcade SDK before its own engine.
- [x] Shared JavaScript and every cabinet engine pass `node --check`.
- [x] Brain Sweat Life Skills keeps unreviewed high-stakes lessons locked.
- [x] Brain Sweat Expanded keeps queued hazardous activity payloads physically absent.
- [x] Chill Brain keeps sound optional and avoids health claims.
- [x] KidsCoin Family keeps family data local and parent controlled.
- [x] KidsCoin combines six twenty-question lessons for 120 open family-planning questions.
- [x] Shared learning packs combine into 120 unique reviewed questions across five subjects.
- [x] Creature Catcher and Road Trip Quest offer Starter, Growing, Challenge, and Mixed paths.
- [x] Learning-path choice, recent question IDs, and local accuracy stay in browser storage without collecting age.
- [x] Learning expansion loaders request no location and upload no answers.
- [x] Learning Goals supports six preset goal types, three slots, safe target choices, restart, remove, and clear.
- [x] Learning Goals counts only progress after the pinned baseline and blocks a fourth goal.
- [x] Learning Goals stores no free text, deadlines, streaks, grades, family records, or location data and uploads nothing.
- [x] Progress Passport publishes current goals, all 32 cabinet stamps, adaptive-learning trails, achievements, level progress, and a suggested next mission.
- [x] Progress Passport is read-only, requests no location, uploads no data, and excludes raw family and location records from its summary export.
- [x] Family Learning Report publishes current goals, aggregate strengths, practice opportunities, learning paths, all 32 cabinet rows, recent activity, and conversation starters.
- [x] Family Learning Report requires at least two answers before describing a subject pattern, uses 80% for strengths and below 75% for practice, and explicitly rejects grading, diagnosis, ranking, and certification claims.
- [x] Family Learning Report is read-only, stores no review notes, requests no location, uploads no data, and excludes raw family and coordinate records from its export.
- [x] Road Trip Quest GPS defaults to Demo Mode and never saves or uploads coordinates.
- [x] Save backups accept only schema-checked `larriverse.*` browser records.
- [x] Import failures roll back to the pre-import browser records.
- [x] Reduced motion, high contrast, and larger text are shared through the SDK.
- [x] Release metadata matches package version, catalog routes, notes, and gallery targets.
- [x] Version tags validate the complete arcade before GitHub can publish a release.
- [x] Automated Chromium pass covers the lobby and all 32 cabinets at 1440×900 and 390×844.
- [x] Browser automation performs a real profile/settings/reward/backup/restore round trip.
- [x] Browser automation changes an adaptive learning path, reloads it, and verifies local recent-question memory.
- [x] Browser automation pins three goals, advances local counters, reloads, verifies completion, checks safe storage and export, restarts one, removes one, and confirms Passport and Report stay read-only.
- [x] Browser automation seeds a realistic Progress Passport and verifies totals, all 32 stamps, accuracy, achievements, next mission, and safe export fields.
- [x] Browser automation seeds a realistic Family Learning Report and verifies strength, practice, neutral subject, all 32 cabinet rows, recent activity, healthy boundaries, and safe export fields.
- [x] Browser evidence is captured without granting location permission.
- [x] Successful Browser QA builds an offline gallery review with 66 hashed images.
- [x] The tag workflow requires a committed final approval JSON and exact approved image hashes.
- [x] Guided QA exports schema-v2 desktop and schema-v2 physical-phone reports with separate local records.
- [x] The physical-phone report requires touch capability and six completed device-wide checks.
- [x] The GitHub Pages workflow validates `main` and publishes only the allowlisted static arcade files.
- [x] The Pages build publishes `/goals/`, `/passport/`, and `/report/` and records them in the deployment manifest.
- [x] The Pages build excludes the final release approval record and private evidence files.
- [x] Every deployed build contains a tamper-evident deployment identity tied to its source commit.
- [x] Deployment Readiness checks HTTPS, release alignment, 32 routes, and private-path exclusion.
- [x] Evidence Preflight validates three human evidence files without approving the release.
- [x] Evidence Preflight, Release Room, and Final Approval use one shared schema-v2 evidence contract.
- [x] The shared contract uses `deviceClass` and `environment.maxTouchPoints` and rejects obsolete device fields.
- [x] The Release Room creates a private `larriverse-evidence-bundle` that preserves all three original JSON texts and SHA-256 hashes.
- [x] The evidence bundle identifies the deployed candidate and explicitly cannot create release approval.

Browser evidence does not replace the manual gameplay, real-device, print, and visual-approval checks below. See [`BROWSER-QA.md`](BROWSER-QA.md), [`GALLERY-APPROVAL.md`](GALLERY-APPROVAL.md), [`DEVICE-QA.md`](DEVICE-QA.md), [`DEPLOYMENT-REHEARSAL.md`](DEPLOYMENT-REHEARSAL.md), [`RELEASE-ROOM.md`](RELEASE-ROOM.md), [`LEARNING-GOALS.md`](LEARNING-GOALS.md), [`PROGRESS-PASSPORT.md`](PROGRESS-PASSPORT.md), and [`FAMILY-LEARNING-REPORT.md`](FAMILY-LEARNING-REPORT.md) for the exact boundary.

## Cabinet launch pass

- [ ] KidsCoin Family App — open a twenty-question lesson bank without a PIN, finish one three-question round, assign a chore, approve its KC, and restore the save.
- [ ] Brain Sweat Expanded — complete one reviewed activity and confirm queued tiers remain locked.
- [ ] Brain Sweat Life Skills — complete one reviewed lesson and confirm world progress persists.
- [ ] Bubble Resonance Φ369 — clear all twenty stages, confirm the numbered pieces look like glossy round bubbles, and keep sound optional and the medical boundary visible.
- [ ] Chill Brain Rewards — finish and leave-gently paths both save correctly.
- [ ] Creature Catcher — change the learning path, finish a round, reload, and confirm the path, recent memory, and field guide persist.
- [ ] Road Trip Quest — change the learning path, win one city battle, reload, and confirm path and route progress persist.
- [ ] Road Trip Quest GPS — complete one Demo Mode encounter and verify Live Movement remains opt-in.
- [ ] Bridge Buddies — Complete twenty advancing crossings, verify all dimensional cargo vehicles and scene palettes, and confirm each bridge stays within its token budget.
- [ ] Water Works — Rotate the pipes through all twenty advancing networks, passing through the toy filter from the left reservoir to the right-side town.
- [ ] Harbor Helpers — Complete twenty advancing island deliveries, matching each load exactly to its request and respecting the displayed boat capacity.
- [ ] Pantry Picnic — Complete eight rotating picnic challenges from a twenty-four-plan bank. Follow each request, use marked leftovers first, and confirm three sessions exhaust the bank before repeating.
- [ ] Compass Cove — Find twenty treasures through four advancement ranks by following clues from island landmarks. North is up, east is right, south is down, and west is left on this map.
- [ ] Cipher Club — Use the toy A–H alphabet and a shared number key to encode or decode twenty messages that grow from three to five letters.
- [ ] Trade Town — Fill three shopping requests within their pretend budgets. Compare bundle sizes, unit prices, and delivery fees. You can return items before checkout.
- [ ] Critter Council — Complete twenty neighborhoods and eighty requests, verify all four advancement ranks, and check the central cards in light, dark, and high-contrast modes.
- [ ] Pocket Planet — Play ten projects focused on food, gardening, and building. Reject irrelevant supplies and incorrect step orders, check that no purchase or coins are requested, replay thirty unique projects, and verify themes, keyboard/touch, local completion, and sound-off.
- [ ] Scam Sleuth — Complete a full Scam Sleuth round using touch and keyboard, read the feedback, confirm one saved completion, then verify replay and sound-off behavior.
- [ ] Kindness Quest — Complete a full Kindness Quest round using touch and keyboard, read the feedback, confirm one saved completion, then verify replay and sound-off behavior.
- [ ] Fact Finder — Complete a full Fact Finder round using touch and keyboard, read the feedback, confirm one saved completion, then verify replay and sound-off behavior.
- [ ] Repair Café — Complete a full Repair Café round using touch and keyboard, read the feedback, confirm one saved completion, then verify replay and sound-off behavior.
- [ ] Time Trail — Complete 60 progressively longer routes across six chapters; check 5×5, 6×6 and 7×7 maps, 3–5 collectible flags, reachable finish, limits, retries, on-device checkpoint/reload, saved best stars, theme contrast, touch/keyboard and sound-off. Keep manual approval.
- [ ] Garden Guardians — Complete all eight gardens, check crop quotas and scarce-water targets, visit all four ranks, test light/dark/high-contrast on phone, and verify stars, keyboard use, and local completion.
- [ ] Energy Island — Complete eight islands and four ranks, verify shifting four-day forecasts, solar/wind/battery budgets, after-dark storage, clear-build, energy log, accessibility, and local completion.
- [ ] Reuse Rally — Complete a full Reuse Rally round using touch and keyboard, read the feedback, confirm one saved completion, then verify replay and sound-off behavior.
- [ ] Robot Rover — Complete a full Robot Rover round using touch and keyboard, read the feedback, confirm one saved completion, then verify replay and sound-off behavior.
- [ ] Lemonade Lab — Complete a full Lemonade Lab round using touch and keyboard, read the feedback, confirm one saved completion, then verify replay and sound-off behavior.
- [ ] Beat Builder — Complete a full Beat Builder round using touch and keyboard, read the feedback, confirm one saved completion, then verify replay and sound-off behavior.

- [ ] Traffic Town — complete six ten-question rounds, confirm all 60 signs appear before the bank cycles, inspect the dimensional regulatory, caution, service, animal, farm, route, and emergency signs, read the explanations, and verify the game does not claim to replace official permit study or licensing.
- [ ] Street Safety Scout — complete two fifteen-stop routes, confirm each route contains three scenes from all five safety zones, verify the second route uses unseen scenes, inspect roadside-caution art, and confirm local-law and real-emergency boundaries stay visible.

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

- [ ] Open `/passport/` after playing multiple cabinets and confirm all 32 stamps appear.
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
- [ ] Confirm all 32 cabinet rows appear and recent activity is ordered by real local timestamps.
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
- [ ] Review all 66 desktop/mobile images and their SHA-256 digests.
- [ ] No personal names, family notes, location prompts, coordinates, or real saved progress appear.
- [ ] Useful alt text is approved for every image.
- [ ] Export the `larriverse-gallery-approval` JSON.

## Guided device QA

- [ ] Confirm **Deploy LarriVerse Arcade** completed successfully for the merged `main` commit.
- [ ] Open the published QA route over HTTPS on both devices.
- [ ] Open the guided QA route on the actual desktop/laptop and export a complete schema-v2 desktop report.
- [ ] Send the QA link to one physical phone and export a complete schema-v2 physical-phone report.
- [ ] Confirm the phone report names the real phone, reports touch capability, and is not desktop emulation.
- [ ] Confirm both reports contain 32 reachable routes, 32 cabinet passes, and six device-wide checks.

## Deployment and evidence rehearsal

- [ ] Open `qa/readiness.html` on the deployed site and confirm its deployment identity matches the merged commit.
- [ ] Confirm Readiness shows all five checks passed and all 32 cabinet routes reachable.
- [ ] Confirm the Learning Goals, Progress Passport, and Family Learning Report routes are published and the final approval record, repository scripts, and workflow files are not publicly reachable.
- [ ] Load the gallery, desktop, and phone files through evidence preflight and resolve every structural issue.

## Release Room handoff

- [ ] Open `qa/release-room.html` from the live HTTPS deployment.
- [ ] Confirm the exact deployment commit, release digest, 32/32 cabinet routes, and private-path exclusion.
- [ ] Load the approved gallery JSON, desktop QA JSON, and physical-phone QA JSON.
- [ ] Export the private evidence bundle and keep it out of the public Pages artifact.
- [ ] Import the evidence bundle into `qa/release-approval.html` and confirm the three original hashes are preserved.

## Final human approval

- [ ] Import the Release Room evidence bundle—or both device QA reports and the gallery approval—into `qa/release-approval.html`.
- [ ] Complete the sound, touch, gameplay, accessibility, backup, privacy, and release-decision confirmations.
- [ ] Export the final approval JSON.
- [ ] Commit it as `docs/release-approval.json` with the exact 66 approved images under `docs/screenshots/`.

## Release decision

**Release only after the unchecked manual items above are complete.** GitHub Actions confirms structural, syntax, content, privacy, safety, browser, Learning Goals, Progress Passport, Family Learning Report, approval-record, device-label, static-preview, shared-evidence-contract, evidence-bundle, and tag-publishing contracts; it does not replace hands-on play testing. The tag workflow verifies the final approval JSON, image hashes, approved-code ancestry, structural validation, and fresh desktop/mobile Chromium before publication. It still does not invent human judgment or physical-device results.


## Modern arcade expansion

The collection includes 32 playable games: eight original cabinets, sixteen practice worlds listed below, and eight expeditions. The release gallery covers the lobby plus every game in both viewports (66 images). The formal release still requires the documented human review.

- **Traffic Town** — Read traffic signs & choose safe actions. Complete a round, inspect explanations, replay for a fresh set, and check one saved completion with sound off.
- **Street Safety Scout** — Identify signs, signals, vehicle lights, roadside warnings, and hazards. Complete a fifteen-stop route, inspect explanations, replay for unseen scenes, and check one saved completion with sound off.
- **Weather Watchers** — Read sky clues and simple forecasts. Complete all 25 picture challenges across four advancement levels and check one saved completion with sound off.
- **Garden Grow & Harvest** — Build, plant, care, harvest, and store. Complete all 24 picture challenges across four advancement levels and check one saved completion with sound off.
- **Pocket Planet** — Planning a budget. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Scam Sleuth** — Spotting online tricks. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Kindness Quest** — Listening & boundaries. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Fact Finder** — Checking claims & sources. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Repair Café** — Repair before replacing. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Time Trail** — Planning & tradeoffs. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Garden Guardians** — Resource care & diversity. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Energy Island** — Energy storage & systems. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Reuse Rally** — Reuse & thoughtful sorting. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Robot Rover** — Sequencing & debugging. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Lemonade Lab** — Costs, demand & small business. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Beat Builder** — Rhythm, patterns & creativity. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.


### Eight new expeditions

- **Bridge Buddies** — Test, improve, try again.
- **Water Works** — See how a system connects.
- **Harbor Helpers** — Plan deliveries together.
- **Pantry Picnic** — Use what you already have.
- **Compass Cove** — Read landmarks and directions.
- **Cipher Club** — Make meaning with a shared key.
- **Trade Town** — Compare the whole deal.
- **Critter Council** — Design for different needs.

See [the expedition guide](EXPEDITIONS.md) for game mechanics and new artwork.
