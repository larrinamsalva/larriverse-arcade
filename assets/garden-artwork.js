// Garden-only SVG miniatures. No shared icon assets, question data or gameplay state are changed.
// All coordinates are in a 100 × 100 miniature; scenes and answer cards reuse the same models.
const models = {
  gardenBed: '<ellipse cx="50" cy="91" rx="43" ry="6" fill="#292b1b" opacity=".18"/><path d="M8 44 49 22 92 44 51 67Z" fill="#d9aa70" stroke="#86512e" stroke-width="3"/><path d="M19 44 49 29 81 44 51 59Z" fill="#69432c"/><path d="M25 44 49 32 75 44 50 56Z" fill="#7d5234"/><g fill="#ac8056"><ellipse cx="40" cy="44" rx="5" ry="2"/><ellipse cx="61" cy="48" rx="4" ry="2"/><ellipse cx="53" cy="38" rx="3" ry="2"/></g><g fill="#d8b08a"><circle cx="35" cy="43" r="2"/><circle cx="55" cy="53" r="1.8"/><circle cx="65" cy="43" r="1.5"/></g><path d="M8 44 51 67v19L8 62Z" fill="#ca8751" stroke="#80502e" stroke-width="2.5"/><path d="M51 67 92 44v18L51 86Z" fill="#925632" stroke="#653d27" stroke-width="2.5"/><path d="M8 44 51 67 92 44" fill="none" stroke="#f4cc8c" stroke-width="5" stroke-linejoin="round"/><path d="M10 51 49 73M10 60l39 21M54 73l35-20M54 82l35-20" fill="none" stroke="#eab577" stroke-width="2.1" opacity=".85"/><path d="M20 54q10 1 17 8m-13-4q-2-5 2-4m38 16q8-8 17-8m-14 8q2-6 8-6" fill="none" stroke="#8a4e2e" stroke-width="1.5"/><path d="M48 69v15M88 48v12" stroke="#724529" stroke-width="3"/><ellipse cx="30" cy="61" rx="3" ry="2" fill="#8e5735"/><ellipse cx="72" cy="65" rx="2.5" ry="2" fill="#6c412d"/>',
  wateringCan: '<ellipse cx="51" cy="91" rx="39" ry="5" fill="#28404a" opacity=".18"/><path d="M26 40Q27 34 35 34h31q9 0 9 9l-4 31q-2 12-14 12H40q-12 0-13-12Z" fill="#218fa3" stroke="#2b586a" stroke-width="3.5"/><path d="M30 43q2-6 9-6h26q5 0 6 6l-3 9H31Z" fill="#95eced"/><path d="M31 59h38M34 67h31" fill="none" stroke="#63c4cb" stroke-width="3"/><path d="M27 45Q5 31 7 57q1 21 20 16" fill="none" stroke="#2b6171" stroke-width="9"/><path d="M27 45Q9 36 12 55" fill="none" stroke="#b3e5e7" stroke-width="3"/><path d="M71 47 86 24l7 5-15 28Z" fill="#388c9f" stroke="#2b6171" stroke-width="3"/><path d="M83 23q9-15 15-1l-2 8-14 4Z" fill="#70d6da" stroke="#326b79" stroke-width="3"/><circle cx="90" cy="26" r="2" fill="#e6ffff"/><path d="M38 42h27M39 80q18 3 26-5" stroke="#e6ffff" stroke-width="3" opacity=".8"/><g fill="#68cbe5" stroke="#2b97bc" stroke-width="1.3"><path d="M93 39q-5 7-5 11a5 5 0 0 0 10 0q0-4-5-11Z"/><path d="M77 59q-4 5-4 8a4 4 0 0 0 8 0q0-3-4-8Z"/></g>',
  tomato: '<ellipse cx="50" cy="91" rx="30" ry="5" fill="#5e392b" opacity=".16"/><path d="M50 27c-15-9-34-3-37 21-3 28 10 40 36 41 23 1 38-13 38-39 0-24-22-33-37-23Z" fill="#c9342d" stroke="#852e2a" stroke-width="3"/><path d="M50 28c-15-8-30 1-32 24-1 19 7 30 21 33 10 2 13-10 15-24 2-16 2-26-4-33Z" fill="#ee5644"/><path d="M50 29q-5-16 1-19" fill="none" stroke="#507b3c" stroke-width="6" stroke-linecap="round"/><path d="m50 27-20-9 10 17-19 6 26-4 9 10 2-15 22-9-23 1-3-12Z" fill="#4b994d" stroke="#316f37" stroke-width="2"/><path d="M28 44q4-11 13-11" fill="none" stroke="#ffa48a" stroke-width="7" stroke-linecap="round"/><g fill="#f58a67" opacity=".55"><circle cx="30" cy="69" r="2"/><circle cx="66" cy="67" r="2"/></g>',
  carrot: '<ellipse cx="48" cy="92" rx="28" ry="5" fill="#543929" opacity=".16"/><path d="M31 39Q47 26 69 39 67 54 48 75L29 95q1-26 2-56Z" fill="#e47c24" stroke="#a75223" stroke-width="3"/><path d="M33 43q16-8 28-4-5 18-25 45Z" fill="#ffa442"/><path d="m37 51 12 3m-15 12 11 4m-13 11 8 2m19-37 7 2" fill="none" stroke="#bb6427" stroke-width="2.4" stroke-linecap="round"/><path d="M49 38Q21 29 24 11q22-2 27 25Q48 12 62 5q14 16-8 33Q73 15 87 22q-5 19-34 18" fill="#66b85b" stroke="#347d43" stroke-width="2.5"/><path d="M48 34q-6-15-18-21M53 34q2-12 8-22m-5 22q15-9 25-10" fill="none" stroke="#b7e47b" stroke-width="2.4"/>',
  berries: '<ellipse cx="50" cy="90" rx="34" ry="5" fill="#402940" opacity=".17"/><g stroke="#4c3368" stroke-width="3"><circle cx="31" cy="57" r="17" fill="#65428e"/><circle cx="55" cy="42" r="17" fill="#6e4b9c"/><circle cx="72" cy="62" r="16" fill="#4a3c82"/><circle cx="48" cy="70" r="17" fill="#72529d"/></g><g fill="#b09bdc"><ellipse cx="27" cy="50" rx="5" ry="7"/><ellipse cx="51" cy="36" rx="5" ry="7"/><ellipse cx="67" cy="55" rx="4" ry="6"/><ellipse cx="44" cy="64" rx="5" ry="7"/></g><path d="M48 26q-4-17 7-23m-4 15q16-17 29-8-5 17-28 17" fill="#76bb5c" stroke="#427e46" stroke-width="3"/><g fill="#45336c"><path d="m32 57 3-5 3 5-6-1-4 3 1-5-4-3 6 1Z"/><path d="m59 41 3-5 3 5-6-1-4 3 1-5-4-3 6 1Z"/></g>',
  lettuce: '<ellipse cx="50" cy="90" rx="37" ry="5" fill="#314c2b" opacity=".15"/><path d="M50 89Q12 84 11 58 8 37 30 36 28 13 47 15 59 5 68 29q27-4 24 27Q86 80 50 89Z" fill="#4f9f4c" stroke="#367844" stroke-width="3"/><path d="M49 85q-29-13-27-36 5-16 17-8-2-17 13-22 13 6 11 24 13-7 19 8-2 26-33 34Z" fill="#84cf68" stroke="#4b9851" stroke-width="2.3"/><path d="M50 82q-17-12-12-31 3-8 11-6 1-15 9-17 11 13 4 23 8 10-12 31Z" fill="#b5e78c"/><path d="M50 82q2-22 5-46M48 68 33 53M55 61l19-13M45 75l-20-13" fill="none" stroke="#d9f2a3" stroke-width="3" stroke-linecap="round"/><path d="M25 45q-5 14 7 24m41-29q13 14 1 28" fill="none" stroke="#d8ef9c" stroke-width="2.5"/>',
  seed: '<ellipse cx="50" cy="90" rx="32" ry="5" fill="#6b4632" opacity=".15"/><ellipse cx="33" cy="55" rx="17" ry="10" transform="rotate(-27 33 55)" fill="#925d3b" stroke="#603d2b" stroke-width="2.5"/><ellipse cx="68" cy="44" rx="17" ry="10" transform="rotate(19 68 44)" fill="#9d663c" stroke="#603d2b" stroke-width="2.5"/><path d="M23 55q8-9 20-6M58 40q11-6 21 2" fill="none" stroke="#ecc293" stroke-width="3.5" stroke-linecap="round"/><path d="M28 61q10-7 12-12M64 49q4-8 11-10" fill="none" stroke="#6c452e" stroke-width="1.5"/>',
  sprout: '<ellipse cx="50" cy="89" rx="28" ry="6" fill="#5f4533" opacity=".17"/><path d="M50 85V43" stroke="#36814c" stroke-width="6" stroke-linecap="round"/><path d="M48 60Q18 63 16 36q28-7 32 24ZM52 49Q54 20 86 25q0 26-34 24Z" fill="#77c567" stroke="#39804c" stroke-width="3"/><path d="M44 56 25 43M57 45l19-14" fill="none" stroke="#bce799" stroke-width="3"/><path d="M37 84q-8-4-13 2m39-1q7-6 13-2" stroke="#93613c" stroke-width="3" fill="none"/>',
  tomatoFlower: '<path d="M50 89V33m0 29-20-15m20 0 22-14" stroke="#367f46" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M30 48q-18-12-18-28 22-2 23 23M68 37q7-25 27-24 0 25-25 30" fill="#6fbe66" stroke="#3b8849" stroke-width="3"/><g transform="translate(50 30)"><g fill="#ffd561" stroke="#bf8939" stroke-width="2"><ellipse cy="-14" rx="8" ry="14"/><ellipse cy="-14" rx="8" ry="14" transform="rotate(72)"/><ellipse cy="-14" rx="8" ry="14" transform="rotate(144)"/><ellipse cy="-14" rx="8" ry="14" transform="rotate(216)"/><ellipse cy="-14" rx="8" ry="14" transform="rotate(288)"/></g><circle r="8" fill="#936b30"/><circle r="4" fill="#e9b44d"/></g>',
  tomatoPlant: '<ellipse cx="49" cy="91" rx="35" ry="5" fill="#304d31" opacity=".16"/><path d="M50 87V26M50 49 24 33m26 29 28-23M49 74 25 65" fill="none" stroke="#317d47" stroke-width="6" stroke-linecap="round"/><g fill="#75c36a" stroke="#397d49" stroke-width="2.3"><path d="M23 33q-22-18-17 6 12 11 23-2Z"/><path d="M24 34q12-19 18-9 2 16-18 15Z"/><path d="M77 40q-2-25 16-22 7 21-16 26Z"/><path d="M75 41q16-4 21 12-13 9-23-6Z"/><path d="M27 65q-15-22-24-6 7 20 25 11Z"/></g><g stroke="#85352e" stroke-width="2.3"><circle cx="41" cy="58" r="12" fill="#ec5943"/><circle cx="67" cy="68" r="11" fill="#da3c34"/></g><path d="M35 54q4-5 8-5M61 63q3-5 8-5" stroke="#ffc49a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="m40 46 3 4 5-1-4 4m22 3 3 5 5-1-4 4" stroke="#438d43" stroke-width="2.6" fill="none"/>',
  rake: '<ellipse cx="51" cy="91" rx="27" ry="5" fill="#24363d" opacity=".15"/><path d="m39 12 20 58" stroke="#a16b40" stroke-width="11" stroke-linecap="round"/><path d="m36 11 20 57" stroke="#e4b47a" stroke-width="4" stroke-linecap="round"/><path d="M40 68 20 78l9 11 50-17-2-12Z" fill="#7797a1" stroke="#395965" stroke-width="3"/><path d="m25 83 4 11m7-12 3 11m7-14 3 11m7-14 3 11m7-14 3 11m7-13 3 10" stroke="#4c737f" stroke-width="5" stroke-linecap="round"/><path d="m45 70 26-8" stroke="#d7e5df" stroke-width="3"/>',
  compost: '<ellipse cx="50" cy="89" rx="41" ry="7" fill="#3c3126" opacity=".22"/><path d="M13 79q2-24 19-23 4-27 21-23 24-5 30 27 10 6 5 19Z" fill="#63462e" stroke="#452f24" stroke-width="3"/><path d="M20 75q18-18 33-9 16-17 28 5" stroke="#936d48" stroke-width="5" fill="none"/><g fill="#a3825b"><circle cx="29" cy="74" r="4"/><circle cx="58" cy="47" r="4"/><circle cx="69" cy="74" r="3"/><circle cx="46" cy="58" r="3"/></g><path d="M34 53q-14-12-17-3 6 13 20 6m28-11q5-18 18-12-3 16-15 15" fill="#74ad5b" stroke="#4d8044" stroke-width="2"/>',
  basket: '<ellipse cx="51" cy="91" rx="37" ry="5" fill="#493421" opacity=".14"/><path d="M16 47h70l-9 40H25Z" fill="#b87839" stroke="#815126" stroke-width="3"/><path d="M21 50h59l-7 30H28Z" fill="#dfa85b"/><path d="M25 48q1-43 26-42 26 0 29 42" fill="none" stroke="#98662e" stroke-width="9"/><path d="M25 40q6-28 25-29 22 2 25 30" fill="none" stroke="#edc48a" stroke-width="3"/><g fill="none" stroke="#a36c36" stroke-width="3"><path d="M23 58h59M25 70h54M33 51l8 30m6-30 8 30m7-30 8 29"/></g><path d="M18 48h67" stroke="#f5cf8a" stroke-width="5"/>',
  plantLabel: '<path d="M50 23v69" stroke="#997046" stroke-width="11" stroke-linecap="round"/><path d="M49 23v63" stroke="#e9bd78" stroke-width="4"/><path d="M16 15h69v38H16Z" fill="#f8e3a5" stroke="#805630" stroke-width="4" stroke-linejoin="round"/><path d="M20 22h61M21 47h58" stroke="#f9efd5" stroke-width="3"/><path d="M30 31h40M30 40h24" stroke="#568454" stroke-width="4" stroke-linecap="round"/><circle cx="75" cy="34" r="3" fill="#aa7a47"/>',
  cutTomato: '<path d="M13 64Q13 29 47 26q35 1 39 37-2 20-37 24Q14 84 13 64Z" fill="#e24437" stroke="#973d36" stroke-width="3.5"/><path d="M22 64q0-25 25-29 25 3 29 28-2 15-27 16-24-1-27-15Z" fill="#f37c5b"/><path d="M47 38v38m-22-12h49" stroke="#f2b77f" stroke-width="4"/><g fill="#ffda9d" stroke="#d78a53" stroke-width="1.3"><ellipse cx="38" cy="49" rx="4" ry="7" transform="rotate(-23 38 49)"/><ellipse cx="59" cy="51" rx="4" ry="7" transform="rotate(23 59 51)"/><ellipse cx="39" cy="69" rx="4" ry="6" transform="rotate(23 39 69)"/><ellipse cx="60" cy="69" rx="4" ry="6" transform="rotate(-23 60 69)"/></g><path d="M24 58q7-17 16-18" stroke="#ffc6a8" stroke-width="4" fill="none"/>',
  bucket: '<ellipse cx="50" cy="91" rx="32" ry="5" fill="#333" opacity=".14"/><path d="M22 33h57l-7 52q-21 10-44 0Z" fill="#7194a4" stroke="#486477" stroke-width="3"/><path d="M26 37h49l-5 40q-18 6-39 0Z" fill="#abc5ca"/><path d="M22 37q-9-34 28-34t29 34" stroke="#576e79" stroke-width="7" fill="none"/><path d="M35 48h26" stroke="#f2f7f5" stroke-width="4"/>'
};

