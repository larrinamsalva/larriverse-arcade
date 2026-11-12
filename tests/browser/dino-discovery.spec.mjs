import { test, expect } from "@playwright/test";

const route="/games/dino-discovery-world/";
const key="larriverse.dinoDiscovery.v1";
const getMission=(page,index)=>page.evaluate(async(i)=>{
  const {MISSIONS}=await import("/games/dino-discovery-world/missions.js");
  return MISSIONS[i];
},index);
test("Dino Discovery: 3D orbit and first science discovery save without repeat reward",async({page})=>{
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(route);
  await expect(page.locator(".chapter-chip")).toHaveCount(8);
  await expect(page.locator("#levelReadout")).toHaveText("Mission 1 of 80");
  const count=await page.evaluate(async()=> (await import("/games/dino-discovery-world/missions.js")).MISSIONS.length);
  expect(count).toBe(80);
  const before=await page.locator("#dinoCanvas").evaluate(c=>c.toDataURL());
  await page.locator("#turnRight").click();
  const after=await page.locator("#dinoCanvas").evaluate(c=>c.toDataURL());
  expect(before).not.toBe(after);
  await page.locator("#switchDino").click();
  await expect(page.locator("#modelName")).toHaveText("Tyrannosaurus rex");
  const mission=await getMission(page,0);
  await page.locator('[data-answer="'+(mission.answer+1)%3+'"]').click();
  await expect(page.locator("#feedback")).toContainText("Not quite");
  await page.locator('[data-answer="'+mission.answer+'"]').click();
  await expect(page.locator("#feedback")).toContainText("Discovery recorded");
  let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  expect(saved.solved).toEqual([1]);
  expect(saved.unlocked).toBe(2);
  await page.reload();
  await expect(page.locator("#nextMission")).toBeEnabled();
  await page.locator('[data-answer="'+mission.answer+'"]').click();
  saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  expect(saved.solved).toEqual([1]);
  await page.locator("#nextMission").click();
  await expect(page.locator("#levelReadout")).toHaveText("Mission 2 of 80");
  expect(errors).toEqual([]);
});

test("Dino Discovery: fossil dig requires three brush actions and unlocks a field-guide card",async({page})=>{
  // Seed only the first navigation. Reload must read the real saved progress;
  // overwriting localStorage on every document load hides persistence regressions.
  await page.addInitScript(k=>{
    if(!localStorage.getItem(k))localStorage.setItem(k,JSON.stringify({
      level:10,unlocked:11,solved:Array.from({length:10},(_,i)=>i+1),fieldGuide:["trike"]
    }));
  },key);
  await page.goto(route);
  await expect(page.locator("#levelReadout")).toHaveText("Mission 11 of 80");
  await expect(page.locator("#brushFossil")).toBeVisible();
  await expect(page.locator(".answer-option").first()).toBeDisabled();
  await page.locator("#brushFossil").click();
  await page.locator("#brushFossil").click();
  await expect(page.locator(".answer-option").first()).toBeDisabled();
  await page.locator("#brushFossil").click();
  await expect(page.locator(".answer-option").first()).toBeEnabled();
  const mission=await getMission(page,10);
  await page.locator('[data-answer="'+mission.answer+'"]').click();
  await expect(page.locator("#feedback")).toContainText("Discovery recorded");
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  expect(saved.fieldGuide).toContain("fossil");
  expect(saved.unlocked).toBe(12);
  await expect(page.locator(".guide-card")).toHaveCount(2);
  await page.reload();
  await expect(page.locator("#nextMission")).toBeEnabled();
});

test("Dino Discovery: last mission, dark contrast and narrow phone layout",async({page})=>{
  await page.addInitScript(k=>localStorage.setItem(k,JSON.stringify({
    level:79,unlocked:80,solved:Array.from({length:79},(_,i)=>i+1),fieldGuide:["trike","fossil"]
  })),key);
  await page.goto(route);
  await expect(page.locator("#levelReadout")).toHaveText("Mission 80 of 80");
  const mission=await getMission(page,79);
  await page.locator('[data-answer="'+mission.answer+'"]').click();
  await expect(page.locator("#solvedCount")).toHaveText("80");
  await page.locator("#nextMission").click();
  await expect(page.locator("#feedback")).toContainText("Master Paleontologist");
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({darkMode:true,highContrast:true,reducedMotion:true}));
  await page.setViewportSize({width:390,height:844});
  const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  expect(layout.scroll).toBeLessThanOrEqual(layout.width+4);
  await expect(page.locator("#dinoCanvas")).toBeVisible();
  await expect(page.locator("#missionQuestion")).toBeVisible();
});

test("Dino Discovery: dinosaur model has look-up/look-down controls without changing mission saves",async({page})=>{
 await page.goto(route);
 const initial=await page.locator("#dinoCanvas").evaluate(c=>c.toDataURL());
 await page.locator("#tiltUp").click();
 const moved=await page.locator("#dinoCanvas").evaluate(c=>c.toDataURL());
 expect(moved).not.toBe(initial);
 await page.locator("#tiltDown").click();
 await page.locator("#dinoCanvas").focus();
 await page.keyboard.press("PageDown");
 const keyboard=await page.locator("#dinoCanvas").evaluate(c=>c.toDataURL());
 expect(keyboard).not.toBe(initial);
 const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 expect(saved?.solved||[]).toEqual([]);
});

