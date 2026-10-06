import { test, expect } from "@playwright/test";
import { bridgeLevels, bridgeParts, pipePaths, directions, islands, expeditions, compassClues, landmarks, cipherLevels, tradeLevels } from "../../assets/expedition-worlds.js";
import { compassTarget, encode } from "../../assets/expedition-logic.js";

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

test("Bridge Buddies: keyboard building, weak supports, eight budgeted crossings and saved completion",async({page})=>{
  await adventure(page,"bridge-buddies",async()=>{
    for (let index=0;index<4;index++) await page.locator(`[data-span="${index}"]`).click();
    await action(page,"Test the crossing"); await expect(page.locator("#feedback")).toHaveClass(/try/);
    for (let round=0;round<bridgeLevels.length;round++) {
      for (let index=0;index<4;index++) {
        const support = bridgeParts.find(part=>part.capacity>=bridgeLevels[round].loads[index]);
        await page.locator(`[data-tool="${support.id}"]`).focus(); await page.keyboard.press("Enter");
        await page.locator(`[data-span="${index}"]`).focus(); await page.keyboard.press("Enter");
      }
      await action(page,"Test the crossing"); await expect(page.locator("#feedback")).toHaveClass(/good/); await next(page,round===bridgeLevels.length-1);
    }
  });
});
test("Water Works: leak feedback, clockwise rotations, filter and eight connected networks",async({page})=>{
  await adventure(page,"water-works",async()=>{
    await action(page,"Send the water"); await expect(page.locator("#feedback")).toHaveClass(/try/);
    for (let round=0;round<pipePaths.length;round++) {
      const path = pipePaths[round], dir=(from,to)=>[-5,1,5,-1].indexOf(to-from);
      for (let index=0;index<path.length;index++) {
        const tile=path[index], pair=[index ? dir(tile,path[index-1]) : 3,index<path.length-1 ? dir(tile,path[index+1]) : 1];
        const pipe=page.locator(`[data-pipe="${tile}"]`);
        for (let turn=0;turn<4;turn++) { const label=await pipe.getAttribute("aria-label"); if(pair.every(value=>label.includes(directions[value])))break; await pipe.click(); }
      }
      await action(page,"Send the water"); await expect(page.locator("#feedback")).toHaveClass(/good/);
      await expect(page.locator(".pipe-tile.flowing")).toHaveCount(path.length); await next(page,round===pipePaths.length-1);
    }
  });
});
test("Harbor Helpers: capacity, rejected wrong supplies, efficient deliveries and fuel",async({page})=>{
  await adventure(page,"harbor-helpers",async()=>{
    await page.locator('[data-cargo="wood"]').click(); await action(page,"Sail to this island");
    await expect(page.locator("#feedback")).toContainText("did not ask");
    // Loading replaces the shelf: each tap must resolve the current button.
    await page.locator('[data-cargo="water"]').click(); await page.locator('[data-cargo="water"]').click(); await page.locator('[data-cargo="seeds"]').click();
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
test("Compass Cove: landmark clues, wrong-turn feedback and eight distinct treasures",async({page})=>{
  await adventure(page,"compass-cove",async()=>{
    await page.locator('[data-map="0"]').click(); await expect(page.locator("#feedback")).toHaveClass(/try/);
    const targets=compassClues.map(clue=>compassTarget(landmarks[clue.landmark],clue));
    expect(new Set(targets).size).toBe(compassClues.length);
    for(let index=0;index<compassClues.length;index++) {
      await page.locator(`[data-map="${targets[index]}"]`).click();
      await expect(page.locator("#feedback")).toHaveClass(/good/);
      await expect(page.locator(`[data-map="${targets[index]}"]`)).toHaveClass(/found/);
      await next(page,index===compassClues.length-1);
    }
  });
});
test("Cipher Club: shared keys, incorrect messages, encode and decode eight rounds",async({page})=>{
  await adventure(page,"cipher-club",async()=>{
    await action(page,"Check my message"); await expect(page.locator("#feedback")).toContainText("shared key 1");
    for(let index=0;index<cipherLevels.length;index++) {
      const level=cipherLevels[index];
      for(let turn=0;turn<level.shift;turn++)await page.locator('[data-key="1"]').click();
      if(index===0) { for(let letter=0;letter<3;letter++)await page.locator('[data-letter="A"]').click(); await action(page,"Check my message"); await expect(page.locator("#feedback")).toHaveClass(/try/); await action(page,"Clear my answer"); }
      const answer=level.encode ? encode(level.word,level.shift) : level.word;
      for(const letter of answer)await page.locator(`[data-letter="${letter}"]`).click();
      await action(page,"Check my message"); await expect(page.locator("#feedback")).toHaveClass(/good/); await next(page,index===cipherLevels.length-1);
    }
  });
});
test("Trade Town: budgets, returns, fees and eight best whole-cost comparisons",async({page})=>{
  await adventure(page,"trade-town",async()=>{
    const cheapestBasket=level=>{
      let best=null;
      for(let a=0;a<=level.need;a++)for(let b=0;b<=level.need;b++)for(let d=0;d<=level.need;d++){
        const counts=[a,b,d];
        const quantity=counts.reduce((sum,count,index)=>sum+count*level.deals[index].quantity,0);
        const cost=counts.reduce((sum,count,index)=>sum+count*(level.deals[index].price+level.deals[index].fee),0);
        if(quantity>=level.need&&(!best||cost<best.cost))best={counts,cost};
      }
      return best;
    };
    for(let item=0;item<6;item++)await page.locator('[data-shop="0,1"]').click(); await action(page,"Check out");
    await expect(page.locator("#feedback")).toContainText("over budget");
    for(let item=0;item<6;item++)await page.locator('[data-shop="0,-1"]').click();

    for(let round=0;round<tradeLevels.length;round++) {
      const best=cheapestBasket(tradeLevels[round]);
      expect(best.cost).toBeLessThanOrEqual(tradeLevels[round].budget);
      for(let offer=0;offer<best.counts.length;offer++)
        for(let bundle=0;bundle<best.counts[offer];bundle++)
          await page.locator(`[data-shop="${offer},1"]`).click();
      await action(page,"Check out");
      await expect(page.locator("#feedback")).toContainText("lowest whole cost");
      await next(page,round===tradeLevels.length-1);
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
