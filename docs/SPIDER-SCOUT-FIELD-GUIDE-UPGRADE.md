# Spider Scout — Field-Guide Realism Upgrade

**Repository:** https://github.com/larrinamsalva/larriverse-arcade  
**World:** `games/spider-scout/`  
**Scope:** Ten original spider illustrations and their habitat backdrops, while preserving all 80 missions, answers, local saves, and earned-only awards.

## Purpose

Make Spider Scout easier and more engaging to study by replacing flat symbol-like shapes with detailed, naturalistic illustrations. The goal is a **gentle educational field-guide look**, not a photo-ID service, horror art, or a source of safety guarantees.

## Art implementation

`assets/spider-field-guide-art.js` now draws ten distinct spiders directly in local SVG. Both the large scene view and identification answer cards reuse `spiderPicture(kind)`. The rest of `assets/picture-quest-art.js` is unchanged so Helping Hands keeps its own existing first-aid illustrations.

Every spider has:

- Two separately shaded body segments (cephalothorax and abdomen), linked by a narrow waist.
- Eight legs, each shaped with two curved articulated sections and visible joints.
- Species-group-dependent limb proportions, positions, eye arrangements, abdomen proportions and markings.
- A darker contour plus subtle gradients, highlights and optional fine hairs where appropriate.
- A scene grounded in leaves, orbital silk, ground leaf litter, indoor corners, flower petals, woodpiles, dry soil/burrows, house storage spaces or grass/sheet webs.

| Illustration | Main study cues | Scene |
| --- | --- | --- |
| Jumping spider | compact fuzzy body, prominent front eyes | sunny garden leaf |
| Orb-weaver | rounded patterned abdomen, slender legs | radial circular capture web |
| Wolf spider | robust hunting stance, stripe and eye-group hints | ground leaf litter |
| Cellar spider | tiny body, exceptionally long fine legs | quiet indoor corner and irregular silk |
| Crab spider | enlarged sideways-facing forelegs | flower petals |
| Tarantula | stout body and substantial hairy legs | soil and sheltered burrow |
| Black widow | glossy dark abdomen and long thin legs | wood and sheltered silk |
| Brown recluse | subdued tan body, subtle *non-diagnostic* dorsal mark | quiet indoor storage area |
| Grass spider | elongated hunting body and striped back | lawn and sheet/funnel silk |
| Trapdoor spider | thick earth-colored body and legs | soil burrow and stones |

**Important anatomy caveat:** The black widow's red hourglass, when present, is usually on the **underside**. The drawing does not incorrectly present it as a certain dorsal mark. The violin-shaped area on a recluse and color alone are **not sufficient** to verify a real-world ID. Eye patterns are simplified teaching clues, not microscope-grade diagnostic photography.

## Performance and accessibility

- No new packages, live services, network downloads, location access or animation loops.
- SVG generated deterministically for consistent browser screenshots and predictable offline play.
- Answer cards use existing text labels; scene artwork is paired with descriptive `aria-label` text. Child-facing safety explanations remain visible.
- Spider Scout uses two columns of larger answer art at phone widths. Helping Hands keeps its original picture-card layout.
- Same keyboard, mobile, reduced-motion, dark/high-contrast and save/backup behavior.

## Human review and testing

**Automated:** Verify the ten exported illustration keys match the Spider Scout question bank; each is a complete locally generated SVG with eight legs, both body segments, eyes and background; ensure no external assets/scripts and a reasonable SVG size; confirm all chapters and saved progress survive. Browser QA renders every SVG, exercises widow/recluse mission changes and tests the two-column 390px phone layout.

**Before formal release:** Review every spider portrait at actual phone size, ensure it stays distinguishable and child-friendly, verify posture/web/habitat accuracy with a naturalist or qualified spider educator, and confirm no illustration is interpreted as a guarantee that a real spider is harmless. Manually inspect actual devices and the offline screenshot gallery. Real spider ID, spider-bite diagnosis and medical decisions require appropriate human expertise.

## Constraints

Do **not** change question IDs, answers, Spider Scout save key `larriverse.spider-scout.v1`, Arcade rewards, the other 39 game entries, child privacy protections, Helping Hands art, or release approval state. Merge only after independent validation and Browser QA pass.
