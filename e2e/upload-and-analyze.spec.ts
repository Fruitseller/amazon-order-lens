import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ZIP_PATH = join(__dirname, "fixtures", "test-export.zip");

test("user can upload a ZIP and see the dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("dropzone")).toBeVisible();

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(ZIP_PATH);

  await expect(page.getByRole("link", { name: /übersicht/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/gesamtausgaben/i).first()).toBeVisible();
  // 15 rows + 3-item multi-order = 19 items across 17 orders
  await expect(page.getByText(/Bestellungen$/).first()).toBeVisible();
});
