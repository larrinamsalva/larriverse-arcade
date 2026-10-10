# LarriVerse Arcade ✦

A free, kid- and teen-friendly arcade with **33 playable games**, including Kids Sudoku World's 60 progressive puzzles, original illustrated worlds, device-local progress, and practical skills to explore together. [Play the arcade](https://larrinamsalva.github.io/larriverse-arcade/).

The magical visual system adds cheerful daylight, moonlit dark mode, a follow-device option, richer SVG materials and scenery, and **Bloom**, a hideable local adventure buddy with a different welcome and hint for every game. See the [magical makeover guide](docs/MAGICAL-MAKEOVER.md).

The latest expansion adds **eight new expeditions**: bridges, water networks, island deliveries, pantry planning, compass maps, secret codes, shopping comparisons, and inclusive town building. See [the expedition guide](docs/EXPEDITIONS.md).

Traffic Town adds a 7+ road-awareness world with 40 unique common U.S. traffic-sign questions served ten at a time without repeats until the bank cycles.

**Street Safety Scout is Game 30:** a visual 8+ companion with 36 unique scenarios covering signal lights, caution signs, emergency awareness, vehicle lights, and hidden roadway hazards. Each untimed route draws three stops from each zone and rotates unseen scenes before repeating them.

**Weather Watchers and Garden Grow & Harvest are Games 31 and 33.** Weather Watchers teaches sky observation, common cloud clues, weather preparation, and simple forecast symbols through 60 illustrated challenges. Garden Grow & Harvest teaches bed building, seed and transplant care, crop support, harvesting, and food freshness through 60 illustrated challenges. Both use four visible learning ranks, fifteen distinct questions per rank.

The modern expansion adds twelve adventures: **Pocket Planet, Scam Sleuth, Kindness Quest, Fact Finder, Repair Café, Time Trail, Garden Guardians, Energy Island, Reuse Rally, Robot Rover, Lemonade Lab, and Beat Builder**. These cover money choices, privacy, media literacy, listening and boundaries, repair and reuse, planning, resource care, coding, small business, and music. See [the full game guide](docs/MODERN-ARCADE.md) for mechanics, architecture, and artwork provenance.

## Playable cabinets

### Creature Catcher

A 60-second learning safari where players catch creatures, answer mixed questions, and build a persistent field guide.

### Bubble Resonance Φ369

A twenty-level bubble-shooter built from Larrina's original PHI·369 prototype. Players aim glossy round numbered bubbles, bank shots, match six frequency colors, drop floating clusters, raise Tφ coherence, and build resonance through PHI-chain score multipliers.

The frequency names are preserved as creative game themes. The cabinet explicitly does not present them as medical claims.

### Road Trip Quest

The first larger adventure cabinet. Players steer across three lanes, collect sixteen types of roadside power items, charge a boss meter, use their inventory during question battles, recruit six roaming heroes, and confront eight city bosses across math, science, reading, and trivia.

The campaign preserves Larrina's original **Collect · Battle · Conquer** structure, city roster, bosses, rewards, Hero Collection, and educational question system. Campaign progress is saved separately on the device, while completed city battles award shared LarriVerse XP and fictional KC.

### Brain Sweat Life Skills

The first content-driven learning cabinet and reusable lesson engine. It preserves the recovered prototype's six-world, 24-lesson organization:

- Cooking & Food Sovereignty
- Body & Health
- Law & Your Rights
- Home Skills
- Survival Skills
- Mind & Emotions

Twelve reviewed lessons are playable at launch with 60 questions, saved personal bests, lesson completion, world mastery, search, filters, random lesson selection, and 3·6·9 rewards. The remaining lessons stay visible as **Review queued** rather than silently publishing medical, legal, electrical, foraging, or other high-stakes material.

The recovered source contains 239 readable questions and one malformed media-literacy question. The malformed item is excluded and documented instead of being silently rewritten.

### Brain Sweat Expanded

The hands-on activity hub preserves the recovered prototype's original 14-world skill map, three guides, four daily quest slots, skill tree, parent report, and beginner/intermediate/advanced organization.

The source contains **219 activities** across eight tool-sequence worlds, four action-choice worlds, a 24-transaction checkbook simulation, and twelve voltage circuit challenges. This reviewed release publishes **69 activities across six worlds**:

- Checkbook & Balancing — all three source tiers
- Basic Coding — all three source tiers
- Landscaping — beginner and intermediate
- Retail & Cashier — beginner and intermediate
- Community Service — beginner
- Cooking & Nutrition — beginner

Plumbing, voltage, caregiving, welding, roofing, HVAC, emergency skills, farming and animals, and higher-risk tiers remain visible as **Review queued**. Their source names and counts stay in the audit, but their actionable payloads are not shipped to the playable interface.

The cabinet supports source-style tool-order puzzles, marked action choices, ledger classification, three selectable guides, safe daily quests, device-local progress, reviewed-world completion bonuses, and a parent-facing source audit. Progress represents game practice only. It is not a license, job qualification, safety clearance, medical assessment, or permission to perform hazardous work.

### Chill Brain Rewards