// Garden-only shadows, material highlights and foliage; shared iconDrawing remains intact.
const miniature = (name, fallback) => models[name] || fallback(name);
const at = (name, x, y, scale, fallback) =>
  `<g transform="translate(${x} ${y}) scale(${scale})">${miniature(name, fallback)}</g>`;
const safe = value => String(value).replace(/[^a-z0-9-]/gi, '-');

function subject(kind) {
  if (/cut-tomato/.test(kind)) return 'cutTomato';
  if (/tomato-flower/.test(kind)) return 'tomatoFlower';
  if (/ripe-tomato|hot-tomato|buried-tomato|moldy-fruit/.test(kind)) return 'tomato';
  if (/carrot|tiny-carrots/.test(kind)) return 'carrot';
  if (/lettuce/.test(kind)) return 'lettuce';
  if (/berries|berry/.test(kind)) return 'berries';
  if (/tomato|stem|roots|covered-plant|tight-wire/.test(kind)) return 'tomatoPlant';
  if (/watering|water|spray/.test(kind)) return 'wateringCan';
  if (/soil-test|weed-check|leaf-check/.test(kind)) return 'magnifier';
  if (/seed|spacing|shelf/.test(kind)) return /spacing/.test(kind) ? 'sprout' : 'seed';
  if (/garden-path/.test(kind)) return 'gardenBed';
  if (/sunny-bed|shade-bed|raised-bed|puddle-bed|dry-bed|roof-bed|empty-row/.test(kind)) return 'gardenBed';
  if (/rake/.test(kind)) return 'rake';
  if (/compost|mulch/.test(kind)) return 'compost';
  if (/plant-label|hidden-label|wet-label/.test(kind)) return 'plantLabel';
  if (/trellis/.test(kind)) return 'trellis';
  if (/clean-basket/.test(kind)) return 'basket';
  if (/dirty-bucket/.test(kind)) return 'bucket';
  if (/plastic/.test(kind)) return 'wrap';
  if (/box/.test(kind)) return 'basket';
  if (/salt/.test(kind)) return 'rice';
  if (/rock|concrete/.test(kind)) return 'rock';
  if (/walkway|sidewalk/.test(kind)) return 'road';
  if (/shade/.test(kind)) return 'tree';
  if (/paint-brush/.test(kind)) return 'paintBrush';
  if (/fork/.test(kind)) return 'fork';
  if (/toy/.test(kind)) return 'robot';
  if (/clock/.test(kind)) return 'sun';
  if (/sunny|hot/.test(kind)) return 'sun';
  return 'sprout';
}

