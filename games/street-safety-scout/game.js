import { streetSafetyCategories, streetSafetyScenarios } from './scenarios.js';

const GAME_ID = 'street-safety-scout';
const ROUND_SIZE = 15;
const ROTATION_KEY = 'larriverse.streetSafetyScout.rotation.v1';
const sdk = window.LarriVerseArcade;
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

let round = [];
let step = 0;
let correct = 0;
let streak = 0;
let answered = false;
let sound = false;
let audioContext;

const shuffle = values => {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
};

function loadRotation() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(ROTATION_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function buildRound() {
  const rotation = loadRotation();
  const picks = [];
  for (const category of streetSafetyCategories) {
    const pool = streetSafetyScenarios.filter(item => item.category === category);
    const validIds = new Set(pool.map(item => item.id));
    let seen = Array.isArray(rotation[category]) ? [...new Set(rotation[category].filter(id => validIds.has(id)))] : [];
    let unseen = shuffle(pool.filter(item => !seen.includes(item.id)));
    const selected = [];
    while (selected.length < 3) {
      if (!unseen.length) {
        seen = [];
        const selectedIds = new Set(selected.map(item => item.id));
        unseen = shuffle(pool.filter(item => !selectedIds.has(item.id)));
      }
      const item = unseen.pop();
      selected.push(item);
      seen.push(item.id);
    }
    rotation[category] = seen;
    picks.push(...selected);
  }
  try { sessionStorage.setItem(ROTATION_KEY, JSON.stringify(rotation)); } catch {}
  return shuffle(picks);
}

const sceneDefs = () => `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8edfec"/><stop offset="1" stop-color="#e9fbff"/></linearGradient>
  <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5f6d75"/><stop offset="1" stop-color="#29363e"/></linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#52636e"/><stop offset=".48" stop-color="#a9bbc2"/><stop offset="1" stop-color="#4a5963"/></linearGradient>
  <linearGradient id="carBlue" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#56b0e6"/><stop offset=".55" stop-color="#2074b4"/><stop offset="1" stop-color="#124a78"/></linearGradient>
  <linearGradient id="busGold" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffe070"/><stop offset=".55" stop-color="#f4ae2d"/><stop offset="1" stop-color="#c87911"/></linearGradient>
  <linearGradient id="ambulance" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff"/><stop offset=".7" stop-color="#d8e5e9"/><stop offset="1" stop-color="#9fb3bb"/></linearGradient>
  <filter id="shadow"><feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#102a35" flood-opacity=".35"/></filter>
  <filter id="glow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;

const background = ({ road = true, night = false } = {}) => `<rect width="760" height="340" rx="22" fill="${night ? '#17263a' : 'url(#sky)'}"/>
  <circle cx="650" cy="62" r="34" fill="${night ? '#fff0b7' : '#fff7c2'}" opacity=".8"/>
  <path d="M0 183q112-34 221 0t214 0 325 0v157H0Z" fill="${road ? 'url(#road)' : '#68ad76'}"/>
  ${road ? '<path d="m31 290 102-8m88-7 102-8m88-7 102-8m88-7 102-8" stroke="#fff0a6" stroke-width="9" stroke-linecap="round"/><path d="M0 199h760" stroke="#d7e2e5" stroke-width="13" opacity=".75"/>' : ''}`;

const svgScene = (label, content, options = {}) => `<svg viewBox="0 0 760 340" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">
  ${sceneDefs()}${background(options)}${content}
</svg>`;

function trafficSignalScene(item) {
  if (item.visual === 'railroad') {
    return svgScene(item.title, `<g filter="url(#shadow)">
      <path d="M190 40v270M558 55v255" stroke="url(#metal)" stroke-width="15"/>
      <path d="M135 105h150M501 115h120" stroke="#dbe4e6" stroke-width="16"/>
      <path d="m146 61 128 89m0-89-128 89M512 74l100 82m0-82-100 82" stroke="#fff" stroke-width="15"/><path d="m146 61 128 89m0-89-128 89M512 74l100 82m0-82-100 82" stroke="#28323a" stroke-width="5"/>
      <rect x="235" y="141" width="112" height="55" rx="17" fill="#1d252b" stroke="#667780" stroke-width="5"/>
      <circle class="pulse-light" cx="266" cy="168" r="17" fill="#ff3443" filter="url(#glow)"/><circle class="pulse-light" cx="316" cy="168" r="17" fill="#ff3443" filter="url(#glow)"/>
      <path d="M190 222h244" stroke="#db3d3d" stroke-width="16"/><path d="M190 222h244" stroke="#fff" stroke-width="7" stroke-dasharray="32 28"/>
    </g><path d="M0 235h760" stroke="#9ca6ab" stroke-width="6"/><path d="M325 202 370 340M400 202l45 138" stroke="#848f94" stroke-width="8"/>`);
  }

  if (item.visual.startsWith('pedestrian-')) {
    const walk = item.visual === 'pedestrian-walk';
    return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(250 28)">
      <path d="M129 0v270" stroke="url(#metal)" stroke-width="17"/>
      <rect x="44" y="17" width="171" height="218" rx="26" fill="#17232a" stroke="#687981" stroke-width="7"/>
      <rect x="66" y="42" width="127" height="168" rx="14" fill="#071116" stroke="#394b53" stroke-width="4"/>
      ${walk ? `<g fill="#e9ffff" filter="url(#glow)"><circle cx="132" cy="75" r="17"/><path d="m132 95-23 45 25 14 20-34 25 23 12-12-33-38Z"/><path d="m127 143-34 51h21l29-40m0 2 24 38h22l-34-58"/></g>` : `<g fill="#ff8f37" filter="url(#glow)"><path d="M111 92q10-11 21 0v37h7V75q1-13 13-6l4 43h5l2-34q2-12 12-5l3 42h5l1-25q3-11 12-3l1 55q0 40-38 48-55-9-68-59-4-18 10-20 10 1 17 26h5Z"/></g>`}
      ${!walk ? '<text x="130" y="202" fill="#ffcf9b" font-size="18" text-anchor="middle" font-weight="900">WAIT</text>' : ''}
    </g><g opacity=".95"><path d="M30 265h700" stroke="#fff" stroke-width="8"/><path d="M110 221v115m100-115v115m100-115v115m100-115v115m100-115v115m100-115v115" stroke="#fff" stroke-width="52"/></g>`);
  }

  if (item.visual === 'signal-dark') {
    return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(223 17)">
      <path d="M25 79V289" stroke="url(#metal)" stroke-width="18"/><path d="M34 85h184" stroke="url(#metal)" stroke-width="16"/>
      <rect x="158" y="20" width="105" height="246" rx="27" fill="#162329" stroke="#657780" stroke-width="7"/>
      <path d="M172 38h77M172 113h77M172 188h77" stroke="#090f12" stroke-width="19" stroke-linecap="round"/>
      <g fill="#202c31" stroke="#090f12" stroke-width="7"><circle cx="210" cy="64" r="29"/><circle cx="210" cy="139" r="29"/><circle cx="210" cy="214" r="29"/></g>
      <path d="m202 48 17 17m-17 0 17-17m-17 75 17 17m-17 0 17-17m-17 75 17 17m-17 0 17-17" stroke="#546168" stroke-width="5" stroke-linecap="round"/>
    </g><g filter="url(#shadow)" transform="translate(503 203)"><rect width="164" height="65" rx="11" fill="#ff9b32" stroke="#fff4dc" stroke-width="6"/><text x="82" y="29" text-anchor="middle" fill="#172126" font-size="19" font-weight="1000">SIGNAL</text><text x="82" y="53" text-anchor="middle" fill="#172126" font-size="19" font-weight="1000">OUT</text></g>`);
  }

  const arrow = item.visual.startsWith('arrow-');
  const active = item.visual.includes('yellow') ? 'yellow' : item.visual.includes('green') ? 'green' : 'red';
  const flashing = item.visual.includes('flashing');
  const colors = { red: '#ff4250', yellow: '#ffc33d', green: '#42dc85' };
  const arrowOffset = { red: 0, yellow: 75, green: 150 }[active];
  return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(233 17)">
    <path d="M25 79V289" stroke="url(#metal)" stroke-width="18"/>
    <path d="M34 85h184" stroke="url(#metal)" stroke-width="16"/>
    <rect x="158" y="20" width="105" height="246" rx="27" fill="#162329" stroke="#657780" stroke-width="7"/>
    <path d="M172 38h77M172 113h77M172 188h77" stroke="#090f12" stroke-width="19" stroke-linecap="round"/>
    ${['red','yellow','green'].map((color, index) => `<circle cx="210" cy="${64 + index * 75}" r="29" fill="${active === color ? colors[color] : '#25343a'}" stroke="#0b1114" stroke-width="7" class="${flashing && active === color ? 'pulse-light' : ''}" ${active === color ? 'filter="url(#glow)"' : ''}/>${active === color ? `<circle cx="200" cy="${54 + index * 75}" r="8" fill="#fff" opacity=".55"/>` : ''}`).join('')}
    ${arrow ? `<path d="M233 65h-38l13-13-11-11-32 32 32 32 11-11-13-13h38Z" fill="#fff" opacity=".92" transform="translate(0 ${arrowOffset})"/>` : ''}
  </g><g transform="translate(486 196)" filter="url(#shadow)"><path d="M0 52 25 16h105l33 36 22 6v45H-10V65Z" fill="url(#carBlue)" stroke="#123e63" stroke-width="5"/><path d="M37 23h42v33H14Zm49 0h35l28 33H86Z" fill="#c9eff7" stroke="#275c77" stroke-width="3"/><circle cx="31" cy="101" r="19" fill="#1c252a" stroke="#9eb1b8" stroke-width="6"/><circle cx="139" cy="101" r="19" fill="#1c252a" stroke="#9eb1b8" stroke-width="6"/></g>`);
}

