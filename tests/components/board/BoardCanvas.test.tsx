import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { BoardCanvas } from "@/components/board/BoardCanvas";
import type { Board } from "@/types/board";

import { server } from "../../mocks/server";
import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("BoardCanvas", () => {
    it("renders every list and the add-column control", async () => {
        const board: Board = {
            id: "b1",
            name: "Test Board",
            lists: [
                { id: "l1", name: "To Do", cards: [] },
                { id: "l2", name: "Done", cards: [] },
            ],
        };

        renderWithRouter(<BoardCanvas board={board} boardId="b1" />);

        expect(
            await screen.findByRole("heading", { name: "To Do" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Done" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Add column" })).toBeInTheDocument();
    });

    it("forwards onCardClick down to each list's cards", async () => {
        const user = userEvent.setup();
        const onCardClick = vi.fn();
        const board: Board = {
            id: "b1",
            name: "Test Board",
            lists: [
                { id: "l1", name: "To Do", cards: [{ id: "c1", title: "First card" }] },
            ],
        };

        renderWithRouter(
            <BoardCanvas board={board} boardId="b1" onCardClick={onCardClick} />,
        );
        await user.click(await screen.findByRole("button", { name: "First card" }));

        expect(onCardClick).toHaveBeenCalledWith("c1");
    });

    it("creates a new list via the add-column form", async () => {
        const user = userEvent.setup();
        const board: Board = { id: "b1", name: "Test Board", lists: [] };
        renderWithRouter(<BoardCanvas board={board} boardId="b1" />);

        await user.click(await screen.findByRole("button", { name: "Add column" }));
        await user.type(screen.getByPlaceholderText("List name"), "New list");
        await user.click(screen.getByRole("button", { name: "Add column" }));

        expect(
            await screen.findByRole("button", { name: "Add column" }),
        ).toBeInTheDocument();
    });

    it("does not submit an empty/whitespace-only column title", async () => {
        const user = userEvent.setup();
        const board: Board = { id: "b1", name: "Test Board", lists: [] };
        renderWithRouter(<BoardCanvas board={board} boardId="b1" />);

        await user.click(await screen.findByRole("button", { name: "Add column" }));
        await user.type(screen.getByPlaceholderText("List name"), "   ");
        await user.click(screen.getByRole("button", { name: "Add column" }));

        expect(screen.getByPlaceholderText("List name")).toBeInTheDocument();
    });

    it("shows a pending state while the create request is in flight", async () => {
        server.use(
            http.post("*/boards/:boardId/lists", async () => {
                await delay(50);
                return HttpResponse.json(
                    { success: true, data: { _id: "list-new", title: "New list" } },
                    { status: 201 },
                );
            }),
        );
        const user = userEvent.setup();
        const board: Board = { id: "b1", name: "Test Board", lists: [] };
        renderWithRouter(<BoardCanvas board={board} boardId="b1" />);

        await user.click(await screen.findByRole("button", { name: "Add column" }));
        await user.type(screen.getByPlaceholderText("List name"), "New list");
        await user.click(screen.getByRole("button", { name: "Add column" }));

        expect(await screen.findByRole("button", { name: "Adding…" })).toBeDisabled();
    });

    it("cancels adding a column without submitting", async () => {
        const user = userEvent.setup();
        const board: Board = { id: "b1", name: "Test Board", lists: [] };
        renderWithRouter(<BoardCanvas board={board} boardId="b1" />);

        await user.click(await screen.findByRole("button", { name: "Add column" }));
        await user.type(screen.getByPlaceholderText("List name"), "New list");
        await user.click(screen.getByRole("button", { name: "Cancel" }));

        expect(screen.getByRole("button", { name: "Add column" })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("List name")).not.toBeInTheDocument();
    });

    it("keeps the add-column form open when the create request fails", async () => {
        server.use(http.post("*/boards/:boardId/lists", () => HttpResponse.error()));
        const user = userEvent.setup();
        const board: Board = { id: "b1", name: "Test Board", lists: [] };
        renderWithRouter(<BoardCanvas board={board} boardId="b1" />);

        await user.click(await screen.findByRole("button", { name: "Add column" }));
        await user.type(screen.getByPlaceholderText("List name"), "New list");
        await user.click(screen.getByRole("button", { name: "Add column" }));

        expect(await screen.findByPlaceholderText("List name")).toBeInTheDocument();
    });

    it("hides the add-column control in read-only mode (no boardId)", async () => {
        const board: Board = {
            id: "b1",
            name: "Test Board",
            lists: [{ id: "l1", name: "To Do", cards: [] }],
        };
        renderWithRouter(<BoardCanvas board={board} />);

        expect(
            await screen.findByRole("heading", { name: "To Do" }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Add column" }),
        ).not.toBeInTheDocument();
    });
});
