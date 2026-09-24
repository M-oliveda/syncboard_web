import { createFileRoute } from "@tanstack/react-router";

import { PrivacyPage } from "@/components/legal/PrivacyPage";

export const Route = createFileRoute("/privacy")({
    component: PrivacyPage,
});
