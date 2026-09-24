import { useMutation, useQueryClient } from "@tanstack/react-query";

import { boardQueryKey } from "@/hooks/useBoardQuery";
import { api } from "@/lib/api";
import { moveListInBoard } from "@/lib/board";
import type { ApiList, ApiSuccess } from "@/types/api";
import type { Board } from "@/types/board";

/** Normal (non-optimistic) create/rename/delete for lists — Phase 2 scope. Optimistic
 * reordering (`order`) is Phase 4's job and untouched here. `boardId` is optional so
 * these can be called unconditionally (Rules of Hooks) from read-only contexts like
 * the static Roadmap demo board, which never actually triggers the mutation. */
export function useCreateListMutation(boardId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (title: string) => {
            await api.post(`/boards/${boardId}/lists`, { title });
        },
        onSuccess: () => {
            if (!boardId) return;
            void queryClient.invalidateQueries({ queryKey: boardQueryKey(boardId) });
        },
    });
}

export function useDeleteListMutation(boardId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (listId: string) => {
            await api.delete(`/lists/${listId}`);
        },
        onSuccess: () => {
            if (!boardId) return;
            void queryClient.invalidateQueries({ queryKey: boardQueryKey(boardId) });
        },
    });
}

export interface MoveListInput {
    listId: string;
    order: number;
}

interface MoveListContext {
    previousBoard: Board | undefined;
}

/** Optimistic list-reorder — Phase 4 scope, same onMutate/onError/onSuccess shape as
 * `useMoveCardMutation`. `boardId` is optional for the same Rules-of-Hooks reason as
 * the other mutations above. */
export function useMoveListMutation(boardId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation<ApiList, unknown, MoveListInput, MoveListContext>({
        mutationFn: async ({ listId, order }: MoveListInput) => {
            const response = await api.patch<ApiSuccess<ApiList>>(`/lists/${listId}`, {
                order,
            });
            return response.data.data;
        },
        onMutate: async ({ listId, order }) => {
            if (!boardId) return { previousBoard: undefined };

            await queryClient.cancelQueries({ queryKey: boardQueryKey(boardId) });
            const previousBoard = queryClient.getQueryData<Board>(
                boardQueryKey(boardId),
            );
            if (previousBoard) {
                queryClient.setQueryData<Board>(
                    boardQueryKey(boardId),
                    moveListInBoard(previousBoard, listId, order),
                );
            }
            return { previousBoard };
        },
        onError: (_error, _variables, context) => {
            if (boardId && context?.previousBoard) {
                queryClient.setQueryData(boardQueryKey(boardId), context.previousBoard);
            }
        },
        onSuccess: (list) => {
            if (!boardId) return;
            const board = queryClient.getQueryData<Board>(boardQueryKey(boardId));
            if (!board) return;
            queryClient.setQueryData<Board>(
                boardQueryKey(boardId),
                moveListInBoard(board, list._id, list.order),
            );
        },
    });
}
