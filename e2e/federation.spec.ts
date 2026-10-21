import { expect, test } from "@playwright/test";

test.describe("module federation", () => {
  test("case study widgets load from the case-studies remote", async ({ page }) => {
    await page.goto("/work/ai-agentic-platform?mode=deep");
    // Remotes are lazy: nothing loads until the evidence section nears the viewport.
    await expect(page.locator("[data-remote]")).toHaveCount(0);
    await page.locator("#evidence").scrollIntoViewIfNeeded();
    await expect(page.locator('[data-remote="caseStudies/LighthouseSlider"]')).toBeVisible();
    await expect(page.locator('[data-remote="caseStudies/BundleChart"]')).toBeVisible();
    await expect(page.getByText("Score verified · breakdown illustrative")).toBeVisible();

    const slider = page.getByRole("slider", { name: "Reveal the after-optimization results" });
    await slider.focus();
    await page.keyboard.press("Home");
    await expect(slider).toHaveValue("0");

    await page.getByRole("button", { name: "Table" }).click();
    await expect(page.getByRole("row", { name: /Total/ })).toContainText("−30%");
  });

  test("a missing remote degrades to a contained fallback", async ({ page }) => {
    await page.route("**/remotes/case-studies/remoteEntry.js*", (route) => route.fulfill({ status: 404, body: "" }));
    await page.goto("/work/ai-agentic-platform?mode=deep");
    await page.locator("#evidence").scrollIntoViewIfNeeded();
    await expect(page.getByRole("alert").first()).toContainText("couldn't load");
    await expect(page.getByRole("heading", { name: "My decisions" })).toBeVisible();
  });

});
