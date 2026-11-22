const zones = new Set(['coast', 'village', 'forest', 'mountain']);
const skies = new Set(['sunny', 'cloudy', 'night', 'breezy']);
const escape = value => String(value).replace(/[&"<>]/g, character => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]);
const source = path => new URL(path, import.meta.url).href;
const parts = {
  solar: '../../assets/world-motion/objects/energy-solar-panel.webp',
  battery: './art/battery.webp',
  tower: './art/turbine-tower.webp',
  rotor: './art/turbine-rotor.webp',
};

export function forecastPicture(zone, weather) {
  const sky = weather.toLowerCase();
  if (!zones.has(zone) || !skies.has(sky)) return '';
  return '<img class="energy-landscape-picture" src="' + source('../../assets/world-motion/backgrounds/energy-' + zone + '-' + sky + '.webp') + '" width="832" height="468" alt="" aria-hidden="true">';
}

function part(name, className) {
  return '<img class="' + className + '" src="' + source(parts[name]) + '" width="256" height="256" alt="" aria-hidden="true">';
}

export function equipmentPicture(type) {
  if (type === 'wind') return '<div class="energy-wind-model" aria-hidden="true">' + part('tower', 'energy-tower-picture') + '<div class="energy-rotor-mount">' + part('rotor', 'energy-rotor-picture') + '</div></div>';
  return Object.hasOwn(parts, type) ? part(type, 'energy-equipment-picture') : '';
}

// The scene shows the day just recorded in the log. The forecast separately
// highlights the NEXT day, because state.day advances before rendering.
export function islandScene(level, state) {
  const result = state.ledger.at(-1);
  const dayIndex = result ? state.ledger.length - 1 : 0;
  const weather = level.weather[dayIndex];
  const capacity = state.build.battery * 4;
  const percent = capacity ? state.stored / capacity * 100 : 0;
  const powered = result ? result.ok ? 'on' : 'off' : 'preview';
  const caption = result ? 'Day ' + (dayIndex + 1) + ' result · ' + weather.name : 'Build preview · ' + weather.name;
  const status = result ? (result.ok ? 'Lights on' : 'Needs more power') + ' · ' + result.made + ' made · ' + level.demand + ' needed' : 'Test your mix to see whether the lights stay on.';
  const labels = { solar: 'Solar panels', wind: 'Wind turbines', battery: 'Batteries' };
  const models = Object.entries(labels).map(([type, label]) => '<section class="energy-installation"><h3>' + label + ' · ' + state.build[type] + '</h3><div class="energy-installed energy-installed--' + type + '">' + (state.build[type] ? Array.from({ length: state.build[type] }, () => '<div class="energy-device" data-energy-device="' + type + '" aria-hidden="true">' + equipmentPicture(type) + '</div>').join('') : '<p class="energy-empty">None built yet</p>') + '</div></section>').join('');
  return '<section class="energy-scene energy-island-scene energy-illustrated" aria-label="Island energy equipment" data-energy-zone="' + escape(level.zone) + '" data-energy-weather="' + escape(weather.name.toLowerCase()) + '" data-energy-power="' + powered + '" data-energy-solar-output="' + weather.solar + '" data-energy-wind-output="' + weather.wind + '" style="--energy-rotor-time:' + (weather.wind > 1 ? 4 : 8) + 's">'
    + '<figure class="energy-result-scene"><div class="energy-landscape">' + forecastPicture(level.zone, weather.name) + '<img class="energy-cottage-picture" src="' + source('./art/home-' + (powered === 'on' ? 'on' : 'off') + '.webp') + '" width="256" height="256" alt="" aria-hidden="true"></div><figcaption><strong class="energy-result-title">' + escape(caption) + '</strong><p class="energy-result-status">' + escape(status) + '</p></figcaption></figure>'
    + '<div class="energy-installations">' + models + '</div>'
    + '<div class="energy-storage-panel"><strong class="energy-storage-label">' + state.stored + ' / ' + capacity + ' stored</strong><div class="energy-storage-track" aria-hidden="true"><div class="energy-storage-fill" style="width:' + percent + '%"></div></div><p>' + (capacity ? 'Battery capacity: ' + capacity + ' energy units' : 'No batteries built') + '</p></div></section>';
}
