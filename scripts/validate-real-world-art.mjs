import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {PORTAL_STORIES,VISUAL_STYLE_VERSION,VISUAL_STANDARDS,visualPortalModels,worldArtPosition} from '../assets/larriverse-visual-foundation.js';

const read=path=>fs.readFileSync(path,'utf8');
const catalog=JSON.parse(read('games/catalog.json'));
const rollout=JSON.parse(read('docs/REAL-WORLD-VISUAL-ROLL-OUT.json'));
assert.equal(catalog.length,40,'Entire 40-world library must be kept');
assert.equal(rollout.worlds.length,40,'Every game needs a future visual-design assessment');
assert.equal(rollout.styleVersion,VISUAL_STYLE_VERSION,'Rollout uses same named art system');
assert.deepEqual(rollout.worlds.map(x=>x.id),catalog.map(x=>x.id),
 'Visual rollout maps each catalog game exactly once in the same order');
assert.ok(rollout.worlds.every(w=>w.wave>=1&&w.wave<=4&&w.visualTarget.length>30&&w.safetyGate.length>20),
 'Every world has a roadmap wave, distinct art goal and human review gate');
assert.ok(rollout.worlds.every(w=>w.status==='planned-visual-review'),
 'Unchanged game scenes are not labeled as already upgraded');
assert.ok(rollout.principle.includes('not emojis or stick figures'),
 'Visual upgrade goal must address real art-quality issues');
assert.equal(PORTAL_STORIES.length,3,'Start with three detailed homepage portals, not forty rushed replacements');
const portals=visualPortalModels(catalog);
assert.deepEqual(portals.map(x=>x.story.id),['repair-cafe','garden-guardians','robot-rover'],
 'First visual shelf uses existing art matched to actual playable world themes');
for(const {story,game} of portals){
 assert.ok(game.available&&game.href.startsWith('games/')&&fs.existsSync(game.href),
  'World portal must take players to a real game');
 assert.ok(story.description.length>30&&story.intendedFocus.length>35,
  'Portal needs meaningful scene description and art-quality target');
 assert.match(worldArtPosition(game),/^--art-x:[0-9.]+%;--art-y:[0-9.]+%$/);
}
for(const field of ['faces','figures','creatures','materials','scenes','inclusive','safety']){
 assert.ok(VISUAL_STANDARDS[field].length>25,'Shared visual design must define '+field);
}
const home=read('index.html'),js=read('assets/arcade.js'),css=read('assets/larriverse-real-world.css');
for(const token of ['id="worldPortalGrid"','aria-labelledby="portalsTitle"','world-art-note',
 'assets/larriverse-real-world.css','href="#games"','id="gameGrid"','id="search"']){
 assert.ok(home.includes(token),'Homepage must provide '+token);
}
assert.ok(home.indexOf('class="world-portals"')<home.indexOf('class="discovery"'),
 'New portal shelf appears before recommended game list');
assert.ok(js.includes('visualPortalModels(games)')&&js.includes('renderWorldPortals();'),
 'Portal cards are rendered from live catalog not invented routes');
assert.ok(js.includes('return worldArtPosition(game);'),
 'All forty original gallery cards share the same art placement helper');
assert.ok(js.includes('escapeHtml(story.description)')&&js.includes('escapeHtml(game.title)'),
 'Portal text is escaped before adding HTML');
for(const token of ['world-portal-visual','world-portal-grid','prefers-reduced-motion',
 'larriverse-dark','larriverse-high-contrast','@media(max-width:700px)','worlds-atlas-v2.webp']){
 assert.ok(css.includes(token),'New visual style preserves '+token);
}
assert.ok(!/https?:\/\/|@import|url\(\s*['"]?\/\//.test(css),
 'All preview paintings stay local to the Arcade');
assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|navigator\.geolocation|sendBeacon/.test(read('assets/larriverse-visual-foundation.js')),
 'Shared foundation uses only static local art definitions');
for(const file of ['assets/larriverse-visual-foundation.js','assets/arcade.js']){
 const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(r.status,0,'Valid JavaScript syntax '+file+': '+r.stderr);
}
console.log('World visual foundation: 40 world audit records, 3 live cinematic portals, responsive offline artwork and shared art rules.');
