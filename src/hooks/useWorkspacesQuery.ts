import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ApiCollection, ApiSuccess, ApiWorkspace } from "@/types/api";

export const WORKSPACES_QUERY_KEY = ["workspaces"] as const;

export function useWorkspacesQuery() {
    return useQuery({
        queryKey: WORKSPACES_QUERY_KEY,
        queryFn: async () => {
            const response = await api.get<ApiCollection<ApiWorkspace>>("/workspaces");
            return response.data.data;
        },
    });
}

/** A freshly registered user starts with zero workspaces — this backs the
 * "create your first workspace" onboarding action `DashboardPage` shows in that
 * case, since there's no workspace-creation UI anywhere else yet. */
export function useCreateWorkspaceMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => {
            const response = await api.post<ApiSuccess<ApiWorkspace>>("/workspaces", {
                name,
            });
            return response.data.data;
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY });
        },
    });
}

/** No workspace switcher exists yet — the first workspace returned by the API stands
 * in for "the current workspace" until one is built. */
export function useCurrentWorkspace() {
    const query = useWorkspacesQuery();
    return { ...query, data: query.data?.[0] };
}
