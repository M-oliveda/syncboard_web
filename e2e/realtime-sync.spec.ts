import { expect, test, type Page } from "@playwright/test";

import { startSocketTestServer } from "./support/socket-test-server";

/** The real-time contract (a card move in one browser context appearing in another)
 * is only meaningfully verified across two real browser contexts exchanging real
 * socket messages — see `MASTERPLAN.md` §11.2 and `CLAUDE.md`'s Testing Expectations.
 * CI's `e2e` job has no live `syncboard_api` (+ Mongo/Redis) to connect to — same
 * constraint `board-drag.spec.ts` documents for REST — so this spins up a minimal
 * local Socket.io stand-in (`./support/socket-test-server.ts`) implementing just the
 * `board:join`/`board:user-presence`/`card:moved`/`card:updated` contract. Both pages
 * connect to it over a real WebSocket using this repo's actual `socket.io-client`
 * wiring (`src/lib/socket.ts`/`src/hooks/useSocket.ts`) — only the server on the
 * other end is a lightweight double, not the frontend code under test.
 *
 * Locally, this needs port 4000 free — `VITE_API_BASE_URL`/`VITE_SOCKET_URL` both
 * point there (`.env.example`), matching `ci.yml`'s `e2e` job env. If a local
 * `syncboard_api` (e.g. via its own `docker compose up`) is already listening on
 * 4000, this spec fails with `EADDRINUSE`, not a real bug — stop that stack first, or
 * skip this one file. CI is never in that state, since it runs no backend at all. */

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

async function mockBoardRest(page: Page): Promise<{ patchBody: () => unknown }> {
    let patchBody: unknown;

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
        const firstCard = board.cards[0];
        const updated = { ...firstCard, ...(patchBody as object) };
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, data: updated }),
        });
    });

    return { patchBody: () => patchBody };
}

test("a card move in one browser context appears in another", async ({ browser }) => {
    const socketServer = await startSocketTestServer();

    try {
        const contextA = await browser.newContext();
        const contextB = await browser.newContext();
        const pageA = await contextA.newPage();
        const pageB = await contextB.newPage();

        const restA = await mockBoardRest(pageA);
        await mockBoardRest(pageB);

        await pageA.goto("/app/boards/board-1");
        await pageB.goto("/app/boards/board-1");

        // Both sockets connect and join the room asynchronously after the board
        // itself renders — wait for presence to reflect both before dragging, so the
        // move's broadcast has somewhere to fan out to.
        const presenceA = pageA.locator('[aria-label="2 people viewing this board"]');
        const presenceB = pageB.locator('[aria-label="2 people viewing this board"]');
        await expect(presenceA).toBeVisible();
        await expect(presenceB).toBeVisible();

        const card = pageA.getByText("Fix the bug");
        const doneList = pageA.getByRole("heading", { name: "Done" });
        await expect(card).toBeVisible();
        await expect(doneList).toBeVisible();

        const cardBox = await card.boundingBox();
        const targetBox = await doneList.boundingBox();
        if (!cardBox || !targetBox) throw new Error("Could not measure drag elements");

        await pageA.mouse.move(
            cardBox.x + cardBox.width / 2,
            cardBox.y + cardBox.height / 2,
        );
        await pageA.mouse.down();
        await pageA.mouse.move(cardBox.x + cardBox.width / 2 + 10, cardBox.y + 10, {
            steps: 5,
        });
        await pageA.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 40, {
            steps: 10,
        });
        await pageA.mouse.up();

        await expect
            .poll(() => restA.patchBody())
            .toMatchObject({
                listId: "list-done",
            });

        // Context B never interacted with the board — this only passes if the
        // socket's card:updated broadcast reached it and patched its cache in place.
        const doneHeadingB = pageB.getByRole("heading", { name: "Done" });
        const doneColumnB = pageB.locator("div").filter({ has: doneHeadingB }).first();
        await expect(doneColumnB.getByText("Fix the bug")).toBeVisible({
            timeout: 5000,
        });

        await contextA.close();
        await contextB.close();
    } finally {
        await socketServer.close();
    }
});
