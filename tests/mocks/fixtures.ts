import type { ApiBoard, ApiCard, ApiList, ApiUser, ApiWorkspace } from "@/types/api";

export const FIXTURE_USER_1: ApiUser = { _id: "user-1", email: "mauricio@test.dev" };
export const FIXTURE_USER_2: ApiUser = { _id: "user-2", email: "jamie@test.dev" };

export const FIXTURE_WORKSPACE: ApiWorkspace = {
    _id: "workspace-1",
    name: "Design Team",
    members: [
        { userId: FIXTURE_USER_1, role: "Admin" },
        { userId: FIXTURE_USER_2, role: "Member" },
    ],
    updatedAt: new Date().toISOString(),
};

export const FIXTURE_BOARDS: ApiBoard[] = [
    {
        _id: "board-1",
        workspaceId: FIXTURE_WORKSPACE._id,
        title: "Sprint Board",
        updatedAt: new Date().toISOString(),
    },
    {
        _id: "board-2",
        workspaceId: FIXTURE_WORKSPACE._id,
        title: "Roadmap",
        updatedAt: new Date().toISOString(),
    },
];

export const FIXTURE_LISTS: ApiList[] = [
    { _id: "list-1", boardId: "board-1", title: "To Do", order: 1 },
    { _id: "list-2", boardId: "board-1", title: "In Progress", order: 2 },
];

export const FIXTURE_CARDS: ApiCard[] = [
    {
        _id: "card-1",
        listId: "list-1",
        title: "Fix login bug",
        description: "Users see a 500 on login.",
        order: 1,
        assignees: [],
        labels: ["bug"],
        checklist: [
            { text: "Reproduce locally", done: true },
            { text: "Write regression test", done: false },
        ],
    },
    {
        _id: "card-2",
        listId: "list-2",
        title: "Write onboarding email",
        description: "",
        order: 1,
        assignees: [],
        labels: [],
        checklist: [],
    },
];
