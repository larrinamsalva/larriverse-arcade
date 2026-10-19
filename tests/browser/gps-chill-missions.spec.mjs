import { test, expect } from "@playwright/test";
import { gpsMissions, chillMissions } from "../../assets/gps-chill-missions.js";

async function runMissionTrail(page,gameId,launchText,deck){
  const errors=[]; page.on("pageerror",e=>errors.push(e.message));
  if(gameId==="chill-brain-rewards"){
    await page.addInitScript(()=>{
      if(location.pathname.includes("/games/chill-brain-rewards/")){
        localStorage.setItem("larriverse.chillBrain.v1",JSON.stringify({
          onboardingComplete:true,
          guide:{name:"Tester",age:"",avatar:"🌱",profile:"little"}
        }));
      }
    });
  }
  await page.goto(`/games/${gameId}/index.html`);
  const launch=page.getByRole("button",{name:launchText});
  await expect(launch).toBeVisible();
  await launch.click();
  const dialog=page.locator("#adventureMissionDialog");
  await expect(dialog).toBeVisible();

  for(let i=0;i<deck.length;i++){
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
    const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem(`larriverse.classicMissions.${id}.v1`)||"{}").next,gameId);
    expect(saved).toBe(i+1);
    await dialog.getByRole("button",{name:i===deck.length-1?"Finish my adventure":"Next mission"}).click();
  }

  await expect(dialog).toContainText(`All ${deck.length} adventures complete!`);
  await dialog.getByRole("button",{name:"Return to the original game"}).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(gameId==="chill-brain-rewards"?"#missionGrid":"#demoButton")).toBeVisible();
  expect(errors).toEqual([]);
}

test("GPS: 60 demo-map missions are solvable with original modes preserved",async({page})=>{
  test.setTimeout(360000);
  await runMissionTrail(page,"road-trip-quest-gps","🧭 Explore 60 offline map missions",gpsMissions);
});

test("Chill Brain: 80 untimed gentle missions are solvable without disrupting original sessions",async({page})=>{
  test.setTimeout(480000);
  expect(chillMissions).toHaveLength(80);
  await runMissionTrail(page,"chill-brain-rewards","🌿 Explore 80 gentle focus missions",chillMissions);
});

test("GPS privacy-mode missions resume after reload without location permission",async function gpsResume({page}){
  await page.goto("/games/road-trip-quest-gps/index.html");
  await page.getByRole("button",{name:"🧭 Explore 60 offline map missions"}).click();
  const d=page.locator("#adventureMissionDialog");
  await d.locator(`[data-choice="${gpsMissions[0].answer}"]`).click();
  await expect(d.locator("#adventureFeedback")).toHaveClass(/correct/);
  await page.reload();
  await page.getByRole("button",{name:"🧭 Explore 60 offline map missions"}).click();
  await expect(page.locator("[data-mission-id]")).toHaveAttribute("data-mission-id","gps-02");
  await page.locator("#adventureClose").click();
  await expect(page.locator("#demoButton")).toBeVisible();
  await expect(page.locator("#liveButton")).toBeVisible();
});
