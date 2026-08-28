import { Code2, Compass, Megaphone, Palette } from "lucide-react";

import type { BoardSummary, WorkspaceMember } from "@/types/workspace";

export const mockBoardSummaries: BoardSummary[] = [
    {
        id: "q4-marketing",
        name: "Q4 Marketing Campaign",
        description: "Planning and assets for the upcoming end-of-year push.",
        icon: Megaphone,
        accent: "primary",
        updatedAt: "Updated 2h ago",
        memberInitials: ["JS", "AK", "MO", "TL", "RC"],
    },
    {
        id: "product-roadmap",
        name: "Product Roadmap 2026",
        description: "Feature prioritization and development timeline for v3.0.",
        icon: Compass,
        accent: "secondary",
        updatedAt: "Updated 5h ago",
        memberInitials: ["MO", "AK"],
    },
    {
        id: "brand-guidelines",
        name: "Brand Guidelines",
        description: "Core identity assets, typography, and color tokens.",
        icon: Palette,
        accent: "tertiary",
        updatedAt: "Updated 1d ago",
        memberInitials: ["TL"],
    },
    {
        id: "frontend-architecture",
        name: "Frontend Architecture",
        description: "Component library structure and state management docs.",
        icon: Code2,
        accent: "primary",
        updatedAt: "Updated 3d ago",
        memberInitials: ["MO", "JS", "AK"],
    },
];

export const mockWorkspaceMembers: WorkspaceMember[] = [
    { id: "m1", name: "Mauricio Oliveda", email: "mauricio@syncboard.dev", role: "admin" },
    { id: "m2", name: "Jamie Santos", email: "jamie.santos@syncboard.dev", role: "admin" },
    { id: "m3", name: "Avery Kim", email: "avery.kim@syncboard.dev", role: "member" },
    { id: "m4", name: "Taylor Lin", email: "taylor.lin@syncboard.dev", role: "member" },
];
