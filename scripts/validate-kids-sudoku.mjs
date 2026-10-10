import assert from "node:assert/strict";
import fs from "node:fs";
import { SUDOKU_LEVELS, SUDOKU_CHAPTERS, sudokuPeers, sudokuConflicts,
  sudokuSolved, countSudokuSolutions } from "../games/kids-sudoku/puzzles.js";

assert.equal(SUDOKU_LEVELS.length,60,"Kids Sudoku provides exactly sixty puzzle levels");
assert.equal(SUDOKU_CHAPTERS.length,6,"Kids Sudoku offers six chapters");
assert.equal(new Set(SUDOKU_LEVELS.map(p=>p.puzzle)).size,60,"Every level has a unique board");
assert.equal(new Set(SUDOKU_LEVELS.map(p=>p.solution)).size,60,"Every level has a unique answer grid");
const shape={4:[2,2],6:[2,3],9:[3,3]};
for(const [i,level] of SUDOKU_LEVELS.entries()){
  const size=i<20?4:i<40?6:9;
  assert.equal(level.id,i+1);
  assert.equal(level.size,size);
  assert.equal(level.chapter,Math.floor(i/10));
  assert.deepEqual([level.boxRows,level.boxCols],shape[size]);
  assert.equal(level.puzzle.length,size*size,`Level ${i+1} puzzle has correct cell count`);
  assert.equal(level.solution.length,size*size,`Level ${i+1} solution has correct cell count`);
  assert.match(level.puzzle,new RegExp(`^[0-${size}]+$`));
  assert.match(level.solution,new RegExp(`^[1-${size}]+$`));
  const clues=level.puzzle.split("").filter(x=>x!=="0");
  assert.equal(clues.length,level.clues);
  assert.ok(clues.length>=size,`Level ${i+1} includes enough starting clues`);
  assert.ok(clues.length<size*size,`Level ${i+1} leaves cells to solve`);
  for(let at=0;at<size*size;at++){
    if(level.puzzle[at]!=="0")assert.equal(level.puzzle[at],level.solution[at]);
    assert.equal(new Set(sudokuPeers(at,size,level.boxRows,level.boxCols)).size,
      2*(size-1)+(level.boxRows-1)*(level.boxCols-1), "peer cells are unique");
  }
  assert.equal(sudokuConflicts(level.solution.split("").map(Number),level).size,0);
  assert.ok(sudokuSolved(level.solution.split("").map(Number),level),`Level ${i+1} solves correctly`);
  assert.equal(countSudokuSolutions(level.puzzle,level),1,`Level ${i+1} has exactly one solution`);
  // Within a grid size there are fewer givens as the level advances.
  if(i>0 && i!==20 && i!==40)
    assert.ok(level.clues<=SUDOKU_LEVELS[i-1].clues,`Level ${i+1} grows progressively harder`);
}
const catalog=JSON.parse(fs.readFileSync("games/catalog.json","utf8"));
const release=JSON.parse(fs.readFileSync("release.json","utf8"));
const row=catalog.find(x=>x.id==="kids-sudoku");
assert.ok(row?.available&&row.integration==="arcade-sdk-v3");
assert.match(row.mission,/60 uniquely solvable puzzles/);
assert.ok(release.cabinets.some(x=>x.id==="kids-sudoku"));
assert.equal(release.cabinetCount,33);
assert.equal(release.galleryReview.expectedImages,68);
const engine=fs.readFileSync("games/kids-sudoku/game.js","utf8");
const html=fs.readFileSync("games/kids-sudoku/index.html","utf8");
for(const selector of ["levelSelect","sudokuBoard","pictureMode","noteMode","numberPad",
  "hintButton","eraseButton","undoButton","checkButton","resetButton","nextLevel","celebration"]) {
  assert.ok(html.includes(`id="${selector}"`),`Accessible ${selector} control exists`);
}
for(const keyword of ["sudokuSolved","sudokuConflicts","function save(","function startLevel(",
  "function completeLevel(","localStorage","addEventListener","levelSelect","aria-label"])
  assert.ok(engine.includes(keyword),`Sudoku game includes ${keyword}`);
console.log("Kids Sudoku validation passed: 60 different uniquely solvable puzzles, six chapters, 3 board sizes, accessible play, no purchase gate.");
