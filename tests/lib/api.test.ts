import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { api } from "@/lib/api";
import { authSession } from "@/lib/auth-session";
import { router } from "@/router";

import { server } from "../mocks/server";

describe("api response interceptor", () => {
    beforeEach(() => {
        authSession.setAccessToken("stale-token");
    });

    it("refreshes the access token and retries the original request on a 401", async () => {
        let workspacesCallCount = 0;
        server.use(
            http.get("*/workspaces", () => {
                workspacesCallCount += 1;
                if (workspacesCallCount === 1) {
                    return HttpResponse.json(
                        {
                            type: "https://syncboard.dev/errors/unauthenticated",
                            title: "Unauthenticated",
                            status: 401,
                            detail: "Access token expired",
                            instance: "/api/v1/workspaces",
                        },
                        { status: 401 },
                    );
                }
                return HttpResponse.json({
                    success: true,
                    data: [],
                    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
                });
            }),
        );

        const response = await api.get("/workspaces");

        expect(response.status).toBe(200);
        expect(workspacesCallCount).toBe(2);
        expect(authSession.getAccessToken()).toBe("mock-refreshed-token");
    });

    it("clears the session and redirects to /login when the refresh itself fails", async () => {
        server.use(
            http.get("*/workspaces", () =>
                HttpResponse.json(
                    {
                        type: "https://syncboard.dev/errors/unauthenticated",
                        title: "Unauthenticated",
                        status: 401,
                        detail: "Access token expired",
                        instance: "/api/v1/workspaces",
                    },
                    { status: 401 },
                ),
            ),
            http.post("*/auth/refresh", () =>
                HttpResponse.json(
                    {
                        type: "https://syncboard.dev/errors/unauthenticated",
                        title: "Unauthenticated",
                        status: 401,
                        detail: "Refresh token has been rotated or revoked",
                        instance: "/api/v1/auth/refresh",
                    },
                    { status: 401 },
                ),
            ),
        );

        await expect(api.get("/workspaces")).rejects.toMatchObject({
            response: { status: 401 },
        });

        expect(authSession.getAccessToken()).toBeNull();
        expect(router.state.location.pathname).toBe("/login");
    });

    it("does not attempt a refresh for a 401 from an exempt auth endpoint", async () => {
        server.use(
            http.post("*/auth/login", () =>
                HttpResponse.json(
                    {
                        type: "https://syncboard.dev/errors/unauthenticated",
                        title: "Unauthenticated",
                        status: 401,
                        detail: "Invalid email or password",
                        instance: "/api/v1/auth/login",
                    },
                    { status: 401 },
                ),
            ),
        );

        await expect(
            api.post("/auth/login", { email: "a@b.com", password: "x" }),
        ).rejects.toMatchObject({ response: { status: 401 } });
    });
});