function signSymbol(type) {
  const black = '#172126';
  const figures = {
    school: `<g fill="${black}"><circle cx="338" cy="102" r="12"/><circle cx="386" cy="116" r="10"/><path d="m330 119-24 45 17 9 14-24 16 26 16-9-27-47Zm49 11-20 35 13 7 11-19 13 20 13-8-21-35Z"/></g>`,
    'road-work': `<g fill="${black}"><circle cx="345" cy="102" r="13"/><path d="m328 125 27-9 20 48-22 9 27 40h-22l-22-32-18 33h-23l28-58-20 14-11-17Z"/><path d="m393 142 13-5 31 77-14 5Z"/><path d="m378 173 48-18 8 18-49 17Z"/></g>`,
    slippery: `<g fill="none" stroke="${black}" stroke-width="9" stroke-linecap="round"><path d="M305 122h84l21 30v30H288v-30Z" fill="${black}"/><circle cx="315" cy="183" r="11" fill="${black}"/><circle cx="385" cy="183" r="11" fill="${black}"/><path d="M297 211q21-24 43 0t43 0 43 0"/></g>`,
    merge: `<g fill="none" stroke="${black}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><path d="M344 205V94m-18 21 18-25 18 25M410 202v-49q0-24-36-41"/></g>`,
    flagger: `<g fill="${black}"><circle cx="345" cy="102" r="13"/><path d="m328 124 28-8 18 51-21 8 25 39h-22l-21-32-19 32h-23l29-57-23 17-11-17Z"/><path d="M393 82h10v105h-10Z"/><path d="m402 87 52 13-20 20 20 21-52 9Z"/></g>`,
    pedestrian: `<g fill="${black}"><circle cx="362" cy="99" r="14"/><path d="m345 121 27-8 18 51-20 8 28 40h-22l-24-31-20 32h-24l31-57-24 14-10-17Z"/></g>`,
    bicycle: `<g fill="none" stroke="${black}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><circle cx="318" cy="184" r="31"/><circle cx="407" cy="184" r="31"/><path d="m318 184 35-53 28 53h-63l27-34h48m-40-19 40-4m-18 0 32 57"/><circle cx="367" cy="99" r="10" fill="${black}"/></g>`,
    curve: `<g fill="none" stroke="${black}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"><path d="M335 222q3-58 53-93 34-24 14-58"/><path d="m386 78 19-20 16 24"/></g>`,
    'narrow-bridge': `<g fill="none" stroke="${black}" stroke-linecap="round"><path d="M319 78q0 66 37 91v61M441 78q0 66-37 91v61" stroke-width="14"/><path d="M367 84v145m26-145v145" stroke-width="7" stroke-dasharray="16 13"/></g>`,
    deer: `<g fill="${black}" stroke="${black}" stroke-linecap="round" stroke-linejoin="round"><path d="M304 182q30-60 76-42l34 18 31-17-14 34-41 18-12 43-17-2 3-47-34 4-17 43-17-5 19-63Z"/><path d="m406 145 15-40m-7 20 22-17m-20 21-20-20" fill="none" stroke-width="10"/></g>`,
    'low-clearance': `<g fill="none" stroke="${black}" stroke-linecap="round" stroke-linejoin="round"><path d="M302 203h156v35H302Z" fill="${black}"/><path d="M322 168v-61m0 0-18 21m18-21 18 21M438 107v61m0 0-18-21m18 21 18-21" stroke-width="10"/><text x="380" y="158" text-anchor="middle" fill="${black}" stroke="none" font-size="31" font-weight="1000">12′ 6″</text></g>`
  };
  return figures[type] || '';
}

