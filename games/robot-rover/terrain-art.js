const zones = new Set(['meadow', 'canyon', 'crystal', 'cosmic']);
const directions = ['north', 'east', 'south', 'west'];
const art = name => new URL('./art/' + name + '.webp', import.meta.url).href;
const picture = (name, className, extra = '') => '<img class="' + className + '" src="' + art(name) + '" width="320" height="320" alt="" aria-hidden="true" ' + extra + '>';

export function roverLandscape(zone) {
  if (!zones.has(zone)) return '';
  const source = new URL('../../assets/world-motion/backgrounds/rover-' + zone + '.webp', import.meta.url).href;
  return '<img class="rover-terrain-backdrop" src="' + source + '" width="832" height="468" alt="" aria-hidden="true" data-rover-setting="' + zone + '">';
}
export function roverCharacter(direction) {
  return directions[direction] ? picture('rover-' + directions[direction], 'rover-token rover-character-art', 'data-rover-facing="' + directions[direction] + '"') : '';
}
export function roverObstacle(zone) {
  return zones.has(zone) ? picture('rock-' + zone, 'rover-rock rover-obstacle-art') : '';
}
export function roverBeacon() {
  return picture('star-beacon', 'rover-goal rover-beacon-art');
}

let activeAnimation;
let watchingMotion = false;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('larriverse-reduced-motion');
const stop = () => { activeAnimation?.cancel(); activeAnimation = null; };
function watchMotion() {
  if (watchingMotion) return;
  watchingMotion = true;
  const stopWhenReduced = () => { if (reduced()) stop(); };
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', stopWhenReduced);
  window.addEventListener('larriverse:settings', stopWhenReduced);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
}

export function captureRover(board) {
  return board.querySelector('.rover-token')?.getBoundingClientRect() || null;
}

// Move between the actual rendered cells so phone sizing and text scaling
// cannot change the route. The engine still owns position, timing and scoring.
export function animateRover(board, previous) {
  stop();
  if (!previous || reduced()) return;
  const token = board.querySelector('.rover-token');
  if (!token) return;
  watchMotion();
  const current = token.getBoundingClientRect();
  const dx = previous.left - current.left, dy = previous.top - current.top;
  const frames = Math.abs(dx) + Math.abs(dy) > 1
    ? [{ transform: 'translate(' + dx + 'px, ' + dy + 'px)' }, { transform: 'none' }]
    : [{ transform: 'rotate(-4deg)' }, { transform: 'none' }];
  const animation = token.animate(frames, { duration: 240, easing: 'ease-in-out' });
  activeAnimation = animation;
  animation.finished.then(() => { if (activeAnimation === animation) activeAnimation = null; }, () => {});
}
