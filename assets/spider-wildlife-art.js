import { spiderFigureSize, spiderLegLayout } from './spider-field-guide-art.js';

const svgNamespace = 'http://www.w3.org/2000/svg';
const decodedImages = new Map();
const legWidthScale = { jumping: 1.58, tarantula: 1.94, trapdoor: 1.62, wolf: 1.37 };
const round = value => Math.round(value * 100) / 100;

function wildlifeImage(folder, species) {
  const url = new URL(`./spider-wildlife/${folder}/${species}.webp`, import.meta.url).href;
  if (!decodedImages.has(url)) {
    const image = new Image();
    image.src = url;
    const ready = image.decode().then(
      () => ({ url, ratio: image.naturalWidth / image.naturalHeight }),
      () => {
        decodedImages.delete(url);
        return null;
      }
    );
    decodedImages.set(url, ready);
  }
  return decodedImages.get(url);
}

function layer(asset, kind, { x, y, width, height, fit = 'none' }) {
  const image = document.createElementNS(svgNamespace, 'image');
  image.setAttribute('href', asset.url);
  image.setAttribute('data-wildlife-layer', kind);
  for (const [key, value] of Object.entries({ x, y, width, height })) {
    image.setAttribute(key, round(value));
  }
  image.setAttribute('preserveAspectRatio', fit);
  return image;
}

function legTexture(texture, from, to, thickness, visibleFraction = 1) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const jointOverlap = thickness * .38;
  const skin = layer(texture, 'leg', {
    x: -jointOverlap,
    y: -thickness / 2,
    width: (Math.hypot(dx, dy) + jointOverlap * 2) / visibleFraction,
    height: thickness
  });
  const angle = round(Math.atan2(dy, dx) * 180 / Math.PI);
  skin.setAttribute('transform', `translate(${from.join(' ')}) rotate(${angle})`);
  // Use the wider part of the texture above a knee and the full taper at a foot.
  if (visibleFraction < 1) skin.style.clipPath = `inset(0 ${round(100 * (1 - visibleFraction))}% 0 0 round 1px)`;
  return skin;
}

export async function showSpiderWildlife(svg) {
  const { species } = svg.dataset;
  const [habitat, body, texture] = await Promise.all([
    wildlifeImage('habitats', species),
    wildlifeImage('bodies', species),
    wildlifeImage('legs', species)
  ]);
  if (!svg.isConnected || !habitat || !body || !texture) return;

  const size = spiderFigureSize(species);
  const anatomy = svg.querySelector('[data-anatomy]');
  const portraitHeight = Math.max(size.height * .86, Math.min(size.height * 1.08, size.width / body.ratio));
  svg.insertBefore(layer(habitat, 'habitat', {
    x: 0, y: 0, width: 320, height: 200, fit: 'xMidYMid slice'
  }), anatomy);
  anatomy.querySelector('[data-spider-body]').append(layer(body, 'body', {
    x: size.left, y: 108 - portraitHeight / 2, width: size.width, height: portraitHeight
  }));

  // These are the same anchors and knees used by the movement controller.
  for (const { number, pair, anchor, knee, tip } of spiderLegLayout(species)) {
    const leg = anatomy.querySelector(`[data-leg="${number}"]`);
    const scale = species === 'crab' && pair < 2 ? 1.68 : legWidthScale[species] ?? 1.22;
    const width = size.legWidth * scale;
    leg.querySelector('[data-leg-part="upper"]').append(legTexture(texture, anchor, knee, width, .77));
    leg.querySelector('[data-leg-part="lower"]').append(legTexture(texture, knee, tip, width * .76));
  }
  svg.dataset.spiderArt = 'wildlife';
}
