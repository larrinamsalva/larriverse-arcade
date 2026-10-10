import { test, expect } from "@playwright/test";
import { SUDOKU_LEVELS, countSudokuSolutions } from "../../games/kids-sudoku/puzzles.js";

async function seedLevel(page, stage) {
  const stars=Array(60).fill(0);
  for(let i=0;i<stage;i++)stars[i]=1;
  await page.goto("/games/kids-sudoku/");
  await page.evaluate(record=>localStorage.setItem("larriverse.kidsSudoku.v1",JSON.stringify(record)),
    { openLevel:stage,unlocked:stage,stars,current:null,picture:false });
  await page.reload();
  await expect(page.locator("#levelCounter")).toHaveText((stage+1)+" / 60");
}
async function solve(page,levelIndex) {
  const level=SUDOKU_LEVELS[levelIndex];
  const blanks=level.puzzle.split("").map((s,i)=>s==="0"?i:-1).filter(i=>i>=0);
  for(const i of blanks) {
    await page.locator('[data-cell="'+i+'"]').click();
    await page.locator('[data-value="'+level.solution[i]+'"]').click();
  }
  await expect(page.locator("#celebration")).toBeVisible();
}
test("Kids Sudoku: sixty puzzle solutions are unique and obey grid rules",()=>{
  expect(SUDOKU_LEVELS).toHaveLength(60);
  expect(SUDOKU_LEVELS.slice(0,20).every(l=>l.size===4)).toBe(true);
  expect(SUDOKU_LEVELS.slice(20,40).every(l=>l.size===6)).toBe(true);
  expect(SUDOKU_LEVELS.slice(40).every(l=>l.size===9)).toBe(true);
  expect(new Set(SUDOKU_LEVELS.map(x=>x.puzzle)).size).toBe(60);
  for(const level of SUDOKU_LEVELS)expect(countSudokuSolutions(level.puzzle,level)).toBe(1);
});
test("Kids Sudoku: accessible mini puzzle, notes, pictures, hints, mistakes and save",async({page})=>{
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/games/kids-sudoku/");
  await expect(page.locator(".sudoku-cell")).toHaveCount(16);
  await expect(page.locator(".chapter-tile")).toHaveCount(6);
  await expect(page.locator("#levelSelect option")).toHaveCount(1);
  await page.locator("#pictureMode").click();
  await expect(page.locator("#pictureMode")).toHaveAttribute("aria-pressed","true");
  const blank=SUDOKU_LEVELS[0].puzzle.indexOf("0");
  await page.locator('[data-cell="'+blank+'"]').click();
  await page.locator("#noteMode").click();
  await page.locator('[data-value="2"]').click();
  await expect(page.locator('[data-cell="'+blank+'"] .notes')).toBeVisible();
  await page.locator("#noteMode").click();
  await page.locator('[data-value="2"]').click();
  await expect(page.locator('[data-cell="'+blank+'"] .notes')).toHaveCount(0);
  await page.locator("#undoButton").click();
  await expect(page.locator('[data-cell="'+blank+'"] .notes')).toBeVisible();
  await page.locator("#hintButton").click();
  await expect(page.locator("#hintCounter")).toHaveText("1");
  await page.reload();
  await expect(page.locator("#levelCounter")).toHaveText("1 / 60");
  await expect(page.locator("#hintCounter")).toHaveText("1");
  await expect(page.locator('[data-cell="'+blank+'"]')).toContainText(/[🐱🦊🐸🐼]/u);
  // Continue after reloading the saved first-level board.
  for(const [i,value] of [...SUDOKU_LEVELS[0].solution].entries()) {
    if(SUDOKU_LEVELS[0].puzzle[i]!=="0"||i===blank)continue;
    await page.locator('[data-cell="'+i+'"]').click();
    await page.locator('[data-value="'+value+'"]').click();
  }
  await expect(page.locator("#celebration")).toBeVisible();
  await expect(page.locator("#nextLevel")).toHaveText(/Next Level 2/);
  await page.locator("#nextLevel").click();
  await expect(page.locator("#levelCounter")).toHaveText("2 / 60");
  await expect(page.locator("#levelSelect option")).toHaveCount(2);
  await page.reload();
  await expect(page.locator("#levelCounter")).toHaveText("2 / 60");
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.kidsSudoku.v1")));
  expect(saved.stars[0]).toBeGreaterThan(0);
  expect(saved.unlocked).toBe(1);
  expect(errors).toEqual([]);
});
test("Kids Sudoku: solving level 20 transitions to 6×6 level 21",async({page})=>{
  await seedLevel(page,19);
  await expect(page.locator(".sudoku-cell")).toHaveCount(16);
  await solve(page,19);
  await page.locator("#nextLevel").click();
  await expect(page.locator("#levelCounter")).toHaveText("21 / 60");
  await expect(page.locator(".sudoku-cell")).toHaveCount(36);
  await expect(page.locator("#puzzleName")).toContainText("Growing Grids");
  await expect(page.locator("#pictureMode")).toBeDisabled();
});
test("Kids Sudoku: solving level 40 transitions to 9×9 level 41",async({page})=>{
  await seedLevel(page,39);
  await expect(page.locator(".sudoku-cell")).toHaveCount(36);
  await solve(page,39);
  await page.locator("#nextLevel").click();
  await expect(page.locator("#levelCounter")).toHaveText("41 / 60");
  await expect(page.locator(".sudoku-cell")).toHaveCount(81);
  await expect(page.locator("#puzzleName")).toContainText("Sudoku Explorers");
  const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  expect(size.scroll).toBeLessThanOrEqual(size.width+4);
});
test("Kids Sudoku: last stage completes all 60 without getting stuck",async({page})=>{
  test.setTimeout(90000);
  await seedLevel(page,59);
  await expect(page.locator(".sudoku-cell")).toHaveCount(81);
  await solve(page,59);
  await expect(page.locator("#winTitle")).toContainText("All 60 levels complete");
  await expect(page.locator("#nextLevel")).toHaveText("Replay the Sudoku Summit");
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.kidsSudoku.v1")));
  expect(saved.stars.filter(Boolean)).toHaveLength(60);
  expect(saved.unlocked).toBe(59);
});
