# Weather Watchers: illustrated skies and response pictures

The sixty existing questions now use one of fifteen distinct outdoor sky paintings or one of seven forecast panels over a neutral nature-station background. The scene is selected by each question's authored `scene` key. Sunny, rainy, cloudy, foggy, cirrus, fair-weather cumulus, towering storm cloud, wind, frost, rainbow, heat, snow, and clear night are visibly different. The frost painting was replaced after review because the first version looked like accumulated snow; the released version shows crystals on grass and leaves with a bare roof and path.

The forecast diagrams still contain their original precise percentages, temperatures, clock times and day sequence. The illustrated background does not encode invented measurements. Native question text, clues, options and explanatory feedback remain outside the paintings and retain keyboard and screen-reader access.

## Asset map

- `assets/world-motion/backgrounds/weather-*.webp`: sixteen 832 × 360 nature-station landscapes, including the neutral `forecast-day` panel background. Outdoor questions use the exact matching landscape; the forecast panels share the neutral background.
- `assets/world-motion/characters/weather-guide.webp`: a transparent 640 × 320 two-pose guide for the existing shared introduction. The weather vane remains the original prop.
- `games/weather-watchers/art/*.webp`: fourteen transparent 256 × 256 practical choice pictures. Weather condition choices use matching landscape thumbnails. Forecast and abstract choices keep the original native SVG drawings where a photograph could imply a false prediction or show the wrong action. The ambiguous generated paper-hat and pond pictures were excluded.

All packaged pictures are local WebP. The artwork was generated using the built-in image generator and processed into individual cropped, resized assets with Pillow. There are no runtime services, dependencies, logins or third-party requests. The code and produced artwork follow this repository's MIT license.

## Motion and access

The shared introduction animates the two-pose guide and weather vane. The game gently moves cloud settings, adds falling rain or snow only to matching scenes, and briefly settles a correctly selected picture. The illustrated evidence remains visible when either the site's Reduce motion setting or the device preference disables animation. The forecast panel stays still so its readings do not move. A 320-pixel layout with enlarged text and dark/high-contrast modes retains native choice labels and the same three choices.

The paintings are an educational aid: real weather and local advisories should be checked through adults and official sources as described in the existing lessons. A generated picture alone must not be treated as a forecast.

## Production briefs

Original production set, all in detailed cinematic 3D animated-feature style with believable weather, clear foreground and distant valley, without text, labels, UI or people:

1. Four-panel nature-station sky atlas: sun with blue sky and dry shadows; gray rainy sky with visible drops and puddles; moonlit clear night with stars; sun peeking between cumulus with wide blue gaps.
2. Four-panel cloud atlas: continuous dry overcast; visibility-limiting ground fog; very high thin feather-shaped cirrus; small low cumulus with flat bottoms and blue gaps.
3. Four-panel weather-clue atlas: tall anvil-topped cumulonimbus; tree, flag and branches blown by wind; frosty morning; rainbow with sunlight and nearby rain. The frosty panel was superseded by a separate wide painting of frost crystals on green grass and leaves, keeping the roof and path free of snow.
4. Four-panel safety and forecast atlas: distant lightning and heavy rain; bright hot sky; falling snow and accumulation; neutral calm station with an empty wooden board for the separate forecast overlay.
5. Transparent two-pose adult guide: yellow rain jacket, teal shirt, navy pants and boots, first standing and then pointing to the sky with feet aligned.
6. Four transparent choice atlases: sturdy shelter, tall tree, pond, water and shade; empty water bottle, winter outfit, summer outfit, bare feet; visible adult and child in fog, foggy road, dark outfit, rain gear; paper hat, secured patio objects, loose windblown objects, clock. The pond and paper hat are deliberately not packaged because they could be read incorrectly at choice size.

The four landscape atlases were cut at their exact centers, then cropped to favor the sky while preserving the station for context. The final frost painting favors the grass to keep the ice crystals legible. Transparent choices were cut at their centers, scaled without stretching, then padded to square cells.
