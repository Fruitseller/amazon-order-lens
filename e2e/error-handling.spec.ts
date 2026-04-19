import { test, expect } from "@playwright/test";

test("invalid file format shows an error and keeps the user on the upload screen", async ({
  page,
}) => {
  await page.goto("/");

  await page.locator('input[type="file"]').setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from("not-a-zip"),
  });

  await expect(page.getByText(/falsches format|nur zip/i)).toBeVisible();
  await expect(page.getByTestId("dropzone")).toBeVisible();
});

test("corrupt zip file shows an import error", async ({ page }) => {
  await page.goto("/");

  await page.locator('input[type="file"]').setInputFiles({
    name: "export.zip",
    mimeType: "application/zip",
    buffer: Buffer.from("this is not really a zip archive"),
  });

  await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("dropzone")).toBeVisible();
});
