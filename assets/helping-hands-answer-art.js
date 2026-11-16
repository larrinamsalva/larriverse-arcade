import { HELPING_ACTION_TYPES, helpActionPicture } from './helping-hands-realistic-art.js';

export function renderHelpAnswerPicture(container, kind) {
  if (!HELPING_ACTION_TYPES.includes(kind)) {
    container.innerHTML = helpActionPicture(kind);
    return;
  }

  const picture = document.createElement('img');
  picture.alt = '';
  picture.width = 480;
  picture.height = 300;
  picture.decoding = 'async';
  picture.addEventListener('error', () => {
    container.innerHTML = helpActionPicture(kind);
  }, { once: true });
  picture.src = new URL(`./helping-hands-answers/${kind}.webp`, import.meta.url).href;
  container.append(picture);
}
