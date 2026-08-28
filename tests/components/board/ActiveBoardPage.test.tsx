import {
    RouterProvider,
    createMemoryHistory,
    createRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { mockActiveBoard, mockPresence } from "@/lib/mock-board";
import { routeTree } from "@/routeTree.gen";

function renderAtPath(path: string) {
    const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: [path] }),
    });

    render(<RouterProvider router={router} />);
    return router;
}

describe("ActiveBoardPage", () => {
    it("renders the board name, presence, and every list", async () => {
        renderAtPath("/app/boards/demo-board");

        expect(
            await screen.findByRole("heading", { name: mockActiveBoard.name }),
        ).toBeInTheDocument();

        for (const list of mockActiveBoard.lists) {
            expect(
                screen.getByRole("heading", { name: list.name }),
            ).toBeInTheDocument();
        }

        expect(
            screen.getByLabelText(`${mockPresence.length} people viewing this board`),
        ).toBeInTheDocument();
    });

    it("opens the card detail modal from the ?card= search param", async () => {
        const firstList = mockActiveBoard.lists[0];
        const firstCard = firstList?.cards[0];
        if (!firstList || !firstCard)
            throw new Error("expected at least one list with a card");

        renderAtPath(`/app/boards/demo-board?card=${firstCard.id}`);

        expect(await screen.findByDisplayValue(firstCard.title)).toBeInTheDocument();
    });

    it("opens a card on click and closes it back to no search param", async () => {
        const user = userEvent.setup();
        const firstList = mockActiveBoard.lists[0];
        const firstCard = firstList?.cards[0];
        if (!firstList || !firstCard)
            throw new Error("expected at least one list with a card");

        const router = renderAtPath("/app/boards/demo-board");
        await screen.findByRole("heading", { name: mockActiveBoard.name });

        await user.click(
            screen.getByRole("button", { name: new RegExp(firstCard.title) }),
        );

        expect(await screen.findByDisplayValue(firstCard.title)).toBeInTheDocument();
        expect(router.state.location.search).toEqual({ card: firstCard.id });

        await user.click(screen.getByTitle("Close modal"));

        expect(screen.queryByDisplayValue(firstCard.title)).not.toBeInTheDocument();
        expect(router.state.location.search).toEqual({});
    });

    it("renders no modal when the card id in the URL does not match any card", async () => {
        renderAtPath("/app/boards/demo-board?card=does-not-exist");

        await screen.findByRole("heading", { name: mockActiveBoard.name });
        expect(screen.queryByText("Description")).not.toBeInTheDocument();
    });
});
