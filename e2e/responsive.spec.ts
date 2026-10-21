import { expect, test } from "@playwright/test";
import { scrollThrough } from "./helpers";

const PAGES = [
  "/",
  "/?mode=skim",
  "/work/ai-agentic-platform?mode=deep",
  "/work/saas-elearning",
  "/work/edtech-platform",
  "/work/pbi-autobuilder",
  "/how-its-built",
  "/for/avoma",
];

for (const path of PAGES) {
  test(`360px: ${path} has no horizontal page scroll`, async ({ page }) => {
    await page.goto(path);
    await scrollThrough(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("360px: header controls fit and work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Skim", exact: true })).toBeVisible();
  await expect(page.getByTestId("palette-trigger")).toBeVisible();
  await expect(page.getByRole("button", { name: /Switch to (dark|light) theme/ })).toBeVisible();
  await page.getByTestId("palette-trigger").click();
  await expect(page.getByRole("combobox", { name: "Search commands" })).toBeFocused();
});

test("360px: an expanded project card fits the screen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /View details for Enterprise AI/ }).click();
  await expect(page.getByRole("link", { name: "Read the full case study" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