The first non-competitive calm-and-focus cabinet. It turns the recovered rewards and onboarding mockup into a playable local experience while preserving its terminology and structure:

- six onboarding steps
- Little Sprout, Explorer, Challenger, and Dreamer paths
- eight spirit-guide avatars
- Leaf Breathing, Wave Breathing, Chaos Shield, and Sleep Moon Journey
- six source skill tracks and twelve badge concepts
- source-length sessions plus an optional 45-second preview mode
- pause, leave-gently, and finish-early controls with no failure state
- reduced motion, high contrast, large text, and optional sound controls
- device-local guide, age, settings, streak, mission, skill, and badge progress

The original mockup references Hemi-Sync. This repository does not include Hemi-Sync audio and does not claim therapeutic effects. Optional **Brain Tune** sound is a quiet, locally generated ambience, defaults off, and can be disabled at any time. Skill percentages represent game practice only—not mental-health or nervous-system measurements.

### KidsCoin Family

A device-local, parent-controlled family reward cabinet grounded in the recovered KidsCoin prototype. It preserves the useful family-system ideas while deliberately removing the source's simulated token-price, wallet-address, staking, interest, and purchase framing.

The playable release includes:

- up to six local explorer profiles with eight source-inspired avatars
- four task groups: The Forge, The Shield, The Scrolls, and The Quest
- twelve default family tasks with 3, 6, or 9 Family KC rewards
- parent approval and rejection queues before task rewards are granted
- six reviewed wallet-skill lessons with 20 questions each (120 total), drawing three questions per round, about earning, needs and wants, saving goals, reading a ledger, planning rewards, and the fictional-reward boundary
- a device-local Family KC ledger with earn and redemption history
- eight parent-approved reward requests with no cash checkout
- custom parent-created tasks and rewards
- parent-issued 3·6·9 bonuses and grace days
- the source's 3-, 7-, 14-, and 30-day milestones
- private family notes that never leave the browser
- a four-digit convenience PIN for Parent Mode

**Family KC and shared arcade KC are separate fictional systems.** Family KC belongs to one local explorer profile and is used only for parent-approved family rewards. Shared arcade KC belongs to the LarriVerse profile and records play across cabinets. Neither has cash value, a market price, a wallet address, staking, blockchain support, or a purchase path.

The Parent Mode PIN prevents casual taps only. It is hashed before local storage, but it is not an online account password or strong protection against someone with browser developer access.

## Shared arcade profile

All playable cabinets connect to the shared arcade profile:

- device-local player XP and levels
- fictional shared arcade KC
- 3-session milestone bonuses
- per-game sessions, completions, high scores, and activity totals
- cabinet-specific numeric metrics through Arcade SDK v3
- device-local achievements and save data

Launch any live game from the root arcade lobby.

## Release candidate

The arcade is at **1.0.0 rc.1**, with 33 playable games. Automation produces candidate evidence; it does not approve a formal release. The existing [release checklist](docs/RELEASE-CHECKLIST.md) still requires hands-on desktop play, real physical-phone QA, human visual/gameplay approval, and print review. No final approval record has been created by this polish pass.

Start the hands-on phase with the [desktop and phone testing guide](docs/RELEASE-TESTING.md). It links the live QA console, explains the three evidence files, and keeps incomplete checks pending.

All eight recovered browser concepts are now connected to the shared arcade. Larger React and React Native recovery sources are historical inputs, not playable cabinets shipped in this repository.

## Architecture

Each browser game lives in its own `games/<slug>/` cabinet. The root arcade lobby reads `games/catalog.json`, allowing new games without rewriting the lobby.

`assets/arcade-sdk.js` provides the shared browser API, device-local theme preferences, and the reusable Bloom guide:

```js
const profile = LarriVerseArcade.summary();

const result = LarriVerseArcade.award('game-id', {
  xp: 36,
  kc: 6,
  score: 90,
  completed: true,
  metrics: {
    activitiesCompleted: 1,
    practiceRuns: 1
  }
});
```

Arcade SDK v3 keeps old v1 saves compatible and adds validated, cumulative per-game metrics. The SDK stores data in the browser with `localStorage`. No account, cloud database, real currency, or blockchain is involved.

Brain Sweat Life Skills separates lessons from its quiz engine through a JSON manifest and one file per world. This lets later content reviews unlock or revise lessons without rebuilding the interface.

Brain Sweat Expanded uses a small `activities.json` source manifest and four world bundles. `loader.js` combines those bundles in the original source order before the activity engine starts. Review-queued tiers contain source counts and review explanations but no actionable activity payloads.

Chill Brain separates source-grounded profiles, missions, skills, badges, privacy rules, and audio boundaries into `sessions.json`. The interface reads that manifest at runtime, and CI verifies its source counts and safety defaults.

KidsCoin Family separates source-grounded family features, tasks, reviewed lessons, rewards, milestones, and finance/privacy boundaries into `family.json`. Family profiles and the family ledger use a cabinet-specific localStorage record; shared arcade progress remains in the Arcade SDK record.

