import { createServer } from "node:http";

import { Server, type Socket } from "socket.io";

/** Minimal stand-in for `syncboard_api`'s Socket.io layer
 * (`api/src/sockets/handlers/{board,card}.handler.ts`) — just enough of the
 * `board:join` → `board:user-presence` and `card:moved` → `card:updated` contract
 * (see `api/MASTERPLAN.md` §7.3) to exercise this repo's real `socket.io-client`
 * wiring end-to-end, across two real browser contexts, over a real WebSocket. No JWT
 * verification and no persistence — see `e2e/realtime-sync.spec.ts` for why that
 * trade-off is documented rather than silent: CI's `e2e` job has no live
 * `syncboard_api` to connect to (see `ci.yml`), the same reason `board-drag.spec.ts`
 * mocks REST via `page.route` instead of hitting a real API. */

interface ActiveUser {
    userId: string;
    email: string;
}

interface CardMovedPayload {
    cardId: string;
    targetListId: string;
    newOrder: number;
}

const boardRoom = (boardId: string): string => `board:${boardId}`;

/** Listens on `VITE_SOCKET_URL`'s port (4000 — see `.env.example`/`ci.yml`'s `e2e`
 * job) so the already-running dev server, whose `VITE_SOCKET_URL` was baked in at
 * `npm run dev` startup, connects to this instead of a real backend. */
export function startSocketTestServer(
    port = 4000,
): Promise<{ close: () => Promise<void> }> {
    const httpServer = createServer();
    const io = new Server(httpServer, { cors: { origin: "*" } });

    function broadcastPresence(boardId: string): void {
        const room = io.sockets.adapter.rooms.get(boardRoom(boardId));
        const activeUsers: ActiveUser[] = [...(room ?? [])].flatMap((socketId) => {
            const socket = io.sockets.sockets.get(socketId);
            return socket
                ? [{ userId: socketId, email: String(socket.data.email) }]
                : [];
        });
        io.to(boardRoom(boardId)).emit("board:user-presence", { boardId, activeUsers });
    }

    io.on("connection", (socket: Socket) => {
        const auth = socket.handshake.auth as { email?: string } | undefined;
        socket.data.email = auth?.email ?? "user@test.dev";

        socket.on("board:join", (payload: { boardId: string }) => {
            socket.data.boardId = payload.boardId;
            void socket.join(boardRoom(payload.boardId));
            broadcastPresence(payload.boardId);
        });

        socket.on("card:moved", (payload: CardMovedPayload) => {
            const boardId = socket.data.boardId as string | undefined;
            if (!boardId) return;
            io.to(boardRoom(boardId)).emit("card:updated", {
                _id: payload.cardId,
                listId: payload.targetListId,
                order: payload.newOrder,
            });
        });

        socket.on("disconnect", () => {
            const boardId = socket.data.boardId as string | undefined;
            if (boardId) broadcastPresence(boardId);
        });
    });

    return new Promise((resolve, reject) => {
        httpServer.once("error", reject);
        httpServer.listen(port, () => {
            resolve({
                close: () =>
                    new Promise<void>((resolveClose, rejectClose) => {
                        io.close((error) => {
                            if (error) rejectClose(error);
                            else resolveClose();
                        });
                    }),
            });
        });
    });
}