function details(kind, fallback) {
  if (/spacing/.test(kind)) return at('sprout', 3, 60, .31, fallback) + at('sprout', 46, 60, .31, fallback) + at('sprout', 82, 60, .31, fallback);
  if (/seed-pile/.test(kind)) return at('seed', 13, 57, .36, fallback) + at('seed', 57, 57, .36, fallback);
  if (/seed-depth|deep-seed/.test(kind)) return '<path d="M17 83h87" stroke="#785038" stroke-width="7"/><path d="M29 83v-22m64 22V47" stroke="#f4d99f" stroke-width="2" stroke-dasharray="3 4"/>';
  if (/puddle-bed/.test(kind)) return '<ellipse cx="61" cy="82" rx="39" ry="9" fill="#59b7db" stroke="#2f819f" stroke-width="2"/><path d="M43 80q13-7 27-1" stroke="#dcfcff" stroke-width="3" fill="none"/>';
  if (/dry-bed/.test(kind)) return '<path d="m39 65 10-6 7 8 12-4m-26 9 7 4-6 8" stroke="#51372c" stroke-width="3" fill="none"/>';
  if (/root-watering|watering-can/.test(kind)) return at('sprout', 73, 49, .33, fallback) + '<g fill="#6ecbe2"><path d="M93 37q-8 11 0 14 9-4 0-14Z"/></g>';
  if (/hard-spray/.test(kind)) return '<path d="M78 24 111 63M73 31l40 52" stroke="#45bcdb" stroke-width="7" stroke-linecap="round"/>';
  if (/tomato-flower/.test(kind)) return at('tomatoFlower', 26, 14, .62, fallback);
  if (/ripe-tomato/.test(kind)) return '<path d="M29 41q10-13 20-11" fill="none" stroke="#ffb9a0" stroke-width="4"/>';
  if (/moldy-fruit/.test(kind)) return '<g fill="#d3d8bc" stroke="#709071" stroke-width="1.5"><circle cx="57" cy="58" r="8"/><circle cx="64" cy="53" r="5"/><circle cx="49" cy="64" r="5"/></g>';
  if (/rotten-carrot/.test(kind)) return '<g fill="#755a36"><circle cx="59" cy="57" r="8"/><circle cx="43" cy="74" r="7"/></g>';
  if (/tomato-transplant|carrot-row/.test(kind)) return at('sprout', 71, 47, .32, fallback);
  if (/tomato-support|tight-wire/.test(kind)) return '<path d="M25 24v61m53-64v62M24 35h55M22 60h57" stroke="#b18550" stroke-width="4" fill="none"/>';
  if (/weed-check|leaf-check/.test(kind)) return at('sprout', 77, 64, .28, fallback);
  if (/mulch/.test(kind)) return '<path d="M21 81q14-9 27 2t46-2" stroke="#ad7a43" stroke-width="7" fill="none" stroke-linecap="round"/>';
  if (/shade-bed|covered-plant|roof-bed/.test(kind)) return '<path d="M10 25h97" stroke="#567e61" stroke-width="10" opacity=".65"/>';
  if (/clean-basket/.test(kind)) return '<path d="M36 45q8-6 16 0t17 0" stroke="#fce3a9" stroke-width="3" fill="none"/>';
  if (/dirty-bucket/.test(kind)) return '<g fill="#6d5139"><circle cx="48" cy="60" r="7"/><circle cx="62" cy="72" r="5"/></g>';
  if (/hot-berries|hot-tomato/.test(kind)) return at('sun', 72, 3, .31, fallback);
  if (/berry-storage/.test(kind)) return at('refrigerator', 81, 19, .3, fallback);
  if (/cut-tomato/.test(kind)) return at('refrigerator', 82, 12, .3, fallback);
  return '';
}

