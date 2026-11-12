import {test,expect} from "@playwright/test";

const route="/games/dino-discovery-world/explore.html";
const trailKey="larriverse.dinoExplorer.v1";
const missionKey="larriverse.dinoDiscovery.v1";

test("3D trails: physically moving and turning updates the perspective-rendered scene",async({page})=>{
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto(route);
 await expect(page.locator("[data-portal]")).toHaveCount(3);
 await expect(page.locator("#stationList .station")).toHaveCount(3);
 await expect(page.locator("#periodTitle")).toContainText("Triassic");
 const original=await page.locator("#worldCanvas").evaluate(canvas=>canvas.toDataURL());
 await page.locator('[data-step="forward"]').click();
 const after=await page.locator("#worldCanvas").evaluate(canvas=>canvas.toDataURL());
 expect(after).not.toBe(original);
 const position=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).position,trailKey);
 expect(position.z).toBeGreaterThan(0);
 await page.locator("#worldCanvas").focus();
 await page.keyboard.press("ArrowRight");
 const second=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).position,trailKey);
 expect(second.heading).toBeGreaterThan(position.heading);
 await page.keyboard.press("w");
 const third=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).position,trailKey);
 expect(third.x).not.toEqual(second.x);
 await expect(page.locator("#inspectSite")).toBeDisabled();
 expect(errors).toEqual([]);
});

test("3D trails: discover science site, preserve progress on reload, and never touch 80 missions",async({page})=>{
 const unchanged={level:15,unlocked:16,solved:Array.from({length:15},(_,i)=>i+1),fieldGuide:["trike","rex"]};
 await page.addInitScript(([key,value])=>localStorage.setItem(key,JSON.stringify(value)),[missionKey,unchanged]);
 await page.goto(route);
 await page.getByRole("button",{name:"Travel to Coelophysis"}).click();
 await expect(page.locator("#inspectSite")).toBeEnabled();
 await page.locator("#inspectSite").click();
 await expect(page.locator("#visitCount")).toHaveText("1");
 await expect(page.locator("#fieldFact")).toContainText("Late Triassic");
 let recorded=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),trailKey);
 expect(recorded.discovered).toEqual(["coelophysis"]);
 await page.locator("#inspectSite").click();
 recorded=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),trailKey);
 expect(recorded.discovered).toEqual(["coelophysis"]);
 await page.reload();
 await expect(page.locator("#visitCount")).toHaveText("1");
 await page.locator('[data-portal="jurassic"]').click();
 await expect(page.locator("#periodTitle")).toContainText("Jurassic");
 await expect(page.locator("#stationList .station")).toHaveCount(3);
 await page.getByRole("button",{name:"Travel to Stegosaurus"}).click();
 await page.locator("#inspectSite").click();
 await expect(page.locator("#visitCount")).toHaveText("2");
 const mission=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),missionKey);
 expect(mission).toEqual(unchanged);
});

test("3D trails: all nine stops reachable, mobile reflows, dark high-contrast settings work",async({page})=>{
 await page.goto(route);
 for(const portal of ["triassic","jurassic","cretaceous"]){
  await page.locator('[data-portal="'+portal+'"]').click();
  const stations=await page.locator(".station .visit-button").allTextContents();
  expect(stations).toHaveLength(3);
  for(const name of stations){
   await page.getByRole("button",{name}).click();
   await expect(page.locator("#inspectSite")).toBeEnabled();
   await page.locator("#inspectSite").click();
  }
 }
 await expect(page.locator("#visitCount")).toHaveText("9");
 await expect(page.locator("#trailBadge")).toBeVisible();
 const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),trailKey);
 expect(saved.discovered).toHaveLength(9);
 await page.evaluate(()=>window.LarriVerseArcade.setSettings({darkMode:true,highContrast:true,reducedMotion:true}));
 await page.setViewportSize({width:390,height:844});
 const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
 expect(layout.scroll).toBeLessThanOrEqual(layout.width+4);
 await expect(page.locator("#worldCanvas")).toBeVisible();
 await expect(page.locator("#stationList .station")).toHaveCount(3);
 await page.reload();
 await expect(page.locator("#visitCount")).toHaveText("9");
});

test("3D trails: wider dinosaur framing, vertical look and backward-compatible local saves",async({page})=>{
 await page.goto(route);
 const first=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).position,trailKey);
 expect(first.pitch).toBeCloseTo(-.12,5);
 const before=await page.locator("#worldCanvas").evaluate(c=>c.toDataURL());
 await page.locator('[data-step="look-up"]').click();
 const after=await page.locator("#worldCanvas").evaluate(c=>c.toDataURL());
 expect(after).not.toBe(before);
 const pitched=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).position,trailKey);
 expect(pitched.pitch).toBeLessThan(first.pitch);
 await page.locator('[data-step="look-down"]').click();
 await page.getByRole("button",{name:"Travel to Coelophysis"}).click();
 const atSite=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).position,trailKey);
 expect(atSite.x).toBe(-3);
 expect(atSite.z).toBeCloseTo(3.5,3);
 expect(atSite.pitch).toBeCloseTo(-.12,5);
 await expect(page.locator("#inspectSite")).toBeEnabled();
 await page.locator("#worldCanvas").focus();
 await page.keyboard.press("PageDown");
 const keyboardPitch=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).position.pitch,trailKey);
 expect(keyboardPitch).toBeGreaterThan(atSite.pitch);
 await page.reload();
 const restored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).position,trailKey);
 expect(restored.pitch).toBeCloseTo(keyboardPitch,5);
 await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({version:1,position:{period:"jurassic",x:1,z:4,heading:.4},discovered:[]})),trailKey);
 await page.reload();
 const legacy=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).position,trailKey);
 expect(legacy.pitch).toBeCloseTo(-.12,5);
 expect(legacy.x).toBe(1);
 expect(legacy.z).toBe(4);
 expect(legacy.heading).toBeCloseTo(.4,5);
});
