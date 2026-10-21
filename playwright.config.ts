import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against the real static export (apps/shell/out), served the way a free static
 * host serves it, so what passes here is what deploys. Locally it uses the installed
 * Microsoft Edge (no browser download); CI uses Playwright's Chromium.
 */
const PORT = 4173;
const CI = !!process.env.CI;
const channel = CI ? undefined : process.env.PW_CHANNEL ?? "msedge";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: /responsive\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], channel },
    },
    {
      name: "mobile-360",
      testMatch: /responsive\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], channel, viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: `npx serve apps/shell/out -l ${PORT} --no-port-switching`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 60_000,
  },
});