const wrong = /shade-bed|walkway-bed|paint-brush|fork|puddle-bed|concrete|plastic|salt|roof-bed|hidden|shelf-seed|deep-seed|seed-pile|empty-row|move-carrot|pull-stem|dry-roots|box|hard-spray|dry-bed|guess-water|clock|wet-label|sidewalk-water|taste-plant|pull-all|buried-plant|tight-wire|covered-plant|unknown-spray|trash-garden|moldy|tiny-carrots|rotten|uproot|step-plant|dirty-bucket|hot-berries|hot-tomato|buried-tomato/;

export function renderGardenChoice(kind, fallback) {
  const name = subject(kind), id = safe(kind);
  const spotlight = /garden-path|root-watering|tomato-transplant|tomato-support|seed-depth|spacing/.test(kind);
  return `<svg class="learning-choice-art garden-choice-art" viewBox="0 0 120 108" aria-hidden="true" focusable="false">
    <defs><linearGradient id="garden-card-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff8e6"/><stop offset="1" stop-color="#ceeabb"/></linearGradient></defs>
    <rect x="4" y="4" width="112" height="100" rx="20" fill="url(#garden-card-${id})" stroke="#769457" stroke-width="2.5"/>
    <path d="M10 79q27-13 49 1t50-3v22H10Z" fill="#b4d68a" opacity=".63"/>
    <ellipse cx="61" cy="94" rx="39" ry="5" fill="#355c38" opacity=".14"/>
    ${at(name, spotlight ? 4 : 12, spotlight ? 4 : 5, spotlight ? .89 : .97, fallback)}
    ${details(kind, fallback)}
    ${wrong.test(kind) ? '<g transform="translate(99 20)"><circle r="12" fill="#fff3cf" stroke="#ad6d37" stroke-width="2.7"/><path d="m-5-5 10 10m0-10L-5 5" stroke="#8e3f2c" stroke-width="3" stroke-linecap="round"/></g>' : ''}
  </svg>`;
}

