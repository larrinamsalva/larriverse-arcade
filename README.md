# LarriVerse Arcade ✦

A GitHub Pages-ready home for Larrina's playable game prototypes, learning worlds, reward systems, and experimental projects.

## Current playable cabinet

### Creature Catcher — Alpha

Creature Catcher is the first concept integrated as a true LarriVerse cabinet. A 60-second safari asks players to catch creatures, answer mixed learning questions, and build a persistent field guide.

It is also the first game connected to the shared arcade profile:

- local player XP and levels
- fictional KC rewards
- 3-session milestone bonuses
- per-game sessions, completions, high scores, and catches
- device-local achievements and save data

Launch it from the root arcade lobby or open `games/creature-catcher/index.html`.

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

The remaining recovered concepts stay marked **Integration queued** until each one is connected to the shared profile, rewards, navigation, and validation system. That avoids publishing broken or misleading Launch buttons.

The broader recovery bundle also includes two source labs:

- KidsCoin React platform (`kidscoin-platform.jsx`)
- Chill Brain React Native / Expo source

## Architecture

Each browser game lives in its own `games/<slug>/index.html` cabinet. The root arcade lobby reads `games/catalog.json`, which lets us add games without rewriting the lobby.

`assets/arcade-sdk.js` provides the first shared browser API:

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

The SDK currently stores data in the browser with `localStorage`. No account, cloud database, real currency, or blockchain is involved.

Larger React and React Native projects stay in source-lab folders until they receive independent build pipelines.

## Validation

The repository has a zero-dependency validation command:

```bash
npm run validate
```

It checks catalog structure, unique IDs and paths, available-game files, HTML document basics, lobby integration, and the presence of the shared SDK. Pull requests also run JavaScript syntax checks through `.github/workflows/validate.yml`.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root whenever `main` changes. In repository settings, choose **Pages → Source → GitHub Actions**.

## Project principles

- Preserve Larrina's original concepts before refactoring them.
- Keep every game independently launchable.
- Share profiles, rewards, achievements, and accessibility after the cabinets are stable.
- Treat `$KIDZ` / KZC / KC as fictional in-app rewards, not real cryptocurrency.
- Keep child-facing experiences free from ads, purchases, public profiles, and gambling mechanics.
- Parent-review child-facing prototypes before public release.

## License

MIT for repository code unless a file states otherwise. Third-party fonts, maps, libraries, and media remain subject to their own licenses.
