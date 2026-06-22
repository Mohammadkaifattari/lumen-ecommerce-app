import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config. Targets a manually-started production build.
 *
 * Run the server first:
 *   npm run build && npm run start -- -p 3138
 * then:
 *   npm run test:e2e
 */
const PORT = process.env.PORT || "3138";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["line"]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

