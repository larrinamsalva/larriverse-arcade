import { test, expect } from "@playwright/test";
import {
  worlds,
  messages,
  conversations,
  newsCards,
  repairs,
  sorting,
  trafficQuestions,
  robotLevels,
  weatherChallenges,
  gardenGrowthChallenges,
} from "../../assets/skill-worlds.js";
import { budgetAdventures } from "../../assets/budget-adventures.js";
import { gardenLevels, energyLevels } from "../../assets/garden-energy-levels.js";

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
async function chooseDeck(page, deck, labels, roundSize = 6) {
  for (let i = 0; i < roundSize; i++) {
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
        name: i === roundSize - 1 ? "See what I learned" : "Next discovery",
        exact: true,
      })
      .click();
  }
}
async function completePicturePath(page, deck) {
  const seen = new Set();
  let priorRank = null;
  await expect(page.locator(".level-node")).toHaveCount(4);
  for (let i = 0; i < deck.length; i++) {
    const title = await page.locator(".learning-question .board-title").innerText();
    const item = deck.find((entry) => entry.title === title);
    expect(item, `challenge ${title} belongs to the learning bank`).toBeTruthy();
    expect(seen.has(item.id), `${item.id} appears only once`).toBe(false);
    seen.add(item.id);
    await expect(page.locator(".learning-scene-art")).toHaveAttribute("role", "img");
    await expect(page.locator(".picture-choice")).toHaveCount(3);
    if (item.rank !== priorRank) {
      await expect(page.locator("#stageLabel")).toContainText(item.rank);
      priorRank = item.rank;
    }
    await page.getByRole("button", { name: item.options[item.answer].label, exact: true }).click();
    await expect(page.locator("#feedback")).toHaveClass(/good/);
    await page.locator("#gameActions button").click();
  }
  expect(seen.size).toBe(deck.length);
}
function shortestRobotProgram(level) {
  const moves = [-5, 1, 5, -1];
  const adjacent = (a, b) =>
    Math.abs(Math.floor(a / 5) - Math.floor(b / 5)) +
      Math.abs((a % 5) - (b % 5)) ===
    1;
  const queue = [{ player: level.start, dir: level.dir, program: "" }];
  const seen = new Set([`${level.start}:${level.dir}`]);
  for (let index = 0; index < queue.length; index++) {
    const state = queue[index];
    if (state.player === level.goal) return state.program;
    const forward = state.player + moves[state.dir];
    if (
      forward >= 0 &&
      forward < 25 &&
      adjacent(forward, state.player) &&
      !level.rocks.includes(forward)
    ) {
      const key = `${forward}:${state.dir}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push({
          player: forward,
          dir: state.dir,
          program: `${state.program}F`,
        });
      }
    }
    for (const [command, dir] of [
      ["L", (state.dir + 3) % 4],
      ["R", (state.dir + 1) % 4],
    ]) {
      const key = `${state.player}:${dir}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push({
          player: state.player,
          dir,
          program: `${state.program}${command}`,
        });
      }
    }
  }
  throw new Error(`No route found for ${level.name}`);
}

test("Pocket Planet: five different budgets, needs, savings, and saved completion", async ({ page }) => {
  await round(page, "pocket-planet", async () => {
    const seen = new Set();
    for (let step = 0; step < 5; step++) {
      const title = await page.locator(".budget-hero h2").innerText();
      const plan = budgetAdventures.find((candidate) => candidate.title === title);
      expect(plan, `known money mission: ${title}`).toBeTruthy();
      expect(seen.has(plan.id), `${plan.id} has not repeated this round`).toBe(false);
      seen.add(plan.id);
      await expect(page.locator("#stageLabel")).toContainText(`Adventure ${step + 1}/5`);
      await expect(page.locator(".budget-hero")).toContainText(plan.goal);
      await expect(page.locator("[data-buy]")).toHaveCount(6);
      await page.getByRole("button", { name: "Try my plan" }).click();
      await expect(page.locator("#feedback")).toContainText("still needs");
      for (let index = 0; index < 3; index++)
        await page.locator(`[data-buy="${index}"]`).click();
      const left = plan.coins - plan.items.filter((item) => item.need)
        .reduce((sum, item) => sum + item.cost, 0);
      const tempting = plan.items.findIndex(
        (item) => !item.need && item.cost <= left && left - item.cost < plan.save,
      );
      expect(tempting, `${plan.id} has an extra that risks savings`).toBeGreaterThanOrEqual(3);
      await page.locator(`[data-buy="${tempting}"]`).click();
      await page.getByRole("button", { name: "Try my plan" }).click();
      await expect(page.locator("#feedback")).toContainText("savings goal needs");
      await page.locator(`[data-buy="${tempting}"]`).click();
      await page.getByRole("button", { name: "Try my plan" }).click();
      if (step < 4) {
        await expect(page.locator("#feedback")).toContainText("Great plan");
        await page.getByRole("button", { name: "Next money mission" }).click();
      }
    }
    expect(seen.size).toBe(5);
  });
});

