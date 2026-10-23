import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { scrollThrough } from "./helpers";

test.describe("company pages", () => {
  test("/for/avoma shows the tailored intro and pinned work, and is noindex", async ({ page }) => {
    await page.goto("/for/avoma");
    await expect(page.getByText("Prepared for Avoma")).toBeVisible();
    await expect(page.getByText(/Hi Avoma team/)).toBeVisible();
    const pinned = page.locator("#for-work").getByRole("article");
    await expect(pinned).toHaveCount(2);
    await expect(pinned.first()).toContainText("Enterprise AI Agentic Management Platform");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("unknown companies 404", async ({ page }) => {
    const res = await page.goto("/for/not-a-company");
    expect(res?.status()).toBe(404);
  });
});

const PAGES = [
  "/",
  "/work/ai-agentic-platform",
  "/work/saas-elearning",
  "/work/edtech-platform",
  "/work/pbi-autobuilder",
  "/how-its-built",
  "/for/avoma",
];

for (const theme of ["light", "dark"] as const) {
  for (const path of PAGES) {
    test(`a11y (${theme}): ${path} has no WCAG A/AA violations`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("skj-theme", t), theme);
      await page.goto(path);
      // Lazy remotes mount on scroll; audit their markup too.
      await scrollThrough(page);
      // Wait until no remote is still loading, then let its 320ms fade-in finish, so axe
      // never measures contrast on half-transparent text.
      await expect(page.locator("[aria-busy=true]")).toHaveCount(0);
      await page.waitForTimeout(600);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`);
      expect(summary).toEqual([]);
    });
  }
}
