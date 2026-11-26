// These neutral settings change with progress, never with a card's answer.
export const NEWSROOM_SCENES = Object.freeze([
  { id: 'news-desk', file: 'news-desk.webp', alt: 'Two students compare blank papers and a notebook at a classroom news desk.' },
  { id: 'source-library', file: 'source-library.webp', alt: 'Two students compare a blank library book and a blank laptop screen.' },
  { id: 'context-review', file: 'context-review.webp', alt: 'Two students look over a blank photograph and contact sheet at a community newsroom table.' }
]);

export const newsroomSceneForStep = step => NEWSROOM_SCENES[Math.min(2, Math.floor(step / 20))];

export function factNewsroomScene(step) {
  const scene = newsroomSceneForStep(step);
  return `<figure class="fact-newsroom-scene" data-fact-setting="${scene.id}">
    <img src="art/${scene.file}" width="1000" height="563" alt="${scene.alt}" decoding="async">
    <figcaption>Illustrated workspace. Read the claim and its source details to decide.</figcaption>
  </figure>`;
}
