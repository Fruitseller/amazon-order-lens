import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ZIP_PATH = join(__dirname, "fixtures", "test-export.zip");

test("search filter reduces the visible dataset and reset restores it", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(ZIP_PATH);
  await expect(page.getByRole("link", { name: /übersicht/i })).toBeVisible({
    timeout: 15_000,
  });

  // Capture initial total spending text
  const overview = page.locator('section, div').filter({ hasText: /gesamtausgaben/i }).first();
  const initialText = await overview.textContent();
  expect(initialText).toContain("€");

  // Apply a search for 'kabel'
  const search = page.getByRole("searchbox");
  await search.fill("kabel");

  // Wait for state to settle — totals should change
  await page.waitForTimeout(250);
  const filteredText = await overview.textContent();
  expect(filteredText).not.toBe(initialText);

  // Clear search
  await search.fill("");
  await page.waitForTimeout(250);
  const restoredText = await overview.textContent();
  expect(restoredText).toBe(initialText);
});
