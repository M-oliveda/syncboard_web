import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    RouterProvider,
    createMemoryHistory,
    createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";

import { routeTree } from "@/routeTree.gen";

/** Mounts the real route tree at `path` in a memory history — for tests exercising
 * routing/loader behavior against actual routes, not an isolated throwaway route
 * (see `renderWithRouter` for that). Each call gets its own `QueryClient` so tests
 * don't share cached query state. */
export function renderAtPath(path: string) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const router = createRouter({
        routeTree,
        context: { queryClient },
        history: createMemoryHistory({ initialEntries: [path] }),
    });

    render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    );
    return router;
}
