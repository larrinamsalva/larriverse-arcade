import { weatherSceneSvg, weatherChoiceSvg } from '../../assets/arcade-scenes.js';

// Exact, authored scene names; never infer a weather picture from a question's text.
export const outdoorScenes = Object.freeze([
  'sunny', 'rainy', 'clear-night', 'partly-cloudy', 'cloudy', 'foggy',
  'wispy-clouds', 'puffy-clouds', 'towering-cloud', 'windy', 'frosty',
  'rainbow', 'stormy', 'hot', 'snowy'
]);
export const reportScenes = Object.freeze([
  'rain-chance', 'high-low', 'hourly-rain', 'wind-report',
  'sun-times', 'current-later', 'three-day'
]);

const pictureNames = new Set([...outdoorScenes, 'forecast-day']);
const choiceNames = new Set([
  ...outdoorScenes, 'indoors', 'tree', 'shade-water', 'empty-bottle',
  'winter-clothes', 'summer-clothes', 'bare-feet', 'visible-with-adult',
  'road-danger', 'dark-clothes', 'rain-gear', 'secure-items', 'flying-items', 'clock'
]);

const background = kind => new URL(`../../assets/world-motion/backgrounds/weather-${kind}.webp`, import.meta.url).href;
const choiceObject = kind => new URL(`./art/${kind}.webp`, import.meta.url).href;

export function weatherScene(kind) {
  if (!pictureNames.has(kind) && !reportScenes.includes(kind)) return weatherSceneSvg(kind);
  const report = reportScenes.includes(kind);
  const scene = report ? 'forecast-day' : kind;
  const description = report
    ? `Illustrated ${kind.replaceAll('-', ' ')} weather report`
    : `Illustrated ${kind.replaceAll('-', ' ')} weather at the nature station`;
  return `<div class="learning-scene-art weather-learning-art weather-panorama"
    role="img" aria-label="${description}" data-weather-scene="${kind}">
    <img class="weather-landscape" src="${background(scene)}" alt="" draggable="false" decoding="async">
    ${report ? weatherSceneSvg(kind, true) : '<span class="weather-air" aria-hidden="true"></span>'}
  </div>`;
}

export function weatherChoice(kind) {
  if (!choiceNames.has(kind)) return weatherChoiceSvg(kind);
  const src = outdoorScenes.includes(kind) ? background(kind) : choiceObject(kind);
  return `<img class="learning-choice-art weather-choice-picture" src="${src}" alt="" draggable="false" decoding="async">`;
}
