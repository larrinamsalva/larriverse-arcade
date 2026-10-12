// Bridge Buddies-only miniature materials. SVG uses a shared 140 × 96 coordinate system.
// These illustrations are presentation-only: bridge capacities and tests live elsewhere.
const plankDeck = [
  '<g class="bridge-wood-deck">',
  '<ellipse cx="70" cy="89" rx="62" ry="5" fill="#332c25" opacity=".19"/>',
  '<path d="M8 15 117 11 134 19 25 25Z" fill="#f0bc7e" stroke="#78502f" stroke-width="2"/>',
  '<path d="M25 25 134 19 130 35 22 39Z" fill="#ac6338" stroke="#6c4029" stroke-width="2.3"/>',
  '<path d="M8 15 25 25 22 39 7 28Z" fill="#d18b4d" stroke="#70432b" stroke-width="2.2"/>',
  '<path d="M12 19 115 15m-85 14 98-5M27 35l98-5" fill="none" stroke="#f8d6a1" stroke-width="2.4" stroke-linecap="round"/>',
  '<path class="wood-grain" d="M33 20q12-4 29-1t24-2m-59 13q13-5 30-1t34-3" fill="none" stroke="#82502f" stroke-width="1.8"/>',
  '<ellipse cx="93" cy="18" rx="6" ry="2.7" transform="rotate(-3 93 18)" fill="none" stroke="#8d5932" stroke-width="1.8"/>',
  '<ellipse cx="93" cy="18" rx="2" ry="1" fill="#936340"/>',
  '<path d="M11 22q4-3 10 2m-9 3q4-3 9 1" stroke="#f7cb86" stroke-width="1.8" fill="none"/>',
  '<g fill="#59646b" stroke="#cedbe0" stroke-width="1.4"><circle cx="30" cy="30" r="3"/><circle cx="119" cy="26" r="3"/></g>',
  '</g>',
].join('');

const models = {
  plank: [
    '<g class="bridge-part-plank">',
    '<path d="M18 49 118 44 132 50 29 57Z" fill="#efb56e" stroke="#764829" stroke-width="2.5"/>',
    '<path d="M29 57 132 50 127 65 25 73Z" fill="#bb6d3a" stroke="#744329" stroke-width="2.5"/>',
    '<path d="M18 49 29 57 25 73 15 64Z" fill="#e5a165" stroke="#795032" stroke-width="2.5"/>',
    '<path d="m33 53 82-5m-84 15 91-6" stroke="#fbd39b" stroke-width="2.4" fill="none"/>',
    '<path class="wood-grain" d="M41 55q12-6 22-2t21-3m-41 16q14-5 28-2t24-5" stroke="#8c5432" stroke-width="1.7" fill="none"/>',
    '<ellipse cx="96" cy="52" rx="7" ry="3" transform="rotate(-4 96 52)" fill="none" stroke="#875029" stroke-width="2"/>',
    '<path d="m30 71-7 15m96-22 7 20" stroke="#754529" stroke-width="7" stroke-linecap="round"/>',
    '<path d="m30 71-7 15m96-22 7 20" stroke="#e8b279" stroke-width="2" stroke-linecap="round"/>',
    '<g fill="#5b6770" stroke="#d7e2e4" stroke-width="1.5"><circle cx="36" cy="62" r="3.5"/><circle cx="115" cy="57" r="3.5"/></g>',
    '</g>',
  ].join(''),
  beam: [
    '<g class="bridge-part-beam">',
    '<path d="M17 37h15v47H17Z" fill="#c27a43" stroke="#6f452a" stroke-width="2.5"/>',
    '<path d="m32 37 7 5v42h-7Z" fill="#7a4629"/>',
    '<path d="M108 34h16v50h-16Z" fill="#b86e3e" stroke="#6f452a" stroke-width="2.5"/>',
    '<path d="m124 34 7 5v45h-7Z" fill="#704126"/>',
    '<path d="M17 49 119 44 132 53 29 61Z" fill="#f4bd78" stroke="#764828" stroke-width="2.4"/>',
    '<path d="M29 61 132 53 124 80 25 87Z" fill="#99532f" stroke="#653c26" stroke-width="3"/>',
    '<path d="M17 49 29 61 25 87 14 74Z" fill="#ce8450" stroke="#6a452c" stroke-width="2.4"/>',
    '<path d="M30 65 128 58M30 82l90-7" fill="none" stroke="#e9aa6c" stroke-width="3"/>',
    '<path class="wood-grain" d="M38 70q23-7 47-4t32-4M41 78q18-5 30-3t26-2" stroke="#6d3d26" stroke-width="2" fill="none"/>',
    '<path d="m23 41 1 15m0 21 0 6m91-44 0 10m0 33-1-12" stroke="#edb77b" stroke-width="2.3" fill="none"/>',
    '<path d="M29 63 40 80M113 56l-10 23" stroke="#6c4229" stroke-width="5" opacity=".75"/>',
    '<g fill="#556168" stroke="#dce1df" stroke-width="1.5"><circle cx="32" cy="72" r="4"/><circle cx="112" cy="66" r="4"/><circle cx="24" cy="47" r="3.3"/><circle cx="117" cy="45" r="3.3"/></g>',
    '</g>',
  ].join(''),
  triangle: [
    '<g class="bridge-part-truss" stroke-linejoin="round">',
    '<path d="M13 81 68 36 130 81 117 81 69 54 29 81Z" fill="#b26a3d" stroke="#704126" stroke-width="3.5"/>',
    '<path d="M18 81 68 39 124 81" stroke="#eeb475" stroke-width="9" fill="none" stroke-linecap="round"/>',
    '<path d="M18 81 68 39 124 81" stroke="#854c2e" stroke-width="2.5" fill="none"/>',
    '<path d="M68 43 67 81" stroke="#c48249" stroke-width="11"/>',
    '<path d="M68 43 67 81" stroke="#eeb77a" stroke-width="3.5"/>',
    '<path d="M30 80 68 56 108 80" stroke="#ca8950" stroke-width="7" fill="none"/>',
    '<path d="m33 78 34-22 38 22" stroke="#f7c68c" stroke-width="2.5" fill="none"/>',
    '<path d="M12 80h119l-7 12H18Z" fill="#a45d34" stroke="#633c26" stroke-width="3"/>',
    '<path d="M16 82h111" stroke="#ecc28a" stroke-width="4"/>',
    '<path d="m23 89 95 0" stroke="#794127" stroke-width="1.8"/>',
    '<path class="wood-grain" d="M37 66q8-4 13-9m30-7q9 4 14 11m-22 4v13" stroke="#80512e" stroke-width="1.8" fill="none"/>',
    '<g fill="#586269" stroke="#dce4e3" stroke-width="1.6"><circle cx="20" cy="81" r="4.5"/><circle cx="68" cy="43" r="4.6"/><circle cx="68" cy="82" r="4.5"/><circle cx="124" cy="81" r="4.5"/></g>',
    '</g>',
  ].join(''),
};
const emptyGuide = [
  '<g class="bridge-part-empty">',
  '<path d="M16 48h109" fill="none" stroke="#6a9ca0" stroke-width="4" stroke-dasharray="9 7"/>',
  '<path d="M18 72h104" fill="none" stroke="#b3d5cf" stroke-width="5"/>',
  '<path d="m18 72-9 14m113-14 9 14" stroke="#759d8c" stroke-width="5"/>',
  '<circle cx="18" cy="72" r="5" fill="#668b85"/><circle cx="122" cy="72" r="5" fill="#668b85"/>',
  '</g>',
].join('');

