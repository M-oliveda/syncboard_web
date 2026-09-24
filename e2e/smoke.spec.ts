import { expect, test } from "@playwright/test";

test("landing page loads", async ({ page }) => {
    await page.goto("/");

    await expect(
        page.getByRole("heading", {
            name: "Kanban boards that move as fast as your team.",
        }),
    ).toBeVisible();
});
