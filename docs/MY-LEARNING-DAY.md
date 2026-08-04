# LarriVerse My Learning Day

`/today/` is a private, device-local next-step page for LarriVerse Arcade. It answers “What could I do next?” without creating a schedule, assignment, grade, timer, or missed-day state.

## Three optional choices

The page builds exactly three invitations from information already stored in this browser:

1. Incomplete pinned Learning Goals are considered first.
2. A subject with at least two answers and below 75% local accuracy may appear as an optional practice invitation.
3. An unvisited or least-played cabinet may appear as an exploration invitation.
4. A general arcade-session or XP choice fills any remaining space.

Cards never select themselves. A learner must deliberately choose one step.

## Comfortable pace

The learner chooses one of three pace sizes before starting a new step:

- **Quick Spark** — one tiny action, such as one question, one visit, one session, or 9 XP.
- **Steady Quest** — a middle-sized action, such as three questions, three sessions, or 18 XP.
- **Deep Dive** — a longer choice, such as six questions, three cabinet visits, six sessions, or 36 XP.

Changing the pace does not alter a pinned goal. It only changes the size of newly offered Learning Day choices.

## Measured progress

When a step is chosen, the page records a baseline from aggregate LarriVerse progress already stored on the device. Only activity after that baseline counts.

The “Celebrate and finish” button remains disabled until the selected metric actually reaches its target. Releasing a step clears only the active Learning Day choice. It does not erase arcade progress, change a pinned goal, or create a failure record.

## Storage and privacy

The only new browser record is `larriverse.learningDay.v1`. It contains:

- schema and version
- at most one preset active step
- pace, metric type, target, and starting counter
- an optional pinned-goal ID reference
- a creation timestamp
- up to six recent completed-step labels

The record contains no custom notes, diary text, age, email, timer duration, schedule, due date, overdue state, streak, grade, punishment, family-control record, password, or location coordinate. It requests no sensors and uploads nothing.

Because the key begins with `larriverse.`, the existing schema-checked LarriVerse backup and restore flow includes it automatically.

## Human release checks

- Open `/today/` with no pinned goals and confirm exactly three optional choices appear.
- Pin an incomplete Learning Goal and confirm a related choice is considered first.
- Switch among Quick Spark, Steady Quest, and Deep Dive and confirm only new choice sizes change.
- Choose a step and confirm it begins at zero even when older progress exists.
- Confirm “Celebrate and finish” remains disabled before real progress reaches the target.
- Make the required progress in a linked cabinet, return, refresh, and confirm the step completes.
- Celebrate the step and confirm one recent celebration appears.
- Release another active step and confirm no failure, penalty, or arcade-progress change is created.
- Back up and restore saves and confirm the active step and recent celebrations return.
- Confirm the page remains comfortable on a physical phone with larger text, high contrast, and reduced motion.
