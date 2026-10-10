import {test,expect} from "@playwright/test";
import {CROSSWORD_LEVELS,buildCrossword} from "../../games/crossword-world/puzzles.js";
async function seed(page,index){
 await page.goto("/games/crossword-world/");
 const stars=Array(60).fill(0);for(let j=0;j<index;j++)stars[j]=1;
 await page.evaluate(data=>localStorage.setItem("larriverse.crosswordWorld.v1",JSON.stringify(data)),{
  open:index,unlocked:index,stars,current:null});
 await page.reload();await expect(page.locator("#levelCount")).toHaveText((index+1)+" / 60");
}
async function solve(page,index){
 const p=buildCrossword(CROSSWORD_LEVELS[index]);
 const cells=p.solution.map((letter,i)=>({letter,i})).filter(({letter})=>letter);
 for(const {letter,i} of cells){
  await page.locator('[data-cell="'+i+'"]').click();
  await page.keyboard.press(letter);
 }
 await expect(page.locator("#celebration")).toBeVisible();
}
test("Crossword World: sixty levels with valid real Across/Down intersections",()=>{
 expect(CROSSWORD_LEVELS).toHaveLength(60);
 for(const level of CROSSWORD_LEVELS){
  const p=buildCrossword(level);
  expect(p.entries).toHaveLength(level.bars+1);
  expect(p.entries.filter(x=>x.direction==="across")).toHaveLength(level.bars);
  expect(p.entries.filter(x=>x.direction==="down")).toHaveLength(1);
  const spine=new Set(p.entries.find(x=>x.direction==="down").cells);
  for(const entry of p.entries.filter(x=>x.direction==="across")){
   expect(entry.cells.filter(i=>spine.has(i))).toHaveLength(1);
   expect(entry.cells.map(i=>p.solution[i]).join("")).toBe(entry.answer);
  }
 }
});
test("Crossword World: beginner letter entry, checking, free hints and local resume",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/games/crossword-world/");
 await expect(page.locator(".chapter")).toHaveCount(6);
 await expect(page.locator(".clue")).toHaveCount(4);
 await expect(page.locator("#levelPicker option")).toHaveCount(1);
 await expect(page.locator("#keyboard button")).toHaveCount(26);
 const p=buildCrossword(CROSSWORD_LEVELS[0]);
 const cell=p.entries[0].cells[0],letter=p.solution[cell];
 await page.locator('[data-cell="'+cell+'"]').click();
 await page.locator('[data-key="'+letter+'"]').click();
 await expect(page.locator('[data-cell="'+cell+'"]')).toContainText(letter);
 await page.locator("#hint").click();
 await expect(page.locator("#hintsCount")).toHaveText("1");
 await page.locator("#checkBoard").click();
 await expect(page.locator("#feedback")).toContainText("Good work");
 await page.reload();
 await expect(page.locator("#levelCount")).toHaveText("1 / 60");
 await expect(page.locator("#hintsCount")).toHaveText("1");
 await expect(page.locator('[data-cell="'+cell+'"]')).toContainText(letter);
 await solve(page,0);
 await expect(page.locator("#nextLevel")).toHaveText(/Next Level 2/);
 await page.locator("#nextLevel").click();
 await expect(page.locator("#levelCount")).toHaveText("2 / 60");
 await expect(page.locator("#levelPicker option")).toHaveCount(2);
 await page.reload();
 await expect(page.locator("#levelCount")).toHaveText("2 / 60");
 const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.crosswordWorld.v1")));
 expect(progress.stars[0]).toBeGreaterThan(0);
 expect(errors).toEqual([]);
});
test("Crossword World: later chapters unlock without skipping or trapping players",async({page})=>{
 test.setTimeout(140000);
 await seed(page,19);
 await solve(page,19);
 await page.locator("#nextLevel").click();
 await expect(page.locator("#levelCount")).toHaveText("21 / 60");
 await expect(page.locator("#puzzleTitle")).toContainText("Kindness Club");
 await seed(page,39);
 await solve(page,39);
 await page.locator("#nextLevel").click();
 await expect(page.locator("#levelCount")).toHaveText("41 / 60");
 await expect(page.locator("#puzzleTitle")).toContainText("Money Masters");
});
test("Crossword World: final crossword awards all sixty and is readable on phones",async({page})=>{
 test.setTimeout(130000);
 await seed(page,59);
 await expect(page.locator("#stage")).toContainText("LEVEL 60 OF 60");
 await solve(page,59);
 await expect(page.locator("#winTitle")).toContainText("All 60 crosswords complete");
 await expect(page.locator("#nextLevel")).toHaveText("Replay final crossword");
 const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.crosswordWorld.v1")));
 expect(progress.stars.filter(Boolean)).toHaveLength(60);
 const size=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
 expect(size.document).toBeLessThanOrEqual(size.viewport+4);
});
