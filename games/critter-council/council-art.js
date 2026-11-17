const forests = ["spring-grove", "willow-bank", "maple-woods", "evening-pines"];
const residentFrames = [1, 0, 4, 2, 7, 3, 8, 9, 6, 5];
const asset = name => new URL(`./art/${name}.webp`, import.meta.url).href;

export function councilScenery(levelIndex) {
  const forest = forests[Math.min(forests.length - 1, Math.floor(levelIndex / 15))];
  return `<div class="critter-scenery" data-forest="${forest}" aria-hidden="true">
    <img src="${asset(forest)}" alt="" width="832" height="468" decoding="async">
    <i class="critter-river-light"></i>
  </div>`;
}

export function councilResident(levelIndex, seat, met) {
  const frame = residentFrames[(levelIndex * 3 + seat) % residentFrames.length];
  const x = (frame % 5) * 25;
  const y = Math.floor(frame / 5) * 100;
  return `<span class="critter-resident">
    <span class="critter-portrait" style="--portrait-x:${x}%;--portrait-y:${y}%;--portrait-delay:${seat * -1.1}s" aria-hidden="true"></span>
    <span class="critter-request-status" role="img" aria-label="${met ? "Request met" : "Request pending"}">${met ? "✓" : "○"}</span>
  </span>`;
}

export function councilBuilding(id, placed = false) {
  return `<img class="critter-building${placed ? " critter-building-placed" : ""}" data-building="${id}" src="${asset(id)}" alt="" width="224" height="192" decoding="async">`;
}
