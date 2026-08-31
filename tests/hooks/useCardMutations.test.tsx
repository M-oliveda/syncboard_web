import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { boardQueryKey } from "@/hooks/useBoardQuery";
import { useCreateCardMutation, useMoveCardMutation } from "@/hooks/useCardMutations";
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
        {
            id: "l1",
            order: 0,
            name: "To Do",
            cards: [{ id: "c1", order: 0, title: "First" }],
        },
        { id: "l2", order: 1, name: "Done", cards: [] },
    ],
};

describe("useCreateCardMutation", () => {
    it("creates a card and skips invalidation when boardId is undefined", async () => {
        server.use(
            http.post("*/lists/:listId/cards", () =>
                HttpResponse.json(
                    { success: true, data: { _id: "card-new", title: "New" } },
                    { status: 201 },
                ),
            ),
        );
        const { result } = renderHook(
            () => useCreateCardMutation(undefined, "list-1"),
            { wrapper: makeWrapper(newQueryClient()) },
        );

        result.current.mutate("New");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
});

describe("useMoveCardMutation", () => {
    it("optimistically moves the card and reconciles with the server response", async () => {
        server.use(
            http.patch("*/cards/:cardId", () =>
                HttpResponse.json({
                    success: true,
                    data: { _id: "c1", listId: "l2", order: -1 },
                }),
            ),
        );
        const queryClient = newQueryClient();
        queryClient.setQueryData(boardQueryKey("board-1"), board);
        const { result } = renderHook(() => useMoveCardMutation("board-1"), {
            wrapper: makeWrapper(queryClient),
        });

        result.current.mutate({ cardId: "c1", listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        const updated = queryClient.getQueryData<Board>(boardQueryKey("board-1"));
        expect(updated?.lists.find((list) => list.id === "l1")?.cards).toHaveLength(0);
        expect(
            updated?.lists
                .find((list) => list.id === "l2")
                ?.cards.map((card) => card.id),
        ).toEqual(["c1"]);
    });

    it("rolls back the optimistic move when the request fails", async () => {
        server.use(http.patch("*/cards/:cardId", () => HttpResponse.error()));
        const queryClient = newQueryClient();
        queryClient.setQueryData(boardQueryKey("board-1"), board);
        const { result } = renderHook(() => useMoveCardMutation("board-1"), {
            wrapper: makeWrapper(queryClient),
        });

        result.current.mutate({ cardId: "c1", listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(queryClient.getQueryData<Board>(boardQueryKey("board-1"))).toEqual(
            board,
        );
    });

    it("skips all cache writes when boardId is undefined", async () => {
        server.use(
            http.patch("*/cards/:cardId", () =>
                HttpResponse.json({
                    success: true,
                    data: { _id: "c1", listId: "l2", order: -1 },
                }),
            ),
        );
        const { result } = renderHook(() => useMoveCardMutation(undefined), {
            wrapper: makeWrapper(newQueryClient()),
        });

        result.current.mutate({ cardId: "c1", listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it("is a no-op error rollback when boardId is undefined", async () => {
        server.use(http.patch("*/cards/:cardId", () => HttpResponse.error()));
        const { result } = renderHook(() => useMoveCardMutation(undefined), {
            wrapper: makeWrapper(newQueryClient()),
        });

        result.current.mutate({ cardId: "c1", listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("handles nothing-cached-yet for both onMutate and onSuccess", async () => {
        server.use(
            http.patch("*/cards/:cardId", () =>
                HttpResponse.json({
                    success: true,
                    data: { _id: "c1", listId: "l2", order: -1 },
                }),
            ),
        );
        const { result } = renderHook(() => useMoveCardMutation("board-1"), {
            wrapper: makeWrapper(newQueryClient()),
        });

        result.current.mutate({ cardId: "c1", listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it("handles nothing-cached-yet on error rollback", async () => {
        server.use(http.patch("*/cards/:cardId", () => HttpResponse.error()));
        const { result } = renderHook(() => useMoveCardMutation("board-1"), {
            wrapper: makeWrapper(newQueryClient()),
        });

        result.current.mutate({ cardId: "c1", listId: "l2", order: -1 });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
