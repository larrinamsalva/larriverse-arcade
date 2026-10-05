import { test, expect } from "@playwright/test";
import { bridgeLevels, bridgeParts, pipePaths, directions, islands, expeditions } from "../../assets/expedition-worlds.js";

async function adventure(page,id,play) {
  const errors = []; page.on("pageerror",error => errors.push(error.message));
  await page.goto(`/games/${id}/index.html`);
  await expect(page.locator("#gameBoard")).not.toBeEmpty();
  await expect(page.locator(".world-scene svg")).toBeVisible();
  await expect(page.locator("#soundToggle")).toHaveAttribute("aria-pressed","false");
  await play();
  await expect(page.locator("#finishDialog")).toBeVisible();
  const saved = await page.evaluate(id=>window.LarriVerseArcade.summary().games[id],id);
  expect(saved.completions).toBe(1); expect(saved.metrics.practiceRuns).toBe(1);
  await page.locator("#closeFinish").click();
  await page.locator("#restartButton").click();
  expect((await page.evaluate(id=>window.LarriVerseArcade.summary().games[id],id)).completions).toBe(1);
  const size = await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  expect(size.scroll).toBeLessThanOrEqual(size.width+4);
  await page.reload(); await expect(page.locator("#bestScore")).not.toHaveText("—");
  expect(errors).toEqual([]);
}
const action = (page,name) => page.getByRole("button",{name,exact:true}).click();
async function next(page,last) { await action(page,last ? "Celebrate my discoveries" : "Next challenge"); }

