# LarriVerse Arcade 1.0

LarriVerse Arcade 1.0 turns Larrina's first recovered browser-concept collection into eight independently playable, GitHub Pages-ready cabinets with a shared device-local profile, fictional rewards, accessibility settings, validation, and clear privacy and safety boundaries.

## Eight playable cabinets

1. **KidsCoin Family App** — unlocked learning with 60 questions, parent-assigned chores, fictional Family KC, local profiles, parent-approved KC awards and reward redemptions, notes, grace days, and a family ledger.
2. **Brain Sweat Expanded** — 69 reviewed hands-on activities across six worlds while higher-risk tiers remain visible and review gated.
3. **Brain Sweat Life Skills** — 60 reviewed questions across twelve lessons in the original six-world learning map.
4. **Bubble Resonance Φ369** — a precision bubble arcade preserving the source's six colors, PHI-chain scoring, resonance, gems, levels, and creative frequency themes.
5. **Chill Brain Rewards** — four non-competitive guided missions, eight spirit guides, source-length sessions, accessibility controls, and optional sound that defaults off.
6. **Creature Catcher** — a timed learning safari using a 96-question Math, Reading, Science, and Nature pool, four learning paths, device-local recent-question memory, shared rewards, explanations, and a persistent field guide.
7. **Road Trip Quest** — an eight-city Collect · Battle · Conquer campaign using a 96-question Math, Trivia, Science, and Reading pool, four learning paths, device-local recent-question memory, bosses, road items, heroes, explanations, and persistent progress.
8. **Road Trip Quest GPS** — a privacy-first proximity collection game with Demo Mode, optional temporary live movement, 41 collectibles, 28 source-grounded questions, and no map or location upload.

## Learning data

- The original shared question bank provides 80 reviewed reusable questions across Math, Reading, Science, Nature, and Trivia.
- A second reviewed expansion pack adds 40 questions for a combined 120-question shared bank.
- Creature Catcher and Road Trip Quest each use the four subjects relevant to that cabinet, producing a 96-question pool per game.
- Starter, Growing, Challenge, and Mixed paths filter the bank without collecting a child's age.
- The selected path, recent question IDs, attempts, correct answers, and local accuracy remain in the browser.
- Recently seen questions are held back until a subject deck needs a fresh cycle.
- Every reusable question includes four choices, a correct answer, a teaching explanation, and a difficulty label.
- KidsCoin Family combines its original 36 questions with a 24-question expansion pack for 60 family-planning questions, ten per lesson.
- Brain Sweat retains its larger reviewed content system, while Road Trip Quest GPS retains its separate recovered 28-question bank.

## Progress Passport

- A first-class `/passport/` route turns existing local saves into a private progress view.
- The Passport shows shared level progress, XP, Arcade KC, sessions, completed sessions, all eight cabinet stamps, adaptive-learning trails, per-subject accuracy, and friendly achievement labels.
- One gentle next mission recommends an unvisited cabinet, a practiced subject below 75% accuracy, or the least-completed cabinet.
- The page supports keyboard focus, mobile layouts, larger text, high contrast, reduced motion, and a print-specific layout.
- A downloadable `larriverse-progress-passport` summary contains totals and learning statistics without raw family records or location data.
- The Passport is read-only and does not create an account, age field, leaderboard, analytics stream, or cloud profile.

## Family Learning Report

- A first-class `/report/` route presents the same local progress in a calmer family-review format.
- The report summarizes shared totals, all eight cabinet participation records, adaptive learning paths, aggregate subject accuracy, and up to five recent cabinet timestamps.
- Growing strengths require at least two answers and at least 80% accuracy; gentle practice opportunities require at least two answers and below 75% accuracy.
- Short histories are described as needing more data instead of being treated as ability conclusions.
- Generated conversation starters invite celebration, curiosity, and optional practice without grading or punishment language.
- Print and JSON export are supported, while review notes are never collected or stored.
- The downloadable `larriverse-family-learning-report` excludes raw KidsCoin family records and location data and explicitly states that it is not a grade, diagnosis, ranking, or certification.

## Shared 1.0 platform

- Arcade SDK v3 with backwards-compatible local saves
- Shared player identity, XP, levels, fictional arcade KC, achievements, and cabinet metrics
- Reduced motion, high contrast, and larger text across SDK-enabled cabinets
- A lobby control center for profile editing, safe save backup and restore, and confirmed progress erasure
- Per-cabinet progress summaries in the lobby
- A private Progress Passport for cabinet stamps, learning statistics, achievements, printing, and safe summary download
- A private Family Learning Report for strengths, gentle practice opportunities, participation, recent activity, printing, and aggregate report download
- Keyboard navigation, visible focus, responsive dialogs, and mobile navigation
- Zero-dependency structural and content validation in GitHub Actions

## Safety and privacy design

- No advertising, gambling, real-currency purchases, cryptocurrency, or public child profiles
- Family data, cabinet progress, question history, local accuracy, accessibility settings, Passport calculations, and report calculations remain in the browser
- The learning-path system does not collect age, request location, or upload answers
- The Progress Passport does not read raw KidsCoin tasks, approvals, PIN data, reward requests, or Road Trip GPS coordinates
- The Family Learning Report does not save review notes, read raw family records, request location, or upload learner statistics
- KidsCoin Parent Mode assigns chores and approves Family KC awards and reward redemptions; learning and reward browsing remain open
- Backup files include only schema-checked `larriverse.*` JSON records
- High-stakes health, legal, electrical, foraging, emergency, repair, and trade content remains review gated where applicable
- Wellness progress is not diagnosis; hands-on progress is not certification or safety clearance
- Road Trip Quest GPS does not upload, save, or map live coordinates and is not navigation or emergency assistance
- Optional audio begins disabled where the source requires a stronger comfort boundary

## Release qualification

GitHub Actions verifies routes, syntax, combined question counts, expansion-pack schemas, difficulty paths, device-local memory, Progress Passport calculations and privacy boundaries, Family Learning Report thresholds and export boundaries, assignment behavior, source counts, review gates, location lifecycle, save schema, and accessibility contracts. Chromium seeds realistic learner progress and verifies both progress views at desktop and mobile widths alongside the lobby, all eight cabinets, and release tooling. Real-device gameplay, physical-phone layout, print review, backup round-trip testing, and privacy-safe screenshots remain human release gates documented in `docs/RELEASE-CHECKLIST.md` and the device-local `qa/` console.
