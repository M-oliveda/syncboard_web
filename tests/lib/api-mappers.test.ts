import { describe, expect, it } from "vitest";

import {
    mapApiBoardDetailToBoard,
    mapApiBoardToBoardSummary,
    mapApiCardToBoardCard,
    mapApiListToBoardList,
    mapApiWorkspaceMemberToWorkspaceMember,
    memberInitialsFromWorkspaceMembers,
} from "@/lib/api-mappers";
import type { ApiCard, ApiList, ApiWorkspaceMember } from "@/types/api";

const baseCard: ApiCard = {
    _id: "card-1",
    listId: "list-1",
    title: "Fix login bug",
    description: "Users see a 500 on login.",
    order: 1,
    assignees: [],
    labels: ["bug"],
    checklist: [],
};

describe("mapApiCardToBoardCard", () => {
    it("leaves progress undefined for an empty checklist", () => {
        const card = mapApiCardToBoardCard(baseCard);
        expect(card.checklistTotal).toBe(0);
        expect(card.progress).toBeUndefined();
    });

    it("computes progress from checklist completion", () => {
        const card = mapApiCardToBoardCard({
            ...baseCard,
            checklist: [
                { text: "Reproduce", done: true },
                { text: "Fix", done: false },
            ],
        });
        expect(card.checklistTotal).toBe(2);
        expect(card.checklistCompleted).toBe(1);
        expect(card.progress).toBe(50);
        expect(card.checklist).toEqual([
            { id: "0", label: "Reproduce", completed: true },
            { id: "1", label: "Fix", completed: false },
        ]);
    });

    it("maps labels to a deterministic color", () => {
        const card = mapApiCardToBoardCard(baseCard);
        expect(card.labels?.[0]).toMatchObject({ id: "bug", name: "bug" });
        expect(["primary", "secondary", "tertiary", "error"]).toContain(
            card.labels?.[0]?.color,
        );
    });
});

describe("mapApiListToBoardList", () => {
    it("only includes cards belonging to the list", () => {
        const list: ApiList = { _id: "list-1", boardId: "board-1", title: "To Do", order: 1 };
        const otherCard: ApiCard = { ...baseCard, _id: "card-2", listId: "list-2" };

        const result = mapApiListToBoardList(list, [baseCard, otherCard]);

        expect(result.name).toBe("To Do");
        expect(result.cards).toHaveLength(1);
        expect(result.cards[0]?.id).toBe("card-1");
    });
});

describe("mapApiBoardDetailToBoard", () => {
    it("sorts lists by order", () => {
        const board = mapApiBoardDetailToBoard({
            board: {
                _id: "board-1",
                workspaceId: "workspace-1",
                title: "Sprint",
                updatedAt: new Date().toISOString(),
            },
            lists: [
                { _id: "list-2", boardId: "board-1", title: "Done", order: 2 },
                { _id: "list-1", boardId: "board-1", title: "To Do", order: 1 },
            ],
            cards: [],
        });

        expect(board.lists.map((list) => list.name)).toEqual(["To Do", "Done"]);
    });
});

describe("mapApiBoardToBoardSummary", () => {
    it("formats the board summary with the given member initials", () => {
        const summary = mapApiBoardToBoardSummary(
            {
                _id: "board-1",
                workspaceId: "workspace-1",
                title: "Sprint Board",
                updatedAt: new Date().toISOString(),
            },
            ["MO", "JS"],
        );

        expect(summary.name).toBe("Sprint Board");
        expect(summary.memberInitials).toEqual(["MO", "JS"]);
        expect(summary.description).toBe("");
    });
});

const member: ApiWorkspaceMember = {
    userId: { _id: "user-1", email: "mauricio@test.dev" },
    role: "Admin",
};

describe("mapApiWorkspaceMemberToWorkspaceMember", () => {
    it("derives name from the email local part and maps role casing", () => {
        expect(mapApiWorkspaceMemberToWorkspaceMember(member)).toEqual({
            id: "user-1",
            name: "mauricio",
            email: "mauricio@test.dev",
            role: "admin",
        });
    });

    it("maps the Member role to lowercase", () => {
        expect(
            mapApiWorkspaceMemberToWorkspaceMember({ ...member, role: "Member" }).role,
        ).toBe("member");
    });
});

describe("memberInitialsFromWorkspaceMembers", () => {
    it("derives initials from each member's email", () => {
        expect(
            memberInitialsFromWorkspaceMembers([
                member,
                { userId: { _id: "user-2", email: "jamie@test.dev" }, role: "Member" },
            ]),
        ).toEqual(["MA", "JA"]);
    });
});
