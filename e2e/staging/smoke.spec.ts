import { expect, test } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

test("logs in against staging and reaches the app dashboard", async ({ page }) => {
    test.skip(!email || !password, "E2E_TEST_EMAIL/E2E_TEST_PASSWORD not configured");

    await page.goto("/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/app/);
});
