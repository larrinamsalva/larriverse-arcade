import { test, expect } from "@playwright/test";

test("Date Detective: eighty cases, saved progression, clear wrong feedback", async ({page}) => {
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/games/date-detective/");

  const count=await page.evaluate(async()=>(
    await import("/games/date-detective/challenges.js")
  ).DATE_DETECTIVE_CHALLENGES.length);
  expect(count).toBe(80);
  await expect(page.locator(".chapter-chip")).toHaveCount(8);
  await expect(page.locator("#levelReadout")).toHaveText("Level 1 of 80");

  await page.locator('[data-answer="1"]').click();
  await expect(page.locator("#feedbackBanner")).toContainText("Not quite");
  await expect(page.locator("#nextButton")).toBeDisabled();

  await page.locator("#clearChoiceButton").click();
  await expect(page.locator("#feedbackBanner")).toContainText("Choice cleared");

  await page.locator('[data-answer="0"]').click();
  await expect(page.locator("#feedbackBanner")).toContainText("Correct");
  await expect(page.locator("#nextButton")).toBeEnabled();

  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.dateDetective.v1")));
  expect(saved.solved).toEqual([1]);
  expect(saved.unlocked).toBe(2);

  await page.locator("#nextButton").click();
  await expect(page.locator("#levelReadout")).toHaveText("Level 2 of 80");
  await page.reload();
  await expect(page.locator("#levelReadout")).toHaveText("Level 2 of 80");
  expect(errors).toEqual([]);
});

test("Date Detective: all chapters can be revisited after unlock and formula rule is explicit", async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem("larriverse.dateDetective.v1",JSON.stringify({level:40,unlocked:80,solved:Array.from({length:40},(_,i)=>i+1)}));
  });
  await page.goto("/games/date-detective/");
  await expect(page.locator("#caseNumber")).toHaveText("Case 41");
  await expect(page.locator("#packageName")).toHaveText("Infant Formula");
  await expect(page.locator("#dateLabel")).toContainText("USE BY");

  const correct=page.locator('[data-answer="0"]');
  await correct.click();
  await expect(page.locator("#explanationText")).toContainText(/do not use|FDA/i);

  await page.locator('[data-chapter="6"]').click();
  await expect(page.locator("#caseNumber")).toHaveText("Case 61");
  await expect(page.locator("#dateLabel")).toContainText("LOT");

  await page.setViewportSize({width:390,height:844});
  const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  expect(layout.scroll).toBeLessThanOrEqual(layout.width+4);
});

test("Date Detective: dark and high-contrast modes keep the date label readable", async ({page}) => {
  await page.goto("/games/date-detective/");
  await page.evaluate(()=>window.LarriVerseArcade.setSettings({darkMode:true,highContrast:false,reducedMotion:true}));
  await expect(page.locator("#dateLabel")).toBeVisible();
  let color=await page.locator("#dateLabel").evaluate(el=>getComputedStyle(el).color);
  expect(color).not.toBe("rgba(0, 0, 0, 0)");

  await page.evaluate(()=>window.LarriVerseArcade.setSettings({darkMode:true,highContrast:true,reducedMotion:true}));
  const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  expect(layout.scroll).toBeLessThanOrEqual(layout.width+4);
});
