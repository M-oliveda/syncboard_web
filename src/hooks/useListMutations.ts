import { useMutation, useQueryClient } from "@tanstack/react-query";

import { boardQueryKey } from "@/hooks/useBoardQuery";
import { api } from "@/lib/api";

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
