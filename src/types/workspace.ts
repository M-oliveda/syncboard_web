import type { LucideIcon } from "lucide-react";

export type AccentColor = "primary" | "secondary" | "tertiary";

export interface BoardSummary {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    accent: AccentColor;
    updatedAt: string;
    memberInitials: string[];
}

export type MemberRole = "admin" | "member";

export interface WorkspaceMember {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
}
