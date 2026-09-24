import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ResetPasswordPage } from "@/components/auth/ResetPasswordPage";

const searchSchema = z.object({
    token: z.string(),
});

export const Route = createFileRoute("/reset-password")({
    validateSearch: searchSchema,
    component: ResetPasswordPage,
});
