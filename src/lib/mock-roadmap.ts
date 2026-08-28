import type { Board, PresenceUser } from "@/types/board";

export const mockRoadmapBoard: Board = {
    id: "product-roadmap",
    name: "Product Roadmap",
    lists: [
        {
            id: "to-do",
            name: "To Do",
            cards: [
                {
                    id: "roadmap-1",
                    title: "Implement new user onboarding flow",
                    description:
                        "Design and integrate the multi-step welcome screens for new signups based on the latest designs.",
                    labels: [
                        { id: "l1", name: "URGENT", color: "error" },
                        { id: "l2", name: "FRONTEND", color: "primary" },
                    ],
                    checklistTotal: 4,
                    checklistCompleted: 0,
                    commentCount: 2,
                    assignees: [{ id: "a1", initials: "MO" }],
                },
                {
                    id: "roadmap-2",
                    title: "Competitor analysis for Q3 features",
                    labels: [{ id: "l3", name: "RESEARCH", color: "tertiary" }],
                    assignees: [{ id: "a2", initials: "AK" }],
                },
            ],
        },
        {
            id: "in-progress",
            name: "In Progress",
            cards: [
                {
                    id: "roadmap-3",
                    title: "Refactor authentication service",
                    description:
                        "Migrate from the legacy token system to JWT-based auth with refresh rotation.",
                    labels: [{ id: "l4", name: "BACKEND", color: "secondary" }],
                    checklistTotal: 5,
                    checklistCompleted: 3,
                    progress: 60,
                    assignees: [
                        { id: "a3", initials: "JS" },
                        { id: "a1", initials: "MO" },
                    ],
                },
            ],
        },
        {
            id: "done",
            name: "Done",
            cards: [
                {
                    id: "roadmap-4",
                    title: "Update primary navigation layout",
                    completed: true,
                },
            ],
        },
    ],
};

export const mockRoadmapPresence: PresenceUser[] = [
    { id: "a1", email: "mauricio@syncboard.dev", status: "online" },
    { id: "a2", email: "avery.kim@syncboard.dev", status: "online" },
    { id: "a3", email: "jamie.santos@syncboard.dev", status: "away" },
];
