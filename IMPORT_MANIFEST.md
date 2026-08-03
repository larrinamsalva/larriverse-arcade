# First Import Manifest

This branch establishes the LarriVerse Arcade lobby and records the first recovered game batch.

## Browser cabinets

| Source file | Target path | Preparation |
|---|---|---|
| `KidsCoin_Family_App (5).html` | `games/kidscoin-family/index.html` | Preserve as standalone HTML |
| `brain_sweat_full_expanded.html` | `games/brain-sweat-expanded/index.html` | Add document wrapper and title |
| `brain_sweat_life_skills_expansion.html` | `games/brain-sweat-life-skills/index.html` | Add document wrapper and title |
| `bubble_resonance_phi369_v3.html` | `games/bubble-resonance-phi369/index.html` | Add document wrapper and title |
| `chill_brain_rewards_onboarding.html` | `games/chill-brain-rewards/index.html` | Add document wrapper and title |
| `creature-catcher.html` | `games/creature-catcher/index.html` | Preserve as standalone HTML |
| `road-trip-quest (2).html` | `games/road-trip-quest/index.html` | Normalize filename only |
| `road-trip-quest-gps.html` | `games/road-trip-quest-gps/index.html` | Preserve Leaflet/GPS prototype |

## Source labs

- `kidscoin-platform.jsx` → `games/kidscoin-react-source/kidscoin-platform.jsx`
- `ChillBrain_FULL_v3.zip` → extracted under `games/chill-brain-native/`

## Validation already completed on the prepared bundle

- Arcade JavaScript passes `node --check`.
- The catalog resolves all eight browser game paths.
- The arcade and catalog serve successfully through a local HTTP server.
- SHA-256 values for every recovered upload are stored in `SOURCE_CHECKSUMS.json`.

The catalog entries remain marked `available: false` on this scaffold branch until the recovered files themselves are committed. This prevents broken Launch buttons from being presented as playable.
