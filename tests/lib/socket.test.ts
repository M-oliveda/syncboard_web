import { describe, expect, it } from "vitest";

import { authSession } from "@/lib/auth-session";
import { getSocket, mapActiveUsersToPresence } from "@/lib/socket";

import { io, mockSocket } from "../mocks/socket";

describe("getSocket", () => {
    it("creates the socket once and memoizes it across calls", () => {
        const first = getSocket();
        const second = getSocket();

        expect(first).toBe(second);
        expect(first).toBe(mockSocket);
        expect(io).toHaveBeenCalledTimes(1);
    });

    it("passes an auth callback that reads the current access token", () => {
        getSocket();
        const call = io.mock.calls[0];
        if (!call) throw new Error("expected io() to have been called");
        const [, options] = call;
        const auth = (options as { auth: (cb: (data: object) => void) => void }).auth;

        authSession.setAccessToken("token-123");
        let received: unknown;
        auth((data) => {
            received = data;
        });

        expect(received).toEqual({ token: "token-123" });
    });
});

describe("mapActiveUsersToPresence", () => {
    it("maps active users to presence entries, all online", () => {
        expect(
            mapActiveUsersToPresence([
                { userId: "u1", email: "a@test.dev" },
                { userId: "u2", email: "b@test.dev" },
            ]),
        ).toEqual([
            { id: "u1", email: "a@test.dev", status: "online" },
            { id: "u2", email: "b@test.dev", status: "online" },
        ]);
    });

    it("maps an empty list to an empty list", () => {
        expect(mapActiveUsersToPresence([])).toEqual([]);
    });
});
