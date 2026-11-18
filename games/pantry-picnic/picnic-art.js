const foods = new Set(['bread', 'beans', 'rice', 'wrap', 'pasta', 'apple', 'banana', 'orange', 'berries', 'grapes', 'carrot', 'cucumber', 'peas']);
const settings = ['garden', 'orchard', 'lakeside', 'courtyard'];
const names = ['Community garden', 'Orchard picnic', 'Lakeside picnic', 'Community courtyard'];

export function pantryFoodPicture(id) {
  if (!foods.has(id)) return '';
  const source = new URL('./art/' + id + '.webp', import.meta.url).href;
  return '<img class="pantry-food-picture" data-pantry-food="' + id + '" src="' + source + '" width="256" height="256" alt="" aria-hidden="true">';
}

export function pantryPicnicLandscape(level) {
  const section = Math.min(3, Math.max(0, Math.floor(level / 20)));
  const source = new URL('../../assets/world-motion/backgrounds/picnic-' + settings[section] + '.webp', import.meta.url).href;
  return '<figure class="pantry-landscape" data-pantry-setting="' + settings[section] + '"><img src="' + source + '" width="832" height="468" alt=""><figcaption>' + names[section] + '</figcaption></figure>';
}