function signScene(item) {
  if (item.visual === 'sign-fire-lane') {
    return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(212 22)"><path d="M168 194v112" stroke="url(#metal)" stroke-width="14"/><rect x="32" y="11" width="272" height="202" rx="17" fill="#fff" stroke="#bf2d35" stroke-width="10"/><rect x="50" y="29" width="236" height="166" rx="7" fill="none" stroke="#bf2d35" stroke-width="4"/><text x="168" y="78" text-anchor="middle" fill="#a81f29" font-size="36" font-weight="1000">FIRE LANE</text><path d="M61 98h214" stroke="#bf2d35" stroke-width="4"/><text x="168" y="142" text-anchor="middle" fill="#a81f29" font-size="28" font-weight="1000">NO PARKING</text><text x="168" y="176" text-anchor="middle" fill="#a81f29" font-size="18" font-weight="900">KEEP CLEAR</text></g>`);
  }
  if (item.visual === 'sign-evacuation') {
    return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(230 18)"><path d="M150 216v95" stroke="url(#metal)" stroke-width="14"/><rect x="22" y="6" width="256" height="230" rx="12" fill="#fff" stroke="#c7d2d8" stroke-width="6"/><circle cx="150" cy="121" r="102" fill="#1c67a5"/><path d="M150 48v68m0-68-27 28m27-28 27 28" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><text x="150" y="148" text-anchor="middle" fill="#fff" font-size="25" font-weight="1000">EVACUATION</text><text x="150" y="180" text-anchor="middle" fill="#fff" font-size="29" font-weight="1000">ROUTE</text></g>`);
  }

  const type = item.visual.replace('sign-', '');
  const orange = type === 'road-work' || type === 'flagger';
  const school = type === 'school';
  const face = orange ? '#ff9b32' : school ? '#c8f04e' : '#ffd24f';
  const shape = school
    ? '<path d="M380 46 482 119l-39 125H317l-39-125Z" fill="FACE" stroke="#fff7d5" stroke-width="9"/>'
    : '<path d="m380 40 135 135-135 135-135-135Z" fill="FACE" stroke="#fff7d5" stroke-width="9"/>';
  return svgScene(item.title, `<g filter="url(#shadow)"><ellipse cx="380" cy="310" rx="95" ry="15" fill="#1b313a" opacity=".28"/><path d="M380 198v117" stroke="url(#metal)" stroke-width="15"/>${shape.replace('FACE', face)}${signSymbol(type)}<path d="M294 132 376 51" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".27"/></g>`);
}

function busScene(item) {
  const red = item.visual === 'bus-red';
  return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(126 62)">
    <path d="M38 10h378q47 0 47 46v151H0V50Q0 10 38 10Z" fill="url(#busGold)" stroke="#7b4b0b" stroke-width="6"/>
    <rect x="34" y="39" width="354" height="74" rx="12" fill="#bfe9ef" stroke="#775114" stroke-width="5"/>
    <path d="M110 42v68m92-68v68m92-68v68" stroke="#4f7684" stroke-width="5"/>
    <path d="M7 132h448" stroke="#34281b" stroke-width="15"/><text x="227" y="128" text-anchor="middle" fill="#251d13" font-size="16" font-weight="1000">SCHOOL BUS</text>
    <circle class="pulse-light" cx="55" cy="29" r="13" fill="${red ? '#ff3344' : '#ffbf28'}" filter="url(#glow)"/><circle class="pulse-light" cx="410" cy="29" r="13" fill="${red ? '#ff3344' : '#ffbf28'}" filter="url(#glow)"/>
    <rect x="23" y="151" width="420" height="37" rx="9" fill="#f7c33d"/><circle cx="77" cy="207" r="30" fill="#1b2429" stroke="#9aa8ac" stroke-width="8"/><circle cx="373" cy="207" r="30" fill="#1b2429" stroke="#9aa8ac" stroke-width="8"/>
    ${red ? '<g transform="translate(433 81)"><path d="M0 34h79" stroke="#5e6670" stroke-width="9"/><path d="M47 0h65l22 33-22 33H47L25 33Z" fill="#d52e38" stroke="#fff" stroke-width="6"/><text x="80" y="42" text-anchor="middle" fill="#fff" font-size="23" font-weight="1000">STOP</text></g>' : ''}
  </g>`);
}

function extendedEmergencyScene(item) {
  if (item.visual === 'emergency-officer') {
    return svgScene(item.title, `<path d="M0 223h760M284 183l-48 157m240-157 48 157" stroke="#dfe7e8" stroke-width="10"/><g opacity=".92" fill="#fff"><path d="M25 245h91v30H25Zm125 0h91v30h-91Zm369 0h91v30h-91Zm125 0h91v30h-91Z"/></g><g filter="url(#shadow)" transform="translate(331 69)"><circle cx="48" cy="35" r="24" fill="#8d5b3f"/><path d="M22 61h53l18 88-31 7-12-58-9 58-31-7Z" fill="#234f78" stroke="#152d45" stroke-width="6"/><path d="m26 69 47 0" stroke="#eff7ff" stroke-width="9"/><path d="M23 81-28 119m98-38 56-41" stroke="#8d5b3f" stroke-width="17" stroke-linecap="round"/><path d="M126 5v79" stroke="#5c6570" stroke-width="9"/><path d="m88 8h76l20 27-20 27H88L69 35Z" fill="#d73742" stroke="#fff" stroke-width="6"/><text x="126" y="43" text-anchor="middle" fill="#fff" font-size="20" font-weight="1000">STOP</text><path d="M28 13q20-19 42 0l-5 18H33Z" fill="#253b55" stroke="#132438" stroke-width="4"/><path d="M26 157 18 232h27l7-56 8 56h27l-13-76Z" fill="#1a3049"/></g>`);
  }
  if (item.visual === 'emergency-fire-truck') {
    return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(42 38)"><path d="M0 0h292v173H0Z" fill="#d7d1c8" stroke="#776c63" stroke-width="7"/><path d="M17 38h258v135H17Z" fill="#3a4248"/><path d="M20 40h252v19H20Z" fill="#c33a3f"/><text x="146" y="28" text-anchor="middle" fill="#8e252d" font-size="22" font-weight="1000">FIRE STATION</text></g><g filter="url(#shadow)" transform="translate(271 116)"><path d="M0 48h258l48 48v92H0Z" fill="#d9363e" stroke="#7f1d24" stroke-width="7"/><path d="M258 54h52l56 53v81h-108Z" fill="#ee4b52" stroke="#7f1d24" stroke-width="7"/><path d="M278 72h25l36 39h-61Z" fill="#bfe8ef" stroke="#315d6b" stroke-width="5"/><rect x="21" y="68" width="216" height="78" rx="9" fill="#b9252f"/><path d="M42 82h172M42 103h172M42 124h172" stroke="#f3c8a3" stroke-width="7"/><rect x="31" y="24" width="177" height="20" rx="8" fill="#29383f"/><rect class="pulse-light" x="39" y="27" width="70" height="14" rx="5" fill="#ff3949" filter="url(#glow)"/><rect class="pulse-light" x="121" y="27" width="78" height="14" rx="5" fill="#2f83ff" filter="url(#glow)"/><circle cx="75" cy="188" r="34" fill="#1c252a" stroke="#a9b5b9" stroke-width="9"/><circle cx="292" cy="188" r="34" fill="#1c252a" stroke="#a9b5b9" stroke-width="9"/><text x="129" y="172" text-anchor="middle" fill="#fff" font-size="20" font-weight="1000">RESCUE</text></g><g class="pulse-light" fill="#ffb52e" filter="url(#glow)"><circle cx="56" cy="254" r="12"/><circle cx="233" cy="254" r="12"/></g>`);
  }
  if (item.visual === 'emergency-scene') {
    return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(74 157)"><path d="M0 38 28 7h113l34 31 21 8v72H-11V51Z" fill="#6c7780" stroke="#35444c" stroke-width="6"/><path d="M43 14h52v43H12Zm63 0h29l29 43h-58Z" fill="#bedee5"/><circle cx="34" cy="117" r="21" fill="#1b252a" stroke="#a7b4b9" stroke-width="6"/><circle cx="157" cy="117" r="21" fill="#1b252a" stroke="#a7b4b9" stroke-width="6"/><path d="m177 59 35 20-35 21" fill="#f4d34b" stroke="#9c7625" stroke-width="5"/></g><g filter="url(#shadow)" transform="translate(481 117)"><path d="M0 40 31 4h133l42 36 25 9v91H-13V55Z" fill="url(#ambulance)" stroke="#647982" stroke-width="6"/><path d="M6 73h217" stroke="#d52c3a" stroke-width="17"/><path d="M95 79v40m-20-20h40" stroke="#fff" stroke-width="11"/><rect class="pulse-light" x="68" y="-8" width="85" height="15" rx="6" fill="#ff3b48" filter="url(#glow)"/><circle cx="39" cy="140" r="25" fill="#1b252a" stroke="#a7b5ba" stroke-width="7"/><circle cx="185" cy="140" r="25" fill="#1b252a" stroke="#a7b5ba" stroke-width="7"/></g><g filter="url(#shadow)" fill="#ff8b26" stroke="#fff4dc" stroke-width="5"><path d="m309 314 25-63 25 63Z"/><path d="m400 307 23-58 23 58Z"/></g><path d="M322 283h25m65-5h23" stroke="#fff" stroke-width="8"/>`);
  }
  if (item.visual === 'emergency-hose') {
    return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(444 101)"><path d="M0 49h174l42 43v112H0Z" fill="#d9363e" stroke="#7f1d24" stroke-width="7"/><path d="M174 56h45l51 49v99h-96Z" fill="#ed4a52" stroke="#7f1d24" stroke-width="7"/><path d="M193 76h23l31 35h-54Z" fill="#bee7ef"/><path d="M23 77h128M23 104h128M23 131h128" stroke="#f2c59d" stroke-width="7"/><circle cx="52" cy="203" r="31" fill="#1b252a" stroke="#a7b5ba" stroke-width="8"/><circle cx="212" cy="203" r="31" fill="#1b252a" stroke="#a7b5ba" stroke-width="8"/><rect class="pulse-light" x="50" y="27" width="92" height="17" rx="6" fill="#ff3949" filter="url(#glow)"/></g><path d="M513 243q-86 1-124 41-49 50-133 27-74-21-158 8" fill="none" stroke="#6a4a2f" stroke-width="24" stroke-linecap="round" filter="url(#shadow)"/><path d="M513 238q-86 1-124 41-49 50-133 27-74-21-158 8" fill="none" stroke="#e5c164" stroke-width="13" stroke-linecap="round"/><g filter="url(#shadow)" transform="translate(67 115)"><rect width="196" height="74" rx="10" fill="#fff" stroke="#d03942" stroke-width="7"/><text x="98" y="31" text-anchor="middle" fill="#ba2831" font-size="21" font-weight="1000">ROAD BLOCKED</text><text x="98" y="58" text-anchor="middle" fill="#ba2831" font-size="20" font-weight="1000">FIRE HOSE</text></g>`);
  }
  if (item.visual === 'emergency-road-closed') {
    return svgScene(item.title, `<g fill="#324e3b" filter="url(#shadow)"><path d="M565 183 688 45l18 15-84 123Z"/><path d="M611 99q30-48 75-52-2 43-37 71 48-20 75 8-34 31-89 26Z"/></g><path d="M0 283q79-21 158 0t158 0 158 0 158 0 128 0v57H0Z" fill="#399bb9" opacity=".88"/><g filter="url(#shadow)" transform="translate(115 108)"><path d="M45 105v120m454-120v120" stroke="url(#metal)" stroke-width="18"/><rect x="0" y="38" width="544" height="92" rx="12" fill="#fff" stroke="#c7363f" stroke-width="8"/><path d="M13 49h518v70H13Z" fill="#f6f2e9"/><path d="m18 54 82 60m35-60 82 60m35-60 82 60m35-60 82 60m35-60 42 31" stroke="#dd3d46" stroke-width="22"/><rect x="151" y="0" width="244" height="79" rx="11" fill="#fff" stroke="#30383d" stroke-width="7"/><text x="273" y="49" text-anchor="middle" fill="#c02f38" font-size="31" font-weight="1000">ROAD CLOSED</text><circle class="pulse-light" cx="38" cy="34" r="15" fill="#ffb52e" filter="url(#glow)"/><circle class="pulse-light" cx="506" cy="34" r="15" fill="#ffb52e" filter="url(#glow)"/></g>`);
  }
  if (item.visual === 'emergency-intersection') {
    return svgScene(item.title, `<path d="M0 220h760M292 183l-47 157m222-157 48 157" stroke="#dbe4e7" stroke-width="10"/><g filter="url(#shadow)" transform="translate(46 49)"><path d="M28 28v177" stroke="url(#metal)" stroke-width="15"/><rect x="64" y="0" width="72" height="172" rx="19" fill="#172329" stroke="#667780" stroke-width="6"/><circle cx="100" cy="42" r="21" fill="#27373d"/><circle cx="100" cy="86" r="21" fill="#27373d"/><circle cx="100" cy="130" r="21" fill="#42dc85" filter="url(#glow)"/></g><g filter="url(#shadow)" transform="translate(252 152)"><path d="M0 39 35 0h159l48 39 31 9v103H-13V56Z" fill="url(#ambulance)" stroke="#657983" stroke-width="7"/><path d="M7 72h252" stroke="#d52c3a" stroke-width="18"/><path d="M112 78v43m-21-21h42" stroke="#fff" stroke-width="12"/><rect x="75" y="-15" width="102" height="17" rx="6" fill="#26363e"/><rect class="pulse-light" x="79" y="-12" width="44" height="11" rx="4" fill="#ff3443" filter="url(#glow)"/><rect class="pulse-light" x="128" y="-12" width="44" height="11" rx="4" fill="#318aff" filter="url(#glow)"/><circle cx="43" cy="151" r="27" fill="#1b252a" stroke="#a7b5ba" stroke-width="8"/><circle cx="214" cy="151" r="27" fill="#1b252a" stroke="#a7b5ba" stroke-width="8"/></g><g filter="url(#shadow)" transform="translate(585 230)"><path d="M0 26 20 4h71l24 22 15 5v45H-6V35Z" fill="#6d7d85" stroke="#35464e" stroke-width="5"/><circle cx="23" cy="76" r="14" fill="#1b252a"/><circle cx="99" cy="76" r="14" fill="#1b252a"/></g>`);
  }
  return null;
}

