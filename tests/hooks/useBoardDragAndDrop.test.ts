import type { DragEndEvent, Over } from "@dnd-kit/core";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBoardDragAndDrop } from "@/hooks/useBoardDragAndDrop";
import type { SortableItemData } from "@/lib/reorder";
import type { Board } from "@/types/board";

const moveCardMutate = vi.fn();
const moveListMutate = vi.fn();

vi.mock("@/hooks/useCardMutations", () => ({
    useMoveCardMutation: () => ({ mutate: moveCardMutate }),
}));
vi.mock("@/hooks/useListMutations", () => ({
    useMoveListMutation: () => ({ mutate: moveListMutate }),
}));

const board: Board = {
    id: "board-1",
    name: "Test Board",
    lists: [
        {
            id: "l1",
            order: 0,
            name: "To Do",
            cards: [{ id: "c1", order: 0, title: "First" }],
        },
        {
            id: "l2",
            order: 1,
            name: "Done",
            cards: [{ id: "c3", order: 0, title: "Third" }],
        },
    ],
};

function dragEndEvent(
    activeId: string,
    activeData: SortableItemData,
    overId: string | null,
): DragEndEvent {
    return {
        active: {
            id: activeId,
            data: { current: activeData },
            rect: { current: { initial: null, translated: null } },
        },
        over: overId
            ? ({ id: overId, disabled: false, data: { current: undefined } } as Over)
            : null,
        collisions: null,
        delta: { x: 0, y: 0 },
        activatorEvent: new Event("pointerdown"),
    };
}

describe("useBoardDragAndDrop", () => {
    beforeEach(() => {
        moveCardMutate.mockClear();
        moveListMutate.mockClear();
    });

    it("returns dnd-kit sensors alongside the drag-end handler", () => {
        const { result } = renderHook(() => useBoardDragAndDrop(board, "board-1"));

        expect(result.current.sensors.length).toBe(2);
    });

    it("does nothing when dropped outside any droppable", () => {
        const { result } = renderHook(() => useBoardDragAndDrop(board, "board-1"));

        result.current.handleDragEnd(
            dragEndEvent("c1", { type: "card", listId: "l1" }, null),
        );

        expect(moveCardMutate).not.toHaveBeenCalled();
        expect(moveListMutate).not.toHaveBeenCalled();
    });

    it("does nothing when the resolved intent is a no-op", () => {
        const { result } = renderHook(() => useBoardDragAndDrop(board, "board-1"));

        result.current.handleDragEnd(
            dragEndEvent("c1", { type: "card", listId: "l1" }, "c1"),
        );

        expect(moveCardMutate).not.toHaveBeenCalled();
        expect(moveListMutate).not.toHaveBeenCalled();
    });

    it("fires the card move mutation when a card is dropped on another card", () => {
        const { result } = renderHook(() => useBoardDragAndDrop(board, "board-1"));

        result.current.handleDragEnd(
            dragEndEvent("c1", { type: "card", listId: "l1" }, "c3"),
        );

        expect(moveCardMutate).toHaveBeenCalledWith({
            cardId: "c1",
            listId: "l2",
            order: -1,
        });
        expect(moveListMutate).not.toHaveBeenCalled();
    });

    it("fires the list move mutation when a list is dropped on another list", () => {
        const { result } = renderHook(() => useBoardDragAndDrop(board, "board-1"));

        result.current.handleDragEnd(dragEndEvent("l2", { type: "list" }, "l1"));

        expect(moveListMutate).toHaveBeenCalledWith({ listId: "l2", order: -1 });
        expect(moveCardMutate).not.toHaveBeenCalled();
    });
});
