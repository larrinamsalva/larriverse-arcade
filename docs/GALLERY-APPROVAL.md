# LarriVerse Arcade — Gallery and Release Approval

The automated Browser QA workflow produces two evidence artifacts after a successful run:

- `larriverse-browser-qa-<run>` — screenshots, Playwright report, and failure traces.
- `larriverse-gallery-review-<run>` — a self-contained offline gallery review folder.

## Review the 18 images

1. Download and unzip the gallery review artifact.
2. Open `index.html` in a modern browser.
3. Inspect the lobby and all eight cabinets in desktop and mobile views.
4. Approve, reject, or leave each image pending.
5. Review or edit the proposed alt text.
6. Complete the five privacy, layout, and human-boundary checks.
7. Export the `larriverse-gallery-approval` JSON file.

The review page works offline. It loads only the images inside the downloaded folder, stores a draft locally when the browser permits it, and uploads nothing.

## Complete desktop and physical-phone QA

Serve the repository over HTTP and open `qa/index.html` once on a desktop browser and once on a physical phone. Complete all eight cabinet focus tasks and export a `larriverse-release-qa` report from each device.

Browser emulation is useful evidence, but it is not a physical-phone pass. The phone report must come from the physical device named in the final approval.

## Export the final approval

Open `qa/release-approval.html` from the served repository and import:

1. The approved gallery JSON.
2. The completed desktop QA JSON.
3. The completed physical-phone QA JSON.

Record the approver, physical phone, and six final confirmations. The console exports a `larriverse-release-approval` JSON file. It uploads nothing and cannot create a tag.

## Commit approved evidence

Before `v1.0.0` can publish, a final evidence commit must contain:

- `docs/release-approval.json`
- All 18 exact approved images at `docs/screenshots/<project>/<subject>.png`

The tag workflow recomputes every image SHA-256 digest, checks all 16 manual cabinet results, verifies the approved code commit is an ancestor of the tag, reruns structural validation, and reruns desktop/mobile Chromium. A missing, incomplete, or changed approval record blocks publication.

## Boundaries

Gallery approval confirms only the selected images. It does not replace gameplay judgment, physical-device behavior, sound checks, touch comfort, accessibility judgment, backup restoration, or privacy review.
