import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useState } from "react";

import { List } from "@/components/board/List";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useBoardDragAndDrop } from "@/hooks/useBoardDragAndDrop";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateListMutation } from "@/hooks/useListMutations";
import type { Board } from "@/types/board";

export interface BoardCanvasProps {
    board: Board;
    /** Omitted for read-only contexts (the static Roadmap demo board) — the "add
     * column" affordance doesn't render without a real board to persist to. */
    boardId?: string;
    onCardClick?: (cardId: string) => void;
}

export function BoardCanvas({ board, boardId, onCardClick }: BoardCanvasProps) {
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [columnTitle, setColumnTitle] = useState("");
    const createListMutation = useCreateListMutation(boardId);
    const { sensors, handleDragEnd } = useBoardDragAndDrop(board, boardId);
    const isMobile = useIsMobile();

    async function handleAddColumn(event: React.FormEvent) {
        event.preventDefault();
        const trimmed = columnTitle.trim();
        if (!trimmed) return;

        try {
            await createListMutation.mutateAsync(trimmed);
        } catch {
            return;
        }
        setColumnTitle("");
        setIsAddingColumn(false);
    }

    const addColumnControl = boardId ? (
        isAddingColumn ? (
            <form
                onSubmit={(event) => void handleAddColumn(event)}
                className="bg-surface-container-low gap-stack-sm flex w-80 shrink-0 flex-col rounded-xl p-3 shadow-sm"
            >
                <input
                    autoFocus
                    value={columnTitle}
                    onChange={(event) => setColumnTitle(event.target.value)}
                    placeholder="List name"
                    className="text-body-base text-on-surface w-full rounded border-0 bg-transparent p-0 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                    <button
                        type="submit"
                        disabled={createListMutation.isPending}
                        className="bg-primary text-on-primary text-body-sm rounded-lg px-3 py-1.5"
                    >
                        {createListMutation.isPending ? "Adding…" : "Add column"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsAddingColumn(false)}
                        className="text-on-surface-variant text-body-sm px-2"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        ) : (
            <button
                type="button"
                onClick={() => setIsAddingColumn(true)}
                className="border-outline-variant/50 hover:bg-surface-container-low hover:border-outline/50 text-on-surface-variant text-label-caps flex h-24 w-80 shrink-0 items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors"
            >
                <Plus className="size-4" aria-hidden="true" />
                Add column
            </button>
        )
    ) : null;

    if (isMobile) {
        return (
            <Carousel
                opts={{ watchDrag: false, align: "start" }}
                className="flex flex-1 flex-col overflow-hidden"
            >
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <CarouselContent className="p-stack-lg gap-stack-lg -ml-0 items-start">
                        <SortableContext
                            items={board.lists.map((list) => list.id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            {board.lists.map((list) => (
                                <CarouselItem key={list.id} className="basis-auto pl-0">
                                    <List
                                        boardId={boardId}
                                        list={list}
                                        onCardClick={onCardClick}
                                    />
                                </CarouselItem>
                            ))}
                        </SortableContext>

                        {addColumnControl && (
                            <CarouselItem className="basis-auto pl-0">
                                {addColumnControl}
                            </CarouselItem>
                        )}
                    </CarouselContent>
                </DndContext>
                <div className="gap-stack-sm py-stack-sm flex items-center justify-center">
                    <CarouselPrevious className="static translate-x-0 translate-y-0" />
                    <CarouselNext className="static translate-x-0 translate-y-0" />
                </div>
            </Carousel>
        );
    }

    return (
        <div className="bg-background flex-1 overflow-x-auto overflow-y-hidden">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="p-stack-lg gap-stack-lg flex h-full min-w-max items-start">
                    <SortableContext
                        items={board.lists.map((list) => list.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {board.lists.map((list) => (
                            <List
                                key={list.id}
                                boardId={boardId}
                                list={list}
                                onCardClick={onCardClick}
                            />
                        ))}
                    </SortableContext>

                    {addColumnControl}
                </div>
            </DndContext>
        </div>
    );
}
