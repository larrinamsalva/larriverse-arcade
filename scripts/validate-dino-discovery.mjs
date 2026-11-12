import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { CHAPTERS, MISSIONS, SOURCES } from "../games/dino-discovery-world/missions.js";

assert.equal(CHAPTERS.length,8,"Dino Discovery contains eight science chapters");
assert.equal(MISSIONS.length,80,"Dino Discovery contains eighty authored missions");
assert.equal(new Set(MISSIONS.map(m=>m.prompt)).size,80,"Every question is distinct");
assert.equal(new Set(MISSIONS.map(m=>m.id)).size,80,"Mission IDs are unique");
for(const [i,m] of MISSIONS.entries()){
  assert.equal(m.id,i+1);
  assert.equal(m.chapter,Math.floor(i/10));
  assert.equal(m.mode,CHAPTERS[m.chapter].mode);
  assert.equal(m.options.length,3);
  assert.equal(new Set(m.options).size,3,"Answer choices must differ");
  assert.ok(Number.isInteger(m.answer)&&m.answer>=0&&m.answer<3);
  assert.ok(m.prompt.length>12&&m.explanation.length>35&&m.observation.length>18);
}
assert.equal(MISSIONS.filter(m=>m.mode==="dig").length,10,"Ten hands-on fossil digs");
assert.ok(MISSIONS.some(m=>/birds/i.test(m.explanation)),"Living dinosaurs explained");
assert.ok(MISSIONS.some(m=>/not dinosaurs/i.test(m.explanation)),"Non-dinosaur reptiles distinguished");
assert.ok(SOURCES.length>=3&&SOURCES.every(s=>s.url.startsWith("https://")),"Museum source links are present");

const root="games/dino-discovery-world/";
const html=fs.readFileSync(root+"index.html","utf8"),css=fs.readFileSync(root+"game.css","utf8");
const game=fs.readFileSync(root+"game.js","utf8"),scene=fs.readFileSync(root+"scene-3d.js","utf8");
for(const name of ["dinoCanvas","turnLeft","turnRight","zoomIn","zoomOut","tiltUp","tiltDown","switchDino","brushFossil","brushReadout","fieldGuide","answerChoices","chapterName","missionQuestion","nextMission","levelSelect"]){
  assert.ok(html.includes('id="'+name+'"'),"3D scene exposes "+name);
}
for(const feature of ["localStorage","LarriVerseArcade?.award","new Set","brushes","fieldGuide","unlocked"]){
  assert.ok(game.includes(feature),"Game engine includes "+feature);
}
for(const feature of ["createScene","pointerdown","pointermove","keydown","project","polygon","yaw","pitch","tilt","zoom","getContext"]){
  assert.ok(scene.includes(feature),"3D scene includes "+feature);
}
assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|geolocation/i.test(game+scene),"3D dinosaur cabinet makes no external requests or location calls");
assert.ok(html.includes("arcade-sdk.js")&&html.includes("cabinet-shell.js")&&html.includes("arcade-accessibility.css"));
assert.ok(css.includes("html.larriverse-dark")&&css.includes("html.larriverse-high-contrast")&&css.includes("@media(max-width:720px)"));
for(const f of ["missions.js","game.js","scene-3d.js"]){
  const result=spawnSync(process.execPath,["--check",root+f],{encoding:"utf8"});
  assert.equal(result.status,0,root+f+" must parse: "+result.stderr);
}
const catalog=JSON.parse(fs.readFileSync("games/catalog.json","utf8"));
const release=JSON.parse(fs.readFileSync("release.json","utf8"));
const row=catalog.find(g=>g.id==="dino-discovery-world");
assert.ok(row?.available&&row.featured&&row.artSet==="dino"&&row.integration==="arcade-sdk-v3");
assert.match(row.mission,/eighty/i);
assert.ok(release.cabinets.some(g=>g.id==="dino-discovery-world"));
assert.equal(release.cabinetCount,catalog.length);
assert.equal(release.galleryReview.expectedImages,(catalog.length+1)*2);
console.log("Dino Discovery validation passed: 80 unique science missions, 8 chapters, 10 fossil digs, accessible 3D renderer, local saves, arcade integration.");
