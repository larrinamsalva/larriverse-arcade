// The displayed rings are drawn from the same alphabet and turn as the live key chart.
// This wheel is supplementary: the full mapping remains readable in the chart below.
export function rotorPairs(alphabet, shift) {
  if (!['ABCDEFGH', 'ABCDEFGHIJKLMNOPQRST', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].includes(alphabet) ||
      !Number.isInteger(shift) || shift < 0 || shift >= alphabet.length) {
    throw new RangeError('Cipher rotor needs a supported alphabet and turn');
  }
  return [...alphabet].map((letter, index) => [letter, alphabet[(index + shift) % alphabet.length]]);
}

function polar(radius, angle) {
  return [140 + radius * Math.cos(angle), 140 + radius * Math.sin(angle)]
    .map(value => value.toFixed(1));
}

export function cipherRotor(alphabet, shift) {
  const pairs = rotorPairs(alphabet, shift);
  const count = pairs.length;
  const size = count === 8 ? 18 : count === 20 ? 14 : 12;
  const outer = pairs.map(([letter], index) => {
    const [x, y] = polar(113, index * 2 * Math.PI / count - Math.PI / 2);
    return `<text x="${x}" y="${y}">${letter}</text>`;
  }).join('');
  const inner = pairs.map(([, letter], index) => {
    const [x, y] = polar(81, index * 2 * Math.PI / count - Math.PI / 2);
    return `<text x="${x}" y="${y}">${letter}</text>`;
  }).join('');
  const ticks = pairs.map((_, index) => {
    const angle = (index + .5) * 2 * Math.PI / count - Math.PI / 2;
    const [x1, y1] = polar(101, angle);
    const [x2, y2] = polar(126, angle);
    return `<path d="M${x1} ${y1}L${x2} ${y2}"/>`;
  }).join('');
  return `<svg class="cipher-rotor-art" viewBox="0 0 280 280" data-rotor-shift="${shift}" data-rotor-size="${count}" aria-hidden="true" focusable="false">
    <defs><radialGradient id="cipher-brass"><stop stop-color="#fff2bd"/><stop offset=".76" stop-color="#c99f58"/><stop offset="1" stop-color="#816038"/></radialGradient></defs>
    <circle cx="140" cy="140" r="137" fill="#4f3b41"/>
    <circle cx="140" cy="140" r="131" fill="#b98b57" stroke="#f7dda2" stroke-width="3"/>
    <circle cx="140" cy="140" r="126" fill="url(#cipher-brass)"/>
    <circle cx="140" cy="140" r="100" fill="#4e3942" stroke="#fff0c0" stroke-width="2"/>
    <circle cx="140" cy="140" r="95" fill="url(#cipher-brass)"/>
    <g class="cipher-rotor-ticks" stroke="#644c39" stroke-width="1.2" opacity=".55">${ticks}</g>
    <g class="cipher-rotor-letters" font-size="${size}">${outer}${inner}</g>
    <circle cx="140" cy="140" r="61" fill="#614349" stroke="#efce84" stroke-width="3"/>
    <circle cx="140" cy="140" r="49" fill="#3a3048" stroke="#bd9b63" stroke-width="3"/>
    <text class="cipher-rotor-center" x="140" y="134">KEY</text>
    <text class="cipher-rotor-center cipher-rotor-number" x="140" y="159">+${shift}</text>
  </svg>`;
}
