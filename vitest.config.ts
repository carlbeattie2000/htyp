import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 10000,
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.ts"],
          setupFiles: [],
        },
      },
      {
        test: {
          name: "browser",
          include: ["tests/browser/**/*.browser.test.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["tests/setup/browser.setup.ts"],
        },
      },
      {
        test: {
          name: "browser-headless",
          include: ["tests/browser/**/*.browser.test.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: "chromium", headless: true },
              { browser: "firefox", headless: true },
              { browser: "webkit", headless: true },
            ],
          },
          setupFiles: ["tests/setup/browser.setup.ts"],
        },
      },
    ],
  },
});
