import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { List } from "@/components/board/List";
import type { BoardList } from "@/types/board";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("List", () => {
    it("renders the list name, card count, and each card", async () => {
        const list: BoardList = {
            id: "l1",
            name: "To Do",
            cards: [
                { id: "c1", title: "First card" },
                { id: "c2", title: "Second card" },
            ],
        };

        renderWithRouter(<List boardId="board-1" list={list} />);

        expect(
            await screen.findByRole("heading", { name: "To Do" }),
        ).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("First card")).toBeInTheDocument();
        expect(screen.getByText("Second card")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "To Do list options" }),
        ).toBeInTheDocument();
    });

    it("calls onCardClick with the clicked card's id", async () => {
        const user = userEvent.setup();
        const onCardClick = vi.fn();
        const list: BoardList = {
            id: "l1",
            name: "To Do",
            cards: [{ id: "c1", title: "First card" }],
        };

        renderWithRouter(
            <List boardId="board-1" list={list} onCardClick={onCardClick} />,
        );
        await user.click(await screen.findByRole("button", { name: "First card" }));

        expect(onCardClick).toHaveBeenCalledWith("c1");
    });

    it("deletes the list via the list options menu", async () => {
        const user = userEvent.setup();
        const list: BoardList = { id: "l1", name: "To Do", cards: [] };
        renderWithRouter(<List boardId="board-1" list={list} />);

        await user.click(
            await screen.findByRole("button", { name: "To Do list options" }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Delete list" }));

        expect(
            screen.queryByRole("menuitem", { name: "Delete list" }),
        ).not.toBeInTheDocument();
    });

    it("hides list options and add-a-card in read-only mode (no boardId)", async () => {
        const list: BoardList = {
            id: "l1",
            name: "To Do",
            cards: [{ id: "c1", title: "First card" }],
        };

        renderWithRouter(<List list={list} />);

        expect(await screen.findByText("First card")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "To Do list options" }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Add a card" }),
        ).not.toBeInTheDocument();
    });
});
