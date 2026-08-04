# LarriVerse Learning Question Data

Phase 17 moved the smallest repeated quiz sets into reviewed JSON data and opened KidsCoin learning without removing the family approval boundary. Phase 18 adds expansion packs and device-local learning paths so the banks can grow without replacing their original reviewed files.

## KidsCoin Family

- All six learning lessons are open to every device-local explorer without entering Parent Mode.
- Each lesson now combines six original questions with four expansion questions for ten questions per lesson.
- The full KidsCoin bank contains 60 family-planning questions.
- Each play session draws a shuffled three-question round.
- Two correct answers master the lesson.
- The first mastery awards 3 Family KC and 9 XP; later rounds are reward-free practice.
- Every question includes an explanation after the answer.
- Parent Mode assigns each chore to all explorers or one explorer.
- A child marks an assigned chore complete; a parent still approves the Family KC award.
- Reward redemption still requires parent approval.

KidsCoin loads its original data from `games/kidscoin-family/family.json` and adds `games/kidscoin-family/family-question-pack-2.json` through the one-time device-local `family-data-loader.js`.

## Shared arcade question bank

The original `games/learning-question-bank.json` contains 80 reviewed questions. `games/learning-question-pack-2.json` adds 40 more without replacing the original file.

| Subject | Original | Expansion | Combined | Used by |
| --- | ---: | ---: | ---: | --- |
| Math | 16 | 8 | 24 | Creature Catcher, Road Trip Quest |
| Reading | 16 | 8 | 24 | Creature Catcher, Road Trip Quest |
| Science | 16 | 8 | 24 | Creature Catcher, Road Trip Quest |
| Nature | 16 | 8 | 24 | Creature Catcher |
| Trivia | 16 | 8 | 24 | Road Trip Quest |
| **Total** | **80** | **40** | **120** | |

Creature Catcher uses 96 Math, Reading, Science, and Nature questions. Road Trip Quest uses 96 Math, Trivia, Science, and Reading questions.

## Learning paths

Creature Catcher and Road Trip Quest offer four device-local choices:

- **Starter** — starter questions only
- **Growing** — starter and growing questions
- **Challenge** — growing and challenge questions
- **Mixed** — the complete bank

`assets/learning-path.js` remembers the selected path, recently seen question IDs, attempts, correct answers, and local accuracy. Recently seen questions are held back until the available deck becomes small, then that subject begins a fresh cycle. The system does not request a child's age.

## Question format

Every shared question includes:

- a unique ID;
- a prompt;
- four answer choices;
- one correct answer index;
- a short teaching explanation;
- a `starter`, `growing`, or `challenge` difficulty label.

## Boundaries

Question data, path choice, recent-question history, accuracy, and cabinet progress remain device-local. The learning system does not request location, upload answers, create public child profiles, collect age, or add real-money or cryptocurrency features. Brain Sweat keeps its larger reviewed content system, and Road Trip Quest GPS keeps its separate 28-question source-grounded bank.
