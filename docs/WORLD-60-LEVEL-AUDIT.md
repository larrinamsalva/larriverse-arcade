## Long-main-campaign correction for ten worlds

A 60-question **bank** is not the same as a 60-question **play session**. Player feedback exposed this important distinction. This main-campaign pass fixes the short gameplay directly, rather than calling six separate ten-question restarts a sixty-level world.

| World | Actual main-game experience after this pass |
| --- | --- |
| Traffic Town | Six sequential ten-sign chapters (60 distinct signs); saved after each completed sign |
| Scam Sleuth | Six sequential ten-message chapters (60 distinct scam messages); saved after each completed message |
| Kindness Quest | Six ten-choice chapters (60 distinct kindness / boundary situations); saved |
| Fact Finder | Six ten-claim chapters (60 distinct verification situations); saved |
| Repair Café | Six ten-object chapters; 60 different repairs with four correctly ordered actions each, saved |
| Reuse Rally | Six ten-object chapters (60 different visible toy objects); saved |
| Street Safety Scout | One uninterrupted four-route, 60-stop journey; route transitions every 15, saved by stop |
| Lemonade Lab | 60 different solvable market contracts launch by default; original four-day stand available from the mission screen |
| Beat Builder | 60 different solvable rhythm patterns launch by default; freestyle studio remains available |
| Trade Town | 60 original unique budget comparisons, now grouped into six named saved market districts with resume and replay |

All progress stays local. Original SDK rewards remain once at completing the journey; restarting does not grant fictional KC for milestones. For these ten games the visible main journey now includes every scenario or rhythm challenge, without needing to find a hidden second mode or repeatedly choose "Try another round."

**Gameplay length** is not a medical or academic measurement, and progress is not proof of real-world competency. Street Safety is not driver instruction; emergency, tool-repair and online-scam activities remain age-appropriate fictional practice. Browser QA must verify full sixty-step completion, saving, replay, accessibility and phone touch.

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

## The final fixed-length worlds (stacked after #62)

- Pocket Planet: thirty additional individual grow/build/eat projects, sixty unique in six rounds.
- Garden Guardians: fifty-two new plant and water quota plans, original eight retained.
- Energy Island: fifty-two distinct four-day weather forecasts with affordable four-day power solutions.
- Robot Rover: forty new deterministic five-by-five obstacle layouts with verified shortest programs, original twenty retained.
- **All 26 fixed-length cabinets** now have sixty individual challenges if this PR merges after #62. Nine free-form cabinets require separate mission design, not fake level counters.

## Remaining fixed-length worlds and accurate gap

| World | Actual playable challenges | More required |
| --- | ---: | ---: |
| Trade Town | **60** | **0** |
| Critter Council | **60** | **0** |
| Pocket Planet | **60** | **0** |
| Garden Guardians | **60** | **0** |
| Energy Island | **60** | **0** |
| Robot Rover | **60** | **0** |

Those games must get genuinely new, **solvable** routes, transactions, layouts, requests, or projects. Avoid repeated text with a new level number. Each new engine needs a test that actually finishes representative levels, catches dead ends and validates no repeats.


## Creative worlds: optional sixty-mission ladders

The two original creative modes remain available. The new curricula count **real objectives**, not sixty renamed repeats:

| World | Optional distinct missions | Original mode retained |
| --- | ---: | --- |
| Lemonade Lab | **60** affordable market-profit challenges, changing demand, price sensitivity, supply cost and budget | Four-day lemonade-stand simulation |
| Beat Builder | **60** different exact kick, clap and hi-hat patterns on a 16-step grid | Freestyle rhythm composer and optional audio |

The progress for each optional path is saved locally. Completing a single mission does not award the complete-world celebration; all sixty are required. The final target is **26 fixed-sequence curricula + 2 optional sixty-mission paths**; the other seven creative/adventure/family cabinets still need bespoke content.

## Wildlife and travel story missions

Two more classic games now have **optional**, fully standalone sixty-mission learning paths, with the original action play intact:

- **Creature Catcher:** 60 unique wildlife questions across habitat, food webs, signs, adaptations, and respectful wildlife care. The original timed collecting and question-pool game is preserved.
- **Road Trip Quest:** 60 route-reading, packing, weather, passenger safety and community-etiquette missions across twelve different trip settings. The original eight-city adventure and boss system is preserved.
- Each mission has a verifiable correct choice, two relevant distractors, explanation and free hint. Wrong answers cannot unlock the next chapter. Device-local saves and replay are opt-in.
- Children are never encouraged to operate a vehicle while playing; there is no location permission or network tracking.

**After this optional quest pack:** 26 fixed sixty-level worlds plus 4 optional sixty-mission worlds = **30 of 35** with distinct sixty-step learning paths. Five remaining family and learning hubs need separate curriculum design.

## GPS demo and Chill Brain: two more optional 60-mission journeys

- **Road Trip Quest GPS:** 60 wholly offline map-symbol, public route, safety, location privacy and leave-no-trace choices. The existing location-free demo **and separately opt-in live movement mode** remain unchanged. No GPS is necessary or requested in these missions. This is never navigation or emergency guidance; no gameplay while driving.
- **Chill Brain Rewards:** 60 short, untimed observation, comfortable breathing choices, gentle focus, comfort and kindness puzzles across twelve illustrated story themes. No forced breath holds, countdowns, medical claims, public accounts, or enforced streaks. Existing calm sessions, profile onboarding, optional sound and parent comfort controls remain.
- Both paths reuse the accessible offline quiz UI, with free hints, local progress and return-to-original-game controls.

**After these two paths merge:** 26 fixed-length 60-challenge cabinets + 6 optional 60-mission cabinets = **32 of 35**. The three family/Brain Sweat hubs still require their own curricula.

## Final three reviewed source-backed curricula (completion milestone)

| World | Playable optional missions | Original mode retained |
| --- | ---: | --- |
| KidsCoin Family | **60** unique questions selected from the 120 existing open family-finance questions across six topics | Original 120 questions, assigned chores, parent approvals, family rewards and device-local Family KC |
| Brain Sweat Expanded | **60** distinct problems derived from reviewed existing ledger transactions, customer-service choices, garden tool challenges, kitchen choices, community tasks and coding puzzles | All 69 original reviewed interactive activities; other expert-review-queued tiers remain locked |
| Brain Sweat Life Skills | **60** distinct source-reviewed questions, one per existing approved question across twelve lessons | Original learning-world screens, saved lesson mastery and review-queued health, legal, electrical, foraging and other high-stakes chapters still locked |

These are **optional** step-by-step question/choice pathways. The three originals remain independently playable and their rewards do not change. These missions do not award family currency, permit parent bypass, or unlock unreviewed material.

**When this PR passes full validation and merges, LarriVerse reaches the honest milestone: all 35 catalog games offer an actual sixty-challenge path (26 fixed-sequence worlds and 9 opt-in mission trails).** Each trail has different situations, reliable local progress, clear feedback, retry, optional hint and completion. This does not claim that each of the six Brain Sweat internal subworlds separately has sixty puzzles, or that free-play sessions themselves are sixty levels.

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
