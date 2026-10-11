import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { familyMissions, sweatMissions, lifeMissions } from "../assets/final-three-missions.js";
const root="games/";
const read=path=>JSON.parse(fs.readFileSync(path,"utf8"));
const baseFamily=read(root+"kidscoin-family/family.json");
const familyPack=read(root+"kidscoin-family/family-question-pack-2.json");
const approvedFamily=new Map(baseFamily.lessons.flatMap(l=>[...l.questions,...familyPack.questionsByLesson[l.id]].map(q=>[q.id,q])));
const reviewedWorlds=["reviewed-a.json","reviewed-b.json","reviewed-c.json"]
  .flatMap(file=>read(root+"brain-sweat-expanded/content/"+file));
const approvedSweat=new Map(reviewedWorlds.flatMap(w=>w.tiers
  .filter(t=>t.status==="reviewed")
  .flatMap(t=>(t.transactions||t.scenarios||[]).map(q=>[q.id,{q,w,t}]))));
const approvedLife=new Map(["cooking","health","law","home2","nature","mind"]
 .flatMap(file=>read(root+"brain-sweat-life-skills/content/"+file+".json").lessons
  .filter(l=>l.status==="reviewed").flatMap(l=>l.questions.map(q=>[l.id+"#"+q.sourceOrder,q]))));
for(const [id,kind,deck] of [
 ["kidscoin-family","family",familyMissions],
 ["brain-sweat-expanded","sweat",sweatMissions],
 ["brain-sweat-life-skills","life",lifeMissions]
]){
 assert.equal(deck.length,60,id+" contains sixty real missions");
 assert.equal(new Set(deck.map(m=>m.id)).size,60,id+" unique IDs");
 assert.equal(new Set(deck.map(m=>m.prompt)).size,60,id+" no repeated question text");
 assert.ok(new Set(deck.map(m=>m.chapter)).size>=4,id+" covers distinct subject chapters");
 for(const m of deck){
  assert.match(m.id,new RegExp("^"+kind+"-[0-9]{2}$"));
  assert.ok(m.prompt.length>15&&m.title.length>10&&m.why.length>=25,m.id+" clear copy");
  assert.ok(m.options.length>=3&&m.options.length<=4,m.id+" supported answer count");
  assert.equal(new Set(m.options).size,m.options.length,m.id+" distinct answers");
  assert.ok(Number.isInteger(m.answer)&&m.answer>=0&&m.answer<m.options.length,m.id+" correct index");
  assert.ok(m.guide.includes(kind==="family"?"Family KC":kind==="sweat"?"simulated classroom":"Review-queued"),m.id+" boundary");
  if(kind==="family"||kind==="life"){
   const original=(kind==="family"?approvedFamily:approvedLife).get(m.sourceId);
   assert.ok(original,m.id+" must use actual reviewed source question");
   assert.equal(m.prompt,original.prompt,m.id+" question must not have altered meaning");
   assert.equal(m.options[m.answer],original.options[original.answer],m.id+" answer must match reviewed source exactly");
  }else{
   const approved=approvedSweat.get(m.sourceId);
   assert.ok(approved,m.id+" uses an actual approved existing workshop activity");
   if(approved.w.mode==="choice"){
     const solution=approved.q.actions.find(a=>a.id===approved.q.correct);
     assert.equal(m.options[m.answer],solution.label,m.id+" matches reviewed original decision");
   }else if(approved.w.mode==="tool-sequence"){
     const map=new Map(approved.w.tools.map(t=>[t.id,t.name]));
     assert.equal(m.options[m.answer],approved.q.requiredTools.map(t=>map.get(t)).join(" → "),m.id+" matches reviewed original tools");
   }else if(approved.w.mode==="ledger"){
     let balance=approved.t.startBalance;
     for(const tx of approved.t.transactions){
      balance+=tx.type==="deposit"?tx.amount:-tx.amount;
      if(tx.id===m.sourceId)break;
     }
     assert.equal(m.options[m.answer],"$"+balance,m.id+" accurate arithmetic");
   }else throw new Error("Unknown workshop mode "+approved.w.mode);
  }
 }
 const html=fs.readFileSync(root+id+"/index.html","utf8");
 assert.ok(html.includes('data-adventure-mission="'+id+'"'),id+" mission entry");
 assert.ok(html.includes("classic-adventure-play.js")&&html.includes("classic-adventure-missions.css"),id+" accessible view");
}
assert.equal(familyMissions.length+lifeMissions.length+sweatMissions.length,180);
assert.ok(baseFamily.boundaries.parentControlled&&baseFamily.boundaries.cryptocurrency===false);
assert.ok(!fs.readFileSync("assets/classic-adventure-play.js","utf8").includes("navigator.geolocation"),"No location permissions");
for(const file of ["assets/final-three-missions.js","assets/classic-adventure-play.js","tests/browser/final-three-missions.spec.mjs"])
 execFileSync(process.execPath,["--check",file]);
console.log("All final three curricula pass: 180 distinct missions, source-verified answers, approved-only content, parent boundaries preserved.");
