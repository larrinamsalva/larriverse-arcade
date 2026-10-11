
import { test, expect } from "@playwright/test";
import { familyMissions, sweatMissions, lifeMissions } from "../../assets/final-three-missions.js";

test("KidsCoin Family: complete all 60 approved money lessons without parent actions",async({page})=>{
  await (async function testFull({page},id,buttonLabel,deck){
 test.setTimeout(390000);
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/games/"+id+"/index.html");
 if(id==="kidscoin-family")await expect(page.locator("#view")).not.toContainText("Loading");
 if(id==="brain-sweat-expanded")await expect(page.locator("#worldGrid")).not.toContainText("Opening the workshop");
 if(id==="brain-sweat-life-skills")await expect(page.locator("#worldGrid")).not.toContainText("Loading the learning worlds");
 await page.getByRole("button",{name:buttonLabel}).click();
 const dialog=page.locator("#adventureMissionDialog");
 await expect(dialog).toBeVisible();
 for(let i=0;i<60;i++){
   const mission=deck[i];
   await expect(dialog.locator("[data-mission-id]")).toHaveAttribute("data-mission-id",mission.id);
   await expect(dialog.locator("#adventurePrompt")).toHaveText(mission.prompt);
   if(i===0){
     const badChoice=(mission.answer+1)%mission.options.length;
     await dialog.locator(`[data-choice="${badChoice}"]`).click();
     await expect(dialog.locator("#adventureFeedback")).toHaveClass(/retry/);
     await expect(dialog.locator("[data-mission-id]")).toHaveAttribute("data-mission-id",mission.id);
     await dialog.getByRole("button",{name:"Show a free hint"}).click();
     await expect(dialog.locator("#adventureFeedback")).toHaveClass(/hint/);
   }
   await dialog.locator(`[data-choice="${mission.answer}"]`).click();
   await expect(dialog.locator("#adventureFeedback")).toHaveClass(/correct/);
   if([0,19,39,59].includes(i)){
     const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem("larriverse.classicMissions."+id+".v1")||"{}").next,id);
     expect(saved).toBe(i+1);
   }
   await dialog.getByRole("button",{name:i===59?"Finish my adventure":"Next mission"}).click();
 }
 await expect(dialog).toContainText("All 60 adventures complete!");
 await dialog.getByRole("button",{name:"Return to the original game"}).click();
 await expect(dialog).not.toBeVisible();
 if(id==="kidscoin-family"){
   await expect(page.locator("#parentButton")).toBeVisible();
   await expect(page.locator('[data-tab="learn"]')).toBeVisible();
 }
 if(id==="brain-sweat-expanded")await expect(page.locator("#worldGrid")).toBeVisible();
 if(id==="brain-sweat-life-skills")await expect(page.locator("#worldGrid")).toBeVisible();
 expect(errors).toEqual([]);
})({page},"kidscoin-family","🪙 Explore 60 family money missions",familyMissions);
});
test("Brain Sweat Expanded: complete 60 authentic reviewed workshop problems",async({page})=>{
  await (async function testFull({page},id,buttonLabel,deck){
 test.setTimeout(390000);
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/games/"+id+"/index.html");
 if(id==="kidscoin-family")await expect(page.locator("#view")).not.toContainText("Loading");
 if(id==="brain-sweat-expanded")await expect(page.locator("#worldGrid")).not.toContainText("Opening the workshop");
 if(id==="brain-sweat-life-skills")await expect(page.locator("#worldGrid")).not.toContainText("Loading the learning worlds");
 await page.getByRole("button",{name:buttonLabel}).click();
 const dialog=page.locator("#adventureMissionDialog");
 await expect(dialog).toBeVisible();
 for(let i=0;i<60;i++){
   const mission=deck[i];
   await expect(dialog.locator("[data-mission-id]")).toHaveAttribute("data-mission-id",mission.id);
   await expect(dialog.locator("#adventurePrompt")).toHaveText(mission.prompt);
   if(i===0){
     const badChoice=(mission.answer+1)%mission.options.length;
     await dialog.locator(`[data-choice="${badChoice}"]`).click();
     await expect(dialog.locator("#adventureFeedback")).toHaveClass(/retry/);
     await expect(dialog.locator("[data-mission-id]")).toHaveAttribute("data-mission-id",mission.id);
     await dialog.getByRole("button",{name:"Show a free hint"}).click();
     await expect(dialog.locator("#adventureFeedback")).toHaveClass(/hint/);
   }
   await dialog.locator(`[data-choice="${mission.answer}"]`).click();
   await expect(dialog.locator("#adventureFeedback")).toHaveClass(/correct/);
   if([0,19,39,59].includes(i)){
     const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem("larriverse.classicMissions."+id+".v1")||"{}").next,id);
     expect(saved).toBe(i+1);
   }
   await dialog.getByRole("button",{name:i===59?"Finish my adventure":"Next mission"}).click();
 }
 await expect(dialog).toContainText("All 60 adventures complete!");
 await dialog.getByRole("button",{name:"Return to the original game"}).click();
 await expect(dialog).not.toBeVisible();
 if(id==="kidscoin-family"){
   await expect(page.locator("#parentButton")).toBeVisible();
   await expect(page.locator('[data-tab="learn"]')).toBeVisible();
 }
 if(id==="brain-sweat-expanded")await expect(page.locator("#worldGrid")).toBeVisible();
 if(id==="brain-sweat-life-skills")await expect(page.locator("#worldGrid")).toBeVisible();
 expect(errors).toEqual([]);
})({page},"brain-sweat-expanded","🧠 Explore 60 reviewed workshop missions",sweatMissions);
});
test("Brain Sweat Life Skills: complete all 60 reviewed practical life questions",async({page})=>{
  await (async function testFull({page},id,buttonLabel,deck){
 test.setTimeout(390000);
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/games/"+id+"/index.html");
 if(id==="kidscoin-family")await expect(page.locator("#view")).not.toContainText("Loading");
 if(id==="brain-sweat-expanded")await expect(page.locator("#worldGrid")).not.toContainText("Opening the workshop");
 if(id==="brain-sweat-life-skills")await expect(page.locator("#worldGrid")).not.toContainText("Loading the learning worlds");
 await page.getByRole("button",{name:buttonLabel}).click();
 const dialog=page.locator("#adventureMissionDialog");
 await expect(dialog).toBeVisible();
 for(let i=0;i<60;i++){
   const mission=deck[i];
   await expect(dialog.locator("[data-mission-id]")).toHaveAttribute("data-mission-id",mission.id);
   await expect(dialog.locator("#adventurePrompt")).toHaveText(mission.prompt);
   if(i===0){
     const badChoice=(mission.answer+1)%mission.options.length;
     await dialog.locator(`[data-choice="${badChoice}"]`).click();
     await expect(dialog.locator("#adventureFeedback")).toHaveClass(/retry/);
     await expect(dialog.locator("[data-mission-id]")).toHaveAttribute("data-mission-id",mission.id);
     await dialog.getByRole("button",{name:"Show a free hint"}).click();
     await expect(dialog.locator("#adventureFeedback")).toHaveClass(/hint/);
   }
   await dialog.locator(`[data-choice="${mission.answer}"]`).click();
   await expect(dialog.locator("#adventureFeedback")).toHaveClass(/correct/);
   if([0,19,39,59].includes(i)){
     const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem("larriverse.classicMissions."+id+".v1")||"{}").next,id);
     expect(saved).toBe(i+1);
   }
   await dialog.getByRole("button",{name:i===59?"Finish my adventure":"Next mission"}).click();
 }
 await expect(dialog).toContainText("All 60 adventures complete!");
 await dialog.getByRole("button",{name:"Return to the original game"}).click();
 await expect(dialog).not.toBeVisible();
 if(id==="kidscoin-family"){
   await expect(page.locator("#parentButton")).toBeVisible();
   await expect(page.locator('[data-tab="learn"]')).toBeVisible();
 }
 if(id==="brain-sweat-expanded")await expect(page.locator("#worldGrid")).toBeVisible();
 if(id==="brain-sweat-life-skills")await expect(page.locator("#worldGrid")).toBeVisible();
 expect(errors).toEqual([]);
})({page},"brain-sweat-life-skills","📚 Explore 60 reviewed life-skill missions",lifeMissions);
});
test("KidsCoin optional missions resume after reload and never unlock parent mode",async function testResume({page}){
 await page.goto("/games/kidscoin-family/index.html");
 const label="🪙 Explore 60 family money missions";
 await page.getByRole("button",{name:label}).click();
 const d=page.locator("#adventureMissionDialog");
 await d.locator(`[data-choice="${familyMissions[0].answer}"]`).click();
 await expect(d.locator("#adventureFeedback")).toHaveClass(/correct/);
 await page.reload();
 await page.getByRole("button",{name:label}).click();
 await expect(page.locator("[data-mission-id]")).toHaveAttribute("data-mission-id","family-02");
 await page.locator("#adventureClose").click();
 await expect(page.locator("#parentButton")).toBeVisible();
 const original=await page.evaluate(()=>localStorage.getItem("larriverse.kidscoinFamily.v1"));
 expect(original).toBeTruthy();
});
