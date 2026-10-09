# LarriVerse 1.0 polish

This pass keeps exactly **30 games**: eight original cabinets, fourteen practice worlds, and eight expeditions. It preserves independent engines, saved progress, learning content, fictional KC, and existing real-world safety boundaries. `release.json` remains a release candidate with mandatory human approval.

## Gallery evidence

The gallery's original description map stopped at 20 games. The eight expeditions therefore produced 16 desktop/mobile descriptions beginning with `undefined`. `scripts/gallery-metadata.mjs` now explicitly describes the clean opening view of the lobby and every game. Unknown subjects, missing titles, or unsupported viewports stop the build.

`npm run gallery:verify` checks exactly 62 unique subject/view pairs, deterministic titles and descriptions, image paths, viewports, PNG dimensions, byte counts, and SHA-256 hashes. Browser QA uploads the offline review bundle only after those checks pass. Human reviewers still inspect the images and can revise alt text. Automated descriptions and screenshots are **candidate evidence**, not human approval.

## Shared cabinet shell

`assets/cabinet-shell.js` adds a small shared layer to the original eight HTML pages. It exposes LarriVerse branding, game/skill context, Back to Arcade, the shared local player summary, and a native comfort dialog. Existing result dialogs keep their own replay/continue controls and gain an arcade return where needed.

The same comfort dialog is available from practice worlds, expeditions, progress views, and QA pages. It uses Arcade SDK v3 settings, restores keyboard focus, and pauses running timed cabinets through their existing pause buttons. Resuming remains a deliberate player action. Chill Brain's cabinet comfort choices stay synchronized with shared settings; its sound and session-length choices remain cabinet-owned.

Creature Catcher's original overlays remain part of its game, with dialog labels, inert background controls, a keyboard focus loop, and arcade/comfort links. Its meadow can scroll on small screens with larger text instead of disappearing behind a tall header. Its start button now says “Start exploring” once the reviewed question bank is ready; gallery capture waits for that ready state instead of showing a stale loading label.

## Discovery

The illustrated lobby and all 30 searchable/filterable cards remain. Optional sections provide:

- **Continue Playing:** the three most recent recorded games. Saved trips resume where supported; short boards begin a fresh round.
- **Recommended for You:** three catalog choices, with the latest game's topic considered when local sessions exist. These are invitations, not learning conclusions.
- **Try Something New:** up to three games without a recorded local session, distinct from the recommended choices.

`assets/arcade-discovery.js` is a deterministic, read-only calculation over the catalog and aggregate local session counters. It stores no recommendation history and reads no answers, family notes, age, PIN, or location. It uploads nothing and creates no assignments, rankings, streak demands, or deadlines. Topic filters retain Money, Digital Life, Build & Create, Everyday Life, People, Planet, and Adventures.

## Comfort and reflow

`assets/arcade-accessibility.css` supplies wrapping, shrinkable grid/flex children, responsive cards, scrolling dialogs, visible focus, 44px minimum control heights, and high-contrast text. Learning-path buttons use two columns on phones so their labels remain readable. Larger text allows navigation and tab rows to wrap and moves the lobby shortcuts into normal document flow to keep controls reachable.

Reduced motion stops decorative CSS animation and automatic lobby spotlight rotation, including the operating-system preference. Explicit previous/next spotlight buttons remain available. Road Trip Quest offers stationary items in its existing three lanes when motion is reduced: move to the matching lane and choose the item. Inventory, collection rewards, and battles retain their original rules. Bubble Resonance adds numbered bubble types, a current/next bubble announcement, keyboard aiming, and touch aiming controls. Sound starts off; its color themes and physics remain.

## Release boundary

The full structural suite, desktop/mobile Chromium suite, focused 320/390/768/1024/1440px checks, backups, safe exports, and 62-image gallery verification provide automated evidence. They cannot approve gameplay feel, real phone touch/layout, sound comfort, print output, or visual quality. Follow [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md), [DEVICE-QA.md](DEVICE-QA.md), and [GALLERY-APPROVAL.md](GALLERY-APPROVAL.md). No approval JSON, approved screenshots, release tag, or final release decision is fabricated by this PR.
