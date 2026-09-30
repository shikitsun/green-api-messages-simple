import { playwright } from "@vitest/browser-playwright";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tsconfigPaths(),
  ],
  test: {
    include: ["e2e/**/*.test.tsx"],
    setupFiles: ["./e2e/setup.browser.ts"],
    env: {
      VITE_GREEN_API_BASE: "https://api.green-api.test",
    },
    testTimeout: 120_000,
    hookTimeout: 60_000,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      // the desktop layout the chat is designed around; the acceptance run works in the
      // narrow one too, it just walks back to the list between chats
      viewport: { width: 1280, height: 800 },
      instances: [{ browser: "chromium" }, { browser: "firefox" }],
    },
  },
});
