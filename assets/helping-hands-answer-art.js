import { HELPING_ACTION_SCENES, HELPING_ACTION_TYPES, helpActionPicture } from './helping-hands-realistic-art.js';
import { renderHelpPicture } from './helping-hands-picture-art.js';

export function renderHelpAnswerPicture(container, kind) {
  let source = null;
  if (HELPING_ACTION_TYPES.includes(kind)) {
    const caseNumber = HELPING_ACTION_SCENES[kind];
    source = caseNumber
      ? `./helping-hands-scenes/case-${caseNumber}.webp`
      : `./helping-hands-answers/${kind}.webp`;
  }
  renderHelpPicture(container, source, 480, 300, () => helpActionPicture(kind));
}
