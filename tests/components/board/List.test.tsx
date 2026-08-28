import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { List } from "@/components/board/List";
import type { BoardList } from "@/types/board";

describe("List", () => {
    it("renders the list name, card count, and each card", () => {
        const list: BoardList = {
            id: "l1",
            name: "To Do",
            cards: [
                { id: "c1", title: "First card" },
                { id: "c2", title: "Second card" },
            ],
        };

        render(<List list={list} />);

        expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
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

        render(<List list={list} onCardClick={onCardClick} />);
        await user.click(screen.getByRole("button", { name: "First card" }));

        expect(onCardClick).toHaveBeenCalledWith("c1");
    });
});
