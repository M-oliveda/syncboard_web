import { useQuery } from "@tanstack/react-query";

import { type ApiBoardDetail, mapApiBoardDetailToBoard } from "@/lib/api-mappers";
import { api } from "@/lib/api";
import type { ApiSuccess } from "@/types/api";
import type { Board } from "@/types/board";

export const boardQueryKey = (boardId: string) => ["board", boardId] as const;

export function useBoardQuery(boardId: string) {
    return useQuery<Board>({
        queryKey: boardQueryKey(boardId),
        queryFn: async () => {
            const response = await api.get<ApiSuccess<ApiBoardDetail>>(
                `/boards/${boardId}`,
            );
            return mapApiBoardDetailToBoard(response.data.data);
        },
    });
}
