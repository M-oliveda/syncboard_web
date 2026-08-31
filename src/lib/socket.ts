import { io, type Socket } from "socket.io-client";

import { authSession } from "@/lib/auth-session";
import type { ApiActiveUser } from "@/types/api";
import type { PresenceUser } from "@/types/board";

let socket: Socket | undefined;

/** Singleton Socket.io connection — one connection per open board, not one per
 * component (see `CLAUDE.md`'s Socket Lifecycle rule), created lazily and reused by
 * every `useSocket` mount. `autoConnect: false` keeps it idle until a board is
 * actually opened; `auth` is a callback rather than a static object so every
 * (re)connection attempt — including Socket.io's automatic reconnects — re-reads
 * whatever token `authSession` currently holds instead of baking in one that could go
 * stale. */
export function getSocket(): Socket {
    socket ??= io(import.meta.env.VITE_SOCKET_URL, {
        autoConnect: false,
        auth: (callback) => callback({ token: authSession.getAccessToken() }),
    });
    return socket;
}

/** `board:user-presence` only reports who is currently joined to the room — there is
 * no online/away distinction in the payload, so everyone present maps to "online". */
export function mapActiveUsersToPresence(activeUsers: ApiActiveUser[]): PresenceUser[] {
    return activeUsers.map((user) => ({
        id: user.userId,
        email: user.email,
        status: "online",
    }));
}
