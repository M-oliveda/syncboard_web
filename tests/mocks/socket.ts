import { vi } from "vitest";

/** Fake `socket.io-client` socket used to back the global `vi.mock("socket.io-client")`
 * in `tests/setup.ts`. `on`/`off` maintain a real listener registry so tests can
 * simulate an incoming server event via `trigger`, distinct from `emit` (which only
 * records outgoing calls, matching how a real socket never locally re-triggers its own
 * `emit`). */
type Handler = (...args: never[]) => void;

const listeners = new Map<string, Set<Handler>>();

export const mockSocket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn((event: string, handler: Handler) => {
        const handlers = listeners.get(event) ?? new Set<Handler>();
        handlers.add(handler);
        listeners.set(event, handlers);
        return mockSocket;
    }),
    off: vi.fn((event: string, handler?: Handler) => {
        if (handler) {
            listeners.get(event)?.delete(handler);
        } else {
            listeners.delete(event);
        }
        return mockSocket;
    }),
    trigger(event: string, ...args: unknown[]) {
        for (const handler of listeners.get(event) ?? []) {
            (handler as (...args: unknown[]) => void)(...args);
        }
    },
    listenerCount(event: string): number {
        return listeners.get(event)?.size ?? 0;
    },
};

export const io = vi.fn((_url?: string, _options?: unknown) => mockSocket);
