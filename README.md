# LarriVerse Arcade ✦

A GitHub Pages-ready home for Larrina's playable game prototypes, learning worlds, reward systems, and experimental projects.

## Playable cabinets

### Creature Catcher — Alpha

A 60-second learning safari where players catch creatures, answer mixed questions, and build a persistent field guide.

### Bubble Resonance Φ369 — Alpha

A precision bubble-shooter built from Larrina's original PHI·369 prototype. Players aim and bank shots, match six frequency colors, drop floating clusters, raise Tφ coherence, and build resonance through PHI-chain score multipliers.

The frequency names are preserved as creative game themes. The cabinet explicitly does not present them as medical claims.

Both cabinets connect to the shared arcade profile:

- device-local player XP and levels
- fictional KC rewards
- 3-session milestone bonuses
- per-game sessions, completions, high scores, and activity totals
- device-local achievements and save data

Launch either game from the root arcade lobby.

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
  catches: 3,
  completed: true
});
```

The SDK stores data in the browser with `localStorage`. No account, cloud database, real currency, or blockchain is involved.

Larger React and React Native projects stay in source-lab folders until they receive independent build pipelines.

## Validation

Run the zero-dependency validation command:

```bash
npm run validate
```

It checks:

- catalog structure, unique IDs, and safe paths
- every available cabinet's HTML document
- local CSS and JavaScript dependencies referenced by playable games
- JavaScript syntax for the lobby, shared SDK, and playable cabinet scripts
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
- Parent-review child-facing prototypes before public release.

## License

MIT for repository code unless a file states otherwise. Third-party fonts, maps, libraries, and media remain subject to their own licenses.
