import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { boardQueryKey } from "@/hooks/useBoardQuery";
import {
    useCreateListMutation,
    useDeleteListMutation,
    useMoveListMutation,
} from "@/hooks/useListMutations";
import type { Board } from "@/types/board";

import { server } from "../mocks/server";

function makeWrapper(queryClient: QueryClient) {
    return function wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    };
}

function newQueryClient() {
    return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

const board: Board = {
    id: "board-1",
    name: "Test Board",
    lists: [
        { id: "l1", order: 0, name: "To Do", cards: [] },
        { id: "l2", order: 1, name: "Done", cards: [] },
    ],
};

describe("useListMutations", () => {
    it("creates a list and skips invalidation when boardId is undefined", async () => {
        server.use(
            http.post("*/boards/:boardId/lists", () =>
                HttpResponse.json(
                    { success: true, data: { _id: "list-new", title: "New" } },
                    { status: 201 },
                ),
            ),
        );
        const { result } = renderHook(() => useCreateListMutation(undefined), {
            wrapper: makeWrapper(newQueryClient()),
        });

        result.current.mutate("New");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it("deletes a list and skips invalidation when boardId is undefined", async () => {
        server.use(
            http.delete(
                "*/lists/:listId",
                () => new HttpResponse(null, { status: 204 }),
            ),
        );
        const { result } = renderHook(() => useDeleteListMutation(undefined), {
            wrapper: makeWrapper(newQueryClient()),
        });

        result.current.mutate("list-1");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
});

describe("useMoveListMutation", () => {
    it("optimistically reorders the list and reconciles with the server response", async () => {
        server.use(
            http.patch("*/lists/:listId", () =>
                HttpResponse.json({
                    success: true,
                    data: { _id: "l2", boardId: "board-1", title: "Done", order: -1 },
                }),
            ),
        );
        const queryClient = newQueryClient();
        queryClient.setQueryData(boardQueryKey("board-1"), board);
        const { result } = renderHook(() => useMoveListMutation("board-1"), {
            wrapper: makeWrapper(queryClient),
        });

        result.current.mutate({ listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        const updated = queryClient.getQueryData<Board>(boardQueryKey("board-1"));
        expect(updated?.lists.map((list) => list.id)).toEqual(["l2", "l1"]);
    });

    it("rolls back the optimistic reorder when the request fails", async () => {
        server.use(http.patch("*/lists/:listId", () => HttpResponse.error()));
        const queryClient = newQueryClient();
        queryClient.setQueryData(boardQueryKey("board-1"), board);
        const { result } = renderHook(() => useMoveListMutation("board-1"), {
            wrapper: makeWrapper(queryClient),
        });

        result.current.mutate({ listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(queryClient.getQueryData<Board>(boardQueryKey("board-1"))).toEqual(
            board,
        );
    });

    it("skips all cache writes when boardId is undefined", async () => {
        server.use(
            http.patch("*/lists/:listId", () =>
                HttpResponse.json({
                    success: true,
                    data: { _id: "l2", boardId: "board-1", title: "Done", order: -1 },
                }),
            ),
        );
        const { result } = renderHook(() => useMoveListMutation(undefined), {
            wrapper: makeWrapper(newQueryClient()),
        });

        result.current.mutate({ listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it("is a no-op error rollback when boardId is undefined", async () => {
        server.use(http.patch("*/lists/:listId", () => HttpResponse.error()));
        const { result } = renderHook(() => useMoveListMutation(undefined), {
            wrapper: makeWrapper(newQueryClient()),
        });

        result.current.mutate({ listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("handles nothing-cached-yet for both onMutate and onSuccess", async () => {
        server.use(
            http.patch("*/lists/:listId", () =>
                HttpResponse.json({
                    success: true,
                    data: { _id: "l2", boardId: "board-1", title: "Done", order: -1 },
                }),
            ),
        );
        const { result } = renderHook(() => useMoveListMutation("board-1"), {
            wrapper: makeWrapper(newQueryClient()),
        });

        result.current.mutate({ listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it("handles nothing-cached-yet on error rollback", async () => {
        server.use(http.patch("*/lists/:listId", () => HttpResponse.error()));
        const { result } = renderHook(() => useMoveListMutation("board-1"), {
            wrapper: makeWrapper(newQueryClient()),
        });

        result.current.mutate({ listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
