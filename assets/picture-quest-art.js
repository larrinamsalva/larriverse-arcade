import { spiderPicture } from './spider-field-guide-art.js';
import { helpScenePicture } from './helping-hands-realistic-art.js';
export { spiderPicture } from './spider-field-guide-art.js';
// Original, offline SVG picture cards shared by Spider Scout and Helping Hands.
// These are teaching illustrations, never reliable species diagnosis or medical instructions.
const esc=value=>String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const picture=(inner,caption='')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" focusable="false" aria-hidden="true">
<rect x="3" y="3" width="314" height="194" rx="22" fill="#f4f8fa" stroke="#accbd0" stroke-width="5"/>
<circle cx="270" cy="49" r="47" fill="#d7e8f5" opacity=".7"/>
<path d="M22 169 Q95 151 160 166 T303 160 V180 H22Z" fill="#d4eddc"/>
${inner}
${caption?`<text x="160" y="190" font-family="system-ui,sans-serif" font-size="13" text-anchor="middle" fill="#244c53" font-weight="700">${esc(caption)}</text>`:''}
</svg>`;
const stroke='#294b5d';
const people=`<circle cx="128" cy="55" r="22" fill="#efb482" stroke="${stroke}" stroke-width="5"/>
<path d="M85 149 Q81 94 129 94 Q176 94 176 149" fill="#63b7a6" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>`;
const phone=`<rect x="103" y="31" width="115" height="139" rx="19" fill="#244d70" stroke="${stroke}" stroke-width="7"/>
<rect x="116" y="49" width="89" height="93" rx="7" fill="#a5e6e8"/>
<circle cx="160" cy="153" r="7" fill="#fff"/>`;
const redCross=`<path d="M148 62 h24 v27 h27 v24 h-27 v27 h-24 v-27 h-27 v-24 h27Z" fill="#e65d58"/>`;
const art={
  emergency:phone+`<text x="160" y="109" font-size="35" font-weight="900" fill="#183f4b" text-anchor="middle">911</text>`,
  adult:people+`<circle cx="229" cy="82" r="17" fill="#edb581" stroke="${stroke}" stroke-width="4"/>
  <path d="M195 151 Q198 107 228 106 Q255 106 263 151" fill="#dca75e" stroke="${stroke}" stroke-width="5"/>`,
  kit:`<rect x="74" y="62" width="171" height="100" rx="14" fill="#fff" stroke="${stroke}" stroke-width="7"/>
  <path d="M126 64 V48 Q127 37 139 37 H179 Q191 37 191 49 V64" fill="none" stroke="${stroke}" stroke-width="7"/>`+redCross,
  bandage:`<rect x="88" y="73" width="145" height="56" rx="22" fill="#eeb88d" stroke="${stroke}" stroke-width="6" transform="rotate(-15 160 101)"/>
  <rect x="136" y="75" width="48" height="51" rx="8" fill="#fff3df" transform="rotate(-15 160 101)"/>
  <g fill="#b67a63"><circle cx="155" cy="96" r="3"/><circle cx="169" cy="96" r="3"/><circle cx="163" cy="108" r="3"/></g>`,
  water:`<path d="M160 35 C115 95 110 110 110 137 A50 50 0 0 0 210 137 C210 106 192 72 160 35Z" fill="#83cce7" stroke="#276887" stroke-width="7"/><path d="M139 129 Q141 108 150 99" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`,
  nose:`<circle cx="155" cy="75" r="42" fill="#edba8f" stroke="${stroke}" stroke-width="6"/>
  <path d="M148 77 Q142 110 166 111" fill="none" stroke="#8b574d" stroke-width="5" stroke-linecap="round"/>
  <path d="M125 126 Q147 133 166 126" stroke="#ab5a60" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M172 114 Q185 129 175 143" stroke="#d85663" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M122 154 l-25 10 M188 154 l25 10" stroke="#3a8894" stroke-width="12" stroke-linecap="round"/>`,
  pressure:`<path d="M84 133 Q101 104 127 110 L159 101 Q169 91 182 103 L216 128 Q235 144 211 153 H132 Q111 164 84 149Z" fill="#eeba87" stroke="${stroke}" stroke-width="6"/>
  <path d="M98 160 H235" stroke="#cc5759" stroke-width="10" stroke-linecap="round"/>`,
  away:`<path d="M93 146 Q122 76 162 101 L202 116" stroke="#357b88" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M204 117 l-25 -25 M204 117 l-31 13" stroke="#357b88" stroke-width="9" stroke-linecap="round"/>
  <circle cx="90" cy="65" r="23" fill="#ffde9f" stroke="#ad6a46" stroke-width="5"/>
  <path d="M67 60 h46 M90 42 v43" stroke="#ad6a46" stroke-width="5"/>`,
  stop:`<path d="M117 44 H201 L245 88 V137 L200 177 H115 L75 136 V87Z" fill="#e26161" stroke="#fff" stroke-width="7"/>
  <text x="160" y="126" fill="#fff" font-family="system-ui" font-size="34" text-anchor="middle" font-weight="900">STOP</text>`,
  observe:`<circle cx="140" cy="91" r="45" fill="#cbe8f7" stroke="${stroke}" stroke-width="9"/>
  <path d="M175 121 L226 166" stroke="${stroke}" stroke-width="17" stroke-linecap="round"/>
  <circle cx="136" cy="91" r="13" fill="#335e76"/>`,
  web:`<g stroke="#7296a1" stroke-width="3" fill="none"><circle cx="160" cy="103" r="62"/><circle cx="160" cy="103" r="43"/><circle cx="160" cy="103" r="22"/>
  <path d="M160 35 V172 M93 103 H227 M112 55 L210 152 M210 55 L112 152"/></g>`,
  eyes:`<ellipse cx="160" cy="115" rx="86" ry="52" fill="#705b54"/><circle cx="125" cy="99" r="22" fill="#e3eef0"/><circle cx="192" cy="99" r="22" fill="#e3eef0"/><circle cx="125" cy="99" r="13" fill="#1c2e38"/><circle cx="192" cy="99" r="13" fill="#1c2e38"/>`,
  flower:`<path d="M160 94 V172" stroke="#388d64" stroke-width="9"/><g fill="#f8bd55" stroke="#d48a62" stroke-width="3">
  <ellipse cx="160" cy="60" rx="18" ry="37"/><ellipse cx="160" cy="60" rx="18" ry="37" transform="rotate(60 160 93)"/>
  <ellipse cx="160" cy="60" rx="18" ry="37" transform="rotate(120 160 93)"/><ellipse cx="160" cy="60" rx="18" ry="37" transform="rotate(180 160 93)"/>
  <ellipse cx="160" cy="60" rx="18" ry="37" transform="rotate(240 160 93)"/><ellipse cx="160" cy="60" rx="18" ry="37" transform="rotate(300 160 93)"/>
  </g><circle cx="160" cy="94" r="21" fill="#87513b"/>`,
  burrow:`<path d="M38 125 Q154 105 279 126 V180 H38Z" fill="#b98e63"/><path d="M114 178 Q118 123 160 126 Q203 125 208 178" fill="#41362e" stroke="#73553e" stroke-width="7"/>
  <path d="M106 126 Q160 99 214 126" fill="none" stroke="#5e7548" stroke-width="7"/>`,
  grass:`<path d="M85 171 Q91 96 121 76 M118 173 Q130 93 149 64 M170 170 Q180 108 206 78 M210 171 Q210 117 243 96" stroke="#499b67" stroke-width="11" fill="none" stroke-linecap="round"/>`,
  wood:`<rect x="59" y="125" width="202" height="31" rx="13" fill="#a97851" stroke="#7c533a" stroke-width="5"/>
  <rect x="75" y="96" width="177" height="28" rx="12" fill="#b3865d" stroke="#7c533a" stroke-width="5"/>`,
  house:`<path d="M65 99 L160 32 L256 99 V177 H65Z" fill="#f6dfaa" stroke="#8c6659" stroke-width="6"/><path d="M58 103 L160 29 L262 103" fill="none" stroke="#b77857" stroke-width="11"/><rect x="140" y="116" width="43" height="61" fill="#6c928b"/>`,
  sheet:`<path d="M51 148 Q95 117 159 137 T269 133" stroke="#799fab" fill="none" stroke-width="4"/><path d="M59 151 L253 151 M75 138 L242 138 M99 124 L233 141" stroke="#799fab" fill="none" stroke-width="3"/>`,
  leaf:`<path d="M77 142 Q84 65 255 45 Q249 137 154 156Z" fill="#7eb880" stroke="#32775a" stroke-width="6"/>
  <path d="M93 143 L248 56" stroke="#347950" stroke-width="5"/>`,
  phone:phone+`<path d="M136 82 Q147 114 182 127" stroke="#166f60" fill="none" stroke-width="13" stroke-linecap="round"/>`,
  rest:`<rect x="77" y="119" width="169" height="24" rx="10" fill="#7db6bc"/><rect x="75" y="95" width="49" height="29" rx="10" fill="#e8bf95"/>
  <path d="M100 144 V168 M224 144 V168" stroke="${stroke}" stroke-width="8"/>`,
  listen:`<circle cx="154" cy="90" r="47" fill="#ebc19b" stroke="${stroke}" stroke-width="6"/><path d="M178 69 Q196 97 167 120" stroke="#7d554f" stroke-width="7" fill="none"/><path d="M165 102 Q148 87 153 80" stroke="#7d554f" stroke-width="5" fill="none"/>`,
  fire:`<path d="M141 33 Q154 73 136 91 Q115 99 108 116 Q105 164 160 171 Q224 166 208 111 Q194 77 180 70 Q186 98 161 114 Q170 77 141 33Z" fill="#f49d55" stroke="#c86a45" stroke-width="7"/><path d="M157 101 Q141 125 145 142 Q149 157 169 154 Q184 144 175 123Z" fill="#fadd7e"/>`,
  cross:redCross,
  clock:`<circle cx="160" cy="105" r="62" fill="#e9f5fa" stroke="#3b7787" stroke-width="9"/><path d="M160 65 V106 L197 124" stroke="#3b7787" stroke-width="9" fill="none" stroke-linecap="round"/>`,
  ice:`<rect x="91" y="57" width="141" height="102" rx="15" fill="#a7dbea" stroke="#367b97" stroke-width="7"/><path d="M162 77 V141 M132 108 H192 M140 86 L184 132 M184 86 L140 132" stroke="#fff" stroke-width="7"/>`,
  medicine:`<rect x="98" y="57" width="125" height="109" rx="12" fill="#edb77c" stroke="#805b4e" stroke-width="6"/><rect x="91" y="45" width="141" height="26" rx="7" fill="#719fb6"/><rect x="119" y="97" width="82" height="37" rx="6" fill="#fff"/>`+redCross.replaceAll('148','148').replaceAll('62','62'),
  food:`<ellipse cx="160" cy="136" rx="91" ry="34" fill="#e4f2f2" stroke="#729cac" stroke-width="6"/><path d="M114 105 Q159 68 211 105" fill="none" stroke="#c79d6d" stroke-width="14" stroke-linecap="round"/>`,
  friend:people+`<path d="M183 111 Q218 70 246 101" stroke="#ca705f" stroke-width="10" fill="none"/>`,
  cloth:`<rect x="88" y="71" width="148" height="89" rx="10" fill="#e2e9df" stroke="#5d8a87" stroke-width="7"/><path d="M117 80 V150 M148 80 V150 M182 80 V150 M211 80 V150" stroke="#b9d0cd" stroke-width="4"/>`,
  door:`<rect x="104" y="33" width="120" height="141" rx="8" fill="#be9475" stroke="${stroke}" stroke-width="7"/><circle cx="198" cy="108" r="7" fill="#fff"/>`,
  wait:`<path d="M160 45 V163" stroke="#50777f" stroke-width="8"/><path d="M108 105 H212" stroke="#50777f" stroke-width="8"/><circle cx="160" cy="104" r="59" fill="none" stroke="#e3a55e" stroke-width="8" stroke-dasharray="12 10"/>`,
  noTouch:`<path d="M105 139 V89 Q105 75 116 75 Q128 75 128 90 V58 Q128 48 138 48 Q150 48 150 60 V84 V47 Q150 38 162 38 Q175 39 175 51 V88 V68 Q176 58 187 58 Q198 58 198 72 V114 Q216 92 230 101 Q244 113 221 145 Q205 167 155 167 Q123 164 105 139Z" fill="#eebe92" stroke="#815b4d" stroke-width="6"/>
  <circle cx="161" cy="101" r="80" fill="none" stroke="#dc5b65" stroke-width="10"/><path d="M108 151 L219 50" stroke="#dc5b65" stroke-width="10"/>`,
};
export function actionPicture(key){
  const inner=art[key]||art.observe;
  return picture(inner);
}
export function scenePicture(item,mode){
  return mode==='spider'?spiderPicture(item.scene):helpScenePicture(item);
}
