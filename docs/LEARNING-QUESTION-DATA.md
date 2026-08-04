# LarriVerse Learning Question Data

Phase 17 moves the smallest repeated quiz sets into reviewed JSON data and opens KidsCoin learning without removing the family approval boundary.

## KidsCoin Family

- All six learning lessons are open to every device-local explorer without entering Parent Mode.
- Each lesson contains six questions and draws a shuffled three-question round.
- Two correct answers master the lesson.
- The first mastery awards 3 Family KC and 9 XP; later rounds are reward-free practice.
- The 36 lesson questions include an explanation after each answer.
- Parent Mode assigns each chore to all explorers or one explorer.
- A child marks an assigned chore complete; a parent still approves the Family KC award.
- Reward redemption still requires parent approval.

## Shared arcade question bank

`games/learning-question-bank.json` contains 80 reviewed questions:

| Subject | Questions | Used by |
| --- | ---: | --- |
| Math | 16 | Creature Catcher, Road Trip Quest |
| Reading | 16 | Creature Catcher, Road Trip Quest |
| Science | 16 | Creature Catcher, Road Trip Quest |
| Nature | 16 | Creature Catcher |
| Trivia | 16 | Road Trip Quest |

Creature Catcher and Road Trip Quest shuffle a subject deck and do not repeat a question until that subject deck cycles. Every entry includes four answer choices, the correct answer index, a short explanation, and a difficulty label.

## Boundaries

Question data and progress remain device-local. The question bank does not request location, upload answers, create public child profiles, or add real-money or cryptocurrency features. Brain Sweat keeps its larger reviewed content system, and Road Trip Quest GPS keeps its separate 28-question source-grounded bank.
