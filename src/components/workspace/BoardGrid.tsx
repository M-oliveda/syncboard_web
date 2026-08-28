import { Plus } from "lucide-react";

import { BoardCard } from "@/components/workspace/BoardCard";
import type { BoardSummary } from "@/types/workspace";

export interface BoardGridProps {
    boards: BoardSummary[];
}

export function BoardGrid({ boards }: BoardGridProps) {
    return (
        <div className="gap-gutter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <button
                type="button"
                className="bg-surface-container-low border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container group flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300"
            >
                <div className="bg-surface-container-highest group-hover:bg-primary group-hover:text-on-primary text-on-surface mb-stack-sm flex size-12 items-center justify-center rounded-full shadow-sm transition-colors duration-300">
                    <Plus className="size-6" aria-hidden="true" />
                </div>
                <span className="text-title-md text-on-surface group-hover:text-primary transition-colors">
                    New Board
                </span>
                <span className="text-body-sm text-on-surface-variant mt-1">
                    Create from template
                </span>
            </button>

            {boards.map((board) => (
                <BoardCard key={board.id} board={board} />
            ))}
        </div>
    );
}
