import assert from "node:assert/strict";
import fs from "node:fs";
import {spawnSync} from "node:child_process";
import {SPECIMENS,SPECIMEN_IDS,BRUSH_STEPS,specimenById} from "../games/dino-discovery-world/fossil-lab-data.js";

const root="games/dino-discovery-world/";
const html=fs.readFileSync(root+"fossil-lab.html","utf8");
const css=fs.readFileSync(root+"fossil-lab.css","utf8");
const logic=fs.readFileSync(root+"fossil-lab.js","utf8");
const renderer=fs.readFileSync(root+"fossil-lab-3d.js","utf8");
const game=fs.readFileSync(root+"index.html","utf8");
const trail=fs.readFileSync(root+"explore.html","utf8");
const trailLogic=fs.readFileSync(root+"explore.js","utf8");
assert.equal(SPECIMENS.length,3,"Three authored fossil investigation samples");
assert.equal(BRUSH_STEPS,4,"Four gentle soil-brushing steps");
assert.equal(new Set(SPECIMEN_IDS).size,SPECIMENS.length,"Sample IDs must be unique");
assert.deepEqual([...SPECIMEN_IDS].sort(),["bone","leaf","track"],"Distinct bone/track/plant samples");
for(const sample of SPECIMENS){
  assert.equal(specimenById(sample.id),sample);
  assert.equal(sample.choices.length,3,"Each sample has three different evidence interpretations");
  assert.equal(new Set(sample.choices).size,3);
  assert.ok(Number.isInteger(sample.answer)&&sample.answer>=0&&sample.answer<3);
  assert.ok(sample.question.length>25&&sample.explanation.length>70&&sample.evidence.length>65);
  assert.ok(sample.observation.length>35);
}
assert.ok(SPECIMENS.find(s=>s.id==="track").explanation.includes("trace fossil"),"Footprints are trace fossils");
assert.ok(SPECIMENS.find(s=>s.id==="bone").explanation.includes("body fossil"),"Bone is fossil evidence of anatomy");
assert.ok(SPECIMENS.find(s=>s.id==="leaf").evidence.includes("cannot"),"Evidence avoids unsupported claims");
for(const id of ["fossilCanvas","brushLayer","brushProgress","labChoices","labExplanation","labFeedback","fossilCards","fossilBadge","fossilsFound","labProgress","saveNote"]){
  assert.ok(html.includes('id="'+id+'"'),"Fossil lab has accessible "+id);
}
for(const str of ['data-specimen="bone"','data-specimen="track"','data-specimen="leaf"','href="explore.html"','href="index.html"']){
  assert.ok(html.includes(str),"Lab navigation has "+str);
}
assert.ok(game.includes('href="fossil-lab.html"'),"80-mission hub links to optional fossil lab");
assert.ok(trail.includes('href="fossil-lab.html"'),"Walking trails link to optional lab");
assert.ok(trailLogic.includes('station.id==="fossil-bluff"'),"Fossil Bluff station points to the lab");
assert.ok(logic.includes("larriverse.dinoFossilLab.v1"),"Lab uses its own save");
assert.ok(!logic.includes("larriverse.dinoDiscovery.v1")&&!logic.includes("larriverse.dinoExplorer.v1"),"Lab cannot write old game save keys");
assert.ok(logic.includes("localStorage.setItem(KEY"),"Lab progress is saved independently");
assert.ok(logic.includes("new Set"),"Restored solved records are de-duplicated");
assert.ok(renderer.includes("project(p)")&&renderer.includes("cuboid(")&&renderer.includes("pointermove")&&renderer.includes("canvas.addEventListener(\"keydown\""),"Training fossils are original, interactive 3D meshes");
assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|geolocation|watchPosition|sendBeacon/i.test(logic+renderer),"Lab does not use network or location APIs");
assert.ok(html.includes("arcade-accessibility.css")&&html.includes("cabinet-shell.js"),"Shared accessibility and cabinet shell are present");
assert.ok(css.includes("html.larriverse-dark")&&css.includes("html.larriverse-high-contrast")&&css.includes("@media(max-width:690px)"),"Lab supports dark, high contrast and narrow devices");
for(const file of ["fossil-lab-data.js","fossil-lab-3d.js","fossil-lab.js"]){
 const result=spawnSync(process.execPath,["--check",root+file],{encoding:"utf8"});
 assert.equal(result.status,0,file+" syntax is valid: "+result.stderr);
}
assert.ok(fs.readFileSync(root+"game.js","utf8").includes("larriverse.dinoDiscovery.v1"),"Original 80-mission save key survives");
const catalog=JSON.parse(fs.readFileSync("games/catalog.json","utf8"));
const release=JSON.parse(fs.readFileSync("release.json","utf8"));
assert.equal(catalog.length,release.cabinetCount,"No changes to arcade cabinet totals");
console.log("3D Fossil Lab validated: 3 evidence-led specimens, brushing, save isolation, mobile and accessibility contracts.");