export function bridgeMiniaturePart(id) {
  return Object.hasOwn(models, id) ? plankDeck + models[id] : emptyGuide;
}

// Decorative backdrop sits under the interactive bridge. One lightweight SVG for
// all crossings, with mountain/coast/river visual cues supplied by the level scene.
export function bridgeMiniatureLandscape(scene = 'creek') {
  const alpine = /mountain|canyon|snow/.test(scene);
  const coast = /coast|harbor/.test(scene);
  const night = /night/.test(scene);
  const ridges = alpine
    ? '<path d="M0 95 93 25 167 86 248 14 359 99 458 32 567 98 665 39 760 110V170H0Z" fill="#8099a2" opacity=".58"/><path d="m57 54 36-29 32 39m85-12 38-38 46 47m330 8 41-30 38 31" fill="#f4f5e8" opacity=".8"/>'
    : coast
      ? '<path d="M0 114q95-19 166 0 104-28 191 9 154-16 264-11 89-11 139-1v63H0Z" fill="#badcc8" opacity=".7"/>'
      : '<path d="M0 114q122-41 242-12t241-6 277 7v74H0Z" fill="#b5d998" opacity=".76"/>';
  const evening = night ? '<g fill="#fff2a4"><circle cx="80" cy="28" r="2"/><circle cx="302" cy="37" r="2"/><circle cx="567" cy="26" r="2"/><circle cx="710" cy="56" r="2"/></g>' : '';
  return `<svg class="bridge-backdrop" viewBox="0 0 760 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    ${ridges}
    ${evening}
    <path d="M0 164q85-32 192-8 140-39 244-5 135-21 324-7v78H0Z" fill="var(--bridge-bank, #91c778)" opacity=".9"/>
    <path d="M0 206q135-28 261-3 145-16 259-5 140-28 240-2v84H0Z" fill="var(--bridge-water, #49adbe)" opacity=".93"/>
    <path d="M0 210q100-24 213-10t226-1 321 1" fill="none" stroke="#edffed" stroke-width="6" opacity=".51"/>
    <g fill="none" stroke="#d6f6f1" stroke-linecap="round" opacity=".83">
      <path d="M22 243q27-6 54 0t55 0M209 223q17-5 42-2M368 254q35-8 78-1M559 230q29-6 65-1M676 258q22-4 48-1" stroke-width="4"/>
      <path d="m158 266 26-1m308-27 39-2m-234-15 36-1m390 22 22-2" stroke-width="2.5"/>
    </g>
    <g fill="#718b7b" stroke="#425e55" stroke-width="2.5">
      <path d="M31 198 43 182l19 2 12 12-9 13-27-1Z"/><path d="M694 199 711 181l20 5 13 12-10 12-34-2Z"/>
    </g>
    <g fill="#b0beb2"><path d="m35 194 9-11 16 2-11 6Z"/><path d="m707 191 6-8 18 5-13 2Z"/></g>
    <g fill="none" stroke="#568d50" stroke-linecap="round" stroke-width="3.5">
      <path d="m28 194-7-21m7 21 2-30m-2 30 12-25M82 201l-7-19m7 19 7-22M676 199l-8-27m8 27 4-24m26 23 11-23m-11 23-3-28"/>
    </g>
    <g fill="#f5ca6d"><circle cx="37" cy="176" r="3"/><circle cx="673" cy="174" r="3"/></g>
  </svg>`;
}
