import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { creatureMissions, roadMissions } from "../assets/classic-adventure-missions.js";

for(const [id,deck] of [["creature-catcher",creatureMissions],["road-trip-quest",roadMissions]]){
  assert.equal(deck.length,60,`${id} has sixty real optional missions`);
  assert.equal(new Set(deck.map(x=>x.id)).size,60,`${id} ids unique`);
  assert.equal(new Set(deck.map(x=>x.prompt)).size,60,`${id} prompts unique`);
  assert.equal(new Set(deck.map(x=>[x.prompt,...x.options].join("|"))).size,60,`${id} has sixty distinct learning situations`);
  const chapters=[...new Set(deck.map(x=>x.chapter))];
  assert.equal(chapters.length,5,`${id} offers five different curriculum chapters`);
  assert.ok(chapters.every(chapter=>deck.filter(x=>x.chapter===chapter).length===12),
    `${id} offers twelve individual challenges per chapter`);
  for(const mission of deck){
    assert.match(mission.id,new RegExp("^"+(id==="creature-catcher"?"creature":"road")+"-[0-9]{2}$"));
    assert.ok(mission.prompt.length>25&&mission.title.length>10&&mission.why.length>55,mission.id);
    assert.equal(mission.options.length,3,mission.id);
    assert.equal(new Set(mission.options).size,3,mission.id);
    assert.ok(mission.options.every(x=>x.length>8),mission.id);
    assert.ok(Number.isInteger(mission.answer)&&mission.answer>=0&&mission.answer<3,mission.id);
    assert.ok(mission.why.includes(mission.options[mission.answer]),`${mission.id} explanation must support its answer`);
  }
  assert.deepEqual([0,1,2].map(n=>deck.filter(x=>x.answer===n).length),[20,20,20]);
  const html=fs.readFileSync(`games/${id}/index.html`,"utf8");
  assert.ok(html.includes(`data-adventure-mission="${id}"`));
  assert.ok(html.includes("../../assets/classic-adventure-play.js"));
  assert.ok(html.includes("../../assets/classic-adventure-missions.css"));
}
const ui=fs.readFileSync("assets/classic-adventure-play.js","utf8");
assert.ok(ui.includes('localStorage.setItem(key'),"Progress saves locally");
assert.ok(ui.includes('Return to the original game'),"All missions allow returning to existing game");
assert.ok(ui.includes('if(n===m.answer)'),"Incorrect answers cannot advance");
assert.ok(ui.includes('index===59'),"Full sixty-mission completion required");
assert.ok(ui.includes('Show a free hint'),"All missions include free accessible hints");
assert.ok(!ui.includes('navigator.geolocation'),"No location tracking");
for(const file of ["assets/classic-adventure-missions.js","assets/classic-adventure-play.js"])
  execFileSync(process.execPath,["--check",file]);
console.log("Classic quests validated: two different sixty-mission curricula, saved resume, non-repeating prompts, original games preserved.");