test("Pocket Planet: four replays reveal all twenty missions without repeats", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("/games/pocket-planet/index.html");
  const seen = new Set();
  for (let round = 0; round < 4; round++) {
    for (let stage = 0; stage < 5; stage++) {
      const title = await page.locator(".budget-hero h2").innerText();
      const plan = budgetAdventures.find((item) => item.title === title);
      expect(plan).toBeTruthy();
      expect(seen.has(plan.id), `${plan.id} should not repeat in four rounds`).toBe(false);
      seen.add(plan.id);
      for (let i = 0; i < 3; i++)
        await page.locator(`[data-buy="${i}"]`).click();
      await page.getByRole("button", { name: "Try my plan" }).click();
      if (stage < 4)
        await page.getByRole("button", { name: "Next money mission" }).click();
    }
    await expect(page.locator("#finishDialog")).toBeVisible();
    await page.locator("#closeFinish").click();
    if (round < 3) await page.locator("#restartButton").click();
  }
  expect(seen.size).toBe(20);
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
test("Scam Sleuth: center evidence stays readable in light, dark, and high contrast", async ({
  page,
}) => {
  await page.goto("/games/scam-sleuth/index.html");
  const readContrast = async (theme) => {
    await page.evaluate((selectedTheme) =>
      window.LarriVerseArcade.setSettings({ theme: selectedTheme, highContrast: false, largeText: false, reducedMotion: true }), theme);
    await expect(page.locator("html")).toHaveClass(new RegExp(`larriverse-${theme}`));
    return page.evaluate(() => {
      const channels = (color) => (color.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const luminance = (color) => {
        const values = channels(color).map((channel) => {
          const value = channel / 255;
          return value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
        });
        return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
      };
      const contrast = (foreground, background) => {
        const first = luminance(foreground), second = luminance(background);
        return (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
      };
      return [
        ["stage label", ".play-top", ".play-card"],
        ["message title", ".message-card .board-title", ".message-card"],
        ["message details", ".message-card p", ".message-card"],
        ["answer choice", ".choice-button", ".choice-button"],
        ["feedback", ".feedback", ".feedback"],
      ].map(([label, textSelector, surfaceSelector]) => {
        const text = getComputedStyle(document.querySelector(textSelector));
        const surface = getComputedStyle(document.querySelector(surfaceSelector));
        const backgrounds = surface.backgroundImage.match(/rgb\([^)]+\)/g) || [surface.backgroundColor];
        return { label, ratio: Math.min(...backgrounds.map((background) => contrast(text.color, background))) };
      });
    });
  };
  for (const theme of ["light", "dark"]) {
    const readings = await readContrast(theme);
    for (const reading of readings)
      expect(reading.ratio, `${theme} ${reading.label} contrast`).toBeGreaterThanOrEqual(4.5);
  }
  await page.evaluate(() => window.LarriVerseArcade.setSettings({ highContrast: true }));
  await expect(page.locator(".message-card")).toHaveCSS("background-color", "rgb(17, 17, 17)");
  await expect(page.locator(".message-card p")).toHaveCSS("color", "rgb(255, 255, 255)");
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
  await round(page, "reuse-rally", async () => {
    for (let i = 0; i < 6; i++) {
      const art = page.locator(".reuse-item-art");
      await expect(art).toBeVisible();
      await expect(art.locator(".object-model")).toHaveCount(1);
      const box = await art.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(90);
      expect(box?.height).toBeGreaterThanOrEqual(90);
      const text = await page.locator(".message-card").innerText();
      const item = sorting.find((entry) => text.includes(entry.name));
      expect(item).toBeTruthy();
      await expect(art.locator(`.object-model--${item.art}`)).toHaveCount(1);
      await page.getByRole("button", {
        name: ["Reuse", "Recycle", "Compost", "Trash"][item.bin],
        exact: true,
      }).click();
      await expect(page.locator("#feedback")).toHaveClass(/good/);
      await page.getByRole("button", {
        name: i === 5 ? "See what I learned" : "Next discovery",
        exact: true,
      }).click();
    }
  });
});
test("Traffic Town: identify ten different signs and safe road meanings", async ({ page }) => {
  await round(page, "traffic-town", () => chooseDeck(page, trafficQuestions, null, 10));
});
test("Traffic Town: six consecutive rounds rotate through sixty unseen signs", async ({ page }) => {
  await page.goto("/games/traffic-town/index.html");
  const playTrafficRound = async () => {
    const seen = [];
    for (let i = 0; i < 10; i++) {
      const text = await page.locator(".message-card p").innerText();
      expect(seen).not.toContain(text);
      seen.push(text);
      const item = trafficQuestions.find((question) => question.text === text);
      expect(item).toBeTruthy();
      await page.getByRole("button", { name: item.options[item.answer], exact: true }).click();
      await page.getByRole("button", { name: i === 9 ? "See what I learned" : "Next discovery", exact: true }).click();
    }
    return seen;
  };
  const allSeen = [];
  for (let roundIndex = 0; roundIndex < 6; roundIndex += 1) {
    const roundSeen = await playTrafficRound();
    expect(roundSeen.filter((text) => allSeen.includes(text))).toEqual([]);
    allSeen.push(...roundSeen);
    await expect(page.locator("#finishDialog")).toBeVisible();
    if (roundIndex < 5) await page.getByRole("button", { name: "Try another round", exact: true }).click();
  }
  expect(new Set(allSeen).size).toBe(trafficQuestions.length);
});
test("Repair Café: draw eight unique repairs from a twenty-scenario bank", async ({
  page,
}) => {
  await round(page, "repair-cafe", async () => {
    expect(repairs.length).toBeGreaterThanOrEqual(20);
    const seen = [];
    for (let i = 0; i < 8; i++) {
      const title = await page.locator(".message-card .board-title").innerText();
      const repair = repairs.find((item) => item.title === title);
      expect(repair).toBeTruthy();
      expect(seen).not.toContain(title);
      seen.push(title);

      if (i === 0) {
        await page
          .getByRole("button", { name: repair.steps[3], exact: true })
          .click();
        await expect(page.locator("#feedback")).toContainText("comes later");
      }

      for (const step of repair.steps)
        await page.getByRole("button", { name: step, exact: true }).click();

      await page
        .getByRole("button", {
          name: i === 7 ? "See my repairs" : "Next repair",
          exact: true,
        })
        .click();
    }
    expect(new Set(seen).size).toBe(8);
  });
});
test("Time Trail: eight clear moves collect every flag and reach the picnic", async ({ page }) => {
  const path = shortestTrailPath(timeTrail);
  expect(path).toEqual([20, 15, 10, 5, 0, 1, 2, 3, 4]);
  await round(page, "time-trail", async () => {
    await expect(page.locator("#missionText")).toContainText("12 moves allowed");
    await expect(page.locator(".route-instruction")).toContainText("12 moves maximum");
    await expect(page.locator(".route-stats")).toContainText("Shortest route8 moves");
    await expect(page.locator(".route-stats .stat-chip").first()).toContainText(/Steps left\s*12/);
    await expect(page.locator(".tile.route-reachable")).toHaveCount(2);
    await page.locator('[data-tile="4"]').click();
    await expect(page.locator("#feedback")).toContainText("nearby");
    await expect(page.locator(".route-stats .stat-chip").first()).toContainText(/Steps left\s*12/);
    for (const [index, tile] of path.slice(1).entries()) {
      await expect(page.locator(`[data-tile="${tile}"]`)).toHaveClass(/route-reachable/);
      await page.locator(`[data-tile="${tile}"]`).click();
      if (index < path.length - 2)
        await expect(page.locator(".route-stats .stat-chip").first())
          .toContainText(new RegExp(`Steps left\\s*${12 - (index + 1)}`));
    }
    await expect(page.locator("#finishMessage")).toContainText("in 8 steps");
    await expect(page.locator("#finishScore")).toHaveText("100");
  });
});
test("Time Trail: the twelve-move limit is exact and tiles disable", async ({ page }) => {
  await page.goto("/games/time-trail/index.html");
  for (let move = 0; move < timeTrail.stepLimit; move++) {
    await page.locator(`[data-tile="${move % 2 === 0 ? 15 : 20}"]`).click();
  }
  await expect(page.locator(".route-stats .stat-chip").first()).toContainText(/Steps left\s*0/);
  await expect(page.locator("#feedback")).toContainText("12-move trail is finished");
  await expect(page.locator(".tile.route-reachable")).toHaveCount(0);
  await expect(page.locator('[data-tile="15"]')).toBeDisabled();
  await page.getByRole("button", { name: "Try a new route", exact: true }).click();
  await expect(page.locator(".route-stats .stat-chip").first()).toContainText(/Steps left\s*12/);
  await expect(page.locator(".tile.route-reachable")).toHaveCount(2);
});
test("Garden Guardians: finish eight gardens, four ranks, and changing water goals", async ({ page }) => {
  test.setTimeout(120000);
  expect(gardenLevels).toHaveLength(8);
  await round(page, "garden-guardians", async () => {
    await expect(page.locator(".nature-level-trail .level-node")).toHaveCount(4);
    for (const [levelIndex, level] of gardenLevels.entries()) {
      await expect(page.locator("#stageLabel")).toContainText(`Garden level ${levelIndex + 1} of 8`);
      await expect(page.locator(".nature-banner")).toContainText(level.name);
      await expect(page.locator("#gameBoard")).toContainText(level.lesson);
      await expect(page.locator(".stat-row")).toContainText(`Water drops${level.water}`);
      if (levelIndex === 0) {
        await page.getByRole("button", { name: "Start growing" }).click();
        await expect(page.locator("#feedback")).toContainText("Plant all six");
      }
      let plot = 0;
      for (const type of ["carrot", "bean", "flower"]) {
        await page.locator(`[data-plant="${type}"]`).click();
        for (let i = 0; i < level[type]; i++)
          await page.locator(`[data-plot="${plot++}"]`).click();
      }
      await expect(page.locator(".nature-quota.complete")).toHaveCount(3);
      await page.getByRole("button", { name: "Start growing" }).click();
      for (let wateringDay = 0; wateringDay < 2; wateringDay++) {
        for (let i = 0; i < level.target; i++)
          await page.locator(`[data-plot="${i}"]`).click();
        if (wateringDay === 0) {
          await page.locator('[data-plot="0"]').click();
          await expect(page.locator("#feedback")).toContainText("already watered");
        }
        await page.getByRole("button", { name: "Next day" }).click();
      }
      await expect(page.locator(".stat-row")).toContainText(`Ready plants${level.target}/${level.target}`);
      await page.getByRole("button", { name: levelIndex === 7 ? "Visit my garden" : "Next garden" }).click();
      if (levelIndex < 7)
        await expect(page.locator(".stat-row")).toContainText(`Garden stars${(levelIndex + 1) * 3}/24`);
    }
    await expect(page.locator("#finishMessage")).toContainText("24 of 24 garden stars");
  });
});
test("Weather Watchers: complete 25 illustrated challenges across four ranks", async ({
  page,
}) => {
  expect(weatherChallenges).toHaveLength(25);
  await round(page, "weather-watchers", () =>
    completePicturePath(page, weatherChallenges),
  );
});
test("Garden Grow & Harvest: complete 24 picture jobs from soil to storage", async ({
  page,
}) => {
  expect(gardenGrowthChallenges).toHaveLength(24);
  await round(page, "garden-grow-harvest", () =>
    completePicturePath(page, gardenGrowthChallenges),
  );
});
function powerRecipe(level) {
  // Find a valid allocation without hardcoding one magic solution per level.
  for (let solar = 0; solar <= Math.floor(level.tokens / 2); solar++)
    for (let wind = 0; wind <= Math.floor(level.tokens / 3); wind++)
      for (let battery = 0; battery <= Math.floor(level.tokens / 2); battery++) {
        if (solar + wind === 0 || 2 * solar + 3 * wind + 2 * battery > level.tokens) continue;
        let stored = 0;
        const works = level.weather.every((day) => {
          const made = day.solar * solar + day.wind * wind;
          const available = made + stored;
          stored = Math.min(battery * 4, Math.max(0, available - level.demand));
          return available >= level.demand;
        });
        if (works) return { solar, wind, battery };
      }
  throw new Error(`No feasible mix for ${level.id}`);
}
test("Energy Island: eight power grids adapt to weather and demand", async ({ page }) => {
  test.setTimeout(120000);
  expect(energyLevels).toHaveLength(8);
  await round(page, "energy-island", async () => {
    await expect(page.locator(".nature-level-trail .level-node")).toHaveCount(4);
    for (const [index, level] of energyLevels.entries()) {
      await expect(page.locator("#stageLabel")).toContainText(`Energy level ${index + 1} of 8`);
      await expect(page.locator(".nature-banner")).toContainText(level.name);
      await expect(page.locator("#gameBoard")).toContainText(level.lesson);
      await expect(page.locator(".forecast-current")).toHaveCount(1);
      if (index === 0) {
        await page.getByRole("button", { name: "Test my power mix" }).click();
        await expect(page.locator("#feedback")).toContainText("Choose at least one energy source");
      }
      const mix = index === 0 ? { solar: 2, wind: 2, battery: 1 } : powerRecipe(level);
      for (const type of ["solar", "wind", "battery"]) {
        for (let i = 0; i < mix[type]; i++)
          await page.locator(`[data-build="${type}"]`).click();
      }
      await page.getByRole("button", { name: "Test my power mix" }).click();
      for (const day of level.weather.slice(1))
        await page.getByRole("button", { name: `Run ${day.name.toLowerCase()} day` }).click();
      await expect(page.locator(".ledger tbody tr")).toHaveCount(4);
      await expect(page.locator(".ledger tbody tr").filter({ hasText: "Glowing" })).toHaveCount(4);
      await page.getByRole("button", { name: index === 7 ? "See my island" : "Next island" }).click();
      if (index < 7)
        await expect(page.locator(".stat-row")).toContainText(`Island stars${(index + 1) * 3}/24`);
    }
    await expect(page.locator("#finishMessage")).toContainText("24 of 24 island stars");
  });
});
test("Robot Rover: debug a collision, show execution state, and solve twenty worlds at par", async ({
  page,
}) => {
  await round(page, "robot-rover", async () => {
    expect(robotLevels).toHaveLength(20);
    await expect(page.locator("#stageLabel")).toContainText("Robot world 1 of 20");
    await expect(page.locator(".rover-level-trail .level-node")).toHaveCount(4);
    await expect(page.locator(".rover-level-trail .level-node.active")).toContainText(
      "Rover Rookie",
    );
    await expect(page.locator("#gameBoard")).toContainText(
      "Forward moves Rover in the direction it is facing.",
    );
    await expect(page.locator(".rover-stats")).toContainText("→ East");

    const command = async (cmd) =>
      page.locator(`[data-command="${cmd}"]`).click();

    for (const cmd of "LFFF") await command(cmd);
    await page
      .getByRole("button", { name: "Run my code", exact: true })
      .click();
    await expect(page.locator("#feedback")).toContainText("hit a rock or edge");
    await expect(page.locator(".tile.rover.trail")).toHaveCount(2);
    await page.getByRole("button", { name: "Clear code", exact: true }).click();

    const programs = robotLevels.map(shortestRobotProgram);
    expect(programs.map((program) => program.length)).toEqual(
      robotLevels.map((level) => level.par),
    );

    for (const [i, program] of programs.entries()) {
      for (const cmd of program) await command(cmd);
      await page
        .getByRole("button", { name: "Run my code", exact: true })
        .click();

      if (i === 0) {
        await expect(page.locator(".command-list .active-command")).toHaveCount(
          1,
        );
      }
      await expect(page.locator("#feedback")).toContainText("found the star");
      await expect(page.locator(".rover-stars")).toContainText("⭐⭐⭐");
      await expect(page.locator(".tile.rover.trail")).not.toHaveCount(0);

      if (i === 0) {
        await page.evaluate(() =>
          window.LarriVerseArcade.setSettings({ reducedMotion: true }),
        );
      }
      await page
        .getByRole("button", {
          name: i === programs.length - 1 ? "See my rover" : "Next world",
          exact: true,
        })
        .click();

      if (i < programs.length - 1) {
        await expect(page.locator("#stageLabel")).toContainText(
          `Robot world ${i + 2} of 20`,
        );
        if ([4, 9, 14].includes(i)) {
          await expect(page.locator("#feedback")).toContainText("unlocked");
          await expect(
            page.locator(".rover-level-trail .level-node.active"),
          ).toContainText(robotLevels[i + 1].rank);
        }
      }
    }

    await expect(page.locator("#finishMessage")).toContainText(
      "60 of 60 efficiency stars",
    );
    await expect(page.locator("#finishMessage")).toContainText("across 4 ranks");
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
