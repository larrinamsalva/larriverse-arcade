# LarriVerse Arcade 1.0 — Deployment and Evidence Rehearsal

Phase 15 added a rehearsal layer between automated CI and final human release approval. Phase 16 connects that layer to one Release Room and one shared schema-v2 evidence contract. Neither phase replaces physical-device testing or creates approval.

## 1. Verify the published build

Open `qa/readiness.html` from the deployed site. The readiness page checks, from the same origin:

- HTTPS or a local development context;
- the generated `deployment.json` identity;
- the release version, candidate, and state;
- all eight cabinet routes;
- that `docs/release-approval.json`, repository workflows, and release-verification scripts are not public Pages files.

The deployment identity records the exact source commit, build time, workflow run, release-manifest digest, and public QA routes. Search-engine indexing is not used as release evidence.

A green readiness page proves the intended static build is reachable. It does not prove gameplay, sound, touch comfort, accessibility judgment, or backup behavior.

## 2. Collect the three human files

Use `qa/index.html` to export:

1. one complete schema-v2 `desktop` report;
2. one complete schema-v2 `physical-phone` report from a touch-capable phone browser.

Use the offline gallery-review artifact to export one `larriverse-gallery-approval` JSON with 18 approved images.

The canonical QA fields are `deviceClass` and `environment.maxTouchPoints`. Evidence Preflight, Release Room, and Final Approval all load `qa/evidence-contract.js` so those fields cannot drift between tools.

The QA pages upload nothing and request no location. Keep the JSON files in a trusted local folder until final approval.

## 3. Run evidence preflight

Open `qa/evidence-preflight.html` and load the three files. The preflight checks:

- release and candidate agreement;
- the gallery schema, reviewer metadata, five global checks, 18 image approvals, hashes, and alt text;
- schema-v2 desktop and physical-phone device classes;
- eight reachable and passed cabinets per device;
- all six device-wide checks;
- phone touch capability;
- location remaining ungranted;
- desktop and phone evidence being different files.

The optional rehearsal summary uses `larriverse-evidence-rehearsal`. It cannot be committed as `docs/release-approval.json`, and the release workflow does not accept it.

## 4. Create the private Release Room handoff

Open `qa/release-room.html` from the live HTTPS deployment. It repeats the deployed-build identity check, validates the three original files through the shared contract, and exports `larriverse-evidence-bundle`.

The bundle preserves the exact original JSON text and SHA-256 digest for the gallery, desktop, and physical-phone files. It also records the deployed source commit and release-manifest digest. It uploads nothing and does not approve the release.

## 5. Use the separate approval console

Only after preflight and the Release Room are green, open `qa/release-approval.html`. Import the bundle—or the three original files—then record the separate human release decision. That page exports `larriverse-release-approval` only after all six final confirmations are checked.

Final release still requires the exact approved images and final approval JSON to be committed, verified, and included in the ancestry of the `v1.0.0` tag.

## Privacy boundary

Readiness, preflight, and the Release Room:

- use same-origin static files only for application data;
- upload nothing;
- use no analytics;
- request no location, camera, microphone, contacts, or background access;
- do not inspect arcade saves;
- do not write GitHub files, tags, or releases.

The Release Room contains user-activated links to GitHub Actions so a reviewer can find the deployment run and gallery artifact. It does not contact GitHub until a person follows a link.
