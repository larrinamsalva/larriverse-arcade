# LarriVerse Arcade ✦

A GitHub Pages-ready home for Larrina's playable game prototypes, learning worlds, reward systems, and experimental projects.

## First arcade drop

The first recovered batch contains eight browser prototypes:

- KidsCoin Family App
- Brain Sweat Expanded
- Brain Sweat Life Skills
- Bubble Resonance Φ369
- Chill Brain Rewards & Onboarding
- Creature Catcher
- Road Trip Quest
- Road Trip Quest GPS

It also contains two source labs:

- KidsCoin React platform (`kidscoin-platform.jsx`)
- Chill Brain React Native / Expo source

## Architecture

Each browser game lives in its own `games/<slug>/index.html` cabinet. The root arcade lobby reads `games/catalog.json`, which lets us add games without rewriting the lobby. Larger React and React Native projects stay in source-lab folders until they receive independent build pipelines.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root whenever `main` changes. In repository settings, choose **Pages → Source → GitHub Actions**.

## Project principles

- Preserve Larrina's original concepts before refactoring them.
- Keep every game independently launchable.
- Share profiles, rewards, achievements, and accessibility after the cabinets are stable.
- Treat `$KIDZ` / KZC as a fictional in-app reward system, not real cryptocurrency.
- Parent-review child-facing prototypes before public release.

## License

MIT for repository code unless a file states otherwise. Third-party fonts, maps, libraries, and media remain subject to their own licenses.
