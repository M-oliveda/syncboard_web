import { describe, expect, it } from "vitest";

import {
    colorForLabel,
    emailInitials,
    mapApiBoardDetailToBoard,
    mapApiBoardToBoardSummary,
    mapApiCardToBoardCard,
    mapApiListToBoardList,
    mapApiWorkspaceMemberToWorkspaceMember,
    memberInitialsFromWorkspaceMembers,
} from "@/lib/api-mappers";
import type { ApiCard, ApiList, ApiWorkspaceMember } from "@/types/api";
import type { WorkspaceMember } from "@/types/workspace";

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
        expect(card.order).toBe(1);
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
        expect(card.labels?.[0]?.color).toBe(colorForLabel("bug"));
    });

    it("leaves assignees empty when no member lookup is given", () => {
        const card = mapApiCardToBoardCard({ ...baseCard, assignees: ["user-1"] });
        expect(card.assignees).toEqual([]);
    });

    it("resolves assignee ids through the member lookup and drops unresolved ones", () => {
        const members: WorkspaceMember[] = [
            { id: "user-1", name: "mauricio", email: "mauricio@test.dev", role: "admin" },
        ];
        const lookup = new Map(members.map((member) => [member.id, member]));

        const card = mapApiCardToBoardCard(
            { ...baseCard, assignees: ["user-1", "user-missing"] },
            lookup,
        );

        expect(card.assignees).toEqual([{ id: "user-1", initials: "MA" }]);
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

    it("sorts cards by order and carries the list's own order through", () => {
        const list: ApiList = { _id: "list-1", boardId: "board-1", title: "To Do", order: 3 };
        const second: ApiCard = { ...baseCard, _id: "card-2", order: 0 };

        const result = mapApiListToBoardList(list, [baseCard, second]);

        expect(result.order).toBe(3);
        expect(result.cards.map((card) => card.id)).toEqual(["card-2", "card-1"]);
    });

    it("threads the member lookup through to each mapped card", () => {
        const list: ApiList = { _id: "list-1", boardId: "board-1", title: "To Do", order: 1 };
        const members: WorkspaceMember[] = [
            { id: "user-1", name: "mauricio", email: "mauricio@test.dev", role: "admin" },
        ];
        const lookup = new Map(members.map((member) => [member.id, member]));

        const result = mapApiListToBoardList(
            list,
            [{ ...baseCard, assignees: ["user-1"] }],
            lookup,
        );

        expect(result.cards[0]?.assignees).toEqual([{ id: "user-1", initials: "MA" }]);
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

    it("threads the member lookup through to lists and cards", () => {
        const members: WorkspaceMember[] = [
            { id: "user-1", name: "mauricio", email: "mauricio@test.dev", role: "admin" },
        ];
        const lookup = new Map(members.map((member) => [member.id, member]));

        const board = mapApiBoardDetailToBoard(
            {
                board: {
                    _id: "board-1",
                    workspaceId: "workspace-1",
                    title: "Sprint",
                    updatedAt: new Date().toISOString(),
                },
                lists: [{ _id: "list-1", boardId: "board-1", title: "To Do", order: 1 }],
                cards: [{ ...baseCard, listId: "list-1", assignees: ["user-1"] }],
            },
            lookup,
        );

        expect(board.lists[0]?.cards[0]?.assignees).toEqual([
            { id: "user-1", initials: "MA" },
        ]);
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

describe("emailInitials", () => {
    it("uppercases the first two characters of the email's local part", () => {
        expect(emailInitials("mauricio@test.dev")).toBe("MA");
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
