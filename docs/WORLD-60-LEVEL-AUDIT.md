# LarriVerse: honest 60-challenge world audit

**Goal:** Every level-based world should offer **60 distinct, finishable challenges**, with levels that become more interesting and harder over time. For free-form studios and family-learning hubs, first design an equivalent 60-mission progression — do not count repeating the same sandbox as 60 different levels.

**Source-of-truth check:** `npm run audit:worlds`. It reads the actual game data, inventories every cabinet in `games/catalog.json`, and prevents the 60-complete games from regressing. Its counts are **not guesses based on marketing text**.

## Completed at 60 in this change

| World | Challenge type | Count |
| --- | --- | ---: |
| Bridge Buddies | Four-span construction load puzzles | **60** (20 original + 40 new progressively stronger loads) |
| Bubble Resonance Φ369 | Arcade match stages with auto-next | **60** (20 original + 40 named fields) |
| Weather Watchers | Four ranks of illustrated weather questions | **60** (25 original + 35 new) |
| Garden Grow & Harvest | Four ranks of illustrated garden/food-care questions | **60** (24 original + 36 new) |

These existing games already had 60: **Pantry Picnic, Traffic Town, Street Safety Scout, Scam Sleuth, Kindness Quest, Fact Finder, Repair Café, Time Trail, Reuse Rally, Kids Sudoku.**

**Main catalog after this PR: 14 of 33 cabinets have 60 distinct sequential puzzles or questions.** Word Search and Crossword have independent, **unmerged** PRs (#58 and #59) with 60 each, and are **not** counted here.

## Remaining fixed-length worlds and accurate gap

| World | Actual playable challenges | More required |
| --- | ---: | ---: |
| Water Works | 20 | 40 |
| Harbor Helpers | 20 | 40 |
| Compass Cove | 20 | 40 |
| Cipher Club | 20 | 40 |
| Trade Town | 8 | 52 |
| Critter Council | 20 | 40 |
| Pocket Planet | 30 | 30 |
| Garden Guardians | 8 | 52 |
| Energy Island | 8 | 52 |
| Robot Rover | 20 | 40 |

Those games must get genuinely new, **solvable** routes, transactions, layouts, requests, or projects. Avoid repeated text with a new level number. Each new engine needs a test that actually finishes representative levels, catches dead ends and validates no repeats.

## Games without one 60-step curriculum today

| Cabinet | What it actually offers | Next design step |
| --- | --- | --- |
| Lemonade Lab | Repeatable four-day business simulation | Add sixty changing market scenarios with distinct price/demand and reflection goals |
| Beat Builder | Open-ended music studio | Add sixty rhythm challenges, including progressively harder beats |
| KidsCoin Family | Many family goals and learning activities | Add sixty optional structured quests, preserve family customization |
| Brain Sweat Expanded | 69 reviewed activities across six subworlds | Assess distribution per subworld and expand safely; **do not release queued material without review** |
| Brain Sweat Life Skills | 239 readable questions spread across lessons | Verify sufficient unique questions for each subworld, then design progress paths |
| Chill Brain Rewards | Four guided sessions | Offer sixty optional gentle focus missions without pressure or medical claims |
| Creature Catcher | Free-form collecting game | Build sixty real discovery tasks and rewards |
| Road Trip Quest | Free-form exploration | Add sixty optional quests with progress and no unsafe play while traveling |
| Road Trip Quest GPS | Eleven XP milestones and 28 questions | Expand optional offline learning quests, preserve consent-only location use |

## Polish requirements for each new batch

- Show the **actual** challenge number, progress, milestone rewards and a reliable Next Level/Replay transition
- Explain controls in kid-friendly language, keep picture objects recognizable and use readable light/dark/high-contrast colors
- Work with mouse, keyboard and mobile touch; provide free hints, no paywalls or countdown pressure
- Save progress locally without destroying existing progress or changing rewards retroactively
- Require unique, relevant tasks and proof that they can be finished
- Keep **Validate LarriVerse Arcade**, full **Browser QA**, real manual gallery/device checks and final human release approval intact

## Suggested rollout

1. First merge/revalidate **Word Search PR #58**, then rebase and validate **Crossword PR #59**. Do not assume a PR is ready just because its unit validation passes.
2. **Infrastructure expedition pack**: Water Works, Harbor Helpers, Compass Cove, Cipher Club.
3. **Builder/economy pack**: Trade Town, Critter Council, Pocket Planet, Garden Guardians, Energy Island, Robot Rover.
4. **Creative/adventure pack**: Lemonade Lab, Beat Builder, Creature Catcher, Road Trip and family/Brain Sweat mini-worlds. Design sixty actual tasks per mode rather than relabeling existing play.
