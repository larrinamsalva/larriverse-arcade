const landmarkFiles = { lighthouse: 'lighthouse', hut: 'reading-hut', tree: 'big-tree', market: 'market', drop: 'fountain' };
const settings = ['sunlit', 'woodland', 'highland'];
const names = ['Sunlit cove', 'Woodland cove', 'Highland cove'];

function picture(name) {
  const source = new URL('./art/' + name + '.webp', import.meta.url).href;
  return '<img class="cove-object-picture" data-cove-object="' + name + '" src="' + source + '" width="256" height="256" alt="" aria-hidden="true">';
}

export function coveLandmarkPicture(icon) {
  return Object.hasOwn(landmarkFiles, icon) ? picture(landmarkFiles[icon]) : '';
}

export function coveTreasurePicture() {
  return picture('treasure');
}

export function coveLandscape(level) {
  const section = Math.min(2, Math.max(0, Math.floor(level / 20)));
  const source = new URL('../../assets/world-motion/backgrounds/cove-' + settings[section] + '.webp', import.meta.url).href;
  return '<figure class="cove-landscape" data-cove-setting="' + settings[section] + '"><img src="' + source + '" width="832" height="468" alt=""><figcaption>' + names[section] + '</figcaption></figure>';
}
