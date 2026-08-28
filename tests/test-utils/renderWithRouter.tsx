import {
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

/** Mounts `ui` as the single route of a throwaway router, so components using `<Link>`/router hooks can render in isolation. */
export function renderWithRouter(ui: ReactElement, path = "/") {
    const rootRoute = createRootRoute();
    const testRoute = createRoute({
        getParentRoute: () => rootRoute,
        path,
        component: () => ui,
    });
    const router = createRouter({
        routeTree: rootRoute.addChildren([testRoute]),
        history: createMemoryHistory({ initialEntries: [path] }),
    });

    return render(<RouterProvider router={router} />);
}
