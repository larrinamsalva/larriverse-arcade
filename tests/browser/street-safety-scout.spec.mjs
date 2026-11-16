import {test,expect} from "@playwright/test";
import {streetSafetyScenarios} from "../../games/street-safety-scout/scenarios.js";
const byId=new Map(streetSafetyScenarios.map(x=>[x.id,x]));
const signalIndications = {
  'signal-red': ['red'],
  'signal-yellow': ['yellow'],
  'signal-green': ['green'],
  'signal-flashing-red': ['red'],
  'signal-flashing-yellow': ['yellow'],
  'arrow-red': ['red-arrow'],
  'arrow-green': ['green-arrow'],
  'arrow-flashing-yellow': ['yellow-arrow'],
  'signal-dark': [],
  'pedestrian-walk': ['walk'],
  'pedestrian-wait': ['hand'],
  railroad: ['red', 'red'],
};
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
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto("/games/street-safety-scout/index.html");
 await expect(page.locator("body")).toHaveAttribute("data-game-ready","true");
 await expect(page.locator("#soundButton")).toHaveAttribute("aria-pressed","false");
 await page.locator("#startButton").focus();
 await page.keyboard.press("Enter");
 const seen=new Set(),categories=new Map();
 const artSources = new Set();
 for(let i=0;i<60;i++){
  const mission=await playStop(page,i===0);
  expect(seen.has(mission.id)).toBe(false);
  seen.add(mission.id);
  categories.set(mission.category,(categories.get(mission.category)||0)+1);
  const art=page.locator("#scenarioVisual > svg");
  await expect(art).toHaveAttribute("aria-label",mission.title);
  await expect(art).toHaveAttribute("role","img");
  await expect(art.locator('[data-street-setting] image')).toHaveCount(1);
  for (const source of await art.locator('image').evaluateAll(images => images.map(image => image.getAttribute('href')))) {
   artSources.add(source);
  }
  if (mission.category === 'Signal lights') {
   const indications = await art.locator('[data-indication]').evaluateAll(lights => lights.map(light => light.dataset.indication));
   expect(indications).toEqual(signalIndications[mission.visual]);
  }
  if (mission.visual === 'signal-green') {
   await expect(art.locator('[data-crossing-pedestrian]')).toHaveCSS('animation-name', 'street-finish-crossing');
  }
  if (mission.visual === 'pedestrian-wait') {
   await expect(art.locator('[data-indication="hand"]')).toHaveCSS('animation-name', 'street-signal-flash');
  }
  if (mission.visual === 'railroad') {
   await expect(art.locator('.signal-flash-second')).toHaveCSS('animation-delay', '-0.6s');
  }
  await expect(page.locator("#stopCount")).toContainText(`Stop ${i+1} of 60`);
  if([14,29,44].includes(i))await expect(page.locator("#nextButton")).toContainText("Enter route");
  await page.locator("#nextButton").click();
 }
 const artSizes = await page.evaluate(sources => Promise.all(sources.map(async source => {
  const image = new Image();
  image.src = source;
  await image.decode();
  return image.naturalWidth;
 })), [...artSources]);
 expect(artSizes.every(width => width > 0)).toBe(true);
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
 await page.emulateMedia({reducedMotion:'reduce'});
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
 await expect(page.locator('#scenarioVisual .safety-scenery')).toHaveCSS('animation-name', 'none');
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.streetSafetyScout.longRoute.v1")));
 expect(snapshot.next).toBe(15);
 expect(snapshot.ids.length).toBe(60);
 expect(new Set(snapshot.ids).size).toBe(60);
 const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
 expect(size.scroll).toBeLessThanOrEqual(size.width+4);
});
