import assert from "node:assert/strict";
import fs from "node:fs";
import {CROSSWORD_LEVELS,CROSSWORD_CHAPTERS,buildCrossword,matchingEntryCells,solvedCrossword} from "../games/crossword-world/puzzles.js";
assert.equal(CROSSWORD_LEVELS.length,60);
assert.equal(CROSSWORD_CHAPTERS.length,6);
assert.equal(new Set(CROSSWORD_LEVELS.map(level=>level.spine)).size,60,"Every puzzle starts with a different anchor word");
for(const [i,level] of CROSSWORD_LEVELS.entries()){
 assert.equal(level.id,i+1);
 assert.equal(level.chapter,Math.floor(i/10));
 assert.equal(level.bars,[3,4,4,5,5,6][level.chapter],"Crossword challenges grow in word count");
 assert.ok(level.spineClue.length>15,"Every anchor needs a real clue");
 const puzzle=buildCrossword(level);
 const again=buildCrossword(level);
 assert.deepEqual(puzzle,again,"Crossword shapes and answers must survive reloads");
 assert.equal(puzzle.entries.length,level.bars+1);
 assert.equal(puzzle.numbered.length,level.bars+1);
 assert.equal(puzzle.solution.length,puzzle.rows*puzzle.cols);
 assert.ok(puzzle.rows>=5 && puzzle.cols>=3);
 const across=puzzle.entries.filter(entry=>entry.direction==="across"),down=puzzle.entries.filter(entry=>entry.direction==="down");
 assert.equal(across.length,level.bars);
 assert.equal(down.length,1);
 assert.equal(new Set(puzzle.entries.map(entry=>entry.answer)).size,puzzle.entries.length);
 const crossing=down[0].cells;
 const crossUsed=new Set();
 for(const entry of puzzle.entries){
  assert.ok(entry.answer.length>=3);
  assert.ok(entry.clue.length>=12);
  assert.ok(entry.number>=1);
  assert.equal(entry.cells.length,entry.answer.length);
  assert.equal(new Set(entry.cells).size,entry.cells.length);
  assert.equal(entry.cells.map(cell=>puzzle.solution[cell]).join(""),entry.answer);
  const filled=Array(puzzle.solution.length).fill("");
  entry.cells.forEach((cell,k)=>{filled[cell]=entry.answer[k];});
  assert.ok(matchingEntryCells(filled,entry));
  if(entry.direction==="across"){
   const shared=entry.cells.filter(x=>crossing.includes(x));
   assert.equal(shared.length,1,"Every Across word genuinely crosses the Down anchor");
   assert.ok(!crossUsed.has(shared[0]),"Crossings are on separate rows");crossUsed.add(shared[0]);
  }
 }
 assert.ok(solvedCrossword(puzzle.solution,puzzle));
 const modified=[...puzzle.solution];modified[puzzle.entries[0].cells[0]]="Z"===modified[puzzle.entries[0].cells[0]]?"A":"Z";
 assert.equal(solvedCrossword(modified,puzzle),false);
}
const catalog=JSON.parse(fs.readFileSync("games/catalog.json","utf8"));
const release=JSON.parse(fs.readFileSync("release.json","utf8"));
assert.ok(catalog.some(x=>x.id==="crossword-world"&&x.available));
assert.ok(release.cabinets.some(x=>x.id==="crossword-world"));
assert.equal(release.cabinetCount,catalog.length);
assert.equal(release.galleryReview.expectedImages,(catalog.length+1)*2);
const html=fs.readFileSync("games/crossword-world/index.html","utf8");
const engine=fs.readFileSync("games/crossword-world/game.js","utf8");
for(const id of ["crosswordGrid","acrossClues","downClues","keyboard","hint","checkWord","checkBoard",
 "erase","restart","levelPicker","celebration","nextLevel","progress"])
 assert.ok(html.includes(`id="${id}"`),"Missing crossword control "+id);
for(const feature of ["typeLetter","matchingEntryCells","solvedCrossword","function save(","checkWord",
 "checkBoard","localStorage","addEventListener","setStats","startLevel","finishIfSolved"])
 assert.ok(engine.includes(feature));
console.log("Crossword World validated: sixty real intersecting, deterministic, clue-led crosswords; all six growing chapters are solvable.");
