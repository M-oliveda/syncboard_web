import { describe, expect, it } from "vitest";

import { moveCardInBoard, moveListInBoard } from "@/lib/board";
import type { Board } from "@/types/board";

const board: Board = {
    id: "b1",
    name: "Test Board",
    lists: [
        {
            id: "l1",
            order: 0,
            name: "To Do",
            cards: [
                { id: "c1", order: 0, title: "First" },
                { id: "c2", order: 1, title: "Second" },
            ],
        },
        {
            id: "l2",
            order: 1,
            name: "Done",
            cards: [{ id: "c3", order: 0, title: "Third" }],
        },
    ],
};

describe("moveCardInBoard", () => {
    it("moves a card into a different list at the given order", () => {
        const result = moveCardInBoard(board, "c1", "l2", -1);

        const source = result.lists.find((list) => list.id === "l1");
        const target = result.lists.find((list) => list.id === "l2");
        expect(source?.cards.map((card) => card.id)).toEqual(["c2"]);
        expect(target?.cards.map((card) => card.id)).toEqual(["c1", "c3"]);
        expect(target?.cards[0]?.order).toBe(-1);
    });

    it("reorders a card within the same list", () => {
        const result = moveCardInBoard(board, "c2", "l1", -1);

        const list = result.lists.find((list) => list.id === "l1");
        expect(list?.cards.map((card) => card.id)).toEqual(["c2", "c1"]);
    });

    it("returns the board unchanged when the card doesn't exist", () => {
        expect(moveCardInBoard(board, "missing", "l2", 0)).toBe(board);
    });
});

describe("moveListInBoard", () => {
    it("moves a list to the given order and keeps lists sorted", () => {
        const result = moveListInBoard(board, "l2", -1);

        expect(result.lists.map((list) => list.id)).toEqual(["l2", "l1"]);
        expect(result.lists[0]?.order).toBe(-1);
    });
});
