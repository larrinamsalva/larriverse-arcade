import { test, expect } from "@playwright/test";
import { creatureMissions, roadMissions } from "../../assets/classic-adventure-missions.js";

test("Creature Catcher: all sixty unique quests are playable and original safari survives",async({page})=>{
 await (async function playFullJourney({page},route,buttonLabel,deck){
 test.setTimeout(300000);
 const errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 await page.goto("/games/"+route+"/index.html");
 await expect(page.locator("#startButton")).toBeVisible();
 await expect(page.locator("[data-adventure-mission]")).toBeVisible();
 await page.getByRole("button",{name:buttonLabel}).click();
 const dialog=page.locator("#adventureMissionDialog");
 await expect(dialog).toBeVisible();
 for(let i=0;i<60;i++){
   const mission=deck[i];
   await expect(dialog.locator("[data-mission-id]")).toHaveAttribute("data-mission-id",mission.id);
   await expect(dialog.locator("#adventurePrompt")).toHaveText(mission.prompt);
   if(i===0){
      await dialog.getByRole("button",{name:"Show a free hint"}).click();
      await expect(dialog.locator("#adventureFeedback")).toHaveClass(/hint/);
      await dialog.locator(`[data-choice="${(mission.answer+1)%3}"]`).click();
      await expect(dialog.locator("#adventureFeedback")).toHaveClass(/retry/);
      await expect(dialog.locator("[data-mission-id]")).toHaveAttribute("data-mission-id",mission.id);
   }
   await dialog.locator(`[data-choice="${mission.answer}"]`).click();
   await expect(dialog.locator("#adventureFeedback")).toHaveClass(/correct/);
   const saveKey="larriverse.classicMissions."+route+".v1";
   const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||"{}").next,saveKey);
   expect(saved).toBe(i+1);
   await dialog.getByRole("button",{name:i===59?"Finish my adventure":"Next mission"}).click();
 }
 await expect(dialog).toContainText("All 60 adventures complete!");
 await dialog.getByRole("button",{name:"Return to the original game"}).click();
 await expect(dialog).not.toBeVisible();
 await expect(page.locator("#startButton")).toBeVisible();
 expect(errors).toEqual([]);
})({page},"creature-catcher","🦋 Explore 60 wildlife quests",creatureMissions);
});

test("Road Trip Quest: all sixty planning quests are playable and the eight-city game survives",async({page})=>{
 await (async function playFullJourney({page},route,buttonLabel,deck){
 test.setTimeout(300000);
 const errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 await page.goto("/games/"+route+"/index.html");
 await expect(page.locator("#startButton")).toBeVisible();
 await expect(page.locator("[data-adventure-mission]")).toBeVisible();
 await page.getByRole("button",{name:buttonLabel}).click();
 const dialog=page.locator("#adventureMissionDialog");
 await expect(dialog).toBeVisible();
 for(let i=0;i<60;i++){
   const mission=deck[i];
   await expect(dialog.locator("[data-mission-id]")).toHaveAttribute("data-mission-id",mission.id);
   await expect(dialog.locator("#adventurePrompt")).toHaveText(mission.prompt);
   if(i===0){
      await dialog.getByRole("button",{name:"Show a free hint"}).click();
      await expect(dialog.locator("#adventureFeedback")).toHaveClass(/hint/);
      await dialog.locator(`[data-choice="${(mission.answer+1)%3}"]`).click();
      await expect(dialog.locator("#adventureFeedback")).toHaveClass(/retry/);
      await expect(dialog.locator("[data-mission-id]")).toHaveAttribute("data-mission-id",mission.id);
   }
   await dialog.locator(`[data-choice="${mission.answer}"]`).click();
   await expect(dialog.locator("#adventureFeedback")).toHaveClass(/correct/);
   const saveKey="larriverse.classicMissions."+route+".v1";
   const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||"{}").next,saveKey);
   expect(saved).toBe(i+1);
   await dialog.getByRole("button",{name:i===59?"Finish my adventure":"Next mission"}).click();
 }
 await expect(dialog).toContainText("All 60 adventures complete!");
 await dialog.getByRole("button",{name:"Return to the original game"}).click();
 await expect(dialog).not.toBeVisible();
 await expect(page.locator("#startButton")).toBeVisible();
 expect(errors).toEqual([]);
})({page},"road-trip-quest","🗺️ Explore 60 travel quests",roadMissions);
});

test("Classic adventure quest progress resumes after reload",async function resumeQuest({page}){
 await page.goto("/games/creature-catcher/index.html");
 await page.getByRole("button",{name:"🦋 Explore 60 wildlife quests"}).click();
 const d=page.locator("#adventureMissionDialog");
 await expect(d).toBeVisible();
 await d.locator(`[data-choice="${creatureMissions[0].answer}"]`).click();
 await expect(d.locator("#adventureFeedback")).toHaveClass(/correct/);
 await page.reload();
 await page.getByRole("button",{name:"🦋 Explore 60 wildlife quests"}).click();
 await expect(page.locator("[data-mission-id]")).toHaveAttribute("data-mission-id","creature-02");
 await page.locator("#adventureClose").click();
 await expect(page.locator("#startButton")).toBeVisible();
});
