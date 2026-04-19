import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ZIP_PATH = join(__dirname, "fixtures", "test-export.zip");

test("deleting data returns user to the upload screen", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(ZIP_PATH);
  await expect(page.getByRole("link", { name: /übersicht/i })).toBeVisible({
    timeout: 15_000,
  });

  // Auto-confirm the window.confirm dialog
  page.on("dialog", (dialog) => dialog.accept());

  await page.getByRole("button", { name: /daten löschen/i }).click();
  await expect(page.getByTestId("dropzone")).toBeVisible({ timeout: 10_000 });
});
