import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

import { RootLayout } from "@/components/layout/RootLayout";

export interface RouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
});
