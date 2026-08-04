# LarriVerse Learning Goals

`/goals/` is a private, device-local focus board for the shared LarriVerse Arcade profile. It turns existing progress into up to three preset goals without creating an account or turning learning into a deadline contest.

## Goal choices

The board supports six goal types:

1. Answer 3, 6, or 9 questions in Math, Reading, Science, Nature, or Trivia.
2. Play one chosen cabinet 1, 3, or 6 times.
3. Try 1, 3, or 6 arcade sessions in any cabinet.
4. Complete 1 or 3 arcade sessions.
5. Earn 9, 18, or 36 Arcade XP.
6. Visit 1 or 3 cabinets that had not been visited when the goal was pinned.

Only progress recorded after the goal is pinned counts. Restarting a goal creates a fresh baseline from the current progress. Removing or clearing a goal never erases arcade progress.

## Pressure-free boundary

- No deadline, overdue state, streak, leaderboard, grade, or punishment is used.
- A reset is not labeled as failure.
- Goal completion awards no money and creates no automatic assignment.
- Suggestions are optional and must be pinned deliberately.
- The board stores no custom notes or free-text goal descriptions.
- The learner can use the board without entering KidsCoin Parent Mode.

## Storage and privacy

The only new browser record is `larriverse.learningGoals.v1`. It contains:

- schema and version
- up to three preset goal definitions
- a starting counter or the previously visited cabinet IDs
- a creation timestamp

The record is included automatically in the existing schema-checked LarriVerse save backup because its key begins with `larriverse.`.

The goal engine reads only the shared Arcade profile and `larriverse.learningPath.v1`. It requests no location, uploads no analytics or answers, and excludes raw KidsCoin family records, parent PIN material, chores, approvals, rewards, family notes, and Road Trip GPS coordinates.

## Shared views

The Progress Passport and Family Learning Report load the same goal engine through a read-only renderer. Those pages can display goal progress and link to `/goals/`, but they cannot add, restart, remove, or clear goals.

## Human release checks

- Pin a subject goal and confirm it begins at zero even when older answers exist.
- Answer enough new questions to complete it and confirm the progress updates.
- Restart the goal and confirm the baseline returns to zero without changing answer history.
- Pin three goals and confirm a fourth is blocked.
- Remove one goal and confirm a slot reopens.
- Restore a save backup and confirm the same goals and baselines return.
- Confirm Passport and Family Report show the same goal totals.
- Confirm the board remains readable on a physical phone with larger text and high contrast.
