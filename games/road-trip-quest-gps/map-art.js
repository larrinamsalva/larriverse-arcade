import { placeSvg } from '../../assets/arcade-scenes.js';

export const gpsPlaceImages = new Map([
  'fuel', 'fast_food', 'hospital', 'pharmacy', 'supermarket', 'shop', 'park', 'school',
  'library', 'police', 'fire_station', 'cinema', 'restaurant', 'bank', 'default',
].map(type => [type, new URL(`./art/${type}.webp`, import.meta.url)]));

export function gpsPlaceArt(type, className) {
  const image = gpsPlaceImages.get(type);
  return image ? `<img class="${className}" src="${image.href}" alt="">` : placeSvg(type, className);
}
