# LarriVerse Progress Passport

The Progress Passport is a read-only, device-local view of progress already stored by LarriVerse Arcade.

## What it shows

- shared profile name and avatar
- current level, XP, Arcade KC, sessions, and completed sessions
- progress toward the next shared arcade level
- one stamp for each of the eight playable cabinets
- per-cabinet sessions, completions, best score, and last-played date
- Creature Catcher and Road Trip Quest learning-path selections
- recent-question counts and per-subject answer accuracy
- friendly labels for shared achievements
- one gentle suggested next mission based on an unvisited cabinet, a low-accuracy practiced subject, or the least-completed cabinet

## Privacy boundary

The page reads only the shared Arcade SDK profile, the public cabinet catalog, and `larriverse.learningPath.v1` in browser storage.

It does not:

- create an account
- collect an age, email address, or legal name
- publish a profile or leaderboard
- request location
- read raw KidsCoin family tasks, approvals, PIN data, or reward requests
- upload analytics, answers, or progress
- read unrelated website storage

The downloadable Progress Passport summary is intentionally smaller than a full Arcade backup. It includes totals, cabinet summaries, learning statistics, and unlocked achievement IDs. It explicitly excludes raw family records and location data.

## Backup behavior

The existing Arcade Control Center backup includes all `larriverse.*` records, including the shared profile and adaptive-learning history. Restoring that backup restores the source data used by the Passport.

## Testing

The structural validator checks the page structure, local-only data boundary, published Pages route, eight-cabinet contract, export schema, JavaScript syntax, mobile layout, and print layout.

Chromium seeds a realistic profile and adaptive-learning record, then verifies the Passport in both desktop and mobile projects. The test confirms totals, cabinet stamps, learning accuracy, achievements, suggested mission, safe export fields, and zero browser console errors.
