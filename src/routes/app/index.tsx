import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "@/components/workspace/DashboardPage";

export const Route = createFileRoute("/app/")({
    component: DashboardPage,
});
