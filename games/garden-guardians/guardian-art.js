const zones = new Set(['meadow', 'orchard', 'hill', 'sunset']);
const crops = new Set(['carrot', 'bean', 'flower']);
const localArt = name => new URL('./art/' + name + '.webp', import.meta.url).href;
const background = zone => new URL('../../assets/world-motion/backgrounds/guardian-' + zone + '.webp', import.meta.url).href;
const robin = new URL('../../assets/world-motion/characters/guardian-robin.webp', import.meta.url).href;
const wateringCan = new URL('../../assets/world-motion/objects/garden-grow-watering-can.webp', import.meta.url).href;

export function guardianBackdrop(zone) {
  if (!zones.has(zone)) return '';
  return '<img class="guardian-backdrop" src="' + background(zone) + '" width="832" height="468" alt="" aria-hidden="true" data-guardian-setting="' + zone + '">';
}

export function guardianPlant(kind, growth = 2) {
  if (!crops.has(kind) || !Number.isInteger(growth) || growth < 0 || growth > 2) return '';
  return '<img class="guardian-plant-art" src="' + localArt(kind + '-' + growth) + '" width="256" height="256" alt="" aria-hidden="true" data-guardian-crop="' + kind + '" data-guardian-growth="' + growth + '">';
}

export function guardianRobin() {
  return '<span class="guardian-robin" aria-hidden="true"><img class="guardian-robin-poses" src="' + robin + '" width="640" height="320" alt=""></span>';
}

export function guardianWatering() {
  return '<span class="guardian-watering" aria-hidden="true"><img class="guardian-watering-can" src="' + wateringCan + '" alt=""><span class="guardian-water-drops"><i></i><i></i><i></i></span></span>';
}
