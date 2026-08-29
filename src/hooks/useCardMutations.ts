import { useMutation, useQueryClient } from "@tanstack/react-query";

import { boardQueryKey } from "@/hooks/useBoardQuery";
import { api } from "@/lib/api";
import type { ApiChecklistItem } from "@/types/api";

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
