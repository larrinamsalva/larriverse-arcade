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
  await page.addInitScript(k=>localStorage.setItem(k,JSON.stringify({
    level:10,unlocked:11,solved:Array.from({length:10},(_,i)=>i+1),fieldGuide:["trike"]
  })),key);
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
