import { HttpResponse, http } from "msw";

import {
    FIXTURE_BOARDS,
    FIXTURE_CARDS,
    FIXTURE_LISTS,
    FIXTURE_USER_1,
    FIXTURE_WORKSPACE,
} from "./fixtures";

const problem = (status: number, title: string, detail: string) =>
    HttpResponse.json(
        {
            type: `https://syncboard.dev/errors/${title.toLowerCase().replace(/\s+/g, "-")}`,
            title,
            status,
            detail,
            instance: "/api/v1/test",
        },
        { status },
    );

export const handlers = [
    // --- Auth ---
    http.post("*/auth/login", async ({ request }) => {
        const body = (await request.json()) as { email: string; password: string };
        if (body.password === "wrong-password") {
            return problem(401, "Unauthenticated", "Invalid email or password");
        }
        return HttpResponse.json({
            success: true,
            data: {
                user: { _id: FIXTURE_USER_1._id, email: body.email },
                accessToken: "mock-access-token",
            },
        });
    }),

    http.post("*/auth/register", async ({ request }) => {
        const body = (await request.json()) as { email: string; password: string };
        return HttpResponse.json(
            {
                success: true,
                data: {
                    user: { _id: FIXTURE_USER_1._id, email: body.email },
                    accessToken: "mock-access-token",
                },
            },
            { status: 201 },
        );
    }),

    http.post("*/auth/refresh", () =>
        HttpResponse.json({
            success: true,
            data: { accessToken: "mock-refreshed-token" },
        }),
    ),

    http.post("*/auth/forgot-password", () =>
        HttpResponse.json(
            {
                success: true,
                data: null,
                message: "If that email exists, a reset link has been sent",
            },
            { status: 202 },
        ),
    ),

    http.post("*/auth/reset-password", async ({ request }) => {
        const body = (await request.json()) as { token: string };
        if (body.token === "bad-token") {
            return problem(400, "Validation Error", "Invalid or expired reset token");
        }
        return new HttpResponse(null, { status: 204 });
    }),

    http.post("*/auth/logout", () => new HttpResponse(null, { status: 204 })),

    // --- Workspaces ---
    http.get("*/workspaces", () =>
        HttpResponse.json({
            success: true,
            data: [FIXTURE_WORKSPACE],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        }),
    ),

    http.post("*/workspaces", async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json(
            {
                success: true,
                data: { ...FIXTURE_WORKSPACE, name: body.name },
            },
            { status: 201 },
        );
    }),

    http.patch("*/workspaces/:workspaceId/members/:userId", () =>
        HttpResponse.json({ success: true, data: FIXTURE_WORKSPACE }),
    ),

    http.delete("*/workspaces/:workspaceId/members/:userId", () =>
        HttpResponse.json({ success: true, data: FIXTURE_WORKSPACE }),
    ),

    // --- Boards ---
    http.get("*/workspaces/:workspaceId/boards", () =>
        HttpResponse.json({
            success: true,
            data: FIXTURE_BOARDS,
            pagination: {
                page: 1,
                limit: 20,
                total: FIXTURE_BOARDS.length,
                totalPages: 1,
            },
        }),
    ),

    http.post("*/workspaces/:workspaceId/boards", async ({ request }) => {
        const body = (await request.json()) as { title: string };
        return HttpResponse.json(
            {
                success: true,
                data: { ...FIXTURE_BOARDS[0], _id: "board-new", title: body.title },
            },
            { status: 201 },
        );
    }),

    http.get("*/boards/:boardId", ({ params }) =>
        HttpResponse.json({
            success: true,
            data: {
                board: { ...FIXTURE_BOARDS[0], _id: params.boardId as string },
                lists: FIXTURE_LISTS,
                cards: FIXTURE_CARDS,
            },
        }),
    ),

    http.patch("*/boards/:boardId", () =>
        HttpResponse.json({ success: true, data: FIXTURE_BOARDS[0] }),
    ),

    http.delete("*/boards/:boardId", () => new HttpResponse(null, { status: 204 })),

    // --- Lists ---
    http.post("*/boards/:boardId/lists", async ({ request }) => {
        const body = (await request.json()) as { title: string };
        return HttpResponse.json(
            {
                success: true,
                data: { ...FIXTURE_LISTS[0], _id: "list-new", title: body.title },
            },
            { status: 201 },
        );
    }),

    http.patch("*/lists/:listId", () =>
        HttpResponse.json({ success: true, data: FIXTURE_LISTS[0] }),
    ),

    http.delete("*/lists/:listId", () => new HttpResponse(null, { status: 204 })),

    // --- Cards ---
    http.post("*/lists/:listId/cards", async ({ request }) => {
        const body = (await request.json()) as { title: string };
        return HttpResponse.json(
            {
                success: true,
                data: { ...FIXTURE_CARDS[0], _id: "card-new", title: body.title },
            },
            { status: 201 },
        );
    }),

    http.patch("*/cards/:cardId", async ({ request, params }) => {
        const updates = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
            success: true,
            data: { ...FIXTURE_CARDS[0], _id: params.cardId as string, ...updates },
        });
    }),

    http.delete("*/cards/:cardId", () => new HttpResponse(null, { status: 204 })),
];
