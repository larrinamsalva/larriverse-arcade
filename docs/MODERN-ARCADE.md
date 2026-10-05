# LarriVerse: 28 worlds for curious kids

The arcade now contains twenty skill adventures and the original eight cabinets. The latest eight adventures are described in [the expedition guide](EXPEDITIONS.md). The lobby uses illustrated covers, short descriptions, skill filters, search, a surprise-game launcher, and the existing profile and comfort controls. There is no required sign-up, advertising, checkout, or public leaderboard. Ages are broad suggestions; adults can help younger players with reading.

| Game | What players do | Skill practiced |
| --- | --- | --- |
| Pocket Planet | Pack three picnic needs and protect savings from a 24-coin budget | Needs, wants, saving, tradeoffs |
| Scam Sleuth | Investigate six messages with shuffled choices and explanatory feedback | Privacy, urgency tricks, trusted verification |
| Kindness Quest | Help five treehouse friends through small social situations | Listening, boundaries, repair, asking for support |
| Fact Finder | Sort eight cards into evidence, opinions, ads, or claims needing checks | Source awareness and media literacy |
| Repair Café | Put the steps of three small pretend repairs in order | Inspection, reuse, preparation, testing |
| Time Trail | Plan a route around rocks, collect three flags, and reach a picnic | Planning, route tradeoffs, iteration |
| Garden Guardians | Plant six plots with diverse plants and share twelve water drops across days | Limited resources and biodiversity |
| Energy Island | Build a power mix and test it across sunny, cloudy, night, and breezy conditions | Supply, storage, and system thinking |
| Reuse Rally | Sort ten objects using clearly stated Toy Town rules | Reuse and local waste rules |
| Robot Rover | Build and debug command sequences across three grid worlds | Algorithms, sequencing, debugging |
| Lemonade Lab | Choose inventory and price for four days, then inspect costs, sales, and profit | Small business decisions and ledgers |
| Beat Builder | Compose in a three-track, sixteen-step sequencer, solve a pattern challenge, or save a freestyle | Rhythm, patterns, creative expression |

## Technical guide

New worlds have independent `games/<slug>/index.html` routes. `assets/skill-worlds.js` owns metadata and scenario content. `assets/skill-games.js` implements twelve modes and delegates eight new modes to `assets/expedition-games.js` with one common game shell. `assets/skill-games.css` provides responsive boards, touch targets, keyboard focus, reduced motion, and high contrast. `assets/classic-polish.css` adds finishing to the original games; their gameplay and storage remain independently owned.

Finishing a round awards shared XP, three fictional KC, one completion, and numeric practice metrics through the existing Arcade SDK. Points summarize game choices, not real-world competence or personal worth. Progress appears in the passport and family report and travels through the existing schema-checked backup. A result cannot award twice by closing and reopening the same round. Restart begins a new practice run. Unfinished boards are not persisted; completed runs and personal bests are.

Scenarios and repair orders shuffle where useful. The route, robot, energy, garden, and business simulations have deliberately stable conditions so players can learn by trying a new plan. The energy and market rules are simplified toy models, not real engineering or financial forecasts. Toy Town's waste rules are explicit and are not a claim that every local service accepts the same materials.

All sound is generated locally at low volume and starts off. Music playback pauses when the page is hidden, and leaving the page stops timers and audio. Fullscreen is not required. No canvas or WebGL support is required for these twenty worlds; they use semantic HTML controls so they work on older phones and with keyboard navigation.

## Original artwork

The production assets are `assets/worlds-atlas-v2.webp` (1600 × 1200) and `assets/expedition-atlas.webp` (1600 × 800), atlases of twenty original scenes generated with the built-in image tool. See [the production briefs](EXPEDITIONS.md#graphics-and-assets) for provenance. Game covers use CSS background positioning instead of twelve downloads. The source was converted to WebP for delivery. No external image, font, or model request is made by the new game engine or lobby. Repository code and the original generated asset are distributed under the repository's MIT license.

Generation brief: one landscape atlas, exactly four columns and three rows of equal panels, no gutters, no UI, labels, or watermarks; premium clay-toy isometric miniature worlds with rounded forms, crisp studio lighting, and saturated teal, coral, yellow, and lilac. Panel order: saving island, cyber detective city, friendship treehouse, news kiosk, toy repair workshop, park route, vegetable garden, clean-energy island, recycling station, grid robot, lemonade stand, and music studio. No realistic people or third-party logos.

## Verification

Run `npm run validate` for structural and content contracts, then `npm run test:browser` after installing the pinned Playwright runner and Chromium as described in `docs/BROWSER-QA.md`. The new full-round tests exercise all twenty game modes on desktop and mobile viewports, including saved completion, replay, and error paths. The release-manifest route tests capture all 28 cabinets and the lobby in both viewports. Gallery and QA counts now follow the manifest. The formal tagged release retains its separate physical-device and human approval gates.

### Local symbol font

`assets/fonts/arcade-emoji.woff2` is a character subset of Noto Color Emoji from `@fontsource/noto-color-emoji` 5.3.2. It supplies colorful icons on devices without an emoji font. Its SIL Open Font License is retained in `assets/fonts/OFL-NotoColorEmoji.txt`; the font keeps that license separately from the MIT project code. `assets/emoji.css` loads it locally as a fallback. FontTools 4.61.1 generated the WOFF2 subset from the characters used in the arcade's HTML, CSS, JavaScript, and JSON files.
