import assert from "node:assert/strict";
import fs from "node:fs";
import {WORD_SEARCH_LEVELS,WORD_SEARCH_CHAPTERS,createWordSearch,lineCells,matchWord} from "../games/word-search-world/puzzles.js";
assert.equal(WORD_SEARCH_LEVELS.length,60);
assert.equal(WORD_SEARCH_CHAPTERS.length,6);
const seenSets=new Set(),seenGrids=new Set();
for(const [i,level] of WORD_SEARCH_LEVELS.entries()){
 const expectedSize=[6,7,8,9,10,12][Math.floor(i/10)];
 assert.equal(level.id,i+1);
 assert.equal(level.chapter,Math.floor(i/10));
 assert.equal(level.size,expectedSize);
 assert.ok(level.fact.length>20);
 assert.equal(new Set(level.words).size,level.words.length);
 assert.ok(level.words.length>=3&&level.words.length<=8);
 assert.ok(level.words.every(word=>/^[A-Z]{2,12}$/.test(word)&&word.length<=level.size));
 assert.ok(level.directions.length>=2);
 if(i%10>=4)assert.ok(level.words.length>=WORD_SEARCH_LEVELS[i-4].words.length);
 const signature=level.words.join(",");
 assert.ok(!seenSets.has(signature),"Each challenge must have its own word list");
 seenSets.add(signature);
 const puzzle=createWordSearch(level),again=createWordSearch(level);
 assert.deepEqual(puzzle,again,"Puzzles must be stable across reloads");
 assert.equal(puzzle.size,level.size);
 assert.match(puzzle.letters,new RegExp(`^[A-Z]{${expectedSize*expectedSize}}$`));
 assert.equal(puzzle.placements.length,level.words.length);
 assert.equal(new Set(puzzle.placements.map(x=>x.word)).size,level.words.length);
 assert.ok(!seenGrids.has(puzzle.letters),"Each puzzle grid must be distinct");seenGrids.add(puzzle.letters);
 for(const p of puzzle.placements){
  assert.ok(level.words.includes(p.word));
  assert.ok(level.directions.includes(p.direction));
  assert.equal(p.cells.length,p.word.length);
  assert.equal(new Set(p.cells).size,p.word.length);
  assert.equal(p.cells.map(index=>puzzle.letters[index]).join(""),p.word);
  assert.deepEqual(lineCells(p.cells[0],p.cells.at(-1),level.size),p.cells);
  assert.ok(matchWord(p,p.cells));
  assert.ok(matchWord(p,[...p.cells].reverse()));
  assert.equal(matchWord(p,[p.cells[0]]),false);
 }
}
const catalog=JSON.parse(fs.readFileSync("games/catalog.json","utf8"));
const release=JSON.parse(fs.readFileSync("release.json","utf8"));
assert.ok(catalog.some(x=>x.id==="word-search-world"&&x.available));
assert.ok(release.cabinets.some(x=>x.id==="word-search-world"));
assert.equal(release.cabinetCount,34);
assert.equal(release.galleryReview.expectedImages,70);
const html=fs.readFileSync("games/word-search-world/index.html","utf8");
const engine=fs.readFileSync("games/word-search-world/game.js","utf8");
for(const id of ["wordGrid","wordList","levelPicker","hintButton","clearSelection","restartLevel",
 "nextLevel","celebration","gameFeedback","chapterTrack","levelProgress"])
 assert.ok(html.includes(`id="${id}"`));
for(const feature of ["pointerdown","pointermove","pointerup","pointercancel",
 "ArrowRight","ArrowDown","Enter","matchWord","lineCells","localStorage","finishWord","startLevel"])
 assert.ok(engine.includes(feature),"Missing gameplay feature: "+feature);
console.log("Word Search World validated: 60 individually authored deterministic solvable grids, six increasingly difficult chapters and all game controls.");
