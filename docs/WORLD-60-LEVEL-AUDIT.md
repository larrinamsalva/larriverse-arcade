# LarriVerse: honest 60-challenge world audit

**Goal:** Every level-based world should offer **60 distinct, finishable challenges**, with levels that become more interesting and harder over time. For free-form studios and family-learning hubs, first design an equivalent 60-mission progression — do not count repeating the same sandbox as 60 different levels.

**Source-of-truth check:** `npm run audit:worlds`. It reads the actual game data, inventories every cabinet in `games/catalog.json`, and prevents the 60-complete games from regressing. Its counts are **not guesses based on marketing text**.

## Worlds already at 60

| World | Challenge type | Count |
| --- | --- | ---: |
| Bridge Buddies | Four-span construction load puzzles | **60** (20 original + 40 new progressively stronger loads) |
| Bubble Resonance Φ369 | Arcade match stages with auto-next | **60** (20 original + 40 named fields) |
| Weather Watchers | Four ranks of illustrated weather questions | **60** (25 original + 35 new) |
| Garden Grow & Harvest | Four ranks of illustrated garden/food-care questions | **60** (24 original + 36 new) |

Four new complete worlds: **Water Works, Harbor Helpers, Compass Cove, Cipher Club**.

These existing games already had 60: **Pantry Picnic, Traffic Town, Street Safety Scout, Scam Sleuth, Kindness Quest, Fact Finder, Repair Café, Time Trail, Reuse Rally, Kids Sudoku.**

**Main catalog after this PR: 20 of 35 cabinets have 60 distinct sequential puzzles or questions.** Four more expedition worlds have expanded from 20 to 60. The table below lists only worlds still below the goal. **Word Search World** and **Crossword World** have merged with 60 levels apiece and are included in the 16 complete cabinets.

## Trade Town and Critter Council next batch

- **Trade Town**: 8 original + 52 distinct market orders, increasingly complex delivery fees and bundle comparisons, every order affordable.
- **Critter Council**: 20 original + 40 new 2×3 neighborhood layouts with four achievable neighbor requests apiece, totaling 240 requests. Preserve earlier saved progress.
- **22 of 35** fixed-sequence cabinets now offer 60 levels once this stacked change is merged on top of the preceding expedition pack.

## Remaining fixed-length worlds and accurate gap

| World | Actual playable challenges | More required |
| --- | ---: | ---: |
| Trade Town | **60** | **0** |
| Critter Council | **60** | **0** |
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

1. **Completed:** Word Search PR #58 and Crossword PR #59 merged after successful validation and browser QA. Keep the same check requirements for PR #60.
2. **Completed in this PR:** Water Works, Harbor Helpers, Compass Cove, Cipher Club expanded with forty new solvable challenges each.
3. **Builder/economy pack**: Trade Town, Critter Council, Pocket Planet, Garden Guardians, Energy Island, Robot Rover.
4. **Creative/adventure pack**: Lemonade Lab, Beat Builder, Creature Catcher, Road Trip and family/Brain Sweat mini-worlds. Design sixty actual tasks per mode rather than relabeling existing play.

### Expedition expansion verification

- Water Works: 60 unique simple pipe routes through the filter, from nine to 21 tiles, with actual flow tracing and turn-to-solve validation.
- Harbor Helpers: 60 named islands and 60 distinct, capacity-safe crate requests. Later islands require more cargo categories, with no paid materials.
- Compass Cove: 60 different landmark-and-step routes on a **36-tile** map. Targets may repeat because 60 unique destinations are mathematically impossible on 36 cells; route identities must not repeat.
- Cipher Club: 60 different real English words using the A–H toy cipher, including longer six-to-nine-letter vocabulary and helpful meanings. It is a puzzle, not real encryption.
