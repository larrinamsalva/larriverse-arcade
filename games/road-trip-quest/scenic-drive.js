export const roadScenes = new Map([
  ['New York City', { place: 'new-york', prop: 'streetlamp' }],
  ['Orlando', { place: 'orlando', prop: 'palm' }],
  ['Nashville', { place: 'nashville', prop: 'streetlamp' }],
  ['Chicago', { place: 'chicago', prop: 'streetlamp' }],
  ['Las Vegas', { place: 'las-vegas', prop: 'streetlamp' }],
  ['Los Angeles', { place: 'los-angeles', prop: 'palm' }],
  ['Denver', { place: 'denver', prop: 'pine' }],
  ['New Orleans', { place: 'new-orleans', prop: 'streetlamp' }],
  ['Seattle', { place: 'seattle', prop: 'pine' }],
  ['San Francisco', { place: 'san-francisco', prop: 'streetlamp' }],
  ['Phoenix', { place: 'phoenix', prop: 'palm' }],
  ['Salt Lake City', { place: 'salt-lake-city', prop: 'pine' }],
  ['Austin', { place: 'austin', prop: 'streetlamp' }],
  ['St. Louis', { place: 'st-louis', prop: 'streetlamp' }],
  ['Boston', { place: 'boston', prop: 'streetlamp' }],
  ['Miami', { place: 'miami', prop: 'palm' }],
]);

export const roadBackground = place => new URL(`../../assets/world-motion/backgrounds/road-${place}.webp`, import.meta.url);

export const roadProps = {
  camper: new URL('../../assets/world-motion/objects/road-camper.webp', import.meta.url),
  pine: new URL('./art/pine.webp', import.meta.url),
  palm: new URL('./art/palm.webp', import.meta.url),
  streetlamp: new URL('./art/streetlamp.webp', import.meta.url),
  plane: new URL('./art/plane.webp', import.meta.url),
};
