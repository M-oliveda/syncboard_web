import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { BoardCanvas } from "@/components/board/BoardCanvas";
import { CardDetailModal } from "@/components/card-modal/CardDetailModal";
import { AppShell } from "@/components/layout/AppShell";
import { PresenceHeader } from "@/components/layout/PresenceHeader";
import { findCardInBoard } from "@/lib/board";
import { mockActiveBoard, mockPresence } from "@/lib/mock-board";

export function ActiveBoardPage() {
    const { card: cardId } = useSearch({ from: "/app/boards/$boardId" });
    const navigate = useNavigate({ from: "/app/boards/$boardId" });

    const selected = cardId ? findCardInBoard(mockActiveBoard, cardId) : undefined;

    function openCard(id: string) {
        navigate({ search: (prev) => ({ ...prev, card: id }) });
    }

    function closeCard() {
        navigate({ search: (prev) => ({ ...prev, card: undefined }) });
    }

    return (
        <AppShell
            breadcrumb={
                <>
                    <span>Workspace</span>
                    <ChevronRight className="size-4" aria-hidden="true" />
                    <span className="text-on-surface font-semibold">Boards</span>
                </>
            }
        >
            <div className="bg-surface border-surface-variant px-stack-lg py-stack-md flex flex-none items-center justify-between border-b">
                <div className="gap-stack-md flex items-center">
                    <h1 className="text-headline-lg text-on-surface">
                        {mockActiveBoard.name}
                    </h1>
                    <div
                        className="bg-outline-variant/30 h-6 w-px"
                        aria-hidden="true"
                    />
                    <PresenceHeader users={mockPresence} />
                </div>
            </div>
            <BoardCanvas board={mockActiveBoard} onCardClick={openCard} />

            {selected && (
                <CardDetailModal
                    card={selected.card}
                    listName={selected.listName}
                    open={true}
                    onOpenChange={closeCard}
                />
            )}
        </AppShell>
    );
}
