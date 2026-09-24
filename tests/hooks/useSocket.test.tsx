import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { boardQueryKey } from "@/hooks/useBoardQuery";
import {
    emptyPresence,
    presenceQueryKey,
    usePresenceQuery,
    useSocket,
} from "@/hooks/useSocket";
import type { Board } from "@/types/board";

import { mockSocket } from "../mocks/socket";

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

describe("useSocket", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("connects, joins the board room, and registers event listeners", () => {
        const queryClient = newQueryClient();
        const { unmount } = renderHook(() => useSocket("board-1"), {
            wrapper: makeWrapper(queryClient),
        });

        expect(mockSocket.connect).toHaveBeenCalledTimes(1);
        expect(mockSocket.emit).toHaveBeenCalledWith("board:join", {
            boardId: "board-1",
        });
        expect(mockSocket.listenerCount("card:updated")).toBe(1);
        expect(mockSocket.listenerCount("board:user-presence")).toBe(1);
        expect(mockSocket.listenerCount("error")).toBe(1);

        unmount();

        expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
        expect(mockSocket.listenerCount("card:updated")).toBe(0);
        expect(mockSocket.listenerCount("board:user-presence")).toBe(0);
        expect(mockSocket.listenerCount("error")).toBe(0);
    });

    it("does nothing when boardId is undefined", () => {
        renderHook(() => useSocket(undefined), {
            wrapper: makeWrapper(newQueryClient()),
        });

        expect(mockSocket.connect).not.toHaveBeenCalled();
        expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it("patches the board cache when card:updated arrives", () => {
        const queryClient = newQueryClient();
        queryClient.setQueryData(boardQueryKey("board-1"), board);
        renderHook(() => useSocket("board-1"), {
            wrapper: makeWrapper(queryClient),
        });

        mockSocket.trigger("card:updated", { _id: "c1", listId: "l2", order: 5 });

        const updated = queryClient.getQueryData<Board>(boardQueryKey("board-1"));
        expect(updated?.lists.find((list) => list.id === "l1")?.cards).toHaveLength(0);
        expect(
            updated?.lists.find((list) => list.id === "l2")?.cards.map((c) => c.id),
        ).toEqual(["c1"]);
    });

    it("ignores card:updated when there is no board cached yet", () => {
        const queryClient = newQueryClient();
        renderHook(() => useSocket("board-1"), {
            wrapper: makeWrapper(queryClient),
        });

        mockSocket.trigger("card:updated", { _id: "c1", listId: "l2", order: 5 });

        expect(queryClient.getQueryData(boardQueryKey("board-1"))).toBeUndefined();
    });

    it("patches the presence cache for a matching board:user-presence event", () => {
        const queryClient = newQueryClient();
        renderHook(() => useSocket("board-1"), {
            wrapper: makeWrapper(queryClient),
        });

        mockSocket.trigger("board:user-presence", {
            boardId: "board-1",
            activeUsers: [{ userId: "u1", email: "a@test.dev" }],
        });

        expect(queryClient.getQueryData(presenceQueryKey("board-1"))).toEqual([
            { id: "u1", email: "a@test.dev", status: "online" },
        ]);
    });

    it("ignores a board:user-presence event for a different board", () => {
        const queryClient = newQueryClient();
        renderHook(() => useSocket("board-1"), {
            wrapper: makeWrapper(queryClient),
        });

        mockSocket.trigger("board:user-presence", {
            boardId: "board-2",
            activeUsers: [{ userId: "u1", email: "a@test.dev" }],
        });

        expect(queryClient.getQueryData(presenceQueryKey("board-1"))).toBeUndefined();
    });

    it("logs socket errors", () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        renderHook(() => useSocket("board-1"), {
            wrapper: makeWrapper(newQueryClient()),
        });

        const problem = {
            type: "https://syncboard.dev/errors/unauthorized",
            title: "Unauthorized",
            status: 401,
            detail: "Bad token",
            instance: "/socket",
        };
        mockSocket.trigger("error", problem);

        expect(errorSpy).toHaveBeenCalledWith("Socket error", problem);
    });
});

describe("usePresenceQuery", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("defaults to an empty array before any presence event arrives", () => {
        const { result } = renderHook(() => usePresenceQuery("board-1"), {
            wrapper: makeWrapper(newQueryClient()),
        });

        expect(result.current.data).toEqual([]);
    });
});

describe("emptyPresence", () => {
    it("returns an empty array", () => {
        expect(emptyPresence()).toEqual([]);
    });
});
