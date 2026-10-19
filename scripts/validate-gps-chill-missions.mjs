import fs from "node:fs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { gpsMissions,chillMissions } from "../assets/gps-chill-missions.js";
const checks=[
 ["road-trip-quest-gps",gpsMissions,60,["Map Symbol Sleuth","Find the Public Entrance","Travel Safely","Location Privacy","Leave Places Better"],[12,12,12,12,12]],
 ["chill-brain-rewards",chillMissions,80,["Gentle Observation","Easy Breathing Choices","Unhurried Focus","Comfort Check","Kindness Practice","Pattern & Memory","Gentle Decision Making"],[12,12,12,12,12,10,10]]
];
for(const [id,deck,expected,chapters,chapterSizes] of checks){
 assert.equal(deck.length,expected,`${id}: ${expected} distinct missions`);
 assert.equal(new Set(deck.map(x=>x.id)).size,expected,`${id}: IDs are all unique`);
 assert.equal(new Set(deck.map(x=>x.prompt)).size,expected,`${id}: no copied question prompts`);
 assert.deepEqual([...new Set(deck.map(x=>x.chapter))],chapters,`${id}: meaningful chapters remain ordered`);
 chapters.forEach((name,index)=>assert.equal(deck.filter(x=>x.chapter===name).length,chapterSizes[index],`${id}: chapter size for ${name}`));
 for(const m of deck){
  assert.match(m.id,new RegExp("^"+(id==="road-trip-quest-gps"?"gps":"chill")+"-[0-9]{2}$"));
  assert.ok(m.title.length>10&&m.prompt.length>25&&m.why.length>60,`${m.id}: useful learning copy`);
  assert.equal(m.options.length,3);
  assert.equal(new Set(m.options).size,3,`${m.id}: answer options distinct`);
  assert.ok(m.options.every(s=>s.length>9),`${m.id}: readable answers`);
  assert.ok(Number.isInteger(m.answer)&&m.answer>=0&&m.answer<3);
  assert.ok(m.why.includes(m.options[m.answer]),`${m.id}: why supports correct answer`);
 }
 const answerCounts=[0,1,2].map(i=>deck.filter(x=>x.answer===i).length);
 if(id==="road-trip-quest-gps")assert.deepEqual(answerCounts,[20,20,20]);
 else assert.ok(Math.max(...answerCounts)-Math.min(...answerCounts)<=1,"Chill Brain answer positions stay balanced");
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
assert.ok(shared.includes('index===deck.length-1')&&shared.includes('item.next<=deck.length'),"Mission player uses each deck\'s real length");
assert.ok(!shared.includes("navigator.geolocation"),"No use of location from challenge path");
assert.ok(!shared.includes("Notification.requestPermission"),"No extra browser permissions");
for(const path of ["assets/gps-chill-missions.js","assets/chill-bonus-missions.js","assets/classic-adventure-play.js","tests/browser/gps-chill-missions.spec.mjs"]){
 execFileSync(process.execPath,["--check",path]);
}
console.log("Validated 60 offline map missions and 80 untimed Chill Brain missions; original GPS and calming-session capabilities retained.");
