import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal } from "lucide-react";

import { AddCardInput } from "@/components/board/AddCardInput";
import { CardItem } from "@/components/board/Card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteListMutation } from "@/hooks/useListMutations";
import type { SortableItemData } from "@/lib/reorder";
import type { BoardList as BoardListData } from "@/types/board";

export interface ListProps {
    /** Omitted for read-only contexts (the static Roadmap demo board) — list options,
     * "add a card", and drag-and-drop don't render/activate without a real board to
     * persist to. */
    boardId?: string;
    list: BoardListData;
    onCardClick?: (cardId: string) => void;
}

export function List({ boardId, list, onCardClick }: ListProps) {
    const deleteListMutation = useDeleteListMutation(boardId);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: list.id,
            data: { type: "list" } satisfies SortableItemData,
            disabled: !boardId,
        });
    const dragStyle: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        /* v8 ignore next -- @preserve: isDragging only flips true mid a real pointer
         * drag gesture, which jsdom can't simulate; covered by e2e/board-drag.spec.ts */
        opacity: isDragging ? 0.4 : undefined,
    };
    /* Only spread dnd-kit's attributes/listeners when dragging is actually possible —
     * see the matching comment in Card.tsx for why. */
    const dragProps = boardId ? { ...attributes, ...listeners } : {};

    return (
        <div
            ref={setNodeRef}
            style={dragStyle}
            className="bg-surface-container-low flex h-full w-80 max-w-full shrink-0 flex-col rounded-xl shadow-sm"
        >
            <div
                {...dragProps}
                className="p-stack-md bg-surface-container-low sticky top-0 z-10 flex items-center justify-between rounded-t-xl"
            >
                <div className="gap-stack-sm flex items-center">
                    <h2 className="text-title-md text-on-surface">{list.name}</h2>
                    <span className="bg-surface-container-high text-on-surface-variant text-label-caps rounded-full px-2 py-0.5">
                        {list.cards.length}
                    </span>
                </div>
                {boardId && (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button
                                    type="button"
                                    aria-label={`${list.name} list options`}
                                    className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded p-1 transition-colors"
                                />
                            }
                        >
                            <MoreHorizontal className="size-5" aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => deleteListMutation.mutate(list.id)}
                            >
                                Delete list
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            <div className="p-stack-md gap-stack-sm flex flex-1 flex-col overflow-y-auto pt-0 pb-2">
                <SortableContext
                    items={list.cards.map((card) => card.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {list.cards.map((card) => (
                        <CardItem
                            key={card.id}
                            card={card}
                            listId={list.id}
                            dragDisabled={!boardId}
                            onClick={
                                onCardClick ? () => onCardClick(card.id) : undefined
                            }
                        />
                    ))}
                </SortableContext>
                {boardId && (
                    <AddCardInput
                        boardId={boardId}
                        listId={list.id}
                        listName={list.name}
                    />
                )}
            </div>
        </div>
    );
}