export function renderGardenScene(kind, fallback) {
  const name = subject(kind), id = safe(kind);
  const harvest = /harvest|ripe|berry-storage|cut-tomato|clean-basket/.test(kind);
  const plant = /seed|spacing|carrot-row|tomato-transplant|tomato-flower/.test(kind) ? 'sprout' :
    /lettuce/.test(kind) ? 'lettuce' : /carrot/.test(kind) ? 'carrot' : 'tomatoPlant';
  return `<svg class="learning-scene-art garden-learning-art" viewBox="0 0 760 245" role="img" aria-label="Illustrated garden lesson about ${kind.replaceAll('-', ' ').replace(/&/g, 'and')}">
    <defs>
      <linearGradient id="garden-sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a6e4ed"/><stop offset="1" stop-color="#f5f9da"/></linearGradient>
      <linearGradient id="garden-grass-${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#98d574"/><stop offset="1" stop-color="#66aa5c"/></linearGradient>
    </defs>
    <rect width="760" height="245" rx="22" fill="url(#garden-sky-${id})"/>
    <circle cx="674" cy="45" r="27" fill="#ffdf79"/><circle cx="674" cy="45" r="36" fill="#fff1ad" opacity=".4"/>
    <path d="M0 151q119-33 253 1 128-29 262-5 135-31 245-3v101H0Z" fill="#a4d98b"/>
    <path d="M0 179q190-33 366 6 220-36 394-10v70H0Z" fill="url(#garden-grass-${id})"/>
    <path d="m0 221q185-20 370 0 210-29 390-2v26H0Z" fill="#53975c" opacity=".36"/>
    <g fill="none" stroke="#e0f0b0" stroke-width="2" opacity=".8"><path d="m28 179 5-12 4 10m34 25 5-15 5 13m174-23 7-10 7 10m389 15 7-12 5 12m50-12 5-11 5 11"/></g>
    ${harvest
      ? '<path d="M90 191h562v22H90Z" fill="#a76c3b"/><path d="M90 191h562v7H90Z" fill="#e1ad6c"/><path d="M105 199h520" stroke="#7c512f" stroke-width="2" stroke-dasharray="60 5"/>'
      : at('gardenBed', 102, 117, 1.38, fallback)}
    ${harvest ? at('basket', 115, 104, 1.08, fallback) : at(plant, 533, 115, 1.04, fallback)}
    ${at(name, 320, 57, 1.42, fallback)}
    ${/watering|root-watering|water/.test(kind) ? '<g fill="#63c7e2" stroke="#398aaa" stroke-width="2"><path d="M507 110q-8 11-8 18a8 8 0 0 0 16 0q0-7-8-18Z"/><path d="M530 124q-6 9-6 14a7 7 0 0 0 14 0q0-5-8-14Z"/></g>' : ''}
    ${/tomato-flower/.test(kind) ? at('tomatoFlower', 539, 106, .91, fallback) : ''}
    ${/berry-storage/.test(kind) ? at('berries', 482, 138, .56, fallback) : ''}
    ${/cut-tomato/.test(kind) ? at('cutTomato', 486, 145, .59, fallback) : ''}
    <g fill="#fff3ba" stroke="#e4bd62" stroke-width="2"><circle cx="61" cy="220" r="6"/><circle cx="712" cy="206" r="5"/></g>
  </svg>`;
}
