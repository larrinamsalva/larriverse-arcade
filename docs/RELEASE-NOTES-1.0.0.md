# LarriVerse Arcade 1.0

LarriVerse Arcade 1.0 turns Larrina's first recovered browser-concept collection into eight independently playable, GitHub Pages-ready cabinets with a shared device-local profile, fictional rewards, accessibility settings, validation, and clear privacy and safety boundaries.

## Eight playable cabinets

1. **KidsCoin Family App** — unlocked learning with 36 questions, parent-assigned chores, fictional Family KC, local profiles, parent-approved KC awards and reward redemptions, notes, grace days, and a family ledger.
2. **Brain Sweat Expanded** — 69 reviewed hands-on activities across six worlds while higher-risk tiers remain visible and review gated.
3. **Brain Sweat Life Skills** — 60 reviewed questions across twelve lessons in the original six-world learning map.
4. **Bubble Resonance Φ369** — a precision bubble arcade preserving the source's six colors, PHI-chain scoring, resonance, gems, levels, and creative frequency themes.
5. **Chill Brain Rewards** — four non-competitive guided missions, eight spirit guides, source-length sessions, accessibility controls, and optional sound that defaults off.
6. **Creature Catcher** — a timed learning safari using 64 shuffled Math, Reading, Science, and Nature questions, shared rewards, answer explanations, and a persistent field guide.
7. **Road Trip Quest** — an eight-city Collect · Battle · Conquer campaign using 64 shuffled Math, Trivia, Science, and Reading questions, bosses, road items, heroes, explanations, and persistent progress.
8. **Road Trip Quest GPS** — a privacy-first proximity collection game with Demo Mode, optional temporary live movement, 41 collectibles, 28 source-grounded questions, and no map or location upload.

## Learning data

- `games/learning-question-bank.json` provides 80 reviewed reusable questions across Math, Reading, Science, Nature, and Trivia.
- Creature Catcher and Road Trip Quest shuffle subject decks and avoid repeating a question until that subject deck cycles.
- Every reusable question includes four choices, a correct answer, a teaching explanation, and a difficulty label.
- KidsCoin Family keeps a separate 36-question family planning and fictional-ledger bank, with three-question rounds and first-mastery rewards.
- Brain Sweat retains its larger reviewed content system, while Road Trip Quest GPS retains its separate recovered 28-question bank.

## Shared 1.0 platform

- Arcade SDK v3 with backwards-compatible local saves
- Shared player identity, XP, levels, fictional arcade KC, achievements, and cabinet metrics
- Reduced motion, high contrast, and larger text across SDK-enabled cabinets
- A lobby control center for profile editing, safe save backup and restore, and confirmed progress erasure
- Per-cabinet progress summaries in the lobby
- Keyboard navigation, visible focus, responsive dialogs, and mobile navigation
- Zero-dependency structural and content validation in GitHub Actions

## Safety and privacy design

- No advertising, gambling, real-currency purchases, cryptocurrency, or public child profiles
- Family data, cabinet progress, question progress, and accessibility settings remain in the browser
- KidsCoin Parent Mode assigns chores and approves Family KC awards and reward redemptions; learning and reward browsing remain open
- Backup files include only schema-checked `larriverse.*` JSON records
- High-stakes health, legal, electrical, foraging, emergency, repair, and trade content remains review gated where applicable
- Wellness progress is not diagnosis; hands-on progress is not certification or safety clearance
- Road Trip Quest GPS does not upload, save, or map live coordinates and is not navigation or emergency assistance
- Optional audio begins disabled where the source requires a stronger comfort boundary

## Release qualification

GitHub Actions verifies routes, syntax, question counts, assignment behavior, source counts, review gates, privacy boundaries, location lifecycle, save schema, and accessibility contracts. Real-device gameplay, mobile layout, backup round-trip testing, and privacy-safe screenshots remain human release gates documented in `docs/RELEASE-CHECKLIST.md` and the device-local `qa/` console.