function emergencyScene(item) {
  if (item.visual.startsWith('bus-')) return busScene(item);
  const extended = extendedEmergencyScene(item);
  if (extended) return extended;
  const shoulder = item.visual === 'emergency-shoulder';
  const x = shoulder ? 445 : 310;
  return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(${x} 114)">
    <path d="M0 38 34 0h144l43 38 34 8v99H-15V54Z" fill="url(#ambulance)" stroke="#667983" stroke-width="6"/>
    <path d="M51 8h70v48H15Zm80 0h39l36 48h-75Z" fill="#bce8f0" stroke="#577884" stroke-width="4"/>
    <path d="M-5 69h245" stroke="#d52c3a" stroke-width="18"/><path d="M102 78v40m-20-20h40" stroke="#fff" stroke-width="12"/>
    <rect x="69" y="-14" width="91" height="17" rx="6" fill="#24353e"/><rect class="pulse-light" x="72" y="-11" width="39" height="11" rx="4" fill="#ff3443" filter="url(#glow)"/><rect class="pulse-light" x="116" y="-11" width="39" height="11" rx="4" fill="#318aff" filter="url(#glow)"/>
    <circle cx="40" cy="145" r="25" fill="#1b252a" stroke="#a7b5ba" stroke-width="7"/><circle cx="194" cy="145" r="25" fill="#1b252a" stroke="#a7b5ba" stroke-width="7"/>
  </g>${shoulder ? '<path d="M537 270h198" stroke="#fff" stroke-width="7" stroke-dasharray="18 14"/><path d="M390 204v125" stroke="#fff" stroke-width="8"/>' : '<g transform="translate(76 206)" filter="url(#shadow)"><path d="M0 40 27 8h112l35 32 19 7v65H-10V50Z" fill="url(#carBlue)" stroke="#173f62" stroke-width="5"/><circle cx="31" cy="110" r="19" fill="#1c252a" stroke="#9eb1b8" stroke-width="6"/><circle cx="146" cy="110" r="19" fill="#1c252a" stroke="#9eb1b8" stroke-width="6"/></g>'}`);
}

function vehicleScene(item) {
  const mode = item.visual.replace('vehicle-', '');
  const hazard = mode === 'hazards';
  const brake = mode === 'brake';
  const reverse = mode === 'reverse';
  const turn = mode === 'turn';
  return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(183 73)">
    <path d="M38 48 83 6h210l50 42 35 17v142H0V69Z" fill="url(#carBlue)" stroke="#143e61" stroke-width="7"/>
    <path d="M99 18h77v62H44Zm91 0h87l49 62H190Z" fill="#bfeaf4" stroke="#2b607c" stroke-width="5"/>
    <path d="M15 94h347" stroke="#5bb8ea" stroke-width="21"/><rect x="22" y="126" width="332" height="49" rx="14" fill="#155786"/>
    <rect x="118" y="134" width="139" height="38" rx="8" fill="#ecf0d9" stroke="#26333a" stroke-width="4"/><text x="188" y="159" text-anchor="middle" fill="#30434b" font-size="18" font-weight="900">SCOUT</text>
    <circle cx="65" cy="205" r="31" fill="#182329" stroke="#a0b0b5" stroke-width="8"/><circle cx="310" cy="205" r="31" fill="#182329" stroke="#a0b0b5" stroke-width="8"/>
    <rect class="${hazard || turn ? 'pulse-light' : ''}" x="19" y="99" width="55" height="27" rx="10" fill="${brake ? '#ff3344' : hazard || turn ? '#ffb52e' : '#7c2025'}" ${brake || hazard || turn ? 'filter="url(#glow)"' : ''}/>
    <rect class="${hazard ? 'pulse-light' : ''}" x="302" y="99" width="55" height="27" rx="10" fill="${brake ? '#ff3344' : hazard ? '#ffb52e' : '#7c2025'}" ${brake || hazard ? 'filter="url(#glow)"' : ''}/>
    ${reverse ? '<rect x="82" y="101" width="40" height="24" rx="7" fill="#f5ffff" filter="url(#glow)"/><rect x="257" y="101" width="40" height="24" rx="7" fill="#f5ffff" filter="url(#glow)"/>' : ''}
  </g>${hazard ? '<g fill="#ffb52e" filter="url(#glow)"><path d="m121 136-25-17v34Z"/><path d="m639 136 25-17v34Z"/></g>' : ''}`);
}

function carModel(x, y, fill = '#287eb9', scale = 1, door = false) {
  return `<g filter="url(#shadow)" transform="translate(${x} ${y}) scale(${scale})"><path d="M0 48 35 9h143l43 39 25 8v92H-13V63Z" fill="${fill}" stroke="#173f5d" stroke-width="6"/><path d="M53 17h68v52H16Zm79 0h37l37 52h-74Z" fill="#c4eaf0" stroke="#35677b" stroke-width="4"/><rect x="4" y="85" width="230" height="34" rx="9" fill="#18577e"/><circle cx="43" cy="147" r="26" fill="#1b252a" stroke="#a8b5ba" stroke-width="7"/><circle cx="194" cy="147" r="26" fill="#1b252a" stroke="#a8b5ba" stroke-width="7"/>${door ? '<path d="M121 71 69 35v91h61Z" fill="#3b91c5" stroke="#173f5d" stroke-width="6"/><path d="M82 53h31v44H82Z" fill="#c4eaf0" stroke="#35677b" stroke-width="4"/>' : ''}</g>`;
}

