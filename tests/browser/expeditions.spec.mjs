import { test, expect } from "@playwright/test";
import { bridgeLevels, bridgeParts, pipePaths, directions, harborLevels, cargo, expeditions, pantryFoods, pantryChallenges, PANTRY_ROUND_SIZE, compassClues, landmarks, cipherLevels, tradeLevels, townParts, townLevels } from "../../assets/expedition-worlds.js";
import { checkPantryBox, compassTarget, encode, checkTownLevel } from "../../assets/expedition-logic.js";

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

test("Bridge Buddies: sixty keyboard-playable increasingly strong crossings and saved completion",async({page})=>{
  test.setTimeout(240000);
  await adventure(page,"bridge-buddies",async()=>{
    const toolDrawings=await page.locator(".bridge-tool-art").evaluateAll(nodes=>nodes.map(node=>node.innerHTML));
    expect(toolDrawings).toHaveLength(bridgeParts.length);
    expect(new Set(toolDrawings).size).toBe(bridgeParts.length);
    await expect(page.locator(".bridge-piers i")).toHaveCount(5);
    const vehicleCoversFirstLoad=await page.evaluate(()=>{
      const vehicle=document.querySelector(".bridge-cart")?.getBoundingClientRect();
      const label=document.querySelector('[data-span="0"] .load-label')?.getBoundingClientRect();
      return Boolean(vehicle&&label&&vehicle.left<label.right&&vehicle.right>label.left&&vehicle.top<label.bottom&&vehicle.bottom>label.top);
    });
    expect(vehicleCoversFirstLoad).toBe(false);
    for (let index=0;index<4;index++) await page.locator(`[data-span="${index}"]`).click();
    await action(page,"Test the crossing"); await expect(page.locator("#feedback")).toHaveClass(/try/);
    for (let round=0;round<bridgeLevels.length;round++) {
      await expect(page.locator(".bridge-landscape")).toHaveClass(new RegExp(`bridge-crossing--${bridgeLevels[round].scene}`));
      await expect(page.locator(".bridge-cart-art")).toHaveClass(new RegExp(`bridge-vehicle--${bridgeLevels[round].vehicle}`));
      await expect(page.locator(".bridge-load-plaque")).toContainText(bridgeLevels[round].cargo);
      for (let index=0;index<4;index++) {
        const support = bridgeParts.find(part=>part.capacity>=bridgeLevels[round].loads[index]);
        await page.locator(`[data-tool="${support.id}"]`).focus(); await page.keyboard.press("Enter");
        await page.locator(`[data-span="${index}"]`).focus(); await page.keyboard.press("Enter");
      }
      await action(page,"Test the crossing"); await expect(page.locator("#feedback")).toHaveClass(/good/); await next(page,round===bridgeLevels.length-1);
    }
  });
});
test("Bridge Buddies: four strongest braces fit even without builder tokens", async ({page})=>{
  await page.goto("/games/bridge-buddies/index.html");
  await expect(page.locator("#gameBoard")).toContainText("All materials are free and unlimited");
  await expect(page.locator("#gameBoard")).not.toContainText(/Builder tokens|tokens return|costs? \d+ tokens/i);
  await expect(page.locator(".build-tool").first()).toContainText("Holds load");
  await page.locator('[data-tool="triangle"]').click();
  for(let i=0;i<4;i++)await page.locator(`[data-span="${i}"]`).click();
  await expect(page.locator(".bridge-span.triangle")).toHaveCount(4);
  await expect(page.locator(".expedition-stats")).toContainText("Supports placed4/4");
  await page.getByRole("button",{name:"Test the crossing"}).click();
  await expect(page.locator("#feedback")).toHaveClass(/good/);
  await page.getByRole("button",{name:"Next challenge"}).click();
  await expect(page.locator(".expedition-stats")).toContainText("Supports placed0/4");
  await page.locator('[data-tool="triangle"]').click();
  await page.locator('[data-span="0"]').click();
  await page.locator('[data-tool="erase"]').click();
  await page.locator('[data-span="0"]').click();
  await expect(page.locator(".expedition-stats")).toContainText("Supports placed0/4");
  await page.locator('[data-tool="triangle"]').click();
  for(let i=0;i<4;i++)await page.locator(`[data-span="${i}"]`).click();
  await page.getByRole("button",{name:"Test the crossing"}).click();
  await expect(page.locator("#feedback")).toHaveClass(/good/);
});

