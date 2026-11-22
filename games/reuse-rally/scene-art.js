import { REUSE_ART_FILES, REUSE_OBJECT_ART } from './reuse-pictures.js';

const escape = value => String(value).replace(/[&"<>]/g, character => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]);
const settings = ['courtyard', 'kitchen', 'garden', 'workshop', 'library', 'park'];
const names = ['Community cleanup courtyard', 'Community kitchen', 'Growing garden', 'Repair workshop', 'Community library', 'Park picnic shelter'];
const bins = ['reuse-crate', 'recycle-bin', 'compost-caddy', 'trash-bin'];

function picture(key, className, attributes = '') {
  if (!Object.hasOwn(REUSE_ART_FILES, key)) return '';
  return '<img class="' + className + '" data-reuse-art="' + key + '" ' + attributes + ' src="' + new URL(REUSE_ART_FILES[key], import.meta.url).href + '" width="256" height="256" alt="" aria-hidden="true">';
}

export function objectScene(item, step) {
  if (!Object.hasOwn(REUSE_OBJECT_ART, item.name)) return '';
  const chapter = Math.min(settings.length - 1, Math.floor(step / 10));
  const background = new URL('../../assets/world-motion/backgrounds/reuse-' + settings[chapter] + '.webp', import.meta.url).href;
  return '<figure class="reuse-picture-scene" data-reuse-setting="' + settings[chapter] + '" data-reuse-result="ready"><div class="reuse-display-scene"><img class="reuse-landscape-picture" src="' + background + '" width="832" height="468" alt="" aria-hidden="true"><div class="reuse-displayed-object">' + picture(REUSE_OBJECT_ART[item.name], 'reuse-object-picture', 'data-reuse-object="' + escape(item.name) + '"') + '</div></div><figcaption>' + names[chapter] + '</figcaption></figure>';
}

export function destinationPicture(index) {
  return bins[index] ? picture(bins[index], 'reuse-destination-picture', 'data-reuse-bin="' + index + '"') : '';
}

export function showResult(board, correct, destination) {
  const scene = board.querySelector('.reuse-picture-scene');
  if (!scene) return;
  scene.dataset.reuseResult = correct ? 'correct' : 'review';
  scene.dataset.reuseDestination = String(destination);
}
