import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { useCreateListMutation, useDeleteListMutation } from "@/hooks/useListMutations";

import { server } from "../mocks/server";

function wrapper({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

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
            wrapper,
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
            wrapper,
        });

        result.current.mutate("list-1");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
});