test("Bridge Buddies: keyboard building, weak supports, three budgeted crossings and saved completion",async({page})=>{
  await adventure(page,"bridge-buddies",async()=>{
    for (let index=0;index<4;index++) await page.locator(`[data-span="${index}"]`).click();
    await action(page,"Test the crossing"); await expect(page.locator("#feedback")).toHaveClass(/try/);
    for (let round=0;round<3;round++) {
      for (let index=0;index<4;index++) {
        const support = bridgeParts.find(part=>part.capacity>=bridgeLevels[round].loads[index]);
        await page.locator(`[data-tool="${support.id}"]`).focus(); await page.keyboard.press("Enter");
        await page.locator(`[data-span="${index}"]`).focus(); await page.keyboard.press("Enter");
      }
      await action(page,"Test the crossing"); await expect(page.locator("#feedback")).toHaveClass(/good/); await next(page,round===2);
    }
  });
});
test("Water Works: leak feedback, clockwise rotations, filter and three connected networks",async({page})=>{
  await adventure(page,"water-works",async()=>{
    await action(page,"Send the water"); await expect(page.locator("#feedback")).toHaveClass(/try/);
    for (let round=0;round<3;round++) {
      const path = pipePaths[round], dir=(from,to)=>[-5,1,5,-1].indexOf(to-from);
      for (let index=0;index<path.length;index++) {
        const tile=path[index], pair=[index ? dir(tile,path[index-1]) : 3,index<path.length-1 ? dir(tile,path[index+1]) : 1];
        const pipe=page.locator(`[data-pipe="${tile}"]`);
        for (let turn=0;turn<4;turn++) { const label=await pipe.getAttribute("aria-label"); if(pair.every(value=>label.includes(directions[value])))break; await pipe.click(); }
      }
      await action(page,"Send the water"); await expect(page.locator("#feedback")).toHaveClass(/good/);
      await expect(page.locator(".pipe-tile.flowing")).toHaveCount(path.length); await next(page,round===2);
    }
  });
});
test("Harbor Helpers: capacity, rejected wrong supplies, efficient deliveries and fuel",async({page})=>{
  await adventure(page,"harbor-helpers",async()=>{
    await page.locator('[data-cargo="wood"]').click(); await action(page,"Sail to this island");
    await expect(page.locator("#feedback")).toContainText("did not ask");
    await page.locator('[data-cargo="water"]').click({clickCount:2}); await page.locator('[data-cargo="seeds"]').click();
    await expect(page.locator("#feedback")).toContainText("holds three"); await action(page,"Unload the boat");
    for(let index=0;index<3;index++) {
      await page.locator(`[data-island="${index}"]`).click();
      for(const [id,count] of Object.entries(islands[index].needs)) for(let crate=0;crate<count;crate++) await page.locator(`[data-cargo="${id}"]`).click();
      await action(page,"Sail to this island");
    }
    await expect(page.locator("#finishMessage")).toContainText("used 6 fuel");
  });
});
test("Pantry Picnic: leftovers before new food, three balanced boxes and empty pantry",async({page})=>{
  await adventure(page,"pantry-picnic",async()=>{
    for(const id of ["beans","apple","apple"]) await page.locator(`[data-food="${id}"]`).click();
    await action(page,"Pack this picnic"); await expect(page.locator("#feedback")).toContainText("leftover bread"); await action(page,"Empty this box");
    for(const box of [["bread","carrot","carrot"],["bread","carrot","apple"],["beans","apple","apple"]]) {
      for(const id of box)await page.locator(`[data-food="${id}"]`).click(); await action(page,"Pack this picnic");
    }
    await expect(page.locator("[data-food]:disabled")).toHaveCount(4);
  });
});
test("Compass Cove: landmark clues, wrong-turn feedback and five distinct treasures",async({page})=>{
  await adventure(page,"compass-cove",async()=>{
    await page.locator('[data-map="0"]').click(); await expect(page.locator("#feedback")).toHaveClass(/try/);
    const targets=[14,15,16,13,29];
    for(let index=0;index<5;index++) { await page.locator(`[data-map="${targets[index]}"]`).click(); await expect(page.locator("#feedback")).toHaveClass(/good/); await next(page,index===4); }
  });
});
test("Cipher Club: shared keys, incorrect messages, encode and decode five rounds",async({page})=>{
  await adventure(page,"cipher-club",async()=>{
    await action(page,"Check my message"); await expect(page.locator("#feedback")).toContainText("shared key 1");
    const shifts=[1,2,3,5,7],answers=["CFE","ACE","GDG","BEE","BHA"];
    for(let index=0;index<5;index++) {
      for(let turn=0;turn<shifts[index];turn++)await page.locator('[data-key="1"]').click();
      if(index===0) { for(let letter=0;letter<3;letter++)await page.locator('[data-letter="A"]').click(); await action(page,"Check my message"); await expect(page.locator("#feedback")).toHaveClass(/try/); await action(page,"Clear my answer"); }
      for(const letter of answers[index])await page.locator(`[data-letter="${letter}"]`).click();
      await action(page,"Check my message"); await expect(page.locator("#feedback")).toHaveClass(/good/); await next(page,index===4);
    }
  });
});
test("Trade Town: budgets, returns, per-bundle fees and best whole-cost comparisons",async({page})=>{
  await adventure(page,"trade-town",async()=>{
    for(let item=0;item<6;item++)await page.locator('[data-shop="0,1"]').click(); await action(page,"Check out");
    await expect(page.locator("#feedback")).toContainText("over budget");
    for(let item=0;item<6;item++)await page.locator('[data-shop="0,-1"]').click();
    for(let round=0;round<3;round++) {
      if(round===2) { for(let bundle=0;bundle<2;bundle++)await page.locator('[data-shop="1,1"]').click(); await action(page,"Check out"); await expect(page.locator("#feedback")).toContainText("over budget"); for(let bundle=0;bundle<2;bundle++)await page.locator('[data-shop="1,-1"]').click(); }
      const offer=round===0 ? 1 : 0; for(let bundle=0;bundle<2;bundle++)await page.locator(`[data-shop="${offer},1"]`).click();
      await action(page,"Check out"); await expect(page.locator("#feedback")).toContainText("lowest whole cost"); await next(page,round===2);
    }
    await expect(page.locator("#finishScore")).toHaveText("100");
  });
});
test("Critter Council: listen to requests, move buildings, make room for every neighbor",async({page})=>{
  await adventure(page,"critter-council",async()=>{
    for(const [id,index]of [["park",3],["hut",0],["ramp",1],["bench",5]]) { await page.locator(`[data-tool="${id}"]`).click(); await page.locator(`[data-plot="${index}"]`).click(); }
    await action(page,"Invite the neighbors"); await expect(page.locator("#feedback")).toHaveClass(/try/);
    for(const [id,index]of [["park",0],["bench",1],["ramp",2],["hut",3]]) { await page.locator(`[data-tool="${id}"]`).click(); await page.locator(`[data-plot="${index}"]`).click(); }
    await expect(page.locator(".neighbor-requests .met")).toHaveCount(4); await action(page,"Invite the neighbors");
  });
});
test("Eight expeditions remain usable with larger text, high contrast and reduced motion",async({page})=>{
  for(const world of expeditions) {
    await page.goto(`/games/${world.id}/index.html`);
    await page.evaluate(()=>{ window.LarriVerseArcade.setSettings({reducedMotion:true,highContrast:true,largeText:true}); document.documentElement.style.setProperty("font-size","32px","important"); });
    await expect(page.locator("#gameBoard")).not.toBeEmpty();
    const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
    expect(size.scroll,world.id).toBeLessThanOrEqual(size.width+4);
  }
});
test("Comfort control stops decorative animation and persists after reload",async({page})=>{
  await page.emulateMedia({reducedMotion:"no-preference"}); await page.goto("/games/bridge-buddies/index.html");
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({reducedMotion:false}));
  expect(await page.locator(".scene-cloud").evaluate(node=>getComputedStyle(node).animationName)).toBe("cloud-drift");
  await page.locator("#comfortToggle").click(); await expect(page.locator("#comfortToggle")).toHaveAttribute("aria-pressed","true");
  expect(await page.locator(".scene-cloud").evaluate(node=>getComputedStyle(node).animationName)).toBe("none");
  await page.reload(); await expect(page.locator("#comfortToggle")).toHaveAttribute("aria-pressed","true");
});
