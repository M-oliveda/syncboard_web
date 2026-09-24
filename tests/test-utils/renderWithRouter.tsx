import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    RouterProvider,
    createMemoryHistory,
    createRootRouteWithContext,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

/** Mounts `ui` as the single route of a throwaway router, so components using `<Link>`/router hooks can render in isolation. Pass a `queryClient` when the component under test also uses TanStack Query hooks; a fresh one is created otherwise. */
export function renderWithRouter(
    ui: ReactElement,
    path = "/",
    queryClient: QueryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    }),
) {
    const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()();
    const testRoute = createRoute({
        getParentRoute: () => rootRoute,
        path,
        component: () => ui,
    });
    const router = createRouter({
        routeTree: rootRoute.addChildren([testRoute]),
        context: { queryClient },
        history: createMemoryHistory({ initialEntries: [path] }),
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    );
}
