import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ZIP_PATH = join(__dirname, "fixtures", "test-export.zip");

test("sidebar navigation switches between views", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(ZIP_PATH);
  await expect(page.getByRole("link", { name: /übersicht/i })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("link", { name: /ausgaben/i }).click();
  await expect(page.getByText(/monatliche ausgaben/i)).toBeVisible();

  await page.getByRole("link", { name: /muster/i }).click();
  await expect(page.getByText(/wochentag/i)).toBeVisible();

  await page.getByRole("link", { name: /kategorien/i }).click();
  await expect(page.getByText(/verteilung nach kategorie/i)).toBeVisible();

  await page.getByRole("link", { name: /fun\s*facts/i }).click();
  await expect(page.getByText(/erste bestellung/i)).toBeVisible();

  await page.getByRole("link", { name: /übersicht/i }).click();
  await expect(page.getByText(/kumulative ausgaben/i)).toBeVisible();
});
