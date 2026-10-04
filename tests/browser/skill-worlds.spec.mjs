import { test, expect } from "@playwright/test";
import {
  worlds,
  messages,
  conversations,
  newsCards,
  repairs,
  sorting,
} from "../../assets/skill-worlds.js";

async function round(page, id, play) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/games/${id}/index.html`);
  await expect(page.locator("#gameBoard")).not.toBeEmpty();
  await expect(page.locator("#soundToggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await play();
  await expect(page.locator("#finishDialog")).toBeVisible();
  const saved = await page.evaluate(
    (id) => window.LarriVerseArcade.summary().games[id],
    id,
  );
  expect(saved.completions).toBe(1);
  expect(saved.metrics.practiceRuns).toBe(1);
  await page.locator("#closeFinish").click();
  await page.locator("#restartButton").click();
  await expect(page.locator("#finishDialog")).not.toBeVisible();
  expect(
    (
      await page.evaluate(
        (id) => window.LarriVerseArcade.summary().games[id],
        id,
      )
    ).completions,
  ).toBe(1);
  const size = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: document.documentElement.clientWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.width + 4);
  await page.reload();
  await expect(page.locator("#bestScore")).not.toHaveText("—");
  expect(errors).toEqual([]);
}
async function chooseDeck(page, deck, labels) {
  for (let i = 0; i < deck.length; i++) {
    const text = await page.locator(".message-card").innerText();
    const item = deck.find((item) => text.includes(item.text || item.name));
    expect(item).toBeTruthy();
    const answer = item.answer ?? item.bin;
    await page
      .getByRole("button", {
        name: labels ? labels[answer] : item.options[answer],
        exact: true,
      })
      .click();
    await expect(page.locator("#feedback")).toHaveClass(/good/);
    await page
      .getByRole("button", {
        name: i === deck.length - 1 ? "See what I learned" : "Next discovery",
        exact: true,
      })
      .click();
  }
}

test("Pocket Planet: needs, savings, unaffordable purchase, and saved completion", async ({
  page,
}) => {
  await round(page, "pocket-planet", async () => {
    await page
      .getByRole("button", { name: "Try my plan", exact: true })
      .click();
    await expect(page.locator("#feedback")).toContainText("still needs");
    for (const item of [
      "Drinking water",
      "Picnic lunch",
      "Bus pass",
      "Giant toy boat",
    ])
      await page.getByRole("button", { name: new RegExp(item) }).click();
    await page
      .getByRole("button", { name: "Try my plan", exact: true })
      .click();
    await expect(page.locator("#feedback")).toContainText("telescope fund");
    await page.getByRole("button", { name: /Giant toy boat/ }).click();
    await page.getByRole("button", { name: /A little kite/ }).click();
    await page
      .getByRole("button", { name: "Try my plan", exact: true })
      .click();
  });
});
test("Scam Sleuth: complete shuffled messages and explanatory feedback", async ({
  page,
}) => {
  await round(page, "scam-sleuth", () =>
    chooseDeck(page, messages, [
      "Read it",
      "Check another way",
      "Block & tell an adult",
    ]),
  );
});
test("Kindness Quest: listen, set boundaries, and repair", async ({ page }) => {
  await round(page, "kindness-quest", () => chooseDeck(page, conversations));
});
test("Fact Finder: inspect sources, opinions, advertising, and claims", async ({
  page,
}) => {
  await round(page, "fact-finder", () =>
    chooseDeck(page, newsCards, [
      "Evidence",
      "Opinion",
      "Advertisement",
      "Needs checking",
    ]),
  );
});
test("Reuse Rally: sort objects with the displayed town rules", async ({
  page,
}) => {
  await round(page, "reuse-rally", () =>
    chooseDeck(page, sorting, ["Reuse", "Recycle", "Compost", "Trash"]),
  );
});
test("Repair Café: reject premature steps and sequence three repairs", async ({
  page,
}) => {
  await round(page, "repair-cafe", async () => {
    await page
      .getByRole("button", { name: repairs[0].steps[3], exact: true })
      .click();
    await expect(page.locator("#feedback")).toContainText("comes later");
    for (let i = 0; i < repairs.length; i++) {
      for (const step of repairs[i].steps)
        await page.getByRole("button", { name: step, exact: true }).click();
      await page
        .getByRole("button", {
          name: i === 2 ? "See my repairs" : "Next repair",
          exact: true,
        })
        .click();
    }
  });
});
test("Time Trail: use a legal route, gather all flags, and reach the picnic", async ({
  page,
}) => {
  await round(page, "time-trail", async () => {
    await page.locator('[data-tile="4"]').click();
    await expect(page.locator("#feedback")).toContainText("nearby");
    for (const tile of [15, 10, 5, 0, 1, 2, 3, 4, 9, 14, 9, 4])
      await page.locator(`[data-tile="${tile}"]`).click();
  });
});
test("Garden Guardians: share twelve drops and include pollinator flowers", async ({
  page,
}) => {
  await round(page, "garden-guardians", async () => {
    await page
      .getByRole("button", { name: "Start growing", exact: true })
      .click();
    await expect(page.locator("#feedback")).toContainText("Plant all six");
    for (let i = 0; i < 6; i++) {
      await page
        .locator(`[data-plant="${["carrot", "bean", "flower"][i % 3]}"]`)
        .click();
      await page.locator(`[data-plot="${i}"]`).click();
    }
    await page
      .getByRole("button", { name: "Start growing", exact: true })
      .click();
    for (let day = 0; day < 2; day++) {
      for (let i = 0; i < 6; i++)
        await page.locator(`[data-plot="${i}"]`).click();
      await page.getByRole("button", { name: "Next day", exact: true }).click();
    }
    await page
      .getByRole("button", { name: "Visit my garden", exact: true })
      .click();
  });
});
test("Energy Island: store a surplus and power the island at night", async ({
  page,
}) => {
  await round(page, "energy-island", async () => {
    for (const type of ["solar", "solar", "wind", "wind", "battery"])
      await page.locator(`[data-build="${type}"]`).click();
    await page
      .getByRole("button", { name: "Test my power mix", exact: true })
      .click();
    for (const day of ["cloudy", "night", "breezy"])
      await page
        .getByRole("button", { name: `Run ${day} day`, exact: true })
        .click();
    await expect(page.locator(".ledger")).toContainText("Night");
    await expect(
      page.locator(".ledger td").filter({ hasText: "Glowing" }),
    ).toHaveCount(4);
    await page
      .getByRole("button", { name: "See my island", exact: true })
      .click();
  });
});
test("Robot Rover: debug a collision and solve three command worlds", async ({
  page,
}) => {
  await round(page, "robot-rover", async () => {
    const command = async (c) => page.locator(`[data-command="${c}"]`).click();
    for (const c of ["L", "F", "F", "F"]) await command(c);
    await page
      .getByRole("button", { name: "Run my code", exact: true })
      .click();
    await expect(page.locator("#feedback")).toContainText("rock or edge");
    await page.getByRole("button", { name: "Clear code", exact: true }).click();
    for (const [i, program] of ["FF", "FFRFF", "LFFFFRFFFFRFF"].entries()) {
      for (const c of program) await command(c);
      await page
        .getByRole("button", { name: "Run my code", exact: true })
        .click();
      await expect(page.locator("#feedback")).toContainText("found the star");
      await page
        .getByRole("button", {
          name: i === 2 ? "See my rover" : "Next world",
          exact: true,
        })
        .click();
    }
  });
});
test("Lemonade Lab: four forecasts and a ledger balancing revenue minus cost", async ({
  page,
}) => {
  await round(page, "lemonade-lab", async () => {
    for (const stock of [8, 2, 12, 6]) {
      await page.locator("#stockInput").selectOption(String(stock));
      await page.locator("#priceInput").selectOption("3");
      await page
        .getByRole("button", { name: "Open for the day", exact: true })
        .click();
    }
    await expect(page.locator(".ledger tbody tr")).toHaveCount(4);
    await expect(page.locator(".stat-chip").first()).toContainText("70");
    await page
      .getByRole("button", { name: "Read my ledger", exact: true })
      .click();
  });
});
test("Beat Builder: compose, play silently, pause on hide, and save a pattern", async ({
  page,
}) => {
  await round(page, "beat-builder", async () => {
    const pattern = [
      [0, 4, 8, 12],
      [4, 12],
      [0, 2, 4, 6, 8, 10, 12, 14],
    ];
    for (let row = 0; row < 3; row++)
      for (const col of pattern[row])
        await page.locator(`[data-beat="${row},${col}"]`).click();
    await page.getByRole("button", { name: "Play beat", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Pause beat", exact: true }),
    ).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(
      page.getByRole("button", { name: "Play beat", exact: true }),
    ).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
    });
    await page
      .getByRole("button", { name: "Check my rhythm", exact: true })
      .click();
  });
});

test("New worlds retain readable controls at 200% font size with shared contrast", async ({
  page,
}) => {
  for (const world of worlds) {
    await page.goto(`/games/${world.id}/index.html`);
    await expect(page.locator("#gameBoard")).not.toBeEmpty();
    await page.evaluate(() => {
      window.LarriVerseArcade.setSettings({
        highContrast: true,
        reducedMotion: true,
      });
      document.documentElement.style.fontSize = "200%";
    });
    const size = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      width: document.documentElement.clientWidth,
    }));
    expect(size.scroll, world.id).toBeLessThanOrEqual(size.width + 4);
  }
});
