import { defineConfig, devices } from "@playwright/test";
import { config } from "./config";

const authenticatedTestMatch = [
  "**/tests/authenticated/**/*.spec.ts",
  "**/tests/shared/**/*.spec.ts",
];
const guestTestMatch = [
  "**/tests/guest/**/*.spec.ts",
  "**/tests/shared/**/*.spec.ts",
];

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["github"]],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: config.baseUrl,
    actionTimeout: config.timeout,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    // video: "retain-on-failure",

    headless: process.env.CI ? true : false,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup:authenticated",
      testMatch: "**/auth.setup.ts",
    },
    {
      name: "setup:guest",
      testMatch: "**/guest.setup.ts",
    },
    {
      name: "authenticated-chromium",
      dependencies: ["setup:authenticated"],
      testMatch: authenticatedTestMatch,
      use: {
        ...devices["Desktop Chrome"],
        storageState: config.storageStates.authenticated,
      },
    },
    {
      name: "authenticated-mobile-safari",
      dependencies: ["setup:authenticated"],
      testMatch: authenticatedTestMatch,
      use: {
        ...devices["iPhone 15"],
        storageState: config.storageStates.authenticated,
      },
      timeout: config.longTimeout,
      retries: 2,
    },
    {
      name: "api",
      dependencies: ["setup:authenticated"],
      testMatch: "**/api/**/*.spec.ts",
      use: {
        storageState: config.storageStates.authenticated,
      },
    },
    {
      name: "guest-chromium",
      dependencies: ["setup:guest"],
      testMatch: guestTestMatch,
      use: {
        ...devices["Desktop Chrome"],
        storageState: config.storageStates.guest,
      },
    },
    {
      name: "guest-mobile-safari",
      dependencies: ["setup:guest"],
      testMatch: guestTestMatch,
      use: {
        ...devices["iPhone 15"],
        storageState: config.storageStates.guest,
      },
      timeout: config.longTimeout,
      retries: 2,
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
