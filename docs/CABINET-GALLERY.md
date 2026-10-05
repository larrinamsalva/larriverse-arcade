# LarriVerse Arcade — Cabinet Gallery

Automated Chromium now creates **candidate evidence** for the lobby and every cabinet at desktop and mobile sizes. Those images remain temporary until a person reviews them through the offline gallery bundle and exports a human approval record.

| Cabinet | Launch path | Candidate evidence | Public gallery |
|---|---|---:|---:|
| KidsCoin Family App | `games/kidscoin-family/index.html` | generated automatically | pending human approval |
| Brain Sweat Expanded | `games/brain-sweat-expanded/index.html` | generated automatically | pending human approval |
| Brain Sweat Life Skills | `games/brain-sweat-life-skills/index.html` | generated automatically | pending human approval |
| Bubble Resonance Φ369 | `games/bubble-resonance-phi369/index.html` | generated automatically | pending human approval |
| Chill Brain Rewards | `games/chill-brain-rewards/index.html` | generated automatically | pending human approval |
| Creature Catcher | `games/creature-catcher/index.html` | generated automatically | pending human approval |
| Road Trip Quest | `games/road-trip-quest/index.html` | generated automatically | pending human approval |
| Road Trip Quest GPS | `games/road-trip-quest-gps/index.html` | generated automatically | pending human approval |

The browser workflow also captures the arcade lobby in both viewports, producing 58 review images in total. Download the `larriverse-gallery-review-<run>` artifact, unzip it, and open `index.html` to approve or reject each image and review its proposed alt text.

## Approval rules

Use only clean demo data. Reject any image showing personal profile names, family messages, private progress, coordinates, location permission prompts, or real nearby-place data. **Road Trip Quest GPS must be captured in Demo Mode.** Check that controls and key safety messages are readable and that alt text describes the visible interface rather than repeating a filename.

Approved images are eventually committed under `docs/screenshots/<project>/<subject>.png` together with `docs/release-approval.json`. Until those exact files and hashes are present, this document intentionally links to the live cabinets rather than claiming a finished public gallery.

See [`GALLERY-APPROVAL.md`](GALLERY-APPROVAL.md) for the complete evidence and release-decision workflow.


## Modern arcade expansion

The collection now includes 28 playable games: the original eight cabinets and these twelve new practice worlds. The release gallery covers the lobby plus every game in both viewports (58 images). The formal release still requires the documented human review.

- **Pocket Planet** — Planning a budget. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Scam Sleuth** — Spotting online tricks. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Kindness Quest** — Listening & boundaries. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Fact Finder** — Checking claims & sources. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Repair Café** — Repair before replacing. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Time Trail** — Planning & tradeoffs. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Garden Guardians** — Resource care & diversity. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Energy Island** — Energy storage & systems. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Reuse Rally** — Reuse & thoughtful sorting. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Robot Rover** — Sequencing & debugging. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Lemonade Lab** — Costs, demand & small business. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.
- **Beat Builder** — Rhythm, patterns & creativity. Complete a round, inspect the feedback, replay, and check one saved completion with sound off.


### Eight new expeditions

- **Bridge Buddies** — Test, improve, try again.
- **Water Works** — See how a system connects.
- **Harbor Helpers** — Plan deliveries together.
- **Pantry Picnic** — Use what you already have.
- **Compass Cove** — Read landmarks and directions.
- **Cipher Club** — Make meaning with a shared key.
- **Trade Town** — Compare the whole deal.
- **Critter Council** — Design for different needs.

See [the expedition guide](EXPEDITIONS.md) for game mechanics and new artwork.
