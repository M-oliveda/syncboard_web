import { createFileRoute } from "@tanstack/react-router";

import { RoadmapPage } from "@/components/board/RoadmapPage";

export const Route = createFileRoute("/roadmap")({
    component: RoadmapPage,
});
