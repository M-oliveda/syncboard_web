import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ApiBoard, ApiCollection, ApiSuccess } from "@/types/api";

export const boardsQueryKey = (workspaceId: string) => ["boards", workspaceId] as const;

export function useBoardsQuery(workspaceId: string | undefined) {
    return useQuery({
        queryKey: boardsQueryKey(workspaceId ?? ""),
        queryFn: async () => {
            const response = await api.get<ApiCollection<ApiBoard>>(
                `/workspaces/${workspaceId}/boards`,
            );
            return response.data.data;
        },
        enabled: Boolean(workspaceId),
    });
}

export function useCreateBoardMutation(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (title: string) => {
            const response = await api.post<ApiSuccess<ApiBoard>>(
                `/workspaces/${workspaceId}/boards`,
                { title },
            );
            return response.data.data;
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: boardsQueryKey(workspaceId),
            });
        },
    });
}

export interface UpdateBoardInput {
    boardId: string;
    title: string;
}

export function useUpdateBoardMutation(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ boardId, title }: UpdateBoardInput) => {
            const response = await api.patch<ApiSuccess<ApiBoard>>(
                `/boards/${boardId}`,
                { title },
            );
            return response.data.data;
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: boardsQueryKey(workspaceId),
            });
        },
    });
}

export function useDeleteBoardMutation(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (boardId: string) => {
            await api.delete(`/boards/${boardId}`);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: boardsQueryKey(workspaceId),
            });
        },
    });
}
