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
    lessonsCompleted: 1,
    correctAnswers: 5
  }
});
```

Arcade SDK v2 keeps old v1 saves compatible and adds validated, cumulative per-game metrics. The SDK stores data in the browser with `localStorage`. No account, cloud database, real currency, or blockchain is involved.

Brain Sweat separates its content from the quiz engine through a JSON manifest and one file per world. This lets later content reviews unlock or revise lessons without rebuilding the interface.

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
- structured learning manifests, world and lesson IDs, review states, question schemas, answer indexes, and source counts
- queued lessons contain no unpublished questions and explain why review is required
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
- Document malformed or excluded source content instead of silently changing it.
- Parent-review child-facing prototypes before public release.

## License

MIT for repository code unless a file states otherwise. Third-party fonts, maps, libraries, and media remain subject to their own licenses.
