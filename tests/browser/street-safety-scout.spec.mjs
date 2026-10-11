import {test,expect} from "@playwright/test";
import {streetSafetyScenarios} from "../../games/street-safety-scout/scenarios.js";
const byId=new Map(streetSafetyScenarios.map(x=>[x.id,x]));
async function playStop(page,wrong=false){
 const id=await page.locator("#challengePanel").getAttribute("data-scenario-id");
 const mission=byId.get(id);
 expect(mission).toBeTruthy();
 const picked=wrong?(mission.answer+1)%mission.options.length:mission.answer;
 await page.locator(`.answer-button[data-answer="${picked}"]`).click();
 await expect(page.locator("#feedback")).toContainText(mission.why);
 await expect(page.locator(".answer-button.correct")).toHaveCount(1);
 return mission;
}

test("Street Safety Scout is one sixty-stop adventure with four milestones and saved award",async({page})=>{
 test.setTimeout(420000);
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/games/street-safety-scout/index.html");
 await expect(page.locator("body")).toHaveAttribute("data-game-ready","true");
 await expect(page.locator("#soundButton")).toHaveAttribute("aria-pressed","false");
 await page.locator("#startButton").focus();
 await page.keyboard.press("Enter");
 const seen=new Set(),categories=new Map();
 for(let i=0;i<60;i++){
  const mission=await playStop(page,i===0);
  expect(seen.has(mission.id)).toBe(false);
  seen.add(mission.id);
  categories.set(mission.category,(categories.get(mission.category)||0)+1);
  const art=page.locator("#scenarioVisual svg");
  await expect(art).toHaveAttribute("aria-label",mission.title);
  await expect(art).toHaveAttribute("role","img");
  await expect(page.locator("#stopCount")).toContainText(`Stop ${i+1} of 60`);
  if([14,29,44].includes(i))await expect(page.locator("#nextButton")).toContainText("Enter route");
  await page.locator("#nextButton").click();
 }
 expect(seen.size).toBe(streetSafetyScenarios.length);
 for(const n of categories.values())expect(n).toBe(12);
 await expect(page.locator("#resultDialog")).toBeVisible();
 await expect(page.locator("#resultMessage")).toContainText("59 of 60");
 const saved=await page.evaluate(()=>window.LarriVerseArcade.summary().games["street-safety-scout"]);
 expect(saved.completions).toBe(1);
 expect(saved.metrics.safetyStops).toBe(60);
 expect(saved.metrics.safetyClues).toBe(59);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.streetSafetyScout.longRoute.v1")).next)).toBe(60);
 expect(errors).toEqual([]);
});

test("Street Safety Scout resumes on step 16 after first route even on 320px screen",async({page})=>{
 await page.setViewportSize({width:320,height:760});
 await page.goto("/games/street-safety-scout/index.html");
 await page.locator("#startButton").click();
 const used=new Set();
 for(let i=0;i<15;i++){
  const mission=await playStop(page);
  expect(used.has(mission.id)).toBe(false);used.add(mission.id);
  await page.locator("#nextButton").click();
 }
 await page.reload();
 await page.locator("#startButton").click();
 await expect(page.locator("#stopCount")).toContainText("Route 2/4 · Stop 16 of 60");
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.streetSafetyScout.longRoute.v1")));
 expect(snapshot.next).toBe(15);
 expect(snapshot.ids.length).toBe(60);
 expect(new Set(snapshot.ids).size).toBe(60);
 const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
 expect(size.scroll).toBeLessThanOrEqual(size.width+4);
});
