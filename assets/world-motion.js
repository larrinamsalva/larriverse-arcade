import { WORLD_MOTION_SCENES } from './world-motion-scenes.js';

const propMoves = {
  bob: ['none', 'translateY(-8%) rotate(7deg)', 'none'],
  lift: ['none', 'translateY(-11%) rotate(-6deg)', 'none'],
  pour: ['none', 'rotate(-21deg)', 'rotate(-18deg)', 'none'],
  roll: ['translateX(-56%)', 'translateX(29%)', 'none'],
  scan: ['translateX(-14%) rotate(-7deg)', 'translateX(14%) rotate(6deg)', 'none'],
  slide: ['translateX(16%)', 'translateX(-11%)', 'none'],
  spin: ['rotate(0deg)', 'rotate(360deg)'],
  sway: ['none', 'rotate(-8deg)', 'rotate(7deg)', 'none'],
  turn: ['none', 'rotate(17deg)', 'rotate(-6deg)', 'none']
};

const characterMoves = {
  fox: ['none', 'translateX(5%)', 'none'],
  rover: ['none', 'translateX(12%)', 'translateX(4%)', 'none'],
  spider: ['none', 'translateX(13%)', 'translateX(5%)', 'none']
};

function element(tag, className, parent) {
  const node = document.createElement(tag);
  node.className = className;
  parent?.append(node);
  return node;
}

function image(parent, className, directory, name) {
  const node = element('img', className, parent);
  node.alt = '';
  node.draggable = false;
  node.decoding = 'async';
  node.src = new URL(`./world-motion/${directory}/${name}.webp`, import.meta.url);
  return node;
}

function loadStyle() {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('./world-motion.css', import.meta.url);
  const loaded = new Promise((resolve, reject) => {
    stylesheet.addEventListener('load', resolve, { once: true });
    stylesheet.addEventListener('error', reject, { once: true });
  });
  document.head.append(stylesheet);
  return loaded;
}

export async function mountWorldMotion(gameId, sdk) {
  const config = WORLD_MOTION_SCENES[gameId];
  if (!config) return;
  const host = document.querySelector(config.host);
  if (!host || document.querySelector('[data-lv-world-motion]')) return;

  const frame = element('div', 'lv-world-motion');
  frame.dataset.lvWorldMotion = gameId;
  frame.dataset.landscape = config.background;
  const art = element('div', 'lv-motion-art', frame);
  art.setAttribute('aria-hidden', 'true');
  const landscape = image(art, 'lv-motion-landscape', 'backgrounds', config.background);
  const air = element('div', 'lv-motion-air', art);
  const character = element('div', 'lv-motion-character', art);
  character.dataset.character = config.character;
  const poses = image(character, 'lv-motion-poses', 'characters', config.character);
  const prop = image(art, 'lv-motion-prop', 'objects', config.prop);
  prop.dataset.move = config.motion;

  try {
    await Promise.all([loadStyle(), landscape.decode(), poses.decode(), prop.decode()]);
  } catch {
    // The gameplay and its existing art are available if a scene asset fails.
    return;
  }
  if (!host.isConnected) return;

  let replay;
  if (config.fullScene) {
    frame.dataset.fullScene = '';
    host.dataset.lvMotionReady = '';
  } else {
    replay = element('button', 'lv-motion-play', frame);
    replay.type = 'button';
    replay.textContent = '▶ Play scene';
  }
  if (config.position === 'afterbegin') host.querySelector(':scope > .world-scene')?.remove();
  host.insertAdjacentElement(config.position, frame);

  const deviceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let introduced = false;
  let pendingReaction = false;
  let playingReaction = false;
  let animations = [];
  let lastStart = -Infinity;
  let sessions = sdk.summary().games[gameId]?.sessions ?? 0;

  function reduced() {
    return deviceMotion.matches || document.documentElement.classList.contains('larriverse-reduced-motion');
  }

  function stop() {
    for (const animation of animations) animation.cancel();
    animations = [];
    playingReaction = false;
  }

  function play(restart = false) {
    // The replay button can be pressed before the scroll observer updates.
    if ((!visible && !restart) || document.hidden || reduced()) return;
    if (!restart && performance.now() - lastStart < 900) return;
    lastStart = performance.now();
    introduced = true;
    stop();
    playingReaction = pendingReaction;
    pendingReaction = false;
    const direction = config.background === 'harbor' ? -1 : 1;
    const figureMotion = characterMoves[config.character] ?? ['none', 'translateY(-2%) rotate(2deg)', 'none'];
    animations = [
      landscape.animate({ transform: [
        'scale(1.06)', `scale(1.085) translateX(${direction * 1.3}%)`, 'scale(1.06)'
      ] }, { duration: 2900, easing: 'ease-in-out' }),
      air.animate([
        { opacity: .25, transform: 'translateX(-4%)' },
        { opacity: .52, transform: 'translateX(10%)' },
        { opacity: .25, transform: 'translateX(-4%)' }
      ], { duration: 2850, easing: 'ease-in-out' }),
      character.animate({ transform: figureMotion }, { duration: 1900, easing: 'ease-in-out' }),
      poses.animate([
        { transform: 'translateX(0)', offset: 0, easing: 'steps(1, end)' },
        { transform: 'translateX(-50%)', offset: .26, easing: 'steps(1, end)' },
        { transform: 'translateX(0)', offset: .75 }
      ], { duration: 1900 }),
      prop.animate({ transform: propMoves[config.motion] }, { duration: 2100, easing: 'ease-in-out' })
    ];
  }

  function syncMotion() {
    if (replay) replay.hidden = reduced();
    if (reduced()) {
      pendingReaction = false;
      lastStart = -Infinity;
      stop();
    } else if (!introduced && !config.fullScene) play();
  }

  function react() {
    if (reduced()) return;
    pendingReaction = true;
    play();
  }

  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .2;
    if (!visible) {
      if (playingReaction && animations.some(animation => animation.playState === 'running')) {
        pendingReaction = true;
      }
      stop();
    } else if (pendingReaction || (!introduced && !config.fullScene)) play(pendingReaction);
  }, { threshold: [.2] });
  visibility.observe(frame);
  replay?.addEventListener('click', () => play(true));
  if (config.fullScene) document.getElementById('startButton')?.addEventListener('click', () => play());
  deviceMotion.addEventListener('change', syncMotion);
  window.addEventListener('larriverse:settings', syncMotion);
  window.addEventListener('larriverse:comfort-opened', stop);
  window.addEventListener('larriverse:bloom-message', ({ detail }) => {
    if (detail?.gameId === gameId && (detail.pose === 'cheer' || detail.pose === 'celebrate')) react();
  });
  window.addEventListener('larriverse:profile', ({ detail }) => {
    const next = detail?.games?.[gameId]?.sessions ?? 0;
    if (next > sessions) react();
    sessions = next;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!introduced && !config.fullScene) play();
  });
  syncMotion();
}
