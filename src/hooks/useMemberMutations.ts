import { useMutation, useQueryClient } from "@tanstack/react-query";

import { WORKSPACES_QUERY_KEY } from "@/hooks/useWorkspacesQuery";
import { api } from "@/lib/api";
import type { MemberRole } from "@/types/workspace";

const API_ROLE_MAP: Record<MemberRole, "Admin" | "Member"> = {
    admin: "Admin",
    member: "Member",
};

export function useUpdateMemberRoleMutation(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: MemberRole }) => {
            await api.patch(`/workspaces/${workspaceId}/members/${userId}`, {
                role: API_ROLE_MAP[role],
            });
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY });
        },
    });
}

export function useRemoveMemberMutation(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY });
        },
    });
}
