const backgrounds = new Map([
  ["creek", "creek"],
  ["market", "market"],
  ["festival", "festival"],
  ["library", "library"],
  ["garden", "garden"],
  ["river", "creek"],
  ["night", "night"],
  ["parade", "market"],
  ["mountain", "mountain"],
  ["farm", "farm"],
  ["coast", "coast"],
  ["school", "library"],
  ["canyon", "canyon"],
  ["snow", "snow"],
  ["solar", "farm"],
  ["orchard", "garden"],
  ["harbor", "coast"],
  ["art", "festival"],
  ["sports", "festival"],
  ["sunrise", "sunrise"]
]);

const vehicles = new Set([
  "timber", "produce", "festival", "books", "garden",
  "water", "lanterns", "parade", "tools", "harvest",
  "mail", "science", "bikes", "blankets", "solar",
  "orchard", "rescue", "art", "sports", "celebration"
]);

export function bridgeRiverLandscape(scene) {
  const setting = backgrounds.get(scene);
  if (!setting) return "";
  const source = new URL(`../../assets/world-motion/backgrounds/bridge-${setting}.webp`, import.meta.url).href;
  return `<img class="bridge-backdrop bridge-river-art" src="${source}" width="832" height="468" alt="" aria-hidden="true" data-bridge-setting="${setting}">`;
}

export function bridgeDeliveryVehicle(kind) {
  if (!vehicles.has(kind)) return "";
  const source = new URL(`./art/${kind}.webp`, import.meta.url).href;
  return `<img class="bridge-cart-art bridge-vehicle--${kind}" src="${source}" alt="" aria-hidden="true">`;
}
