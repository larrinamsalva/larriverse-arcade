import { streetSafetyCategories, streetSafetyScenarios } from './scenarios.js';

const GAME_ID = 'street-safety-scout';
const ROUND_SIZE = 12;
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
    'road-work': `<g fill="none" stroke="${black}" stroke-width="11" stroke-linecap="round"><circle cx="350" cy="101" r="12" fill="${black}"/><path d="m350 119-10 48m9-29 35 22m-43 5-30 41m29-39 29 38M387 154l26 62M395 174h42"/></g>`,
    slippery: `<g fill="none" stroke="${black}" stroke-width="9" stroke-linecap="round"><path d="M305 122h84l21 30v30H288v-30Z" fill="${black}"/><circle cx="315" cy="183" r="11" fill="${black}"/><circle cx="385" cy="183" r="11" fill="${black}"/><path d="M297 211q21-24 43 0t43 0 43 0"/></g>`,
    merge: `<g fill="none" stroke="${black}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><path d="M344 205V94m-18 21 18-25 18 25M410 202v-49q0-24-36-41"/></g>`,
    flagger: `<g fill="none" stroke="${black}" stroke-width="10" stroke-linecap="round"><circle cx="350" cy="103" r="12" fill="${black}"/><path d="m350 119-1 61m0-40-35 25m36-16 36 19m-37 11-24 35m25-35 25 35M388 88v88"/><path d="M389 91h40l-15 21 15 20h-40Z" fill="${black}"/></g>`,
    pedestrian: `<g fill="none" stroke="${black}" stroke-width="12" stroke-linecap="round"><circle cx="365" cy="99" r="13" fill="${black}"/><path d="m362 119-18 53m11-30 39 14m-47 14-32 43m38-43 30 42"/></g>`,
    bicycle: `<g fill="none" stroke="${black}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><circle cx="318" cy="184" r="31"/><circle cx="407" cy="184" r="31"/><path d="m318 184 35-53 28 53h-63l27-34h48m-40-19 40-4m-18 0 32 57"/><circle cx="367" cy="99" r="10" fill="${black}"/></g>`
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

function emergencyScene(item) {
  if (item.visual.startsWith('bus-')) return busScene(item);
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

function hazardScene(item) {
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

function safetyVisual(item) {
  if (item.visual.startsWith('signal-') || item.visual.startsWith('arrow-') || item.visual.startsWith('pedestrian-') || item.visual === 'railroad') return trafficSignalScene(item);
  if (item.visual.startsWith('sign-')) return signScene(item);
  if (item.visual.startsWith('emergency-') || item.visual.startsWith('bus-')) return emergencyScene(item);
  if (item.visual.startsWith('vehicle-')) return vehicleScene(item);
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
