import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { useMoveCardMutation } from "@/hooks/useCardMutations";
import { useMoveListMutation } from "@/hooks/useListMutations";
import { resolveDragEndIntent, type SortableItemData } from "@/lib/reorder";
import type { Board } from "@/types/board";

/** Wires `@dnd-kit`'s sensors and `onDragEnd` to the board's optimistic move
 * mutations. All the actual move-resolution logic lives in the pure, separately
 * unit-tested `resolveDragEndIntent` (`src/lib/reorder.ts`) — this hook is just the
 * glue between a real `DragEndEvent` and the two mutations, kept thin enough that its
 * `handleDragEnd` can be exercised directly in tests without simulating a real drag
 * gesture (not reliably possible in jsdom). `boardId` is optional so this can be
 * called unconditionally (Rules of Hooks) from the read-only Roadmap board, which
 * disables dragging per-item instead (see `List`/`CardItem`'s `disabled` props). */
export function useBoardDragAndDrop(board: Board, boardId: string | undefined) {
    const moveCardMutation = useMoveCardMutation(boardId);
    const moveListMutation = useMoveListMutation(boardId);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;

        const intent = resolveDragEndIntent(
            board,
            String(active.id),
            active.data.current as SortableItemData | undefined,
            String(over.id),
        );
        if (!intent) return;

        if (intent.kind === "list") {
            moveListMutation.mutate({ listId: intent.listId, order: intent.order });
        } else {
            moveCardMutation.mutate({
                cardId: intent.cardId,
                listId: intent.listId,
                order: intent.order,
            });
        }
    }

    return { sensors, handleDragEnd };
}