test("Water Works: every one of eighty unique filter-connected networks works",async({page})=>{
  test.setTimeout(480_000);
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
test("Harbor Helpers: eighty increasingly complex exact deliveries fit their boat",async({page})=>{
  test.setTimeout(420_000);
  await adventure(page,"harbor-helpers",async()=>{
    expect(harborLevels).toHaveLength(80);
    expect(cargo).toHaveLength(10);
    expect(harborLevels.map(level=>level.capacity).filter((value,index,array)=>index===0||value!==array[index-1])).toEqual([3,4,5,6,7,8]);
    expect(harborLevels[0].vehicle).toBe("Harbor skiff");
    expect(harborLevels[79].vehicle).toBe("Grand harbor convoy");
    await expect(page.locator(".harbor-manifest")).toBeVisible();
    await page.locator('[data-cargo="wood"]').click(); await action(page,"Sail to Sprout Island");
    await expect(page.locator("#feedback")).toContainText("does not match");
    await action(page,"Unload the boat");
    await page.locator('[data-cargo="water"]').click(); await page.locator('[data-cargo="water"]').click(); await page.locator('[data-cargo="seeds"]').click();
    await page.locator('[data-cargo="wood"]').click();
    await expect(page.locator("#feedback")).toContainText("holds 3 crates"); await action(page,"Unload the boat");
    const ranks=["Dock Helper","Route Planner","Harbor Captain","Community Admiral","Supply Scout","Island Planner","Resource Organizer","Cargo Navigator","Delivery Leader","Harbor Coordinator","Community Captain","Master Harbor Helper","Coastal Dispatcher","Fleet Planner","Harbor Strategist","Grand Harbor Captain"];
    for(let index=0;index<harborLevels.length;index++) {
      await expect(page.locator(".adventure-advancement")).toHaveAttribute("data-level",String(index+1));
      await expect(page.locator(".adventure-advancement")).toHaveAttribute("data-rank",ranks[Math.floor(index/5)]);
      for(const [id,count] of Object.entries(harborLevels[index].needs)) for(let crate=0;crate<count;crate++) await page.locator(`[data-cargo="${id}"]`).click();
      await action(page,`Sail to ${harborLevels[index].name}`);
      await expect(page.locator("#feedback")).toHaveClass(/good/);
      await next(page,index===harborLevels.length-1);
    }
    await expect(page.locator("#finishMessage")).toContainText("80 island deliveries");
  });
});
function pantrySolution(challenge) {
  const ids = Object.keys(challenge.stock), solutions = [];
  const search = (index, remaining, box) => {
    if (index === ids.length) {
      if (!remaining && checkPantryBox(challenge, box, pantryFoods).ok) solutions.push({ ...box });
      return;
    }
    const id = ids[index];
    for (let count = 0; count <= Math.min(challenge.stock[id], remaining); count++) {
      if (count) box[id] = count; else delete box[id];
      search(index + 1, remaining - count, box);
    }
    delete box[id];
  };
  search(0, 3, {});
  return solutions[0];
}
test("Pantry Picnic: eighty continuous, unique picnics with saved checkpoints and one reward",async({page})=>{
  test.setTimeout(360_000);
  expect(pantryChallenges).toHaveLength(80);
  expect(PANTRY_ROUND_SIZE).toBe(10);
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/games/pantry-picnic/index.html");
  await expect(page.locator(".world-scene svg")).toBeVisible();
  await expect(page.locator("#soundToggle")).toHaveAttribute("aria-pressed","false");

  const visited=[];
  for(let index=0;index<pantryChallenges.length;index++){
    const challenge=pantryChallenges[index];
    const card=page.locator("[data-pantry-challenge]");
    const id=await card.getAttribute("data-pantry-challenge");
    expect(id).toBe(challenge.id);
    visited.push(id);
    await expect(page.locator("#stageLabel")).toContainText(`Picnic ${index+1} of 80`);
    await expect(page.locator("#stageLabel")).toContainText(`Chapter ${Math.floor(index/10)+1}/8`);
    await expect(page.locator(".adventure-advancement")).toContainText(`Level ${index+1} of 80`);
    if(index===0){
      await action(page,"Check this picnic");
      await expect(page.locator("#feedback")).toContainText("exactly three portions");
    }
    const solution=pantrySolution(challenge);
    expect(solution).toBeTruthy();
    for(const [food,count] of Object.entries(solution))
      for(let n=0;n<count;n++)await page.locator(`[data-food="${food}"]`).click();
    await action(page,"Check this picnic");
    await expect(page.locator("#feedback")).toHaveClass(/good/);
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.pantryPicnic.sixty.v1")));
    expect(saved.next).toBe(index+1);
    expect(saved.rewarded).toBe(false);
    // Reload immediately after completing a challenge, BEFORE pressing Next.
    // The completed picnic should never have to be solved again.
    if(index===23){
      await page.reload();
      await expect(page.locator("#stageLabel")).toContainText("Picnic 25 of 80");
      continue;
    }
    await action(page,index===79?"Celebrate my discoveries":"Next picnic");
    if(index===9)await expect(page.locator("#stageLabel")).toContainText("Chapter 2/8");
  }
  expect(new Set(visited).size).toBe(80);
  await expect(page.locator("#finishDialog")).toBeVisible();
  const reward=await page.evaluate(()=>window.LarriVerseArcade.summary().games["pantry-picnic"]);
  expect(reward.completions).toBe(1);
  expect(reward.metrics.practiceRuns).toBe(1);
  const checkpoint=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.pantryPicnic.sixty.v1")));
  expect(checkpoint).toEqual({next:80,rewarded:true});

  await page.locator("#closeFinish").click();
  await page.reload();
  await expect(page.locator("#gameBoard")).toContainText("Your whole picnic journey is complete!");
  await expect(page.getByRole("button",{name:"Celebrate my discoveries"})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Replay all 80 picnics"})).toBeVisible();
  // A replay requires explicit confirmation and must not erase progress casually.
  page.once("dialog",dialog=>dialog.dismiss());
  await action(page,"Replay all 80 picnics");
  await expect(page.locator("#gameBoard")).toContainText("Your whole picnic journey is complete!");
  page.once("dialog",dialog=>dialog.accept());
  await action(page,"Replay all 80 picnics");
  await expect(page.locator("#stageLabel")).toContainText("Picnic 1 of 80");
  const after=await page.evaluate(()=>window.LarriVerseArcade.summary().games["pantry-picnic"]);
  expect(after.completions).toBe(1);
  expect(errors).toEqual([]);
});
test("Compass Cove: sixty progressive multi-step routes with gentle wrong-answer recovery",async({page})=>{
  test.setTimeout(180_000);
  expect(compassClues.slice(0,5).every(clue=>clue.steps.length===2)).toBe(true);
  expect(compassClues.slice(40).every(clue=>clue.steps.length>=4)).toBe(true);
  expect(Math.max(...compassClues.slice(40).map(clue=>clue.steps.length))).toBeGreaterThanOrEqual(8);
  await adventure(page,"compass-cove",async()=>{
    await expect(page.locator("#restartButton")).toHaveText("Clear my try");
    await expect(page.locator(".compass-direction-list li")).toHaveCount(compassClues[0].steps.length);
    await page.locator('[data-map="0"]').click();
    await expect(page.locator("#feedback")).toHaveClass(/try/);
    await expect(page.locator("#feedback")).toContainText("nothing was lost");
    await expect(page.locator('[data-map="0"]')).toHaveClass(/wrong-pick/);
    await action(page,"Clear my try");
    await expect(page.locator(".compass-map-tile.wrong-pick")).toHaveCount(0);
    await expect(page.locator("#stageLabel")).toContainText("Treasure 1 of 60");
    const targets=compassClues.map(clue=>compassTarget(landmarks[clue.landmark],clue));
    expect(new Set(targets.slice(0,20)).size).toBe(20);
    expect(new Set(compassClues.map(c=>[c.landmark,c.east,c.south].join(":"))).size).toBe(60);
    for(let index=0;index<compassClues.length;index++) {
      await expect(page.locator(".compass-direction-list li")).toHaveCount(compassClues[index].steps.length);
      await page.locator(`[data-map="${targets[index]}"]`).click();
      await expect(page.locator("#feedback")).toHaveClass(/good/);
      await expect(page.locator(`[data-map="${targets[index]}"]`)).toHaveClass(/found/);
      await next(page,index===compassClues.length-1);
    }
  });
});
test("Cipher Club: sixty unique A–H words grow from three to nine letters",async({page})=>{
  test.setTimeout(360_000);
  await adventure(page,"cipher-club",async()=>{
    await action(page,"Check my message"); await expect(page.locator("#feedback")).toContainText("shared key 1");
    for(let index=0;index<cipherLevels.length;index++) {
      const level=cipherLevels[index];
      for(let turn=0;turn<level.shift;turn++)await page.locator('[data-key="1"]').click();
      if(index===0) { for(let letter=0;letter<level.word.length;letter++)await page.locator('[data-letter="A"]').click(); await action(page,"Check my message"); await expect(page.locator("#feedback")).toHaveClass(/try/); await action(page,"Clear my answer"); }
      const answer=level.encode ? encode(level.word,level.shift) : level.word;
      for(const letter of answer)await page.locator(`[data-letter="${letter}"]`).click();
      await action(page,"Check my message"); await expect(page.locator("#feedback")).toHaveClass(/good/); await next(page,index===cipherLevels.length-1);
    }
  });
});
test("Trade Town: budgets, returns, fees and sixty unique whole-cost comparisons",async({page})=>{
  test.setTimeout(300000);
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
function townSolution(level) {
  const ids=townParts.map(part=>part.id);
  for(let park=0;park<6;park++)for(let hut=0;hut<6;hut++)for(let ramp=0;ramp<6;ramp++)for(let bench=0;bench<6;bench++) {
    if(new Set([park,hut,ramp,bench]).size<4)continue;
    const plots=Array(6).fill(null);
    [park,hut,ramp,bench].forEach((plot,index)=>{plots[plot]=ids[index];});
    if(checkTownLevel(level,plots).every(Boolean))return plots;
  }
  return null;
}
test("Critter Council: 240 requests guide sixty solvable neighborhoods",async({page})=>{
  test.setTimeout(300000);
  await adventure(page,"critter-council",async()=>{
    for(const [id,index]of [["park",3],["hut",0],["ramp",1],["bench",5]]) { await page.locator(`[data-tool="${id}"]`).click(); await page.locator(`[data-plot="${index}"]`).click(); }
    await action(page,"Invite the neighbors"); await expect(page.locator("#feedback")).toHaveClass(/try/);
    const ranks=["Kind Listener","Neighborhood Helper","Access Planner","Council Champion","Park Pathfinder","Neighbor Advocate","Inclusive Designer","Access Engineer","Community Planner","Shared Space Leader","Council Mentor","Neighborhood Champion"];
    for(let round=0;round<townLevels.length;round++) {
      const solution=townSolution(townLevels[round]);
      expect(solution).toBeTruthy();
      await expect(page.locator(".adventure-advancement")).toHaveAttribute("data-level",String(round+1));
      await expect(page.locator(".adventure-advancement")).toHaveAttribute("data-rank",ranks[Math.floor(round/5)]);
      for(const [index,id] of solution.entries()) if(id) { await page.locator(`[data-tool="${id}"]`).click(); await page.locator(`[data-plot="${index}"]`).click(); }
      await expect(page.locator(".neighbor-requests .met")).toHaveCount(4);
      await action(page,"Invite the neighbors"); await expect(page.locator("#feedback")).toHaveClass(/good/);
      await next(page,round===townLevels.length-1);
    }
    await expect(page.locator("#finishMessage")).toContainText("sixty neighborhoods");
  });
});
test("Critter Council center cards stay readable in light and high-contrast modes",async({page})=>{
  await page.goto("/games/critter-council/index.html");
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({theme:"light",highContrast:false,largeText:false,reducedMotion:true}));
  await expect(page.locator("html")).toHaveClass(/larriverse-light/);
  const readings=await page.evaluate(()=>{
    const rgb=color=>(color.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
    const luminance=color=>{
      const values=rgb(color).map(channel=>{const value=channel/255;return value<=.03928?value/12.92:((value+.055)/1.055)**2.4;});
      return .2126*values[0]+.7152*values[1]+.0722*values[2];
    };
    const ratio=(foreground,background)=>{const a=luminance(foreground),b=luminance(background);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
    return [
      ["challenge title",".town-challenge-card h2",".town-challenge-card"],
      ["neighbor name",".neighbor-requests b",".neighbor-requests p"],
      ["neighbor request",".neighbor-requests small",".neighbor-requests p"],
      ["building detail",".town-tool-shelf .build-tool small",".town-tool-shelf .build-tool"],
      ["plot detail",".town-plot small",".town-plot"]
    ].map(([label,textSelector,surfaceSelector])=>{
      const foreground=getComputedStyle(document.querySelector(textSelector)).color,surface=getComputedStyle(document.querySelector(surfaceSelector));
      const stops=surface.backgroundImage.match(/rgb\([^)]+\)/g)||[surface.backgroundColor];
      return{label,ratio:Math.min(...stops.map(color=>ratio(foreground,color))),foreground,background:surface.backgroundImage};
    });
  });
  for(const reading of readings)expect(reading.ratio,`${reading.label} contrast`).toBeGreaterThanOrEqual(4.5);
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({highContrast:true}));
  await expect(page.locator(".neighbor-requests p").first()).toHaveCSS("background-color","rgb(17, 17, 17)");
  await expect(page.locator(".neighbor-requests small").first()).toHaveCSS("color","rgb(255, 255, 255)");
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
