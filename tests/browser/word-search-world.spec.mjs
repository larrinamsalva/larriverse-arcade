import {test,expect} from "@playwright/test";
import {WORD_SEARCH_LEVELS,createWordSearch,lineCells,matchWord} from "../../games/word-search-world/puzzles.js";
async function choose(page,placement){
 const first=placement.cells[0],last=placement.cells.at(-1);
 await page.locator('[data-cell="'+first+'"]').click();
 await page.locator('[data-cell="'+last+'"]').click();
}
async function unlock(page,index){
 await page.goto("/games/word-search-world/");
 const stars=Array(60).fill(0);for(let i=0;i<index;i++)stars[i]=1;
 await page.evaluate(item=>localStorage.setItem("larriverse.wordSearchWorld.v1",JSON.stringify(item)),
 {open:index,unlocked:index,stars,current:null});
 await page.reload();
 await expect(page.locator("#levelCount")).toHaveText((index+1)+" / 60");
}
async function finish(page,index){
 const puzzle=createWordSearch(WORD_SEARCH_LEVELS[index]);
 for(const placement of puzzle.placements)await choose(page,placement);
 await expect(page.locator("#celebration")).toBeVisible();
}
test("Word Search: sixty progressive grids all contain every listed word",()=>{
 expect(WORD_SEARCH_LEVELS).toHaveLength(60);
 for(const level of WORD_SEARCH_LEVELS){
  const p=createWordSearch(level);
  expect(p.placements).toHaveLength(level.words.length);
  for(const place of p.placements){
   expect(p.letters.split("").filter(Boolean)).toHaveLength(level.size**2);
   expect(place.cells.map(i=>p.letters[i]).join("")).toBe(place.word);
   expect(lineCells(place.cells[0],place.cells.at(-1),level.size)).toEqual(place.cells);
   expect(matchWord(place,[...place.cells].reverse())).toBe(true);
  }
 }
});
test("Word Search: tap, keyboard, free hint, word colors and saved progress",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/games/word-search-world/");
 await expect(page.locator(".letter")).toHaveCount(36);
 await expect(page.locator(".chapter")).toHaveCount(6);
 await expect(page.locator("#levelPicker option")).toHaveCount(1);
 const puzzle=createWordSearch(WORD_SEARCH_LEVELS[0]);
 const first=puzzle.placements[0],second=puzzle.placements[1];
 await choose(page,first);
 await expect(page.locator('[data-word="'+first.word+'"]')).toHaveClass(/found/);
 await page.locator("#hintButton").click();
 await expect(page.locator("#hintCount")).toHaveText("1");
 await expect(page.locator(".letter.hinted")).toHaveCount(1);
 await page.locator('[data-cell="'+second.cells[0]+'"]').focus();
 await page.keyboard.press("Enter");
 await page.locator('[data-cell="'+second.cells.at(-1)+'"]').focus();
 await page.keyboard.press("Enter");
 await expect(page.locator('[data-word="'+second.word+'"]')).toHaveClass(/found/);
 await page.reload();
 await expect(page.locator("#foundCount")).toHaveText("2 / "+puzzle.placements.length);
 await expect(page.locator("#hintCount")).toHaveText("1");
 for(const place of puzzle.placements.slice(2))await choose(page,place);
 await expect(page.locator("#celebration")).toBeVisible();
 await expect(page.locator("#nextLevel")).toHaveText(/Next Level 2/);
 await page.locator("#nextLevel").click();
 await expect(page.locator("#levelCount")).toHaveText("2 / 60");
 await page.reload();
 await expect(page.locator("#levelCount")).toHaveText("2 / 60");
 expect(errors).toEqual([]);
});
test("Word Search: finger-style pointer drag selects a hidden word",async({page})=>{
 await page.goto("/games/word-search-world/");
 const place=createWordSearch(WORD_SEARCH_LEVELS[0]).placements[0];
 const first=await page.locator('[data-cell="'+place.cells[0]+'"]').boundingBox();
 const last=await page.locator('[data-cell="'+place.cells.at(-1)+'"]').boundingBox();
 const x1=first.x+first.width/2,y1=first.y+first.height/2,x2=last.x+last.width/2,y2=last.y+last.height/2;
 await page.mouse.move(x1,y1);
 await page.mouse.down();
 await page.mouse.move(x2,y2,{steps:8});
 await page.mouse.up();
 await expect(page.locator('[data-word="'+place.word+'"]')).toHaveClass(/found/);
});
test("Word Search: harder chapters unlock and final level is winnable",async({page})=>{
 test.setTimeout(120000);
 await unlock(page,19);
 await expect(page.locator(".letter")).toHaveCount(49);
 await finish(page,19);
 await page.locator("#nextLevel").click();
 await expect(page.locator("#levelCount")).toHaveText("21 / 60");
 await expect(page.locator(".letter")).toHaveCount(64);
 await unlock(page,39);
 await finish(page,39);
 await page.locator("#nextLevel").click();
 await expect(page.locator("#levelCount")).toHaveText("41 / 60");
 await expect(page.locator(".letter")).toHaveCount(100);
 await unlock(page,59);
 await expect(page.locator(".letter")).toHaveCount(144);
 await finish(page,59);
 await expect(page.locator("#winTitle")).toContainText("All 60 Word Searches Complete");
 await expect(page.locator("#nextLevel")).toHaveText("Replay final puzzle");
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.wordSearchWorld.v1")));
 expect(saved.stars.filter(Boolean)).toHaveLength(60);
 const dims=await page.evaluate(()=>({w:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
 expect(dims.w).toBeLessThanOrEqual(dims.viewport+4);
});
