import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// The established expeditions.spec.mjs runs all 60 crossings. This focused
// review captures the miniature artwork and checks the responsive controls.
test("Bridge Buddies: 3-D tools, scenery, weak and completed spans", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const response = await page.goto("/games/bridge-buddies/index.html");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator(".bridge-backdrop")).toBeVisible();
  await expect(page.locator(".bridge-tool-art")).toHaveCount(3);
  const art = await page.locator(".bridge-tool-art").evaluateAll(nodes => nodes.map(node => node.innerHTML));
  expect(new Set(art).size).toBe(3);
  for (const part of ["plank", "beam", "triangle"]) {
    expect(art.some(svg => svg.includes('bridge-part-' + (part === "triangle" ? "truss" : part)))).toBeTruthy();
  }
  const folder = path.join("artifacts", "screenshots", testInfo.project.name);
  fs.mkdirSync(folder, { recursive: true });
  await page.locator(".bridge-tool-shelf").screenshot({
    path: path.join(folder, "bridge-tools-3d.png"), animations: "disabled"
  });
  await page.locator(".bridge-landscape").screenshot({
    path: path.join(folder, "bridge-before-supports-3d.png"), animations: "disabled"
  });
  const overflow = async () => page.evaluate(() => ({
    page: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth
  }));
  let dimensions = await overflow();
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 4);
  await page.locator('[data-tool="plank"]').click();
  for (let i = 0; i < 4; i++) await page.locator('[data-span="' + i + '"]').click();
  await page.getByRole("button", { name: "Test the crossing", exact: true }).click();
  await expect(page.locator(".bridge-span.weak")).toHaveCount(4);
  await page.locator(".bridge-landscape").screenshot({
    path: path.join(folder, "bridge-needs-stronger-supports-3d.png"), animations: "disabled"
  });
  await page.locator('[data-tool="triangle"]').click();
  for (let i = 0; i < 4; i++) await page.locator('[data-span="' + i + '"]').click();
  await page.getByRole("button", { name: "Test the crossing", exact: true }).click();
  await expect(page.locator(".bridge-landscape.crossed")).toBeVisible();
  await expect(page.getByRole("button", { name: "Next challenge" })).toBeEnabled();
  await page.locator(".bridge-landscape").screenshot({
    path: path.join(folder, "bridge-strong-crossing-3d.png"), animations: "disabled"
  });
  dimensions = await overflow();
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 4);
  expect(errors).toEqual([]);
});

test("Bridge Buddies: legible tools and support labels in dark/high contrast", async ({ page }) => {
  await page.goto("/games/bridge-buddies/index.html");
  for (const mode of ["larriverse-dark", "larriverse-high-contrast"]) {
    await page.evaluate(className => {
      document.documentElement.classList.remove("larriverse-dark", "larriverse-high-contrast");
      document.documentElement.classList.add(className);
    }, mode);
    await expect(page.locator(".bridge-tool-art")).toHaveCount(3);
    for (const id of ["plank", "beam", "triangle"]) {
      const tool = page.locator('[data-tool="' + id + '"]');
      await expect(tool).toBeEnabled();
      await expect(tool).toContainText(/Holds load/);
      const color = await tool.evaluate(element => getComputedStyle(element).color);
      expect(color).not.toBe("rgba(0, 0, 0, 0)");
    }
    await expect(page.locator(".load-label")).toHaveCount(4);
  }
});
