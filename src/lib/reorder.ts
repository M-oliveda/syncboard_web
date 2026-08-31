import type { Board } from "@/types/board";

/** Discriminant carried in each dnd-kit sortable's `data`, so `onDragEnd` can tell a
 * dragged/dropped-on list apart from a card without inspecting the DOM. */
export type SortableItemData = { type: "list" } | { type: "card"; listId: string };

/** Fractional/LexoRank-style order — matches the backend's scheme
 * (`api/MASTERPLAN.md` §5.3): a plain float, set as the midpoint between the two
 * neighbors it's inserted between, or `±1` past the current min/max at either end.
 * No client-side rebalancing — precision drift under heavy repeated inserts is the
 * API's documented v1 follow-up, not this project's job. */
export function computeOrderForIndex(
    siblingOrders: number[],
    targetIndex: number,
): number {
    if (siblingOrders.length === 0) return 0;

    if (targetIndex <= 0) {
        /* v8 ignore next -- @preserve: length > 0 guard above guarantees index 0 exists */
        return (siblingOrders[0] ?? 0) - 1;
    }

    if (targetIndex >= siblingOrders.length) {
        /* v8 ignore next -- @preserve: length > 0 guard above guarantees the last index exists */
        return (siblingOrders[siblingOrders.length - 1] ?? 0) + 1;
    }

    /* v8 ignore next -- @preserve: 0 < targetIndex < length guarantees this index exists */
    const before = siblingOrders[targetIndex - 1] ?? 0;
    /* v8 ignore next -- @preserve: 0 < targetIndex < length guarantees this index exists */
    const after = siblingOrders[targetIndex] ?? 0;
    return (before + after) / 2;
}

/** Resolves a dnd-kit card drag into a destination list + fractional order, given the
 * dropped-on id (`overId`) — either another card's id (insert just before it) or a
 * list's own id (dropped on the list container itself, e.g. an empty list or below its
 * last card — append at the end). Returns `null` for a no-op drop (dropped on itself,
 * or an `overId` that matches neither a card nor a list). Pure and dnd-kit-agnostic so
 * it's unit-testable without simulating a real drag. */
export function computeCardMove(
    board: Board,
    activeCardId: string,
    overId: string,
): { listId: string; order: number } | null {
    if (activeCardId === overId) return null;

    const overList = board.lists.find((list) => list.id === overId);
    const destList =
        overList ??
        board.lists.find((list) => list.cards.some((card) => card.id === overId));
    if (!destList) return null;

    const siblings = destList.cards.filter((card) => card.id !== activeCardId);
    const targetIndex = overList
        ? siblings.length
        : siblings.findIndex((card) => card.id === overId);

    return {
        listId: destList.id,
        order: computeOrderForIndex(
            siblings.map((card) => card.order),
            targetIndex,
        ),
    };
}

/** Resolves a dnd-kit list drag into a fractional order, given the list id dropped on
 * (`overId`). Returns `null` for a no-op drop. */
export function computeListMove(
    board: Board,
    activeListId: string,
    overListId: string,
): { order: number } | null {
    if (activeListId === overListId) return null;

    const siblings = board.lists.filter((list) => list.id !== activeListId);
    const overIndex = siblings.findIndex((list) => list.id === overListId);
    if (overIndex === -1) return null;

    return { order: computeOrderForIndex(siblings.map((list) => list.order), overIndex) };
}

export type DragEndIntent =
    | { kind: "list"; listId: string; order: number }
    | { kind: "card"; cardId: string; listId: string; order: number };

/** Translates a dnd-kit `onDragEnd` (already unwrapped to its `active`/`over` ids and
 * the dragged item's `data`) into a single mutation to fire, or `null` for a no-op
 * drop. Kept dnd-kit-event-shape-agnostic (plain string ids + `SortableItemData`) so
 * it's unit-testable without constructing a real `DragEndEvent`. */
export function resolveDragEndIntent(
    board: Board,
    activeId: string,
    activeData: SortableItemData | undefined,
    overId: string,
): DragEndIntent | null {
    if (activeData?.type === "list") {
        const move = computeListMove(board, activeId, overId);
        return move ? { kind: "list", listId: activeId, order: move.order } : null;
    }

    if (activeData?.type === "card") {
        const move = computeCardMove(board, activeId, overId);
        return move
            ? { kind: "card", cardId: activeId, listId: move.listId, order: move.order }
            : null;
    }

    return null;
}
