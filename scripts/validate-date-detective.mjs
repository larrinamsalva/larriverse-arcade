import assert from "node:assert/strict";
import fs from "node:fs";
import { DATE_DETECTIVE_CHAPTERS, DATE_DETECTIVE_CHALLENGES } from "../games/date-detective/challenges.js";

assert.equal(DATE_DETECTIVE_CHAPTERS.length,8,"Date Detective has eight chapters");
assert.equal(DATE_DETECTIVE_CHALLENGES.length,80,"Date Detective has eighty challenges");
assert.equal(new Set(DATE_DETECTIVE_CHALLENGES.map(x=>x.id)).size,80,"Date Detective ids are unique");
assert.equal(new Set(DATE_DETECTIVE_CHALLENGES.map(x=>x.packageName+"|"+x.label+"|"+x.prompt)).size,80,"Date Detective cases are unique");

for(const [index,item] of DATE_DETECTIVE_CHALLENGES.entries()){
  assert.equal(item.id,index+1);
  assert.equal(item.chapter,Math.floor(index/10));
  assert.equal(item.options.length,3);
  assert.ok(Number.isInteger(item.answer)&&item.answer>=0&&item.answer<3);
  assert.ok(item.prompt.length>=20);
  assert.ok(item.tip.length>=25);
  assert.ok(item.label.length>=8);
  assert.ok(item.packageName.length>=4);
  assert.ok(item.options.every(o=>o.text.length>=12&&o.why.length>=18));
}
for(let chapter=0;chapter<8;chapter++){
  assert.equal(DATE_DETECTIVE_CHALLENGES.filter(x=>x.chapter===chapter).length,10,"Each Date Detective chapter has ten cases");
}

const html=fs.readFileSync("games/date-detective/index.html","utf8");
const js=fs.readFileSync("games/date-detective/game.js","utf8");
const css=fs.readFileSync("games/date-detective/game.css","utf8");

for(const id of ["dateQuestion","answerChoices","hintButton","clearChoiceButton","nextButton","levelSelect","chapterTrack","feedbackBanner","dateLabel"]){
  assert.ok(html.includes('id="'+id+'"'),"Date Detective exposes "+id);
}
for(const phrase of ["80 levels","Most packaged-food dates","Infant formula","manufacturer lot codes"]){
  assert.ok(html.includes(phrase),"Date Detective keeps key learning copy: "+phrase);
}
for(const feature of ["localStorage","LarriVerseArcade?.award","Not quite","state.unlocked","DATE_DETECTIVE_CHALLENGES"]){
  assert.ok(js.includes(feature),"Date Detective engine includes "+feature);
}
assert.ok(css.includes("html.larriverse-dark"));
assert.ok(css.includes("html.larriverse-high-contrast"));
assert.ok(css.includes("@media(max-width:720px)"));

const catalog=JSON.parse(fs.readFileSync("games/catalog.json","utf8"));
const release=JSON.parse(fs.readFileSync("release.json","utf8"));
const row=catalog.find(x=>x.id==="date-detective");
assert.ok(row?.available&&row.featured&&row.integration==="arcade-sdk-v3");
assert.match(row.mission,/80/i);
assert.ok(release.cabinets.some(x=>x.id==="date-detective"));
assert.equal(release.cabinetCount,catalog.length);
assert.equal(release.galleryReview.expectedImages,(catalog.length+1)*2);

const formula=DATE_DETECTIVE_CHALLENGES.filter(x=>/Infant Formula/.test(x.packageName));
assert.ok(formula.length>=5,"Formula exception is practiced repeatedly");
assert.ok(DATE_DETECTIVE_CHALLENGES.some(x=>/lot code/i.test(x.tip)),"Unknown lot-code rule is taught");
assert.ok(DATE_DETECTIVE_CHALLENGES.some(x=>/quality/i.test(x.tip)),"Quality-vs-safety distinction is taught");

console.log("Date Detective validation passed: 80 cases, 8 chapters, package-date reading, quality labels, formula exception, opening-date math, and manufacturer-keyed codes.");
