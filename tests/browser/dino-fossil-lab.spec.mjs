import {test,expect} from "@playwright/test";

const route="/games/dino-discovery-world/fossil-lab.html";
const key="larriverse.dinoFossilLab.v1",missions="larriverse.dinoDiscovery.v1",trail="larriverse.dinoExplorer.v1";

async function brushFully(page){
  for(let i=0;i<4;i++)await page.locator("#brushLayer").click();
  await expect(page.locator("#brushCount")).toHaveText("4 of 4 layers");
  await expect(page.locator(".science-choice").first()).toBeEnabled();
}

test("3D fossil lab: rotate a model, brush layers, answer from evidence and persist discovery",async({page})=>{
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(route);
  await expect(page.locator("[data-specimen]")).toHaveCount(3);
  await expect(page.locator("#specimenName")).toContainText("Mineralized Bone");
  const before=await page.locator("#fossilCanvas").evaluate(canvas=>canvas.toDataURL());
  await page.locator("#rotateRight").click();
  const after=await page.locator("#fossilCanvas").evaluate(canvas=>canvas.toDataURL());
  expect(after).not.toBe(before);
  await expect(page.locator(".science-choice").first()).toBeDisabled();
  await page.locator("#brushLayer").click();
  await expect(page.locator("#brushCount")).toHaveText("1 of 4 layers");
  const partial=await page.locator("#fossilCanvas").evaluate(canvas=>canvas.toDataURL());
  expect(partial).not.toBe(after);
  for(let i=0;i<3;i++)await page.locator("#brushLayer").click();
  await expect(page.locator(".science-choice").first()).toBeEnabled();
  await page.locator(".science-choice").nth(1).click();
  await expect(page.locator("#labFeedback")).toContainText("Look again");
  await page.locator(".science-choice").first().click();
  await expect(page.locator("#labFeedback")).toContainText("Careful discovery recorded");
  await expect(page.locator("#fossilsFound")).toHaveText("1");
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  expect(saved.solved).toEqual(["bone"]);
  expect(saved.progress.bone).toBe(4);
  await page.reload();
  await expect(page.locator("#brushLayer")).toBeDisabled();
  await expect(page.locator("#fossilsFound")).toHaveText("1");
  await expect(page.locator("#labExplanation")).toBeVisible();
  expect(errors).toEqual([]);
});

test("3D fossil lab: all evidence categories complete without changing trail or 80 missions",async({page})=>{
  const oldMissions={level:24,unlocked:26,solved:[1,2,3,4,5],fieldGuide:["rex"]};
  const oldTrail={version:1,position:{period:"cretaceous",x:0,z:12,heading:0},discovered:["fossil-bluff"]};
  await page.addInitScript(([a,b,c,d])=>{
    if(!localStorage.getItem(a))localStorage.setItem(a,JSON.stringify(b));
    if(!localStorage.getItem(c))localStorage.setItem(c,JSON.stringify(d));
  },[missions,oldMissions,trail,oldTrail]);
  await page.goto(route);
  const answers={bone:0,track:1,leaf:2};
  for(const specimen of ["bone","track","leaf"]){
    await page.locator('[data-specimen="'+specimen+'"]').click();
    await brushFully(page);
    await page.locator(".science-choice").nth(answers[specimen]).click();
    await expect(page.locator("#labFeedback")).toContainText("Careful discovery recorded");
  }
  await expect(page.locator("#fossilsFound")).toHaveText("3");
  await expect(page.locator("#fossilBadge")).toBeVisible();
  const all=await page.evaluate(([a,b,c])=>({
    lab:JSON.parse(localStorage.getItem(a)),
    missions:JSON.parse(localStorage.getItem(b)),
    trail:JSON.parse(localStorage.getItem(c))
  }),[key,missions,trail]);
  expect(all.lab.solved).toEqual(["bone","track","leaf"]);
  expect(all.missions).toEqual(oldMissions);
  expect(all.trail).toEqual(oldTrail);
  await page.reload();
  await expect(page.locator("#fossilBadge")).toBeVisible();
  expect(await page.locator(".fossil-card.complete").count()).toBe(3);
});

test("3D fossil lab: linked from 80 missions and Fossil Bluff, readable on mobile in dark mode",async({page})=>{
  await page.goto("/games/dino-discovery-world/");
  await expect(page.locator('a[href="fossil-lab.html"]')).toBeVisible();
  await page.goto("/games/dino-discovery-world/explore.html");
  await page.locator('[data-portal="cretaceous"]').click();
  await expect(page.locator('a.fossil-visit-link[href="fossil-lab.html"]')).toBeVisible();
  await page.locator('a.fossil-visit-link[href="fossil-lab.html"]').click();
  await expect(page.locator("#labTitle")).toContainText("Fossil");
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({theme:"dark",highContrast:true,reducedMotion:true}));
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator("#fossilCanvas")).toBeVisible();
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.viewport+4);
  await page.locator('[data-specimen="leaf"]').click();
  await expect(page.locator("#specimenName")).toContainText("Leaf");
  await expect(page.locator("#brushLayer")).toBeEnabled();
});