function truckModel(x, y, scale = 1) {
  return `<g filter="url(#shadow)" transform="translate(${x} ${y}) scale(${scale})"><rect x="0" y="15" width="235" height="136" rx="9" fill="#d9e0e2" stroke="#65757d" stroke-width="7"/><path d="M235 55h87l57 55v41H235Z" fill="#db4c45" stroke="#7b2927" stroke-width="7"/><path d="M261 67h47l39 43h-86Z" fill="#bee5ed" stroke="#426878" stroke-width="5"/><path d="M23 41h189M23 70h189M23 99h189" stroke="#aab7bc" stroke-width="7"/><circle cx="61" cy="151" r="34" fill="#1b252a" stroke="#a7b4b9" stroke-width="9"/><circle cx="198" cy="151" r="34" fill="#1b252a" stroke="#a7b4b9" stroke-width="9"/><circle cx="309" cy="151" r="34" fill="#1b252a" stroke="#a7b4b9" stroke-width="9"/></g>`;
}

function hazardScene(item) {
  if (item.visual === 'scene-truck-blind-spot') {
    return svgScene(item.title, `${truckModel(222, 107, 1.05)}${carModel(62, 213, '#9259a8', .62)}<path d="M188 235q65-52 124-44M198 266q72-29 128-19" fill="none" stroke="#ffb52e" stroke-width="7" stroke-dasharray="13 11"/><path d="m204 213-27 25 33 12" fill="#ffb52e"/><g filter="url(#shadow)" transform="translate(34 52)"><rect width="181" height="68" rx="11" fill="#ffd24f" stroke="#fff4d0" stroke-width="6"/><text x="90" y="29" text-anchor="middle" fill="#172126" font-size="19" font-weight="1000">BLIND SPOT</text><text x="90" y="53" text-anchor="middle" fill="#172126" font-size="16" font-weight="900">STAY VISIBLE</text></g>`);
  }
  if (item.visual === 'scene-debris') {
    return svgScene(item.title, `${carModel(72, 142, '#4f91bb', .82)}<g filter="url(#shadow)" transform="translate(441 224)"><path d="m0 26 42-26 56 27-39 37Z" fill="#b47a43" stroke="#684326" stroke-width="6"/><path d="M42 0v64m-42-38 59 38m39-37-56 37" stroke="#d8a56c" stroke-width="5"/><path d="m121 57 27-49 33 49Z" fill="#ff8b26" stroke="#fff4dc" stroke-width="5"/><path d="M137 38h28" stroke="#fff" stroke-width="8"/></g><path d="M298 246q60-25 115 4" fill="none" stroke="#fff0a6" stroke-width="6" stroke-dasharray="12 11"/><path d="m400 238 24 14-25 13" fill="none" stroke="#fff0a6" stroke-width="7"/>`);
  }
  if (item.visual === 'scene-ice') {
    return svgScene(item.title, `<path d="M0 183h760v157H0Z" fill="#78959f" opacity=".82"/><path d="M0 199h760" stroke="#e9f7fb" stroke-width="13"/><path d="M0 274q95-33 188 0t190 0 190 0 192 0" fill="none" stroke="#bfefff" stroke-width="16" opacity=".7"/><g stroke="#e8fbff" stroke-width="5" opacity=".9"><path d="m80 226 42 19-37 22m226-41 39 17-34 26m240-42 41 20-35 24"/></g>${carModel(290, 147, '#3975a8', .78)}<g filter="url(#shadow)" transform="translate(61 45)"><path d="m80 0 80 80-80 80L0 80Z" fill="#ffd24f" stroke="#fff4d0" stroke-width="7"/><path d="M42 91q27-23 45 0t44 0M44 112q22-19 39 0t38 0" fill="none" stroke="#172126" stroke-width="8" stroke-linecap="round"/><path d="M48 59h65" stroke="#172126" stroke-width="12"/></g>`);
  }
  if (item.visual === 'scene-open-door') {
    return svgScene(item.title, `${carModel(390, 127, '#2e82bb', 1, true)}<g filter="url(#shadow)" transform="translate(140 164)"><circle cx="48" cy="103" r="36" fill="none" stroke="#20292e" stroke-width="10"/><circle cx="154" cy="103" r="36" fill="none" stroke="#20292e" stroke-width="10"/><path d="m48 103 43-66 35 66H48l35-45h60m-52-21 48-5m-22 0 37 71" fill="none" stroke="#315d76" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="108" cy="0" r="17" fill="#84583f"/><path d="m105 21 40 19-18 50-31-18-26 39" fill="none" stroke="#7550a4" stroke-width="19" stroke-linecap="round"/></g><path d="M339 205q48-41 97-28" fill="none" stroke="#ffb52e" stroke-width="8" stroke-dasharray="12 11"/><path d="m424 163 29 15-27 17" fill="#ffb52e"/>`);
  }
  if (item.visual === 'scene-following') {
    return svgScene(item.title, `${carModel(409, 132, '#5d7f98', .78)}${carModel(117, 184, '#246ea5', .88)}<g stroke="#c7f0f8" stroke-width="6" stroke-linecap="round" opacity=".82"><path d="m36 42-23 38m96-61-28 47m103-24-29 48m105-74-31 52m111-33-27 47m112-65-32 51m112-29-27 47m110-64-34 54"/></g><path d="M316 285h81" stroke="#fff0a6" stroke-width="8" stroke-dasharray="13 11"/><path d="m327 269-22 16 22 16m59-32 22 16-22 16" fill="none" stroke="#fff0a6" stroke-width="7" stroke-linejoin="round"/>`);
  }
  if (item.visual === 'scene-sun-glare') {
    return svgScene(item.title, `<circle cx="604" cy="76" r="62" fill="#fff6a0" filter="url(#glow)"/><g stroke="#fff1a1" stroke-width="9" stroke-linecap="round" opacity=".9"><path d="M604 0v21m0 110v29M528 76h-28m132 0h43m-124-53-22-22m112 112 26 26m-116-23-24 24m113-115 26-25"/></g><path d="M544 100 456 245M652 112l75 119" fill="none" stroke="#fff8bd" stroke-width="36" opacity=".27"/>${carModel(239, 165, '#226fa6', .88)}<g filter="url(#shadow)" transform="translate(57 58)"><path d="m78 0 78 78-78 78L0 78Z" fill="#ffd24f" stroke="#fff4d0" stroke-width="7"/><circle cx="78" cy="68" r="24" fill="#f0a936"/><path d="M78 28v14m0 51v16M38 68h15m50 0h16m-69-28 11 11m35 35 12 12m-58 0 12-12m35-35 11-11" stroke="#172126" stroke-width="6" stroke-linecap="round"/></g>`);
  }
  if (item.visual === 'scene-flood') {
    return svgScene(item.title, `<path d="M0 231q72-22 144 0t144 0 144 0 144 0 144 0v109H0Z" fill="#3aa7c2" opacity=".92"/><path d="M0 256q72-20 144 0t144 0 144 0 144 0 144 0M0 297q70-18 140 0t140 0 140 0 140 0 140 0" fill="none" stroke="#a8eff4" stroke-width="9" opacity=".8"/><g filter="url(#shadow)" transform="translate(160 47)"><path d="M220 124v146" stroke="url(#metal)" stroke-width="14"/><rect x="24" y="12" width="392" height="147" rx="14" fill="#ff9b32" stroke="#fff3d6" stroke-width="8"/><text x="220" y="70" text-anchor="middle" fill="#20282d" font-size="35" font-weight="1000">WATER OVER</text><text x="220" y="118" text-anchor="middle" fill="#20282d" font-size="39" font-weight="1000">ROADWAY</text></g>`, { road: false });
  }
  if (item.visual === 'scene-ball') {
    return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(42 136)"><path d="M0 38 28 8h115l34 30 18 7v73H-10V49Z" fill="#687682" stroke="#33434c" stroke-width="5"/><circle cx="32" cy="117" r="20" fill="#1b252a" stroke="#a8b4b9" stroke-width="6"/><circle cx="147" cy="117" r="20" fill="#1b252a" stroke="#a8b4b9" stroke-width="6"/></g><g filter="url(#shadow)" transform="translate(530 124)"><path d="M0 38 28 8h115l34 30 18 7v73H-10V49Z" fill="#9d597c" stroke="#563046" stroke-width="5"/><circle cx="32" cy="117" r="20" fill="#1b252a" stroke="#a8b4b9" stroke-width="6"/><circle cx="147" cy="117" r="20" fill="#1b252a" stroke="#a8b4b9" stroke-width="6"/></g><g filter="url(#shadow)"><circle cx="397" cy="253" r="32" fill="#f14f4f" stroke="#fff" stroke-width="5"/><path d="m377 233 41 41m0-41-41 41" stroke="#fff" stroke-width="6"/></g><path d="M258 203q74 21 116 35" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="9 12" opacity=".65"/>`);
  }
  if (item.visual === 'scene-fog') {
    return svgScene(item.title, `<g filter="url(#shadow)" transform="translate(270 150)"><path d="M0 38 29 7h119l36 31 20 7v77H-10V49Z" fill="#65757e" stroke="#34464f" stroke-width="5"/><path d="M44 14h57v44H10Zm68 0h29l30 44h-59Z" fill="#b9cbd0"/><rect x="7" y="69" width="189" height="31" rx="9" fill="#4b5d66"/><circle cx="35" cy="121" r="21" fill="#1b252a" stroke="#a8b4b9" stroke-width="6"/><circle cx="162" cy="121" r="21" fill="#1b252a" stroke="#a8b4b9" stroke-width="6"/><circle cx="11" cy="82" r="9" fill="#ffe687" filter="url(#glow)"/><circle cx="195" cy="82" r="9" fill="#ffe687" filter="url(#glow)"/></g><g class="fog-layer" fill="none" stroke="#fff" stroke-linecap="round" opacity=".68"><path d="M-30 103h330m55 0h445M-75 150h220m40 0h420m45 0h170M-20 205h430m55 0h360M-60 255h250m55 0h480" stroke-width="24"/></g>`, { night: true });
  }
  return '';
}

