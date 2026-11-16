import { HELPING_SCENE_TITLES, helpScenePicture } from './helping-hands-realistic-art.js';

export function renderHelpPicture(container, source, width, height, fallback) {
  if (!source) {
    container.innerHTML = fallback();
    return;
  }

  const picture = document.createElement('img');
  picture.alt = '';
  picture.width = width;
  picture.height = height;
  picture.decoding = 'async';
  picture.addEventListener('error', () => {
    if (picture.parentNode === container) {
      container.innerHTML = fallback();
    }
  }, { once: true });
  container.replaceChildren(picture);
  picture.src = new URL(source, import.meta.url).href;
}

export function renderHelpScenePicture(container, mission) {
  const caseNumber = HELPING_SCENE_TITLES.indexOf(mission?.title) + 1;
  const source = caseNumber ? `./helping-hands-scenes/case-${caseNumber}.webp` : null;
  renderHelpPicture(container, source, 960, 600, () => helpScenePicture(mission));
}
