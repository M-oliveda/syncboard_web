import { useMutation, useQueryClient } from "@tanstack/react-query";

import { boardQueryKey } from "@/hooks/useBoardQuery";
import { api } from "@/lib/api";
import { moveCardInBoard } from "@/lib/board";
import type { ApiCard, ApiChecklistItem, ApiSuccess } from "@/types/api";
import type { Board } from "@/types/board";

export interface UpdateCardInput {
    cardId: string;
    title?: string;
    description?: string;
    labels?: string[];
    checklist?: ApiChecklistItem[];
}

/** Normal (non-optimistic) create/update/delete for cards — Phase 2 scope. Moving a
 * card between lists/positions (`listId`/`order`) is Phase 4's optimistic-drag job.
 * `boardId` is optional so these can be called unconditionally (Rules of Hooks) from
 * read-only contexts like the static Roadmap demo board, which never actually
 * triggers the mutation. */
export function useCreateCardMutation(boardId: string | undefined, listId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (title: string) => {
            await api.post(`/lists/${listId}/cards`, { title });
        },
        onSuccess: () => {
            if (!boardId) return;
            void queryClient.invalidateQueries({ queryKey: boardQueryKey(boardId) });
        },
    });
}

export function useUpdateCardMutation(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ cardId, ...updates }: UpdateCardInput) => {
            await api.patch(`/cards/${cardId}`, updates);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: boardQueryKey(boardId) });
        },
    });
}

export function useDeleteCardMutation(boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (cardId: string) => {
            await api.delete(`/cards/${cardId}`);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: boardQueryKey(boardId) });
        },
    });
}

export interface MoveCardInput {
    cardId: string;
    listId: string;
    order: number;
}

interface MoveCardContext {
    previousBoard: Board | undefined;
}

/** Optimistic drag-and-drop move — Phase 4 scope. `onMutate` snapshots the board
 * before writing the optimistic guess into the cache; `onError` rolls back to that
 * snapshot; `onSuccess` reconciles with the server's own `listId`/`order` in case it
 * ever differs from the guess. `boardId` is optional for the same Rules-of-Hooks
 * reason as the other mutations above — the read-only Roadmap board never triggers a
 * drag, so this mutation is never actually called there. */
export function useMoveCardMutation(boardId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation<ApiCard, unknown, MoveCardInput, MoveCardContext>({
        mutationFn: async ({ cardId, listId, order }: MoveCardInput) => {
            const response = await api.patch<ApiSuccess<ApiCard>>(`/cards/${cardId}`, {
                listId,
                order,
            });
            return response.data.data;
        },
        onMutate: async ({ cardId, listId, order }) => {
            if (!boardId) return { previousBoard: undefined };

            await queryClient.cancelQueries({ queryKey: boardQueryKey(boardId) });
            const previousBoard = queryClient.getQueryData<Board>(
                boardQueryKey(boardId),
            );
            if (previousBoard) {
                queryClient.setQueryData<Board>(
                    boardQueryKey(boardId),
                    moveCardInBoard(previousBoard, cardId, listId, order),
                );
            }
            return { previousBoard };
        },
        onError: (_error, _variables, context) => {
            if (boardId && context?.previousBoard) {
                queryClient.setQueryData(boardQueryKey(boardId), context.previousBoard);
            }
        },
        onSuccess: (card) => {
            if (!boardId) return;
            const board = queryClient.getQueryData<Board>(boardQueryKey(boardId));
            if (!board) return;
            queryClient.setQueryData<Board>(
                boardQueryKey(boardId),
                moveCardInBoard(board, card._id, card.listId, card.order),
            );
        },
    });
}