function roadsideScene(item) {
  const shoulder = `<path d="M548 183h212v157H596Z" fill="#bda778"/><path d="M573 183h187v157H621Z" fill="#9b8763"/><g fill="#d9c99f" opacity=".9"><circle cx="624" cy="225" r="6"/><circle cx="696" cy="251" r="8"/><circle cx="655" cy="302" r="5"/><circle cx="730" cy="319" r="7"/></g><path d="M548 183 596 340" stroke="#eef4f0" stroke-width="8"/>`;
  const roadsideSign = (lines, color = '#ffd24f') => `<g filter="url(#shadow)" transform="translate(78 36)"><ellipse cx="132" cy="277" rx="61" ry="11" fill="#142932" opacity=".28"/><path d="M137 133v145" stroke="#43525b" stroke-width="16"/><path d="M131 133v143" stroke="url(#metal)" stroke-width="9"/><rect x="13" y="15" width="244" height="128" rx="13" fill="#574421" opacity=".62" transform="translate(8 9)"/><rect x="13" y="15" width="244" height="128" rx="13" fill="${color}" stroke="#fff4d0" stroke-width="7"/>${lines.map((line, index) => `<text x="135" y="${67 + index * 42}" text-anchor="middle" fill="#172126" font-size="${lines.length > 1 ? 28 : 34}" font-weight="1000">${line}</text>`).join('')}<path d="M30 31h168" stroke="#fff" stroke-width="8" opacity=".32" stroke-linecap="round"/></g>`;

  if (item.visual === 'roadside-cow') {
    return svgScene(item.title, `<path d="M515 183h245v157H568Z" fill="#639164"/><path d="M560 183 611 340" stroke="#eff5ec" stroke-width="8"/>${roadsideSign(['CATTLE', 'CROSSING'])}<g filter="url(#shadow)" transform="translate(474 126)"><ellipse cx="110" cy="72" rx="82" ry="46" fill="#f1eee4" stroke="#4b4038" stroke-width="6"/><g fill="#5d493e"><path d="M42 44q24-28 45 1-18 26-42 11Zm75-12q27-17 45 8-11 27-38 16Zm13 54q25-19 43 3-13 26-38 14Z"/></g><path d="M35 75 21 188h24l27-86 47 4 21 82h24l4-105Z" fill="#eeeae0" stroke="#4b4038" stroke-width="6"/><path d="M178 52q46-19 68 15l-25 33-50-9Z" fill="#eeeae0" stroke="#4b4038" stroke-width="6"/><path d="m225 58 18-20m-14 23 28-2" stroke="#4b4038" stroke-width="8" stroke-linecap="round"/><path d="M30 59Q0 30 10 7q18 15 43 1" fill="none" stroke="#4b4038" stroke-width="9" stroke-linecap="round"/><circle cx="218" cy="67" r="5" fill="#181818"/></g>`);
  }
  if (item.visual === 'roadside-rocks') {
    return svgScene(item.title, `<path d="M493 31h267v309H551Z" fill="#82684f"/><path d="m493 31 267 309" stroke="#a88b68" stroke-width="18"/><g fill="#644e3b" stroke="#3b3028" stroke-width="5" filter="url(#shadow)"><path d="m512 81 45-31 43 38-26 53-59-11Z"/><path d="m595 129 54-21 37 52-37 42-62-17Z"/><path d="m641 235 46-27 50 40-19 55-63-4Z"/><path d="m487 273 38-28 47 25-8 50-62 5Z"/></g><path d="M514 183 569 340" stroke="#eef4f0" stroke-width="8"/>${roadsideSign(['FALLING', 'ROCKS'])}<g fill="#725740" stroke="#3b3028" stroke-width="4"><circle cx="526" cy="305" r="15"/><circle cx="608" cy="319" r="21"/><circle cx="690" cy="310" r="12"/></g>`);
  }
  if (item.visual === 'roadside-cyclist') {
    return svgScene(item.title, `<path d="M514 183h246v157H568Z" fill="#9d9071"/><path d="M554 183 608 340" stroke="#eef4f0" stroke-width="8"/><g filter="url(#shadow)" transform="translate(508 115)"><circle cx="58" cy="148" r="45" fill="none" stroke="#20292e" stroke-width="11"/><circle cx="188" cy="148" r="45" fill="none" stroke="#20292e" stroke-width="11"/><path d="m58 148 52-80 43 80H58l43-55h74m-65-25 59-6m-26 0 45 86" fill="none" stroke="#2e6f8b" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><circle cx="130" cy="20" r="21" fill="#8e5d40"/><path d="m126 46 49 23-21 62-38-22-31 47" fill="none" stroke="#e45555" stroke-width="23" stroke-linecap="round"/><path d="M119 4q17-14 36 2l-2 16h-31Z" fill="#ffe16f" stroke="#6b5322" stroke-width="4"/></g>${roadsideSign(['SHARE', 'THE ROAD'])}`);
  }
  if (item.visual === 'roadside-driveway') {
    return svgScene(item.title, `<path d="M525 183h235v157H579Z" fill="#719372"/><path d="M558 183 611 340" stroke="#eef4f0" stroke-width="8"/><path d="M570 183 690 82h70v258H611Z" fill="#a69a7f"/><g filter="url(#shadow)" transform="translate(548 35)"><path d="m0 93 92-79 92 79v103H0Z" fill="#e6d2ad" stroke="#785e45" stroke-width="7"/><path d="m-11 94 103-91 103 91" fill="none" stroke="#7d3f37" stroke-width="20"/><rect x="22" y="118" width="63" height="78" fill="#85543b"/><rect x="113" y="112" width="46" height="45" fill="#bfe4e8" stroke="#5e7f86" stroke-width="5"/></g><g fill="#345b3d" filter="url(#shadow)"><circle cx="510" cy="88" r="55"/><circle cx="686" cy="68" r="48"/><circle cx="738" cy="103" r="57"/></g>${carModel(589, 190, '#9b5d78', .63)}<g filter="url(#shadow)" transform="translate(72 60)"><path d="m73 0 73 73-73 73L0 73Z" fill="#ffd24f" stroke="#fff4d0" stroke-width="7"/><path d="M42 108V42h42q29 0 29 27" fill="none" stroke="#172126" stroke-width="12"/><path d="m99 58 16 13-16 13" fill="none" stroke="#172126" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`);
  }
  if (item.visual === 'roadside-guardrail') {
    return svgScene(item.title, `<path d="M0 183q285-14 480 72t280 52v33H0Z" fill="#44525a"/><path d="M0 205q275-15 470 72t290 52" fill="none" stroke="#eff4f2" stroke-width="10"/><path d="M397 226q177 83 363 50" fill="none" stroke="#c7d1d4" stroke-width="18"/><path d="M397 219q177 83 363 50" fill="none" stroke="#68757b" stroke-width="9"/><g filter="url(#shadow)">${[435,520,605,690].map((x,index) => `<g transform="translate(${x} ${149 + index * 25}) rotate(${16 + index * 5})"><path d="M0 0h64v83H0Z" fill="#ffd24f" stroke="#fff4d0" stroke-width="5"/><path d="m17 14 27 27-27 27" fill="none" stroke="#172126" stroke-width="12" stroke-linecap="square"/></g>`).join('')}</g><g fill="#355b40" opacity=".8"><path d="M445 183q38-67 79 0Zm90 0q42-74 87 0Zm99 0q37-66 80 0Z"/></g>`);
  }
  if (item.visual === 'roadside-tow') {
    return svgScene(item.title, `${shoulder}<g filter="url(#shadow)" transform="translate(381 144)"><path d="M0 54h171l44 42v93H0Z" fill="#f2b633" stroke="#8e6418" stroke-width="7"/><path d="M171 61h52l49 49v79h-101Z" fill="#f7c74b" stroke="#8e6418" stroke-width="7"/><path d="M190 75h27l31 34h-58Z" fill="#bee6ed"/><path d="M42 56 160 0" stroke="#555f64" stroke-width="15"/><path d="m160 0 34 103" stroke="#555f64" stroke-width="12"/><path d="M194 101v41" stroke="#333b3f" stroke-width="7"/><path d="m182 141 12 13 12-13" fill="none" stroke="#333b3f" stroke-width="7"/><rect class="pulse-light" x="52" y="26" width="82" height="16" rx="6" fill="#ffb52e" filter="url(#glow)"/><circle cx="56" cy="189" r="31" fill="#1b252a" stroke="#a7b5ba" stroke-width="8"/><circle cx="211" cy="189" r="31" fill="#1b252a" stroke="#a7b5ba" stroke-width="8"/></g>${carModel(585, 232, '#667681', .54)}<g filter="url(#shadow)" fill="#ff8b26" stroke="#fff4dc" stroke-width="5"><path d="m337 325 23-58 23 58Z"/><path d="m704 327 22-55 22 55Z"/></g>`);
  }

  if (item.visual === 'roadside-soft-shoulder') {
    return svgScene(item.title, `${shoulder}${roadsideSign(['SOFT', 'SHOULDER'])}<path d="M592 225q38 18 70 7t61 13" fill="none" stroke="#6f5d45" stroke-width="8" stroke-linecap="round" opacity=".7"/><path d="M605 256q34 17 62 7t54 10" fill="none" stroke="#6f5d45" stroke-width="8" stroke-linecap="round" opacity=".5"/>`);
  }
  if (item.visual === 'roadside-dropoff') {
    return svgScene(item.title, `<path d="M545 183h215v157H611Z" fill="#9c7855"/><path d="m545 183 66 157" stroke="#f8f8ed" stroke-width="8"/><path d="M567 191h193v38H584Z" fill="#5b4938" opacity=".68"/>${roadsideSign(['SHOULDER', 'DROP-OFF'], '#ff9b32')}<g filter="url(#shadow)"><path d="m521 291 28-65 28 65Z" fill="#ff8b26" stroke="#fff4dc" stroke-width="5"/><path d="M536 262h26" stroke="#fff" stroke-width="8"/></g>`);
  }
  if (item.visual === 'roadside-disabled') {
    return svgScene(item.title, `${shoulder}<g filter="url(#shadow)" transform="translate(488 171)"><path d="M0 43 29 8h122l38 35 22 8v78H-11V57Z" fill="url(#carBlue)" stroke="#143e61" stroke-width="6"/><path d="M43 16h58v43H12Zm69 0h31l31 43h-62Z" fill="#c6eef5" stroke="#30657f" stroke-width="4"/><rect x="7" y="76" width="195" height="29" rx="8" fill="#165681"/><circle cx="38" cy="127" r="22" fill="#19242a" stroke="#a9b8bd" stroke-width="7"/><circle cx="168" cy="127" r="22" fill="#19242a" stroke="#a9b8bd" stroke-width="7"/><rect class="pulse-light" x="5" y="64" width="32" height="19" rx="7" fill="#ffb52e" filter="url(#glow)"/><rect class="pulse-light" x="173" y="64" width="32" height="19" rx="7" fill="#ffb52e" filter="url(#glow)"/></g><g filter="url(#shadow)" transform="translate(408 272)"><path d="m0 48 28-48 28 48Z" fill="#f04a44" stroke="#fff" stroke-width="5"/><path d="m17 33 11-18 11 18Z" fill="#fff"/></g>`);
  }
  if (item.visual === 'roadside-worker') {
    return svgScene(item.title, `${shoulder}<g filter="url(#shadow)" transform="translate(565 111)"><circle cx="55" cy="34" r="24" fill="#8b5c3f"/><path d="M29 56h54l20 84-32 7-10-50-10 50-32-7Z" fill="#ff8e2f" stroke="#5d3f2d" stroke-width="5"/><path d="m31 67 51 54M81 67l-51 54" stroke="#fff7ad" stroke-width="12"/><path d="M37 142 28 221h28l8-58 8 58h28l-14-79Z" fill="#29475b"/><path d="m28 78-35 58m91-58 36 50" stroke="#8b5c3f" stroke-width="17" stroke-linecap="round"/><path d="M19 13q36-24 72 0l-7 16H26Z" fill="#ffd44f" stroke="#735321" stroke-width="4"/></g><g filter="url(#shadow)" fill="#ff8b26" stroke="#fff4dc" stroke-width="5"><path d="m453 317 25-62 25 62Z"/><path d="m694 326 23-58 23 58Z"/></g><g stroke="#fff" stroke-width="8"><path d="M465 286h26M705 297h24"/></g>`);
  }
  if (item.visual === 'roadside-tractor') {
    return svgScene(item.title, `<path d="M0 184h760v156H0Z" fill="#56646b"/><path d="M0 199h760" stroke="#e3ecee" stroke-width="12"/><path d="M520 184h240v156H582Z" fill="#b99562"/><path d="M570 183h190" stroke="#eef5ec" stroke-width="8"/>${roadsideSign(['TRACTOR', 'CROSSING'])}<g filter="url(#shadow)" transform="translate(454 135)"><circle cx="79" cy="122" r="48" fill="#20282d" stroke="#9aa6a8" stroke-width="10"/><circle cx="202" cy="132" r="30" fill="#20282d" stroke="#9aa6a8" stroke-width="8"/><path d="M58 50h99l35 74H48Z" fill="#4f9f45" stroke="#28572a" stroke-width="7"/><path d="M89 5h71v69H79Z" fill="#377f3e" stroke="#28572a" stroke-width="7"/><path d="M98 14h49v45H92Z" fill="#bce6ed" stroke="#37606c" stroke-width="5"/><path d="M151 76h55l22 47h-54Z" fill="#62ad4c" stroke="#28572a" stroke-width="6"/><path d="M111 5V-25h13V5" stroke="#273b31" stroke-width="8"/><circle cx="79" cy="122" r="18" fill="#d9c8a4"/><circle cx="202" cy="132" r="11" fill="#d9c8a4"/><rect x="153" y="81" width="37" height="15" rx="6" fill="#ffe17a"/></g>`);
  }

  return svgScene(item.title, `<path d="M0 184h760v156H0Z" fill="#3e4a50"/><path d="M0 199h760" stroke="#e6ecea" stroke-width="11"/><path d="M545 183h215v157H595Z" fill="#46684a"/><g opacity=".7" fill="#284b36"><path d="M552 185q34-49 70 0Zm75 0q42-61 87 0Zm73 0q31-47 62 0Z"/></g><g filter="url(#shadow)" transform="translate(489 103)" fill="#30251f" stroke="#1c1714" stroke-width="4"><ellipse cx="95" cy="83" rx="70" ry="39"/><path d="m42 79-17 104h19l29-83 37 3 18 80h20l-2-99Z"/><path d="M145 65q43-26 66 6-25 1-38 19l-31 7Z"/><path d="M187 63q4-25 20-34m-15 21 19-6m-15 11-10-18" fill="none" stroke-width="7" stroke-linecap="round"/><path d="M31 66Q8 38 16 17q17 14 34 3 4 21-19 46Z"/><path d="M164 72q-28-34-43-50" fill="none" stroke-width="9" stroke-linecap="round"/></g><g transform="translate(665 139) scale(.53)" fill="#3a2c25" stroke="#1c1714" stroke-width="5"><ellipse cx="70" cy="72" rx="55" ry="31"/><path d="m27 69-12 90h17l23-70 30 2 17 68h18l-2-82Z"/><path d="M108 58q34-20 51 6-20 1-30 16l-25 6Z"/></g>`, { night: true });
}

