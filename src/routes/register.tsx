import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RegisterPage } from "@/components/auth/RegisterPage";

const searchSchema = z.object({
    email: z.string().optional(),
});

export const Route = createFileRoute("/register")({
    validateSearch: searchSchema,
    component: RegisterPage,
});
