import { Plus } from "lucide-react";
import { useState } from "react";

import { List } from "@/components/board/List";
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

    return (
        <div className="bg-background flex-1 overflow-x-auto overflow-y-hidden">
            <div className="p-stack-lg gap-stack-lg flex h-full min-w-max items-start">
                {board.lists.map((list) => (
                    <List
                        key={list.id}
                        boardId={boardId}
                        list={list}
                        onCardClick={onCardClick}
                    />
                ))}

                {boardId &&
                    (isAddingColumn ? (
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
                                    {createListMutation.isPending
                                        ? "Adding…"
                                        : "Add column"}
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
                    ))}
            </div>
        </div>
    );
}
