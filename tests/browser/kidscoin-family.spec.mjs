import { test, expect } from "@playwright/test";

test("KidsCoin Family: chore growth graph rises only for approved chore earnings", async ({ page }) => {
  await page.goto("/games/kidscoin-family/index.html");
  await expect(page.locator("#choreGrowthSvg")).toBeVisible();
  await expect(page.locator("#choreGrowthTotal")).toHaveText("0 KC");

  await page.evaluate(() => {
    const key = "larriverse.kidscoinFamily.v1";
    const state = JSON.parse(localStorage.getItem(key));
    const profile = state.profiles[0];
    profile.balance = 6;
    profile.tx = [
      { id:"spend-1", type:"spend", amount:3, label:"Choose the family movie", icon:"🎬", source:"reward", at:"2026-10-18T18:04:00.000Z" },
      { id:"legacy-chore", type:"earn", amount:3, label:"Brush teeth", icon:"🪥", at:"2026-10-18T18:03:00.000Z" },
      { id:"lesson-1", type:"earn", amount:3, label:"Earn before spending", icon:"🌱", source:"lesson", at:"2026-10-18T18:02:00.000Z" },
      { id:"chore-1", type:"earn", amount:6, label:"Make the bed", icon:"🛏️", source:"chore", at:"2026-10-18T18:01:00.000Z" }
    ];
    localStorage.setItem(key, JSON.stringify(state));
  });

  await page.reload();
  await expect(page.locator("#choreGrowthTotal")).toHaveText("9 KC");
  await expect(page.locator("#choreGrowthCount")).toHaveText("2");
  await expect(page.locator("#choreGrowthLatest")).toContainText("+3 KC · Brush teeth");
  await expect(page.locator(".kc-chart-point")).toHaveCount(2);
  await expect(page.locator("#choreGrowthSvg")).toHaveAttribute("aria-label", /earned 9 fictional Family KC from 2 approved chores/i);
  await expect(page.locator(".kc-growth-note")).toContainText("not cryptocurrency, a market price, or real money");
});
