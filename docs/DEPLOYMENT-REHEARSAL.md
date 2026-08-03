# LarriVerse Arcade 1.0 — Deployment and Evidence Rehearsal

Phase 15 adds a rehearsal layer between automated CI and final human release approval. It does not replace physical-device testing or create approval.

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

The QA pages upload nothing and request no location. Keep the JSON files in a trusted local folder until final approval.

## 3. Run evidence preflight

Open `qa/evidence-preflight.html` and load the three files. The preflight checks:

- release and candidate agreement;
- the gallery schema, reviewer metadata, five global checks, 18 image approvals, hashes, and alt text;
- schema-v2 desktop and physical-phone roles;
- eight reachable and passed cabinets per device;
- all six device-wide checks;
- phone touch capability;
- location remaining ungranted;
- desktop and phone evidence being different files.

The optional rehearsal summary uses `larriverse-evidence-rehearsal`. It cannot be committed as `docs/release-approval.json`, and the release workflow does not accept it.

## 4. Use the separate approval console

Only after preflight is green, open `qa/release-approval.html`. That separate page combines the evidence with the human release decision and exports `larriverse-release-approval`.

Final release still requires the exact approved images and final approval JSON to be committed, verified, and included in the ancestry of the `v1.0.0` tag.

## Privacy boundary

Readiness and preflight:

- use same-origin static files only;
- upload nothing;
- use no analytics;
- request no location, camera, microphone, contacts, or background access;
- do not inspect arcade saves;
- do not write GitHub files, tags, or releases.
