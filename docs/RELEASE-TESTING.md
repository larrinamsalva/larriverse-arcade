# LarriVerse release testing: start here

The current candidate has 32 games, a 66-image desktop/mobile gallery, and six KidsCoin lessons with 20 questions each. KidsCoin rounds still contain three questions. Repair Café draws eight unique repairs from its twenty-scenario bank.

Automated checks provide evidence. The hands-on desktop, physical-phone, gallery, print, and final release checks remain human decisions.

## 1. Confirm the live candidate

Open [Deployment Readiness](https://larrinamsalva.github.io/larriverse-arcade/qa/readiness.html). Confirm **5/5**, **32/32** routes, and hidden private files. Keep the displayed source commit with your test notes. If it changes during testing, confirm which build the reports and gallery describe before final approval.

## 2. Test on the desktop or laptop

Open [Guided QA](https://larrinamsalva.github.io/larriverse-arcade/qa/), select **Desktop or laptop browser**, and enter the actual device/browser and tester name or initials.

Start with these recent changes, then complete all 32 cabinet tasks shown by the console:

| Game | Check during play |
| --- | --- |
| KidsCoin Family | Six lessons show 20 questions each and 120 total. Open learning without a parent PIN, finish a three-question round, and confirm a chore reward still waits for parent approval. |
| Repair Café | Complete eight different repairs. Try a later step first and read the feedback. Finish the eighth repair and confirm saved completion and replay. |
| Traffic Town | Complete four ten-question rounds and confirm all 40 signs appear once before the bank cycles. |
| Street Safety Scout | Complete two fifteen-stop routes, confirm three scenes from each of the five safety zones per route, and verify the second route uses unseen scenarios. |
| Weather Watchers | Complete all 25 picture challenges, advance through four levels, and inspect sky scenes and forecast panels in light and dark themes. |
| Garden Grow & Harvest | Complete all 24 picture challenges, advance through four levels, and inspect the tools, plants, harvest, and freshness guidance in light and dark themes. |
| Creature Catcher and Road Trip Quest | Change the learning path, play, reload, and confirm the selected path and local progress persist. |

Complete the six device-wide checks: controls, accessibility, backup/restore, privacy, sound, and device comfort. Review the Goals, Learning Day, Passport, and Family Report print output using the [full release checklist](RELEASE-CHECKLIST.md). Mark only checks you actually completed. Export the desktop QA JSON once the report is complete.

## 3. Test on a real phone

Open the same [Guided QA link](https://larrinamsalva.github.io/larriverse-arcade/qa/) in the phone's normal browser and select **Physical phone browser**. Use the real phone/browser description and tester name or initials.

Complete all 32 cabinet tasks with touch, then all six device-wide checks. Include scrolling, orientation, enlarged text, contrast, reduced motion, sound, and backup/restore. Desktop mobile emulation cannot supply this report. Export the phone QA JSON and move it to the computer using your usual trusted method.

## 4. Review the gallery

Download the successful Browser QA gallery artifact, or use a verified gallery review pack prepared from the same candidate. Extract the ZIP and open `gallery-review/index.html` when using the prepared test pack; GitHub's gallery-only artifact places `index.html` at its root.

Inspect all 66 images for readable controls, clipping, useful alt text, and private data. The gallery begins pending. Approve or reject each image based on your inspection, complete the five gallery checks, and export the gallery approval JSON only when every image has genuinely passed.

## 5. Keep these three files

| Evidence file | Produced by |
| --- | --- |
| Desktop QA JSON | Guided QA on the actual desktop/laptop |
| Physical-phone QA JSON | Guided QA on the actual touch-capable phone |
| Gallery approval JSON | The offline gallery review |

Open the [Release Room](https://larrinamsalva.github.io/larriverse-arcade/qa/release-room.html), check the deployment identity, and import all three files. Resolve every failure before exporting its private evidence bundle.

Import that bundle into [Final Approval](https://larrinamsalva.github.io/larriverse-arcade/qa/release-approval.html). Make the final human decision only after the required play, touch, sound, accessibility, backup, privacy, visual, and print checks are complete. Keep the evidence private until the repository's documented release process is ready to use it.

A green automated run, a reachable route, or this guide does not mark a human check as passed. The existing approval verifier, image hashes, code ancestry, and release workflow remain required before a formal release tag.