The original eight cabinets keep independent engines and local saves. `assets/cabinet-shell.js` adds shared branding, player context, comfort controls, and an arcade return while preserving their replay and continue actions. `assets/arcade-accessibility.css` provides reflow and focus rules across game and progress routes.

Twenty-one shared-engine worlds use `assets/skill-games.js`, which implements thirteen practice modes and delegates eight expedition modes to `assets/expedition-games.js`. Their definitions live in `assets/skill-worlds.js` and `assets/expedition-worlds.js`. Street Safety Scout has a dedicated visual engine and 60-scenario module; the lobby reads every cabinet from `games/catalog.json`. Each game preserves its individual board and safety notes. See [MODERN-ARCADE.md](docs/MODERN-ARCADE.md), [EXPEDITIONS.md](docs/EXPEDITIONS.md), and [V1-POLISH.md](docs/V1-POLISH.md).

`assets/arcade-discovery.js` computes optional Continue Playing, Recommended for You, and Try Something New links from the current catalog and aggregate local session history. It writes no records and makes no ability judgment. Search and topic filters still expose all 33 games.

## Validation

Run the zero-dependency validation command:

```bash
npm run validate
```

It checks:

- catalog structure, unique IDs, safe paths, and declared SDK versions
- every available cabinet's HTML document and route back to the lobby
- local CSS and JavaScript dependencies referenced by playable games
- shared SDK load order before cabinet code
- JavaScript syntax for the lobby, shared SDK, and playable cabinet scripts
- Brain Sweat Life Skills manifests, world and lesson IDs, review states, question schemas, answer indexes, and source counts
- queued lessons contain no unpublished questions and explain why review is required
- Brain Sweat Expanded's 14 worlds, 219 source activities, 69 reviewed activities, tier counts, tool references, choice answers, ledger transactions, and empty queued payloads
- Brain Sweat Expanded loads SDK, content loader, and game engine in that order and keeps the real-world competence boundary explicit
- Chill Brain's six onboarding steps, four paths, eight avatars, four missions, six skills, and twelve badges
- Chill Brain sound defaults off, profiles remain device-local, and the Hemi-Sync / medical-claim boundary stays explicit
- KidsCoin Family's source features, eight avatars, four task groups, twelve tasks, six reviewed lessons, eight reward requests, and four streak milestones
- KidsCoin Family keeps rewards fictional and device-local, loads the SDK first, hashes the local PIN, and excludes token-price, staking, blockchain, geolocation, and real-purchase code
- lobby integration and playable-cabinet counts
- all 33 contextual Bloom guides, three saved themes, local-only behavior, and reduced-motion coverage
- detailed Bridge Buddies, Lemonade Lab, Beat Builder, Robot Rover, Traffic Town, Street Safety Scout, and Pantry Picnic artwork contracts

Pull requests run the same checks through `.github/workflows/validate.yml`. Complete browser QA uses the pinned runner in `.github/workflows/browser-qa.yml`:

```bash
npm install --no-save --no-package-lock @playwright/test@1.55.0
npx playwright install chromium
npm run test:browser
npm run gallery:build
npm run gallery:verify
```

The gallery contains the lobby plus 33 games in desktop/mobile Chromium: **68 images**. Explicit descriptions, PNG dimensions, byte counts, and SHA-256 hashes are verified before the offline human review bundle is uploaded. Missing descriptions fail the build. See [BROWSER-QA.md](docs/BROWSER-QA.md) and [GALLERY-APPROVAL.md](docs/GALLERY-APPROVAL.md).

Repository description, homepage, and topic suggestions are documented in [REPOSITORY-METADATA.md](docs/REPOSITORY-METADATA.md).

## GitHub Pages

The workflow in `.github/workflows/pages.yml` validates and builds an allowlisted static site when `main` changes. Private approval evidence, repository scripts, and workflow files are excluded from publication. In repository settings, choose **Pages → Source → GitHub Actions**.

## Project principles

- Preserve Larrina's original concepts before refactoring them.
- Keep every game independently launchable.
- Share profiles, rewards, achievements, and accessibility after the cabinets are stable.
- Treat `$KIDZ` / KZC / KC as fictional in-app rewards, not real cryptocurrency.
- Keep child-facing experiences free from ads, real purchases, public profiles, gambling mechanics, and location uploads.
- Keep family profiles, approvals, notes, and reward histories device-local and parent-controlled.
- Clearly separate creative themes from medical or scientific claims.
- Keep high-stakes learning material behind visible review gates until qualified review is complete.
- Treat wellness progress as game activity, never as diagnosis or health measurement.
- Treat hands-on progress as game practice, never as competence, certification, or permission to perform hazardous work.
- Keep optional audio off by default and document branded or therapeutic-source references without imitating them.
- Document malformed or excluded source content instead of silently changing it.
- Parent-review child-facing prototypes before public release.

## License

MIT for repository code unless a file states otherwise. Third-party fonts, maps, libraries, and media remain subject to their own licenses.

**60-challenge audit:** Run `npm run audit:worlds` to see verified counts for all arcade games. Some still need genuine new levels; see [the game-by-game audit](docs/WORLD-60-LEVEL-AUDIT.md). Do not count repeated free-play sessions as different challenges.
