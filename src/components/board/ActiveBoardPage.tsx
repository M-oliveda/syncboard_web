import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { AlertTriangle, ChevronRight } from "lucide-react";

import { BoardCanvas } from "@/components/board/BoardCanvas";
import { CardDetailModal } from "@/components/card-modal/CardDetailModal";
import { AppShell } from "@/components/layout/AppShell";
import { OriginUiEmptyState } from "@/components/ui/empty-state";
import { PresenceHeader } from "@/components/layout/PresenceHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoardQuery } from "@/hooks/useBoardQuery";
import { usePresenceQuery, useSocket } from "@/hooks/useSocket";
import { useCurrentWorkspace } from "@/hooks/useWorkspacesQuery";
import { findCardInBoard } from "@/lib/board";
import { mapApiWorkspaceMemberToWorkspaceMember } from "@/lib/api-mappers";

export function ActiveBoardPage() {
    const { boardId } = useParams({ from: "/app/boards/$boardId" });
    const { card: cardId } = useSearch({ from: "/app/boards/$boardId" });
    const navigate = useNavigate({ from: "/app/boards/$boardId" });
    const workspaceQuery = useCurrentWorkspace();
    const members = (workspaceQuery.data?.members ?? []).map(
        mapApiWorkspaceMemberToWorkspaceMember,
    );
    const memberLookup = new Map(members.map((member) => [member.id, member]));
    const boardQuery = useBoardQuery(boardId, memberLookup);
    const presenceQuery = usePresenceQuery(boardId);
    useSocket(boardId);

    const board = boardQuery.data;
    const selected = board && cardId ? findCardInBoard(board, cardId) : undefined;

    function openCard(id: string) {
        void navigate({ search: (prev) => ({ ...prev, card: id }) });
    }

    function closeCard() {
        void navigate({ search: (prev) => ({ ...prev, card: undefined }) });
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
            {boardQuery.isError && (
                <div className="p-stack-lg">
                    <OriginUiEmptyState
                        icon={AlertTriangle}
                        title="Couldn't load this board"
                        description="Something went wrong while loading the board. Please try again."
                    />
                </div>
            )}

            {boardQuery.isLoading && (
                <div className="p-stack-lg gap-stack-lg flex">
                    <Skeleton className="h-64 w-80 shrink-0 rounded-xl" />
                    <Skeleton className="h-64 w-80 shrink-0 rounded-xl" />
                    <Skeleton className="h-64 w-80 shrink-0 rounded-xl" />
                </div>
            )}

            {board && (
                <>
                    <div className="bg-surface border-surface-variant px-stack-lg py-stack-md flex flex-none items-center justify-between border-b">
                        <div className="gap-stack-md flex items-center">
                            <h1 className="text-headline-lg text-on-surface">
                                {board.name}
                            </h1>
                            <div
                                className="bg-outline-variant/30 h-6 w-px"
                                aria-hidden="true"
                            />
                            <PresenceHeader users={presenceQuery.data} />
                        </div>
                    </div>
                    <BoardCanvas
                        board={board}
                        boardId={boardId}
                        onCardClick={openCard}
                    />

                    {selected && (
                        <CardDetailModal
                            card={selected.card}
                            listName={selected.listName}
                            listId={selected.listId}
                            lists={board.lists}
                            members={members}
                            boardId={boardId}
                            open={true}
                            onOpenChange={closeCard}
                        />
                    )}
                </>
            )}
        </AppShell>
    );
}
