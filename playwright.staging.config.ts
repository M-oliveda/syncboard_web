import { defineConfig, devices } from "@playwright/test";

// Targets an already-deployed Cloud Run environment (Staging today) instead of a
// local dev server — no `webServer` block, and credentials come from the environment
// rather than a local .env, matching e2e-staging.yml's env wiring.
export default defineConfig({
    testDir: "./e2e/staging",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: "html",
    use: {
        baseURL: process.env.E2E_BASE_URL,
        httpCredentials: process.env.E2E_BASIC_AUTH_USER
            ? {
                  username: process.env.E2E_BASIC_AUTH_USER,
                  password: process.env.E2E_BASIC_AUTH_PASSWORD ?? "",
              }
            : undefined,
        trace: "on-first-retry",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
