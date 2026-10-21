import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("gives a recruiter the key facts above the fold", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Subrat Kumar Jena/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Subrat Kumar Jena");
    await expect(page.getByText("Software Engineer · Frontend")).toBeVisible();
    await expect(page.getByRole("link", { name: "Download résumé" })).toHaveAttribute("href", "/Subrat_Kumar_Jena_Resume.pdf");
    await expect(page.getByRole("button", { name: "Email me" }).first()).toBeVisible();
  });

  test("shows the five verified headline metrics", async ({ page }) => {
    await page.goto("/");
    const results = page.getByRole("list", { name: "Headline results" });
    for (const label of [
      "Lighthouse performance",
      "Smaller bundle",
      "Faster frontend issue detection (MTTD)",
      "Fewer failed payment follow-ups",
      "MVP delivered early",
    ]) {
      await expect(results.getByText(label)).toBeVisible();
    }
    // Count-up animates to the final values.
    await expect(results.getByText("62 → 88", { exact: true }).first()).toBeAttached();
  });

  test("View details expands a card, then links to the full case study", async ({ page }) => {
    await page.goto("/");
    const work = page.locator("#work");
    await expect(work.getByRole("article")).toHaveCount(3);

    // The accessible name flips to "Show less …" once expanded, so match both.
    const toggle = work.getByRole("button", { name: /(View details|Show less) for SaaS E-Learning/ });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    const card = work.getByRole("article").filter({ hasText: "SaaS E-Learning & Publication Platform" });
    await expect(card.getByRole("heading", { name: "Key decisions" })).toBeVisible();
    await expect(card).toContainText("Micro-frontends with Module Federation");
    await expect(card).toContainText("~50–60% of the frontend, plus backend contributions");

    await card.getByRole("link", { name: "Read the full case study" }).click();
    await expect(page).toHaveURL(/\/work\/saas-elearning$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("SaaS E-Learning & Publication Platform");
    await expect(page.getByLabel("At a glance")).toContainText("Clairvoyant (EXL)");
  });

  test("personal work has its own section, GitHub link and full page", async ({ page }) => {
    await page.goto("/");
    const personal = page.locator("#personal");
    await expect(personal.getByRole("heading", { name: "PBI AutoBuilder" })).toBeVisible();
    await expect(personal.getByText("Personal project")).toBeVisible();
    await expect(page.locator("#work").getByRole("article")).toHaveCount(3);

    await personal.getByRole("button", { name: /View details for PBI AutoBuilder/ }).click();
    await expect(personal.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/subratspace-lab/pbi-autobuilder");
    await personal.getByRole("link", { name: "Read the full case study" }).click();

    await expect(page).toHaveURL(/\/work\/pbi-autobuilder$/);
    await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What I learned" })).toBeVisible();
    await expect(page.getByLabel("At a glance")).toContainText("Solo project");
    await expect(page.getByLabel("About confidentiality")).toHaveCount(0);
  });

  test("Show less collapses the card again", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /View details for EdTech/ });
    await toggle.click();
    await page.getByRole("button", { name: /Show less for EdTech/ }).click();
    await expect(page.getByRole("link", { name: "Read the full case study" })).toHaveCount(0);
  });

  test("serves the résumé, sitemap and robots", async ({ request }) => {
    const pdf = await request.get("/Subrat_Kumar_Jena_Resume.pdf");
    expect(pdf.ok()).toBeTruthy();
    expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/work/ai-agentic-platform");
    expect(sitemap).not.toContain("/for/");

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /for/");
  });

  test("has Open Graph and Twitter metadata", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Subrat Kumar Jena/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\.png$/);
    const og = await page.request.get("/og.png");
    expect(og.ok()).toBeTruthy();
    expect(og.headers()["content-type"]).toBe("image/png");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  });

  test("shows a helpful 404", async ({ page }) => {
    const res = await page.goto("/definitely-not-here");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "That page doesn't exist." })).toBeVisible();
  });
});