function safetyVisual(item) {
  if (item.visual.startsWith('signal-') || item.visual.startsWith('arrow-') || item.visual.startsWith('pedestrian-') || item.visual === 'railroad') return trafficSignalScene(item);
  if (item.visual.startsWith('sign-')) return signScene(item);
  if (item.visual.startsWith('emergency-') || item.visual.startsWith('bus-')) return emergencyScene(item);
  if (item.visual.startsWith('vehicle-')) return vehicleScene(item);
  if (item.visual.startsWith('roadside-')) return roadsideScene(item);
  return hazardScene(item);
}

function setProgress(done = step) {
  const clamped = Math.max(0, Math.min(ROUND_SIZE, done));
  $('#progressNumber').textContent = `${clamped} / ${ROUND_SIZE}`;
  $('#progressText').textContent = clamped === 0 ? 'Ready to scout' : clamped === ROUND_SIZE ? 'Route explored' : `${ROUND_SIZE - clamped} safety stops left`;
  $('#progressFill').style.width = `${(clamped / ROUND_SIZE) * 100}%`;
  $('.progress-track').setAttribute('aria-valuenow', String(clamped));
}

function setStats() {
  const answeredCount = step + (answered ? 1 : 0);
  const score = answeredCount ? Math.round((correct / answeredCount) * 100) : 0;
  $('#scoreValue').textContent = String(score);
  $('#streakValue').textContent = String(streak);
}

