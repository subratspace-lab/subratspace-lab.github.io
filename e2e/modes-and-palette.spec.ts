import { expect, test } from "@playwright/test";

test.describe("recruiter mode", () => {
  test("skim hides deep content and persists across reloads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#experience")).toBeVisible();

    await page.getByRole("button", { name: "Skim", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "skim");
    await expect(page.locator("#experience")).toBeHidden();
    await expect(page.getByRole("definition").filter({ hasText: "Software Engineer II, Clairvoyant India Pvt. Ltd." })).toBeVisible();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "skim");
    await expect(page.getByRole("button", { name: "Skim", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("can be set by link with ?mode=", async ({ page }) => {
    await page.goto("/work/edtech-platform?mode=skim");
    await expect(page.getByRole("heading", { name: "In 30 seconds" })).toBeVisible();
    await expect(page.locator("#problem")).toBeHidden();

    await page.goto("/work/edtech-platform?mode=deep");
    await expect(page.locator("#problem")).toBeVisible();
  });
});

test.describe("command palette", () => {
  test("opens with Ctrl+K and navigates by keyboard", async ({ page }) => {
    await page.goto("/");
    // The shortcut listener attaches on hydration; wait for the page to settle first.
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox", { name: "Search commands" });
    await expect(input).toBeFocused();

    await input.fill("edtech");
    await expect(page.getByRole("option")).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work\/edtech-platform$/);
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeHidden();
  });

  test("closes on Escape and runs actions", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("palette-trigger").click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeHidden();

    await page.keyboard.press("Control+k");
    await page.getByRole("combobox", { name: "Search commands" }).fill("dark light");
    await page.keyboard.press("Enter");
    const theme = await page.locator("html").getAttribute("data-theme");
    expect(["light", "dark"]).toContain(theme);
  });
});

test("theme toggle persists", async ({ page }) => {
  await page.goto("/");
  const before = await page.locator("html").getAttribute("data-theme");
  await page.getByRole("button", { name: /Switch to (dark|light) theme/ }).click();
  const after = await page.locator("html").getAttribute("data-theme");
  expect(after).not.toBe(before);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", after!);
});
