import { test, expect } from "@playwright/test";

test("Creative Calm Cove: eighty open prompts, generators and local progress", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/games/creative-calm-cove/");

  await expect(page.locator("#promptSelect option")).toHaveCount(80);
  await expect(page.locator(".chapter-chip")).toHaveCount(8);
  await expect(page.locator("#promptCounter")).toHaveText("1 / 80");
  await expect(page.locator("#progressText")).toContainText("0 of 80");

  await page.locator("#completePrompt").click();
  await expect(page.locator("#progressText")).toContainText("1 of 80");
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem("larriverse.creativeCalmCove.v1")));
  expect(saved.completed).toEqual([1]);

  await page.locator("#nextPrompt").click();
  await expect(page.locator("#promptCounter")).toHaveText("2 / 80");
  await page.selectOption("#symmetryMode", "radial6");
  await page.locator("#spiroButton").click();
  await expect(page.locator("#saveStatus")).toContainText("Spiro Garden");

  const colored = await page.evaluate(() => {
    const canvas = document.querySelector("#artCanvas");
    const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) count++;
    }
    return count;
  });
  expect(colored).toBeGreaterThan(500);

  await page.locator("#creatureButton").click();
  await page.locator('[data-sticker="⭐"]').click();
  await page.locator("#undoButton").click();
  await page.locator("#redoButton").click();
  await page.locator("#saveButton").click();

  await page.reload();
  await expect(page.locator("#promptCounter")).toHaveText("2 / 80");
  await expect(page.locator("#progressText")).toContainText("1 of 80");
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem("larriverse.creativeCalmCove.v1")));
  expect(saved.snapshot).toMatch(/^data:image\/png;base64,/);
  expect(errors).toEqual([]);
});

test("Creative Calm Cove: freehand pointer drawing and mobile reflow", async ({ page }) => {
  await page.goto("/games/creative-calm-cove/");
  const box = await page.locator("#artCanvas").boundingBox();
  expect(box).toBeTruthy();

  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.35);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.62, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator("#saveStatus")).toContainText("Saved");

  await page.setViewportSize({ width: 390, height: 844 });
  const layout = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: document.documentElement.clientWidth
  }));
  expect(layout.scroll).toBeLessThanOrEqual(layout.width + 4);
});