function refreshBest() {
  const game = sdk?.summary?.().games?.[GAME_ID];
  $('#bestValue').textContent = game ? String(game.highScore) : '—';
}

function tone(kind) {
  if (!sound || document.hidden) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(kind === 'good' ? 440 : 230, now);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'good' ? 720 : 165, now + .16);
    gain.gain.setValueAtTime(.055, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + .2);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + .21);
  } catch {
    sound = false;
    $('#soundButton').textContent = 'Sound unavailable';
    $('#soundButton').setAttribute('aria-pressed', 'false');
  }
}

function bloom(pose, message) {
  window.dispatchEvent(new CustomEvent('larriverse:bloom-message', {
    detail: { gameId: GAME_ID, pose, message }
  }));
}

function renderChallenge() {
  const item = round[step];
  answered = false;
  $('#challengePanel').dataset.scenarioId = item.id;
  $('#categoryChip').textContent = item.category;
  $('#categoryChip').dataset.category = item.category;
  $('#stopCount').textContent = `Stop ${step + 1} of ${ROUND_SIZE}`;
  $('#scenarioVisual').innerHTML = safetyVisual(item);
  $('#challengeTitle').textContent = item.title;
  $('#challengePrompt').textContent = item.prompt;
  $('#feedback').className = 'feedback';
  $('#feedback').textContent = '';
  $('#nextButton').hidden = true;
  $('#nextButton').textContent = step === ROUND_SIZE - 1 ? 'See my safety badge' : 'Next safety stop';

  const choices = shuffle(item.options.map((label, originalIndex) => ({ label, originalIndex })));
  $('#answerGrid').innerHTML = choices.map(choice => `<button type="button" class="answer-button" data-answer="${choice.originalIndex}">${esc(choice.label)}</button>`).join('');
  $('#answerGrid').querySelectorAll('.answer-button').forEach(button => button.addEventListener('click', () => answer(button, item)));
  setProgress(step);
  setStats();
}

function answer(button, item) {
  if (answered) return;
  answered = true;
  const selected = Number(button.dataset.answer);
  const good = selected === item.answer;
  if (good) {
    correct += 1;
    streak += 1;
  } else {
    streak = 0;
  }
  $('#answerGrid').querySelectorAll('.answer-button').forEach(option => {
    option.disabled = true;
    if (Number(option.dataset.answer) === item.answer) option.classList.add('correct');
  });
  if (!good) button.classList.add('wrong');
  $('#feedback').className = `feedback ${good ? 'good' : 'try'}`;
  $('#feedback').textContent = `${good ? 'Strong spotting!' : 'Good practice—here is the clue:'} ${item.why}`;
  $('#nextButton').hidden = false;
  setProgress(step + 1);
  setStats();
  tone(good ? 'good' : 'try');
  bloom(good ? 'cheer' : 'thinking', good ? `Great spotting! ${item.why}` : `That was a useful practice stop. ${item.why}`);
  $('#nextButton').focus({ preventScroll: true });
}

function finishRound() {
  const score = Math.round((correct / ROUND_SIZE) * 100);
  const title = score >= 90 ? 'Master Scout badge earned!' : score >= 70 ? 'Safety Scout badge earned!' : 'A new safety route explored!';
  $('#resultTitle').textContent = title;
  $('#resultScore').textContent = String(score);
  $('#resultMessage').textContent = `You identified ${correct} of ${ROUND_SIZE} safety clues. Every explanation becomes one more tool for the next street scene.`;
  const xp = 20 + Math.round(score * .28);
  let reward = `+${xp} XP · +3 pretend KC · progress saved`;
  try {
    sdk.award(GAME_ID, {
      xp,
      kc: 3,
      score,
      completed: true,
      metrics: { safetyStops: ROUND_SIZE, safetyClues: correct }
    });
    refreshBest();
  } catch {
    reward = 'This round is complete, but your browser could not save it.';
  }
  $('#rewardMessage').textContent = reward;
  $('#resultDialog').showModal();
  bloom('celebrate', `Route complete! You spotted ${correct} of ${ROUND_SIZE} safety clues.`);
}

function startRound() {
  round = buildRound();
  step = 0;
  correct = 0;
  streak = 0;
  answered = false;
  if ($('#resultDialog').open) $('#resultDialog').close();
  $('#startPanel').hidden = true;
  $('#challengePanel').hidden = false;
  renderChallenge();
  $('#playArea').focus({ preventScroll: true });
  bloom('cheer', 'Scout route ready! Check the picture, then choose the safest first move.');
}

$('#startButton').addEventListener('click', startRound);
$('#restartButton').addEventListener('click', startRound);
$('#playAgainButton').addEventListener('click', startRound);
$('#nextButton').addEventListener('click', () => {
  if (!answered) return;
  step += 1;
  if (step >= ROUND_SIZE) finishRound();
  else renderChallenge();
});
$('#hintButton').addEventListener('click', () => {
  const message = round.length && round[step] ? round[step].hint : 'Use color, shape, light position, and what is happening around the clue.';
  bloom('thinking', message);
  if (round.length && !answered) {
    $('#feedback').className = 'feedback try';
    $('#feedback').textContent = `Bloom’s clue: ${message}`;
  }
});
$('#soundButton').addEventListener('click', () => {
  sound = !sound;
  $('#soundButton').textContent = sound ? 'Sound on' : 'Sound off';
  $('#soundButton').setAttribute('aria-pressed', String(sound));
  if (sound) tone('good');
});

refreshBest();
setProgress(0);
setStats();
document.body.dataset.gameReady = 'true';
