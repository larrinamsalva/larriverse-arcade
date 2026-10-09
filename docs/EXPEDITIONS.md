# Eight new expeditions

The arcade has 30 playable games: eight original cabinets, fourteen practice worlds, and eight new expeditions. Every expedition uses short hands-on challenges, encouraging feedback, optional hints, no timer, keyboard and touch controls, sound off by default, and device-local progress.

| Game | What children do | A practical discovery |
| --- | --- | --- |
| Bridge Buddies | Choose supports for four spans and test three crossings within a budget | Test a model, notice weak spots, and improve a plan |
| Water Works | Rotate pipes through three networks and trace the flow through a toy filter | Systems depend on connected parts; troubleshoot from the start |
| Harbor Helpers | Match nine supply crates to three island requests with boat and fuel limits | Listen before helping and plan shared resources |
| Pantry Picnic | Solve eight rotating packing challenges from a twenty-four-plan pantry | Check what you already have, follow the request, and plan to reduce waste |
| Compass Cove | Follow five landmark clues on a compass map | Explain a route using directions and reference points |
| Cipher Club | Encode and decode five messages using an A–H wheel | A shared rule changes the meaning of a pattern |
| Trade Town | Compare bundles, unit prices and extra fees for three requests | Judge the whole deal and buy enough for the actual need |
| Critter Council | Place a park, hut, ramp and bench around four neighbors' requests | Ask about different needs and make room for more people |

The bridge is a simplified toy model. Pipe filters and picnic portions are pretend: these games do not establish real water safety or food handling. Pantry Picnic asks an adult to help with allergies, preparation, and safe storage. The small cipher is easy to break and cannot protect real secrets. Coins and builder tokens are fictional. The town includes a step-free route and different comfort needs without asking players for personal information.

## Graphics and assets

Twenty shared-engine adventures now have original SVG scene banners, friendly characters, local object illustrations, and gentle CSS animation. The new boards have bridge supports, water flow, harbor islands, picnic baskets, compass landmarks, code-wheel charts, market stalls, and woodland buildings. The reduced-motion control and system preference stop decorative animation. All playable controls remain semantic HTML buttons; the scenes are decorative.

The built-in image generation tool created two production atlases:

- `assets/expedition-atlas.webp`: 1600 × 800, four columns and two rows, one square scene for each expedition in catalog order.
- `assets/worlds-atlas-v2.webp`: 1600 × 1200, four columns and three rows, refreshed scenes for the twelve earlier skill worlds.

Square illustrations are cropped proportionally into the lobby and game covers. Both atlases are delivered as local compressed WebP files. The earlier `assets/worlds-atlas.webp` is retained. No remote fonts, models or image requests are needed during play.

### Generation briefs

Shared prompt: production illustration atlas for a children's learning arcade; premium cinematic 3D rounded toy dioramas, warm sunlight, clay and carved wood textures, turquoise water, lavender shadows, gold and coral accents, detailed foliage, original friendly blob characters, centered subjects. Equal square panels in an edge-to-edge grid. No UI, labels, logos, real humans or recognizable third-party characters.

Expedition atlas: 2:1 image, four columns and two rows. Top row: golden triangle-truss bridge and little cart; blue-pipe reservoir workshop and cottages; three-island harbor with supply crates and sailboat; garden picnic basket with apples, carrots and bread. Bottom row: coastal lighthouse with compass and map; secret-code clubhouse with geometric dial and golden key; market with apples, pencils, seeds, coins and balance; inclusive woodland village with gentle ramp, reading hut, shaded tree, bench and four blob neighbors.

Refreshed skill-world atlas: 4:3 image, four columns and three rows. Top row: picnic budget island and telescope; cyber detective clubhouse with key and shield; friendship treehouse; news kiosk with magnifying glass and blank paper. Middle row: toy repair workshop; park maze with flags; carrot and bean garden with flowers; solar, wind and storage island. Bottom row: reuse station with unlabeled bins; rounded robot on garden path; lemonade stand; cozy music studio. Cohesive camera angle, textures and lighting across all scenes.

## Implementation and verification

`assets/expedition-worlds.js` holds metadata and challenge models. `assets/expedition-logic.js` holds flow tracing, map targets, cipher conversion, shopping comparison and neighbor needs. `assets/expedition-games.js` renders eight distinct modes in the common game shell. `assets/arcade-scenes.js` owns the original SVG drawings and banners. The shared SDK saves one completion and practice-run award per finished round; starting over does not award a second completion.

Run `npm run validate`, then `npm run test:browser` using the pinned Playwright runner described in [Browser QA](BROWSER-QA.md). Tests exercise complete rounds, wrong choices, restarts, saved progress, keyboard interaction, comfort settings and desktop/mobile overflow. The release gallery captures the lobby and 30 cabinets in both viewports: 62 images. Browser emulation does not replace the project's physical-phone and human approval requirements for a formal tagged release.
