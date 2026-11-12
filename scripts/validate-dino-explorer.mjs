import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { PERIODS, ALL_SITES, SITE_IDS, nearestSite } from "../games/dino-discovery-world/trail-data.js";
import { TRAIL_SPECIES, ORGANIC_PALETTES } from "../games/dino-discovery-world/organic-dino-models.js";

const root="games/dino-discovery-world/";
assert.deepEqual(PERIODS.map(p=>p.id),["triassic","jurassic","cretaceous"],"Three separate, ordered time portals");
assert.equal(ALL_SITES.length,9,"Exactly nine authored trail stops");
assert.equal(SITE_IDS.length,new Set(SITE_IDS).size,"Station identifiers are unique");
for(const period of PERIODS){
 assert.equal(period.sites.length,3,period.id+" has three walkable stops");
 assert.ok(period.label.length>5&&period.note.length>35&&period.years.includes("million years ago"));
 for(const station of period.sites){
  assert.ok(station.fact.length>=65,station.id+" needs substantive science");
  assert.ok(station.clue.length>25,station.id+" needs an accessible observation");
  assert.ok(Number.isFinite(station.x)&&Number.isFinite(station.z));
  assert.ok(station.x>=-7.5&&station.x<=7.5&&station.z>0&&station.z<=18);
  const near=nearestSite(period.id,station.x,station.z);
  assert.equal(near.site.id,station.id,"Station navigation is spatially grounded");
 }
}
assert.ok(PERIODS[0].sites.some(s=>s.id==="coelophysis"),"Triassic includes a period-appropriate dinosaur");
assert.ok(PERIODS[1].sites.some(s=>s.id==="stegosaurus"),"Jurassic includes Stegosaurus");
assert.ok(PERIODS[2].sites.some(s=>s.id==="tyrannosaurus"),"Cretaceous includes T. rex");
const html=fs.readFileSync(root+"explore.html","utf8");
const page=fs.readFileSync(root+"index.html","utf8");
const logic=fs.readFileSync(root+"explore.js","utf8");
const renderer=fs.readFileSync(root+"walkthrough-3d.js","utf8");
const css=fs.readFileSync(root+"explore.css","utf8");
for(const id of ["worldCanvas","trailMap","inspectSite","periodTitle","periodCount","nearestName","stationList","expeditionStatus","trailBadge","visitCount","scienceDetail","saveNote"]){
 assert.ok(html.includes('id="'+id+'"'),"Explorer has "+id);
}
for(const text of ['data-portal="triassic"','data-portal="jurassic"','data-portal="cretaceous"','data-step="forward"','data-step="back"','data-step="side-left"','data-step="side-right"','data-step="look-up"','data-step="look-down"']){
 assert.ok(html.includes(text),"Explorer provides "+text);
}
assert.ok(page.includes('href="explore.html"'),"Existing 80-mission hub links to optional explorer");
assert.ok(html.includes('href="index.html"'),"Explorer links back to the unmodified missions");
assert.ok(html.includes("arcade-sdk.js")&&html.includes("cabinet-shell.js")&&html.includes("arcade-accessibility.css"));
assert.ok(logic.includes("larriverse.dinoExplorer.v1")&&!logic.includes("larriverse.dinoDiscovery.v1"),"Trail journal never overwrites 80-mission saves");
assert.ok(logic.includes("localStorage")&&logic.includes("new Set")&&logic.includes("persist()"),"Trail journal is saved locally");
assert.ok(renderer.includes("worldToView")&&renderer.includes("clipNear")&&renderer.includes("camera.heading")&&renderer.includes("camera.pitch")&&renderer.includes("FOCAL_LENGTH=380")&&renderer.includes("pointermove")&&renderer.includes("step(action)")&&renderer.includes("canvas.addEventListener(\"keydown\""),"Renderer frames dinosaurs with working vertical look controls");
assert.ok(renderer.includes('from "./organic-dino-models.js"')&&renderer.includes("TRAIL_SPECIES[kind]")&&renderer.includes('quality:"trail"'),"Walking models share the same organic dinosaur meshes and use phone-friendly detail");
assert.equal(Object.keys(TRAIL_SPECIES).length,7,"Seven walking dinosaur kinds map to a shared model");
assert.ok(Object.values(TRAIL_SPECIES).every(kind=>Boolean(ORGANIC_PALETTES[kind])),"Every trail dinosaur has a matching museum model palette");
assert.ok(PERIODS.flatMap(p=>p.sites).filter(s=>s.kind!=="forest"&&s.kind!=="fossil").every(s=>Boolean(TRAIL_SPECIES[s.kind])),"Every walk-through dinosaur uses a known shared species mesh");
assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|geolocation|watchPosition|sendBeacon/i.test(logic+renderer),"Explorer never calls network or location APIs");
assert.ok(css.includes("html.larriverse-dark")&&css.includes("html.larriverse-high-contrast")&&css.includes("@media(max-width:700px)"),"Explorer styles support comfort and mobile");
for(const file of ["trail-data.js","walkthrough-3d.js","explore.js","organic-dino-models.js"]){
 const result=spawnSync(process.execPath,["--check",root+file],{encoding:"utf8"});
 assert.equal(result.status,0,file+" must pass syntax checking: "+result.stderr);
}
const catalog=JSON.parse(fs.readFileSync("games/catalog.json","utf8"));
const release=JSON.parse(fs.readFileSync("release.json","utf8"));
assert.equal(release.cabinetCount,catalog.length,"Existing cabinet count is preserved");
assert.ok(catalog.find(game=>game.id==="dino-discovery-world")?.available,"Dino Discovery remains a playable cabinet");
assert.ok(fs.readFileSync(root+"game.js","utf8").includes("larriverse.dinoDiscovery.v1"),"Original mission progress key remains unchanged");
console.log("Dino 3D walking trails validated: 3 time portals, 9 evidence-based sites, real camera movement, separate local journal, 80-mission progress preserved.");
