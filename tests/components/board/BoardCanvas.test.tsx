import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BoardCanvas } from "@/components/board/BoardCanvas";
import type { Board } from "@/types/board";

describe("BoardCanvas", () => {
    it("renders every list and the add-column control", () => {
        const board: Board = {
            id: "b1",
            name: "Test Board",
            lists: [
                { id: "l1", name: "To Do", cards: [] },
                { id: "l2", name: "Done", cards: [] },
            ],
        };

        render(<BoardCanvas board={board} />);

        expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
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

        render(<BoardCanvas board={board} onCardClick={onCardClick} />);
        await user.click(screen.getByRole("button", { name: "First card" }));

        expect(onCardClick).toHaveBeenCalledWith("c1");
    });
});
