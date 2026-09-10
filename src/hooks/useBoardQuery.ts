import { useQuery } from "@tanstack/react-query";

import { type ApiBoardDetail, mapApiBoardDetailToBoard } from "@/lib/api-mappers";
import { api } from "@/lib/api";
import type { ApiSuccess } from "@/types/api";
import type { Board } from "@/types/board";
import type { WorkspaceMember } from "@/types/workspace";

export const boardQueryKey = (boardId: string) => ["board", boardId] as const;

/** `memberLookup` (workspace members keyed by id) resolves card assignee ids to
 * displayable initials — see `mapApiCardToBoardCard`. Omit it for read-only contexts
 * (e.g. the static Roadmap board) that never call this with a real `boardId`. */
export function useBoardQuery(
    boardId: string,
    memberLookup?: Map<string, WorkspaceMember>,
) {
    return useQuery<Board>({
        queryKey: boardQueryKey(boardId),
        queryFn: async () => {
            const response = await api.get<ApiSuccess<ApiBoardDetail>>(
                `/boards/${boardId}`,
            );
            return mapApiBoardDetailToBoard(response.data.data, memberLookup);
        },
    });
}
