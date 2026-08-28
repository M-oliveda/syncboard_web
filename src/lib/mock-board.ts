import type { Board, PresenceUser } from "@/types/board";

export const mockActiveBoard: Board = {
    id: "demo-board",
    name: "Sprint 14 — Web App",
    lists: [
        {
            id: "backlog",
            name: "Backlog",
            cards: [
                {
                    id: "card-1",
                    title: "Add keyboard shortcuts for card creation",
                    description: "Cmd+K to open the quick-add palette from anywhere on a board.",
                    labels: [{ id: "l1", name: "ENHANCEMENT", color: "primary" }],
                    commentCount: 1,
                },
                {
                    id: "card-2",
                    title: "Audit color contrast across dark surfaces",
                    labels: [{ id: "l2", name: "ACCESSIBILITY", color: "tertiary" }],
                },
            ],
        },
        {
            id: "in-progress",
            name: "In Progress",
            cards: [
                {
                    id: "card-3",
                    title: "Fix drag ghost image rendering on Safari",
                    description:
                        "The placeholder card renders behind the list header during a drag on WebKit.",
                    labels: [
                        { id: "l3", name: "BUG", color: "error" },
                        { id: "l4", name: "FRONTEND", color: "primary" },
                    ],
                    checklistTotal: 4,
                    checklistCompleted: 1,
                    commentCount: 3,
                    progress: 35,
                    assignees: [{ id: "a1", initials: "MO" }],
                },
                {
                    id: "card-4",
                    title: "Write onboarding email sequence",
                    labels: [{ id: "l5", name: "CONTENT", color: "secondary" }],
                    checklistTotal: 3,
                    checklistCompleted: 2,
                    progress: 66,
                    assignees: [
                        { id: "a2", initials: "JS" },
                        { id: "a3", initials: "AK" },
                    ],
                },
            ],
        },
        {
            id: "review",
            name: "Review",
            cards: [
                {
                    id: "card-5",
                    title: "Card detail modal — checklist progress bar",
                    labels: [{ id: "l6", name: "FRONTEND", color: "primary" }],
                    commentCount: 5,
                    assignees: [{ id: "a1", initials: "MO" }],
                },
            ],
        },
        {
            id: "done",
            name: "Done",
            cards: [
                {
                    id: "card-6",
                    title: "Set up optimistic drag-and-drop cache patching",
                    completed: true,
                },
                {
                    id: "card-7",
                    title: "Ship presence header with live avatars",
                    completed: true,
                },
            ],
        },
    ],
};

export const mockPresence: PresenceUser[] = [
    { id: "a1", email: "mauricio@syncboard.dev", status: "online" },
    { id: "a2", email: "jamie.santos@syncboard.dev", status: "online" },
    { id: "a3", email: "avery.kim@syncboard.dev", status: "away" },
];
