import { spiderLegLayout } from '../../assets/spider-field-guide-art.js';

const motions = {
  jumping: { kind: 'hop', duration: 1550, travel: [-26, 0] },
  orb: { kind: 'web', duration: 2250, travel: [3, 2] },
  wolf: { kind: 'walk', duration: 1550, travel: [-24, 1], steps: 3 },
  cellar: { kind: 'web', duration: 2450, travel: [-2, 5] },
  crab: { kind: 'walk', duration: 1920, travel: [1, 12], steps: 2 },
  tarantula: { kind: 'walk', duration: 2320, travel: [-17, 1], steps: 2 },
  widow: { kind: 'web', duration: 2140, travel: [2.5, 1.5] },
  recluse: { kind: 'walk', duration: 1720, travel: [-10, 2], steps: 2 },
  grass: { kind: 'walk', duration: 1640, travel: [-18, 0], steps: 2 },
  trapdoor: { kind: 'walk', duration: 2020, travel: [-9, 2], steps: 1 }
};

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const ease = t => t * t * (3 - 2 * t);
const round = value => Math.round(value * 100) / 100;
const angle = ([x1, y1], [x2, y2]) => Math.atan2(y2 - y1, x2 - x1);
const distance = ([x1, y1], [x2, y2]) => Math.hypot(x2 - x1, y2 - y1);
const translate = (x, y) => `translate(${round(x)} ${round(y)})`;

function turnSegment(node, origin, destination, radians) {
  const rotation = round(radians * 180 / Math.PI);
  node.setAttribute('transform',
    translate(destination[0] - origin[0], destination[1] - origin[1]) +
    ` rotate(${rotation} ${origin[0]} ${origin[1]})`);
}

function articulate(leg, anchor, target) {
  // Keep each leg segment the same length and keep the knee on its original
  // side of the leg. A planted foot can stay in place as the body moves.
  const heading = angle(anchor, target);
  const x = Math.cos(heading), y = Math.sin(heading);
  const reach = clamp(distance(anchor, target), Math.abs(leg.upperLength - leg.lowerLength) + .001,
    leg.upperLength + leg.lowerLength - .001);
  const along = (leg.upperLength ** 2 + reach ** 2 - leg.lowerLength ** 2) / (2 * reach);
  const bend = leg.bend * Math.sqrt(Math.max(0, leg.upperLength ** 2 - along ** 2));
  const knee = [anchor[0] + x * along - y * bend, anchor[1] + y * along + x * bend];
  const tip = [anchor[0] + x * reach, anchor[1] + y * reach];
  turnSegment(leg.upper, leg.anchor, anchor, angle(anchor, knee) - leg.restUpper);
  turnSegment(leg.lower, leg.knee, knee, angle(knee, tip) - leg.restLower);
}

function step(progress, group, count) {
  const phase = Math.max(0, progress * count - group / 2);
  const completed = Math.floor(phase);
  const swing = clamp((phase - completed) / .4, 0, 1);
  return { advance: (completed + ease(swing)) / count, lift: Math.sin(Math.PI * swing) };
}

export function createSpiderRig(svg) {
  const spec = motions[svg.dataset.species];
  const [travelX, travelY] = spec.travel;
  const body = svg.querySelector('[data-spider-body]');
  const shadow = svg.querySelector('[data-spider-shadow]');
  const legs = spiderLegLayout(svg.dataset.species).map(rest => {
    const { anchor, knee, tip, number, pair, side } = rest;
    const element = svg.querySelector(`[data-leg="${number}"]`);
    const bend = Math.sign((tip[0] - anchor[0]) * (knee[1] - anchor[1]) -
      (tip[1] - anchor[1]) * (knee[0] - anchor[0]));
    return {
      ...rest, bend, group: (pair + (side > 0 ? 1 : 0)) % 2,
      upperLength: distance(anchor, knee), lowerLength: distance(knee, tip),
      restUpper: angle(anchor, knee), restLower: angle(knee, tip),
      upper: element.querySelector('[data-leg-part="upper"]'),
      lower: element.querySelector('[data-leg-part="lower"]')
    };
  });

  function pose(progress) {
    const airborne = clamp((progress - .22) / .52, 0, 1);
    const leap = spec.kind === 'hop' ? Math.sin(Math.PI * airborne) : 0;
    const flex = spec.kind === 'web' ? Math.sin(2 * Math.PI * progress) * Math.sin(Math.PI * progress) : 0;
    const advance = spec.kind === 'hop' ? ease(airborne) : spec.kind === 'web' ? flex : ease(progress);
    const x = travelX * advance;
    const y = travelY * advance - leap * 10;
    const steps = spec.kind === 'walk' ? [step(progress, 0, spec.steps), step(progress, 1, spec.steps)] : null;
    const tuck = spec.kind === 'hop' ? Math.sin(Math.PI * clamp(progress / .22, 0, 1)) * .065 + leap * .13 : 0;
    body.setAttribute('transform', translate(x, y));
    shadow.setAttribute('transform', translate(x, travelY * advance));
    shadow.setAttribute('opacity', round(.16 - leap * .075));

    for (const leg of legs) {
      const [ax, ay] = leg.anchor;
      const [tx, ty] = leg.tip;
      let toeX = tx, toeY = ty;
      if (steps) {
        const foot = steps[leg.group];
        toeX += travelX * foot.advance - (tx - ax) * foot.lift * .065;
        toeY += travelY * foot.advance - (ty - ay) * foot.lift * .065;
      } else if (spec.kind === 'hop') {
        toeX += x - (tx - ax) * tuck;
        toeY += y - (ty - ay) * tuck;
      } else {
        // Small changes at the front feet suggest contact with the drawn silk.
        const reach = leg.pair < 2 ? flex * .045 : 0;
        toeX += (tx - ax) * reach;
        toeY += (ty - ay) * reach;
      }
      articulate(leg, [ax + x, ay + y], [toeX, toeY]);
    }
  }

  function rest() {
    body.removeAttribute('transform');
    shadow.removeAttribute('transform');
    shadow.setAttribute('opacity', '.16');
    for (const { upper, lower } of legs) {
      upper.removeAttribute('transform');
      lower.removeAttribute('transform');
    }
  }

  return { duration: spec.duration, pose, rest };
}

export function setupSpiderMotion(scene, button) {
  const deviceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let rig;
  let frame = null;
  let inView = false;
  let played = false;
  const reduced = () => deviceMotion.matches ||
    document.documentElement.classList.contains('larriverse-reduced-motion');

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    rig?.rest();
  }

  function play() {
    if (!rig || reduced() || document.hidden) return;
    stop();
    played = true;
    let start;
    function render(time) {
      start ??= time;
      const progress = Math.min(1, (time - start) / rig.duration);
      rig.pose(progress);
      frame = progress < 1 ? requestAnimationFrame(render) : null;
    }
    frame = requestAnimationFrame(render);
  }

  function refreshComfort() {
    button.hidden = reduced();
    if (reduced() || document.hidden) stop();
    else if (inView && !played) play();
  }

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= .45;
    if (!inView) stop();
    else if (!played) play();
  }, { threshold: [.45] });
  observer.observe(scene);
  button.addEventListener('click', () => {
    if (!inView) scene.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    play();
  });
  deviceMotion.addEventListener('change', refreshComfort);
  document.addEventListener('visibilitychange', refreshComfort);
  window.addEventListener('larriverse:settings', refreshComfort);
  window.addEventListener('larriverse:comfort-opened', stop);

  return function showSpider() {
    stop();
    rig = createSpiderRig(scene.querySelector('svg[data-species]'));
    played = false;
    refreshComfort();
  };
}
