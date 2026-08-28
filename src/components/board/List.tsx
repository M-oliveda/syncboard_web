import { MoreHorizontal } from "lucide-react";

import { AddCardInput } from "@/components/board/AddCardInput";
import { CardItem } from "@/components/board/Card";
import type { BoardList as BoardListData } from "@/types/board";

export interface ListProps {
    list: BoardListData;
    onCardClick?: (cardId: string) => void;
}

export function List({ list, onCardClick }: ListProps) {
    return (
        <div className="bg-surface-container-low flex h-full w-80 max-w-full shrink-0 flex-col rounded-xl shadow-sm">
            <div className="p-stack-md bg-surface-container-low sticky top-0 z-10 flex items-center justify-between rounded-t-xl">
                <div className="gap-stack-sm flex items-center">
                    <h2 className="text-title-md text-on-surface">{list.name}</h2>
                    <span className="bg-surface-container-high text-on-surface-variant text-label-caps rounded-full px-2 py-0.5">
                        {list.cards.length}
                    </span>
                </div>
                <button
                    type="button"
                    className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded p-1 transition-colors"
                    aria-label={`${list.name} list options`}
                >
                    <MoreHorizontal className="size-5" aria-hidden="true" />
                </button>
            </div>
            <div className="p-stack-md gap-stack-sm flex flex-1 flex-col overflow-y-auto pt-0 pb-2">
                {list.cards.map((card) => (
                    <CardItem
                        key={card.id}
                        card={card}
                        onClick={onCardClick ? () => onCardClick(card.id) : undefined}
                    />
                ))}
                <AddCardInput listName={list.name} />
            </div>
        </div>
    );
}
