import fs from "node:fs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { gpsMissions,chillMissions } from "../assets/gps-chill-missions.js";
const checks=[
 ["road-trip-quest-gps",gpsMissions,["Map Symbol Sleuth","Find the Public Entrance","Travel Safely","Location Privacy","Leave Places Better"]],
 ["chill-brain-rewards",chillMissions,["Gentle Observation","Easy Breathing Choices","Unhurried Focus","Comfort Check","Kindness Practice"]]
];
for(const [id,deck,chapters] of checks){
 assert.equal(deck.length,60,`${id}: 60 distinct missions`);
 assert.equal(new Set(deck.map(x=>x.id)).size,60,`${id}: IDs are all unique`);
 assert.equal(new Set(deck.map(x=>x.prompt)).size,60,`${id}: no copied question prompts`);
 assert.deepEqual([...new Set(deck.map(x=>x.chapter))],chapters,`${id}: 5 meaningful chapters`);
 assert.ok(chapters.every(name=>deck.filter(x=>x.chapter===name).length===12),`${id}: 12 missions per chapter`);
 for(const m of deck){
  assert.match(m.id,new RegExp("^"+(id==="road-trip-quest-gps"?"gps":"chill")+"-[0-9]{2}$"));
  assert.ok(m.title.length>10&&m.prompt.length>25&&m.why.length>60,`${m.id}: useful learning copy`);
  assert.equal(m.options.length,3);
  assert.equal(new Set(m.options).size,3,`${m.id}: answer options distinct`);
  assert.ok(m.options.every(s=>s.length>9),`${m.id}: readable answers`);
  assert.ok(Number.isInteger(m.answer)&&m.answer>=0&&m.answer<3);
  assert.ok(m.why.includes(m.options[m.answer]),`${m.id}: why supports correct answer`);
 }
 assert.deepEqual([0,1,2].map(i=>deck.filter(x=>x.answer===i).length),[20,20,20]);
 const html=fs.readFileSync("games/"+id+"/index.html","utf8");
 assert.ok(html.includes('data-adventure-mission="'+id+'"'));
 assert.ok(html.includes('classic-adventure-play.js'));
 assert.ok(html.includes('classic-adventure-missions.css'));
}
const gpsHtml=fs.readFileSync("games/road-trip-quest-gps/index.html","utf8");
assert.ok(gpsHtml.includes('id="demoButton"')&&gpsHtml.includes('id="liveButton"'),"Keep demo + explicit live GPS opt-in");
const chillHtml=fs.readFileSync("games/chill-brain-rewards/index.html","utf8");
assert.ok(chillHtml.includes('id="missionGrid"')&&chillHtml.includes('id="setupView"'),"Keep original calming sessions/onboarding");
const shared=fs.readFileSync("assets/classic-adventure-play.js","utf8");
assert.ok(shared.includes('larriverse.classicMissions.'),"Mission progress stored locally");
assert.ok(shared.includes('if(n===m.answer)'),"Wrong answers must not advance");
assert.ok(shared.includes('index===59'),"All sixty levels required");
assert.ok(!shared.includes("navigator.geolocation"),"No use of location from challenge path");
assert.ok(!shared.includes("Notification.requestPermission"),"No extra browser permissions");
for(const path of ["assets/gps-chill-missions.js","assets/classic-adventure-play.js","tests/browser/gps-chill-missions.spec.mjs"]){
 execFileSync(process.execPath,["--check",path]);
}
console.log("Validated 120 distinctive offline map and untimed focus missions; original GPS and Chill Brain capabilities retained.");
