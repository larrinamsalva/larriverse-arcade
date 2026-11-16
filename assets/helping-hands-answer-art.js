import { HELPING_ACTION_TYPES, helpActionPicture } from './helping-hands-realistic-art.js';
import { renderHelpPicture } from './helping-hands-picture-art.js';

export function renderHelpAnswerPicture(container, kind) {
  const source = HELPING_ACTION_TYPES.includes(kind) ? `./helping-hands-answers/${kind}.webp` : null;
  renderHelpPicture(container, source, 480, 300, () => helpActionPicture(kind));
}
