import { Plus } from "lucide-react";

import { List } from "@/components/board/List";
import type { Board } from "@/types/board";

export interface BoardCanvasProps {
    board: Board;
    onCardClick?: (cardId: string) => void;
}

export function BoardCanvas({ board, onCardClick }: BoardCanvasProps) {
    return (
        <div className="bg-background flex-1 overflow-x-auto overflow-y-hidden">
            <div className="p-stack-lg gap-stack-lg flex h-full min-w-max items-start">
                {board.lists.map((list) => (
                    <List key={list.id} list={list} onCardClick={onCardClick} />
                ))}
                <button
                    type="button"
                    className="border-outline-variant/50 hover:bg-surface-container-low hover:border-outline/50 text-on-surface-variant text-label-caps flex h-24 w-80 shrink-0 items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors"
                >
                    <Plus className="size-4" aria-hidden="true" />
                    Add column
                </button>
            </div>
        </div>
    );
}
