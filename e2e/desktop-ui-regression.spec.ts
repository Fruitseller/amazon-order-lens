import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ZIP_PATH = join(__dirname, "fixtures", "test-export.zip");

test("large currency KPI values stay on one line on desktop", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(ZIP_PATH);
  await expect(page.getByRole("link", { name: /übersicht/i })).toBeVisible({
    timeout: 15_000,
  });

  const totalSpending = page.getByText("1.659,74 €").first();
  await expect(totalSpending).toBeVisible();

  const box = await totalSpending.boundingBox();
  expect(box?.height).toBeLessThan(45);
});

test("chart navigation does not emit transient Recharts sizing warnings", async ({ page }) => {
  const sizingWarnings: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "warning" && msg.text().includes("width(-1)")) {
      sizingWarnings.push(msg.text());
    }
  });

  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(ZIP_PATH);
  await expect(page.getByRole("link", { name: /übersicht/i })).toBeVisible({
    timeout: 15_000,
  });

  for (const view of [/ausgaben/i, /muster/i, /kategorien/i, /fun\s*facts/i]) {
    await page.getByRole("link", { name: view }).click();
    await page.waitForTimeout(100);
  }

  expect(sizingWarnings).toEqual([]);
});
