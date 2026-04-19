import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ZIP_PATH = join(__dirname, "fixtures", "test-export.zip");

test("imported data survives a page reload via IndexedDB", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(ZIP_PATH);
  await expect(page.getByRole("link", { name: /übersicht/i })).toBeVisible({
    timeout: 15_000,
  });

  await page.reload();
  await expect(page.getByRole("link", { name: /übersicht/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByTestId("dropzone")).not.toBeVisible();
});
