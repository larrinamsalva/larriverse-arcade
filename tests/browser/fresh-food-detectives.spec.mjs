import { test, expect } from "@playwright/test";
import { LEVELS, CHAPTERS } from "../../games/fresh-food-detectives/levels.js";

test("Fresh Food Detectives: 120 progressive label-reading levels and 3-D objects",async({page})=>{
  expect(LEVELS).toHaveLength(120);
  expect(CHAPTERS).toHaveLength(12);
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/games/fresh-food-detectives/index.html");
  await expect(page.locator("#levelCounter")).toHaveText("1 / 120");
  await expect(page.locator(".food-model")).toBeVisible();
  await expect(page.locator("#answers button")).toHaveCount(4);
  const first=LEVELS[0];
  await page.locator('[data-answer="'+first.answer+'"]').click();
  await expect(page.locator("#feedback")).toHaveClass(/success/);
  await expect(page.locator("#nextButton")).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("larriverse.freshFoodDetectives.v1")));
  expect(saved.unlocked).toBe(1);
  await page.evaluate(()=>{
    localStorage.setItem("larriverse.freshFoodDetectives.v1",JSON.stringify({unlocked:119,open:80,stars:Array(120).fill(0)}));
  });
  await page.reload();
  await expect(page.locator("#levelCounter")).toHaveText("81 / 120");
  await expect(page.locator("#bakeryChart")).toBeVisible();
  expect(errors).toEqual([]);
});

test("Fresh Food Detectives: sample bread-tie chart is explicitly non-universal",async({page})=>{
  await page.goto("/games/fresh-food-detectives/index.html");
  await page.evaluate(()=>{
    localStorage.setItem("larriverse.freshFoodDetectives.v1",JSON.stringify({unlocked:89,open:80,stars:Array(120).fill(0)}));
  });
  await page.reload();
  await expect(page.locator("#bakeryChart")).toBeVisible();
  await expect(page.locator("#bakeryChart")).toContainText("Real stores may use different colors");
  await expect(page.locator(".tie-legend span")).toHaveCount(5);
});