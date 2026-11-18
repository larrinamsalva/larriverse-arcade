import { PLANET_ART_FILES, PLANET_SUPPLY_ART, PLANET_PROJECT_ART } from './project-pictures.js';

const escapeAttribute = value => String(value).replace(/[&"<>]/g, character => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]);
function picture(key, attribute) {
  if (!Object.hasOwn(PLANET_ART_FILES, key)) return '';
  const source = new URL(PLANET_ART_FILES[key], import.meta.url).href;
  return '<img class="planet-object-picture" data-planet-art="' + key + '" ' + attribute + ' src="' + source + '" width="256" height="256" alt="" aria-hidden="true">';
}

export function supplyPicture(name) {
  return Object.hasOwn(PLANET_SUPPLY_ART, name) ? picture(PLANET_SUPPLY_ART[name], 'data-planet-supply="' + escapeAttribute(name) + '"') : '';
}

export function projectPicture(id) {
  if (!Object.hasOwn(PLANET_PROJECT_ART, id)) return '';
  const image = picture(PLANET_PROJECT_ART[id], 'data-planet-project="' + escapeAttribute(id) + '"');
  // A real paper picture holds a precise native bridge sketch; no generated
  // measurements or technical instructions are used in the lesson.
  return id === 'quest-50-toy-bridge-blueprint' ? '<span class="planet-blueprint">' + image + '<svg class="planet-blueprint-drawing" viewBox="0 0 100 100" aria-hidden="true"><path d="M8 68h16v18H8m68-18h16v18H76M17 68h66M22 67V41h56v26M22 41l14 26 14-26 14 26 14-26M22 67h56" fill="none" stroke="#235b92" stroke-width="3" stroke-linejoin="round"/></svg></span>' : image;
}

export function projectLandscape(kind) {
  const names = { grow: 'Growing garden', build: 'Maker workshop', eat: 'Community kitchen' };
  if (!Object.hasOwn(names, kind)) return '';
  const source = new URL('../../assets/world-motion/backgrounds/planet-' + kind + '.webp', import.meta.url).href;
  return '<figure class="planet-landscape" data-planet-setting="' + kind + '"><img src="' + source + '" width="832" height="468" alt=""><figcaption>' + names[kind] + '</figcaption></figure>';
}
