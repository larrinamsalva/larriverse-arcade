# LarriVerse Arcade ✦

A GitHub Pages-ready home for Larrina's playable game prototypes, learning worlds, reward systems, and experimental projects.

## Playable cabinets

### Creature Catcher — Alpha

A 60-second learning safari where players catch creatures, answer mixed questions, and build a persistent field guide.

### Bubble Resonance Φ369 — Alpha

A precision bubble-shooter built from Larrina's original PHI·369 prototype. Players aim and bank shots, match six frequency colors, drop floating clusters, raise Tφ coherence, and build resonance through PHI-chain score multipliers.

The frequency names are preserved as creative game themes. The cabinet explicitly does not present them as medical claims.

### Road Trip Quest — Alpha

The first larger adventure cabinet. Players steer across three lanes, collect sixteen types of roadside power items, charge a boss meter, use their inventory during question battles, recruit six roaming heroes, and confront eight city bosses across math, science, reading, and trivia.

The campaign preserves Larrina's original **Collect · Battle · Conquer** structure, city roster, bosses, rewards, Hero Collection, and educational question system. Campaign progress is saved separately on the device, while completed city battles award shared LarriVerse XP and fictional KC.

### Brain Sweat Life Skills — Alpha

The first content-driven learning cabinet and reusable lesson engine. It preserves the recovered prototype's six-world, 24-lesson organization:

- Cooking & Food Sovereignty
- Body & Health
- Law & Your Rights
- Home Skills
- Survival Skills
- Mind & Emotions

Twelve reviewed lessons are playable at launch with 60 questions, saved personal bests, lesson completion, world mastery, search, filters, random lesson selection, and 3·6·9 rewards. The remaining lessons stay visible as **Review queued** rather than silently publishing medical, legal, electrical, foraging, or other high-stakes material.

The recovered source contains 239 readable questions and one malformed media-literacy question. The malformed item is excluded and documented instead of being silently rewritten.

### Brain Sweat Expanded — Alpha

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

### Chill Brain Rewards — Alpha

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

All playable cabinets connect to the shared arcade profile:

- device-local player XP and levels
- fictional KC rewards
- 3-session milestone bonuses
- per-game sessions, completions, high scores, and activity totals
- cabinet-specific numeric metrics through Arcade SDK v2
- device-local achievements and save data

Launch any live game from the root arcade lobby.

## Recovered concept vault

The first recovered batch contains eight browser concepts:

- KidsCoin Family App
- Brain Sweat Expanded
- Brain Sweat Life Skills
- Bubble Resonance Φ369
- Chill Brain Rewards & Onboarding
- Creature Catcher
- Road Trip Quest
- Road Trip Quest GPS

Concepts remain marked **Integration queued** until they are connected to shared profiles, rewards, navigation, and validation. This prevents broken or misleading Launch buttons.

The broader recovery bundle also includes two source labs:

- KidsCoin React platform (`kidscoin-platform.jsx`)
- Chill Brain React Native / Expo source

## Architecture

Each browser game lives in its own `games/<slug>/` cabinet. The root arcade lobby reads `games/catalog.json`, allowing new games without rewriting the lobby.

`assets/arcade-sdk.js` provides the shared browser API:

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

Arcade SDK v2 keeps old v1 saves compatible and adds validated, cumulative per-game metrics. The SDK stores data in the browser with `localStorage`. No account, cloud database, real currency, or blockchain is involved.

Brain Sweat Life Skills separates lessons from its quiz engine through a JSON manifest and one file per world. This lets later content reviews unlock or revise lessons without rebuilding the interface.

Brain Sweat Expanded uses a small `activities.json` source manifest and four world bundles. `loader.js` combines those bundles in the original source order before the activity engine starts. Review-queued tiers contain source counts and review explanations but no actionable activity payloads.

Chill Brain separates source-grounded profiles, missions, skills, badges, privacy rules, and audio boundaries into `sessions.json`. The interface reads that manifest at runtime, and CI verifies its source counts and safety defaults.

Larger React and React Native projects stay in source-lab folders until they receive independent build pipelines.

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
- lobby integration and playable-cabinet counts

Pull requests run the same checks through `.github/workflows/validate.yml`.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root whenever `main` changes. In repository settings, choose **Pages → Source → GitHub Actions**.

## Project principles

- Preserve Larrina's original concepts before refactoring them.
- Keep every game independently launchable.
- Share profiles, rewards, achievements, and accessibility after the cabinets are stable.
- Treat `$KIDZ` / KZC / KC as fictional in-app rewards, not real cryptocurrency.
- Keep child-facing experiences free from ads, purchases, public profiles, and gambling mechanics.
- Clearly separate creative themes from medical or scientific claims.
- Keep high-stakes learning material behind visible review gates until qualified review is complete.
- Treat wellness progress as game activity, never as diagnosis or health measurement.
- Treat hands-on progress as game practice, never as competence, certification, or permission to perform hazardous work.
- Keep optional audio off by default and document branded or therapeutic-source references without imitating them.
- Document malformed or excluded source content instead of silently changing it.
- Parent-review child-facing prototypes before public release.

## License

MIT for repository code unless a file states otherwise. Third-party fonts, maps, libraries, and media remain subject to their own licenses.