test("Dino Discovery: shared organic animal models use more detailed gallery meshes",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(route);
 const counts=await page.evaluate(async()=>{
   const {drawOrganicDinosaur,ORGANIC_PALETTES,TRAIL_SPECIES}=await import("/games/dino-discovery-world/organic-dino-models.js");
   const get=(kind,quality)=>{
     let faces=0;const colors=new Set();
     drawOrganicDinosaur(kind,(pts,c)=>{if(pts.some(p=>p.some(n=>!Number.isFinite(n))))throw Error("Non-finite mesh");colors.add(c);faces++;},{quality});
     return {faces,colors:colors.size};
   };
   return {kinds:Object.keys(ORGANIC_PALETTES).length,mapped:Object.keys(TRAIL_SPECIES).length,
     main:get("trike","high"),trail:get("trike","trail"),tRex:get("rex","high"),sauropod:get("longneck","high")};
 });
 expect(counts.kinds).toBe(11);
 expect(counts.mapped).toBe(7);
 expect(counts.main.faces).toBeGreaterThan(counts.trail.faces);
 expect(counts.main.colors).toBeGreaterThan(4);
 expect(counts.tRex.faces).toBeGreaterThan(500);
 expect(counts.sauropod.faces).toBeGreaterThan(500);
 await page.locator("#switchDino").click();
 await expect(page.locator("#modelName")).toHaveText("Tyrannosaurus rex");
 expect(errors).toEqual([]);
});

test("Dino Discovery: every chapter box and all 80 missions are selectable on a fresh game",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(route);
 const chapters=page.locator("#chapters .chapter-chip");
 await expect(chapters).toHaveCount(8);
 await expect(page.locator("#levelSelect option")).toHaveCount(80);
 for(let chapter=0;chapter<8;chapter++){
   await expect(chapters.nth(chapter)).toBeEnabled();
   await chapters.nth(chapter).click();
   await expect(page.locator("#levelReadout")).toHaveText("Mission "+(chapter*10+1)+" of 80");
   await expect(chapters.nth(chapter)).toHaveAttribute("aria-pressed","true");
 }
 await expect(page.locator("#solvedCount")).toHaveText("0");
 await page.locator("#levelSelect").selectOption("79");
 await expect(page.locator("#levelReadout")).toHaveText("Mission 80 of 80");
 await page.locator("#nextMission").click();
 await expect(page.locator("#levelReadout")).toHaveText("Mission 1 of 80");
 await expect(page.locator("#feedback")).not.toContainText("Master Paleontologist");
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 expect(saved.solved).toEqual([]);
 expect(saved.unlocked).toBe(1);
 expect(errors).toEqual([]);
});

test("Dino Discovery: fossil dig is free-choice, progress stays earned and a later selection survives reload",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(route);
 await page.locator('[data-chapter="1"]').click();
 await expect(page.locator("#levelReadout")).toHaveText("Mission 11 of 80");
 await expect(page.locator("#brushFossil")).toBeVisible();
 await expect(page.locator(".answer-option").first()).toBeDisabled();
 for(let i=0;i<3;i++)await page.locator("#brushFossil").click();
 const fossil=await getMission(page,10);
 await page.locator('[data-answer="'+fossil.answer+'"]').click();
 await expect(page.locator("#solvedCount")).toHaveText("1");
 await expect(page.locator('[data-chapter="1"] .chapter-count')).toHaveText("1 / 10 discoveries");
 await expect(page.locator(".guide-card")).toHaveCount(1);
 await page.locator('[data-chapter="7"]').click();
 await expect(page.locator("#levelReadout")).toHaveText("Mission 71 of 80");
 await page.reload();
 await expect(page.locator("#levelReadout")).toHaveText("Mission 71 of 80");
 await expect(page.locator("#levelSelect option")).toHaveCount(80);
 await expect(page.locator("#solvedCount")).toHaveText("1");
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 expect(saved.level).toBe(70);
 expect(saved.solved).toEqual([11]);
 expect(saved.fieldGuide).toEqual(["fossil"]);
 expect(errors).toEqual([]);
});

test("Dino Discovery: older saved free-choice position remains selectable when legacy unlock checkpoint is low",async({page})=>{
 await page.addInitScript(k=>{
   if(!localStorage.getItem(k))localStorage.setItem(k,JSON.stringify({
     level:69,unlocked:2,solved:[1],fieldGuide:["trike"]
   }));
 },key);
 await page.goto(route);
 await expect(page.locator("#levelReadout")).toHaveText("Mission 70 of 80");
 await expect(page.locator("#levelSelect option")).toHaveCount(80);
 await expect(page.locator("#solvedCount")).toHaveText("1");
 await page.locator("#nextMission").click();
 await expect(page.locator("#levelReadout")).toHaveText("Mission 71 of 80");
 await page.reload();
 await expect(page.locator("#levelReadout")).toHaveText("Mission 71 of 80");
});
