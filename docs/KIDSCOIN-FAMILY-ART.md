# KidsCoin Family: illustrated family practice

This update puts recognizable people and household objects on the actual KidsCoin Family page. The planning scene appears beside the introduction; the chores scene appears whether or not chores are currently assigned; the learning scene appears beside the six lesson cards and in the optional 60-mission dialog. All three illustrations are context for family practice, **not** depictions of a specific question, completed chore, earned token amount or reward.

The same grandmother, guardian and two children appear throughout. Their grounded poses show an age-appropriate conversation, folding clean towels and watering a houseplant, and sorting **pretend** savings tokens. No picture makes a claim about a player's actual family structure. Native text states that Family KC is fictional, that lessons are unlocked, and that parents approve chores and rewards. Profile names, balances, questions, choices, the parent PIN flow and both existing save formats are unchanged.

## Assets and access

`games/kidscoin-family/art/planning.webp`, `chores.webp` and `learning.webp` are original local illustrations, 1672 × 941 each, encoded as WebP at 79 quality. Together they are under 850 KiB. The pictures are part of the static site; there are no image requests to outside hosts, runtime dependencies, accounts, ads or personal uploads. The page's social preview now shows the actual KidsCoin family illustration rather than the unrelated expedition atlas.

The introduction and section figures have descriptive alternative text and separate native captions. The repeated mission image has an empty alternative text because the mission title and prompt carry the learning content and the picture never identifies the correct answer. On narrow phones, scene and caption stack; the mission illustration is a short banner above the current native question and choices. High-contrast mode keeps captions on black and gives image frames a white border. Images have no animation, so both motion preferences leave their meaning intact.

## Review and verification

`npm run validate` checks that all three packaged files are optimized WebP images. `tests/browser/kidscoin-family-art.spec.mjs` checks decoded images on a 320-pixel page, the chores and lesson tabs, the mission banner, visible questions and continued access to the parent button. Existing `final-three-missions.spec.mjs` completes all sixty missions and checks resume. Review the **actual** hero, chores, lessons and mission dialog on desktop and phone before merging; automated checks cannot approve an illustration's anatomy or appearance.

## Original image briefs

- **Planning:** Warm cinematic 3D animated-feature scene in a lived-in kitchen with a grandmother, guardian and two children planning chores around a blank paper checklist and a jar of pretend gold tokens. Purple, emerald and gold accents, natural hands and contact shadows. No writing, real-currency mark, branding or UI.
- **Chores:** Reuse those four characters and their clothing in a new living-room scene. One child folds clean towels, another waters a houseplant, and adults encourage them. Show complete poses and no hazardous cleaning supplies.
- **Learning:** Reuse the family in a new tabletop scene sorting plain pretend tokens into two jars with blank paper and pencils. The visual represents discussion and simple planning, with no numerical result, purchase or answer revealed.
