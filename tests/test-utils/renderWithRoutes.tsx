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

/** Mounts several throwaway routes at once — for components whose interactions
 * navigate to another path (e.g. `navigate({ to: "/app" })` after login), which a
 * single-route `renderWithRouter` can't represent since the router has nowhere to
 * land. Each route renders plain marker content, not the real destination page. */
export function renderWithRoutes(
    routes: { path: string; element: ReactElement }[],
    initialPath: string,
) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()();
    const children = routes.map(({ path, element }) =>
        createRoute({
            getParentRoute: () => rootRoute,
            path,
            component: () => element,
        }),
    );
    const router = createRouter({
        routeTree: rootRoute.addChildren(children),
        context: { queryClient },
        history: createMemoryHistory({ initialEntries: [initialPath] }),
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    );
}
