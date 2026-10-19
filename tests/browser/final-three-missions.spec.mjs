import { test, expect } from "@playwright/test";
import { familyMissions, sweatMissions, lifeMissions } from "../../assets/final-three-missions.js";

async function completeMissionTrail(page,id,buttonLabel,deck){
  const errors=[]; page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/games/"+id+"/index.html");
  if(id==="kidscoin-family")await expect(page.locator("#view")).not.toContainText("Loading");
  if(id==="brain-sweat-expanded")await expect(page.locator("#worldGrid")).not.toContainText("Opening the workshop");
  if(id==="brain-sweat-life-skills")await expect(page.locator("#worldGrid")).not.toContainText("Loading the learning worlds");

  await page.getByRole("button",{name:buttonLabel}).click();
  const dialog=page.locator("#adventureMissionDialog");
  await expect(dialog).toBeVisible();
  const checkpoints=new Set([0,19,39,59,deck.length-1]);

  for(let i=0;i<deck.length;i++){
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
    if(checkpoints.has(i)){
      const saved=await page.evaluate(gameId=>JSON.parse(localStorage.getItem("larriverse.classicMissions."+gameId+".v1")||"{}").next,id);
      expect(saved).toBe(i+1);
    }
    await dialog.getByRole("button",{name:i===deck.length-1?"Finish my adventure":"Next mission"}).click();
  }

  await expect(dialog).toContainText(`All ${deck.length} adventures complete!`);
  await dialog.getByRole("button",{name:"Return to the original game"}).click();
  await expect(dialog).not.toBeVisible();
  if(id==="kidscoin-family"){
    await expect(page.locator("#parentButton")).toBeVisible();
    await expect(page.locator('[data-tab="learn"]')).toBeVisible();
  }
  if(id==="brain-sweat-expanded")await expect(page.locator("#worldGrid")).toBeVisible();
  if(id==="brain-sweat-life-skills")await expect(page.locator("#worldGrid")).toBeVisible();
  expect(errors).toEqual([]);
}

test("KidsCoin Family: complete all 60 approved money lessons without parent actions",async({page})=>{
  test.setTimeout(390000);
  await completeMissionTrail(page,"kidscoin-family","🪙 Explore 60 family money missions",familyMissions);
});

test("Brain Sweat Expanded: complete all 80 workshop learning missions",async({page})=>{
  test.setTimeout(520000);
  expect(sweatMissions).toHaveLength(80);
  await completeMissionTrail(page,"brain-sweat-expanded","🧠 Explore 80 workshop learning missions",sweatMissions);
});

test("Brain Sweat Life Skills: complete all 80 life-skill missions",async({page})=>{
  test.setTimeout(520000);
  expect(lifeMissions).toHaveLength(80);
  await completeMissionTrail(page,"brain-sweat-life-skills","📚 Explore 80 life-skill missions",lifeMissions);
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
