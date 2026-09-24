import { expect, test } from "@playwright/test";

/** Drag-and-drop is only meaningfully verified with a real pointer gesture in a real
 * browser (jsdom can't simulate dnd-kit's sensor activation — see the `v8 ignore`
 * comments in `Card.tsx`/`List.tsx`). Network calls are mocked via `page.route` rather
 * than hitting a live `syncboard_api` instance, since CI's `e2e` job doesn't run one
 * (see `ci.yml`) — this keeps the test hermetic while still exercising the real
 * `@dnd-kit` pointer interaction end-to-end. */

const board = {
    board: {
        _id: "board-1",
        workspaceId: "workspace-1",
        title: "Sprint 1",
        updatedAt: new Date().toISOString(),
    },
    lists: [
        { _id: "list-todo", boardId: "board-1", title: "To Do", order: 0 },
        { _id: "list-done", boardId: "board-1", title: "Done", order: 1 },
    ],
    cards: [
        {
            _id: "card-1",
            listId: "list-todo",
            title: "Fix the bug",
            description: "",
            order: 0,
            assignees: [],
            labels: [],
            checklist: [],
        },
    ],
};

test("dragging a card into another list persists the move", async ({ page }) => {
    let patchBody: unknown;

    // Scoped to the API's own origin/path — a bare "**/boards/board-1" glob would
    // also match the frontend's own page navigation to that same path and hijack it.
    await page.route("**/api/v1/auth/refresh", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                success: true,
                data: { accessToken: "fake-token" },
            }),
        }),
    );
    await page.route("**/api/v1/boards/board-1", (route) => {
        if (route.request().method() !== "GET") return route.fallback();
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, data: board }),
        });
    });
    await page.route("**/api/v1/cards/card-1", async (route) => {
        patchBody = route.request().postDataJSON();
        const updated = { ...board.cards[0], ...(patchBody as object) };
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, data: updated }),
        });
    });

    await page.goto("/app/boards/board-1");

    const card = page.getByText("Fix the bug");
    const doneList = page.getByRole("heading", { name: "Done" });
    await expect(card).toBeVisible();
    await expect(doneList).toBeVisible();

    const cardBox = await card.boundingBox();
    const targetBox = await doneList.boundingBox();
    if (!cardBox || !targetBox) throw new Error("Could not measure drag elements");

    await page.mouse.move(
        cardBox.x + cardBox.width / 2,
        cardBox.y + cardBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(cardBox.x + cardBox.width / 2 + 10, cardBox.y + 10, {
        steps: 5,
    });
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 40, {
        steps: 10,
    });
    await page.mouse.up();

    await expect.poll(() => patchBody).toMatchObject({ listId: "list-done" });

    const doneColumn = page.locator("div").filter({ has: doneList }).first();
    await expect(doneColumn.getByText("Fix the bug")).toBeVisible();
});
