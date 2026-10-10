import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Test-only instrumentation is added to the served JS response. The production
// game never exposes a shortcut to skip a stage: these tests exercise place(),
// bubble removal, actual level-clear state, and normal timer/button navigation.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const gameCode = fs.readFileSync(path.join(root, "games/bubble-resonance-phi369/game.js"), "utf8");
const testHooks = `
window.__bubbleQA = {
  prime(stage=10, power=null) {
    cancelLevelAdvance();
    level=stage;gameOver=false;won=false;levelCleared=false;awarded=false;
    shot=null;dropAnimation=null;misses=0;combo=1;
    particles=[];powerEffects=[];
    grid=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    for(const c of [7,8]) grid[0][c]={freq:0,gem:false,...pos(c,0)};
    current={freq:0,gem:false,power};next={freq:0,gem:false,power:null};
    setLevelAction();document.querySelector('#message').classList.remove('show');
    hud();return {level,remaining:grid.flat().filter(Boolean).length};
  },
  clear() {const cell=pos(9,0);return place(cell.x,cell.y)},
  state() {return {level,levelCleared,gameOver,won,remaining:grid.flat().filter(Boolean).length}},
};
`;

async function startGame(page) {
  await page.route("**/games/bubble-resonance-phi369/game.js",route=>
    route.fulfill({status:200,contentType:"text/javascript",body:gameCode+"\n"+testHooks}));
  await page.goto("/games/bubble-resonance-phi369/");
  await expect(page.locator("#level")).toHaveText("1 / 20");
  await expect(page.locator("#game")).toBeVisible();
}

test("Bubble Shooter: clearing level 10 automatically advances to level 11",async({page})=>{
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  await startGame(page);
  const setup=await page.evaluate(()=>window.__bubbleQA.prime(10));
  expect(setup).toEqual({level:10,remaining:2});
  await page.evaluate(()=>window.__bubbleQA.clear());
  await expect(page.locator("#message")).toContainText("LEVEL 10 CLEAR");
  await expect(page.locator("#levelAction")).toBeVisible();
  await expect(page.locator("#bubbleStatus")).toContainText("Level 11");
  await expect(page.locator("#level")).toHaveText("11 / 20",{timeout:7000});
  await expect(page.locator("#levelName")).toHaveText("Prism Path");
  await expect(page.locator("#game")).toHaveAttribute("aria-busy","false");
  expect(await page.evaluate(()=>window.__bubbleQA.state())).toEqual(expect.objectContaining({
    level:11,levelCleared:false,gameOver:false
  }));
  expect(errors).toEqual([]);
});

test("Bubble Shooter: manual Next advances once and cancels the automatic timer",async({page})=>{
  await startGame(page);
  await page.evaluate(()=>window.__bubbleQA.prime(10));
  await page.evaluate(()=>window.__bubbleQA.clear());
  await page.locator("#levelAction").click();
  await expect(page.locator("#level")).toHaveText("11 / 20");
  await page.waitForTimeout(2600);
  await expect(page.locator("#level")).toHaveText("11 / 20");
});

test("Bubble Shooter: clearing with a power bubble advances, but level 20 wins",async({page})=>{
  await startGame(page);
  await page.evaluate(()=>window.__bubbleQA.prime(10,"row"));
  await page.evaluate(()=>window.__bubbleQA.clear());
  await expect(page.locator("#level")).toHaveText("11 / 20",{timeout:7000});

  await page.evaluate(()=>window.__bubbleQA.prime(20));
  await page.evaluate(()=>window.__bubbleQA.clear());
  await expect(page.locator("#message")).toContainText("ALL 20 LEVELS CLEARED");
  await expect(page.locator("#levelAction")).toHaveText("Play all 20 again");
  await page.waitForTimeout(2600);
  await expect(page.locator("#level")).toHaveText("20 / 20");
  expect(await page.evaluate(()=>window.__bubbleQA.state())).toEqual(expect.objectContaining({
    level:20,gameOver:true,won:true
  }));
});
