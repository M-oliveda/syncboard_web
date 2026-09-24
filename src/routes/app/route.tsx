import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppLayout } from "@/components/layout/AppLayout";
import { refreshAccessToken } from "@/lib/api";
import { authSession } from "@/lib/auth-session";

export const Route = createFileRoute("/app")({
    beforeLoad: async () => {
        if (authSession.getAccessToken()) {
            return;
        }

        try {
            await refreshAccessToken();
        } catch {
            throw redirect({ to: "/login" });
        }
    },
    component: AppLayout,
});
