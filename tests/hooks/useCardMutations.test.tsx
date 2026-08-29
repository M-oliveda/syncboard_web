import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { useCreateCardMutation } from "@/hooks/useCardMutations";

import { server } from "../mocks/server";

function wrapper({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

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
            { wrapper },
        );

        result.current.mutate("New");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
});
