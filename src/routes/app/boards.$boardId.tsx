import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ActiveBoardPage } from "@/components/board/ActiveBoardPage";

const searchSchema = z.object({
    card: z.string().optional(),
});

export const Route = createFileRoute("/app/boards/$boardId")({
    validateSearch: searchSchema,
    component: ActiveBoardPage,
});
