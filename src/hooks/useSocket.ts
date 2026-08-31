import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { boardQueryKey } from "@/hooks/useBoardQuery";
import { getSocket, mapActiveUsersToPresence } from "@/lib/socket";
import { moveCardInBoard } from "@/lib/board";
import type { ApiBoardUserPresence, ApiCard, ApiProblem } from "@/types/api";
import type { Board, PresenceUser } from "@/types/board";

export const presenceQueryKey = (boardId: string) =>
    ["board", boardId, "presence"] as const;

/** Never actually invoked — `initialData` below always wins for this cache-only query
 * (populated exclusively by the socket's `board:user-presence` handler further down,
 * via `setQueryData`), so this only exists to get TanStack Query's "data is always
 * defined" typing instead of `PresenceUser[] | undefined`. Exported so it's exercised
 * directly in tests rather than left uncovered. */
export const emptyPresence = (): PresenceUser[] => [];

/** See `MASTERPLAN.md` §8.1 — presence has no REST source, so `ActiveBoardPage` reads
 * it via this plain `useQuery` purely for a reactive cache read, not to fetch. */
export function usePresenceQuery(boardId: string) {
    return useQuery({
        queryKey: presenceQueryKey(boardId),
        queryFn: emptyPresence,
        initialData: [] as PresenceUser[],
        staleTime: Infinity,
    });
}

/** Connects the singleton socket, joins `boardId`'s room, and patches the TanStack
 * Query cache directly from incoming events — never refetches the board on a socket
 * event (see `CLAUDE.md`'s Real-Time Sync section). One connection per open board:
 * connects/joins on mount, tears everything down (including the socket itself) on
 * unmount, which is also what makes logout clean — navigating away from the board
 * unmounts this hook's owner. `boardId` is optional so this can be called
 * unconditionally (Rules of Hooks) from read-only contexts like the static Roadmap
 * board, which never actually connects. */
export function useSocket(boardId: string | undefined): void {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!boardId) return;
        const activeBoardId = boardId;
        const socket = getSocket();

        function handleCardUpdated(card: ApiCard) {
            const board = queryClient.getQueryData<Board>(boardQueryKey(activeBoardId));
            if (!board) return;
            queryClient.setQueryData<Board>(
                boardQueryKey(activeBoardId),
                moveCardInBoard(board, card._id, card.listId, card.order),
            );
        }

        function handlePresence(payload: ApiBoardUserPresence) {
            if (payload.boardId !== activeBoardId) return;
            queryClient.setQueryData<PresenceUser[]>(
                presenceQueryKey(activeBoardId),
                mapActiveUsersToPresence(payload.activeUsers),
            );
        }

        function handleError(problem: ApiProblem) {
            console.error("Socket error", problem);
        }

        socket.connect();
        socket.emit("board:join", { boardId: activeBoardId });
        socket.on("card:updated", handleCardUpdated);
        socket.on("board:user-presence", handlePresence);
        socket.on("error", handleError);

        return () => {
            socket.off("card:updated", handleCardUpdated);
            socket.off("board:user-presence", handlePresence);
            socket.off("error", handleError);
            socket.disconnect();
        };
    }, [boardId, queryClient]);
}
