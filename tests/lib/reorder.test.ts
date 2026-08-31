import { describe, expect, it } from "vitest";

import {
    computeCardMove,
    computeListMove,
    computeOrderForIndex,
    resolveDragEndIntent,
} from "@/lib/reorder";
import type { Board } from "@/types/board";

describe("computeOrderForIndex", () => {
    it("returns 0 for the only item in an empty list", () => {
        expect(computeOrderForIndex([], 0)).toBe(0);
    });

    it("returns one less than the current minimum when inserted at the start", () => {
        expect(computeOrderForIndex([5, 10, 15], 0)).toBe(4);
    });

    it("returns one more than the current maximum when inserted at the end", () => {
        expect(computeOrderForIndex([5, 10, 15], 3)).toBe(16);
    });

    it("returns the midpoint of its two neighbors when inserted in the middle", () => {
        expect(computeOrderForIndex([5, 10, 15], 1)).toBe(7.5);
        expect(computeOrderForIndex([5, 10, 15], 2)).toBe(12.5);
    });

    it("handles a single-sibling list at both ends", () => {
        expect(computeOrderForIndex([10], 0)).toBe(9);
        expect(computeOrderForIndex([10], 1)).toBe(11);
    });
});

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
        { id: "l3", order: 2, name: "Empty", cards: [] },
    ],
};

describe("computeCardMove", () => {
    it("returns null when dropped on itself", () => {
        expect(computeCardMove(board, "c1", "c1")).toBeNull();
    });

    it("returns null when overId matches neither a card nor a list", () => {
        expect(computeCardMove(board, "c1", "does-not-exist")).toBeNull();
    });

    it("inserts before the card it's dropped on, in the same list", () => {
        expect(computeCardMove(board, "c1", "c2")).toEqual({ listId: "l1", order: 0 });
    });

    it("inserts before the card it's dropped on, in a different list", () => {
        expect(computeCardMove(board, "c1", "c3")).toEqual({ listId: "l2", order: -1 });
    });

    it("appends to the end when dropped on an empty list's container", () => {
        expect(computeCardMove(board, "c1", "l3")).toEqual({ listId: "l3", order: 0 });
    });

    it("appends to the end when dropped on a non-empty list's container", () => {
        expect(computeCardMove(board, "c1", "l2")).toEqual({ listId: "l2", order: 1 });
    });
});

describe("computeListMove", () => {
    it("returns null when dropped on itself", () => {
        expect(computeListMove(board, "l1", "l1")).toBeNull();
    });

    it("returns null when overListId doesn't exist", () => {
        expect(computeListMove(board, "l1", "does-not-exist")).toBeNull();
    });

    it("computes the order to move a list before another", () => {
        expect(computeListMove(board, "l3", "l1")).toEqual({ order: -1 });
    });

    it("computes the order to move a list between two others", () => {
        expect(computeListMove(board, "l1", "l3")).toEqual({ order: 1.5 });
    });
});

describe("resolveDragEndIntent", () => {
    it("returns a list intent when the active item is a list", () => {
        expect(resolveDragEndIntent(board, "l3", { type: "list" }, "l1")).toEqual({
            kind: "list",
            listId: "l3",
            order: -1,
        });
    });

    it("returns a card intent when the active item is a card", () => {
        expect(
            resolveDragEndIntent(board, "c1", { type: "card", listId: "l1" }, "c3"),
        ).toEqual({ kind: "card", cardId: "c1", listId: "l2", order: -1 });
    });

    it("returns null when the underlying list move resolves to a no-op", () => {
        expect(resolveDragEndIntent(board, "l1", { type: "list" }, "l1")).toBeNull();
    });

    it("returns null when the underlying card move resolves to a no-op", () => {
        expect(
            resolveDragEndIntent(board, "c1", { type: "card", listId: "l1" }, "c1"),
        ).toBeNull();
    });

    it("returns null when the active item has no recognized data", () => {
        expect(resolveDragEndIntent(board, "c1", undefined, "c3")).toBeNull();
    });
});
