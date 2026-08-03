# LarriVerse Arcade 1.0 — Release Room

The Release Room is the private handoff step between human testing and final release approval.

Published route after a successful Pages deployment:

`https://larrinamsalva.github.io/larriverse-arcade/qa/release-room.html`

## Why this phase exists

The guided QA export uses these canonical schema-v2 fields:

- device type: `deviceClass`
- device environment: `environment`
- physical-phone touch evidence: `environment.maxTouchPoints`

An earlier Evidence Preflight implementation checked obsolete field names (`deviceRole` and `device.maxTouchPoints`). Phase 16 removes that drift by loading one shared browser contract, `qa/evidence-contract.js`, in Evidence Preflight, the Release Room, and Final Approval.

## Release Room workflow

1. Open the Release Room from the deployed HTTPS site.
2. Run the deployment check.
3. Confirm the exact source commit, release digest, eight cabinet routes, and private-path exclusions.
4. Complete and export one schema-v2 desktop QA report.
5. Complete and export one schema-v2 physical-phone QA report from a touch-capable phone.
6. Review and approve the 18-image gallery artifact.
7. Load all three JSON files into the Release Room.
8. Export the private `larriverse-evidence-bundle` JSON.
9. Import that bundle into `qa/release-approval.html`.
10. Complete the six final human confirmations and export `larriverse-release-approval` only after the release decision is genuine.

## Evidence bundle

The bundle contains the exact original JSON text for:

- gallery approval;
- desktop QA;
- physical-phone QA.

It also contains each original SHA-256 digest and the deployed build identity. The Final Approval console recalculates all three hashes and validates every embedded document again.

The bundle:

- uses schema `larriverse-evidence-bundle` version 1;
- is limited to 6.5 MB;
- requires three distinct and valid evidence documents;
- requires a full deployed source commit and release-manifest digest;
- records `createsReleaseApproval: false`;
- does not approve the release;
- cannot create tags, releases, repository commits, or screenshots.

## Privacy boundary

The Release Room uploads nothing and uses no analytics. It does not request location, camera, microphone, contacts, or game saves. Evidence stays in memory inside the current tab until the user deliberately downloads a bundle.

The bundle contains tester names or initials, device/browser descriptions, review notes, and screenshot hashes. Treat it as private release evidence. Do not publish it through GitHub Pages.

## Authority boundary

A green deployment check proves that the intended static candidate is available. A valid evidence bundle proves that the three files are structurally compatible and tamper-evident. Neither result replaces hands-on play testing or the final human decision.

Only the separate `larriverse-release-approval` record, committed with the exact 18 approved screenshots and accepted by the repository verifier, can unlock tag publication.
