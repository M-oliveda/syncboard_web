import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { authSession } from "@/lib/auth-session";

import { mockSocket } from "./mocks/socket";
import { server } from "./mocks/server";

const DEFAULT_INNER_WIDTH = window.innerWidth;

// Real `socket.io-client` opens a real WebSocket handshake — never desirable in
// jsdom. Every test file gets this fake instead; `src/lib/socket.ts`'s singleton
// memoizes around whatever `io()` returns, so the same `mockSocket` backs every
// `getSocket()` call within a test file.
vi.mock("socket.io-client", async () => {
    const mocked = await import("./mocks/socket");
    return { io: mocked.io };
});

beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    authSession.clearAccessToken();
    window.innerWidth = DEFAULT_INNER_WIDTH;
    mockSocket.connect.mockClear();
    mockSocket.disconnect.mockClear();
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
});

afterAll(() => {
    server.close();
});

// jsdom doesn't implement scrollTo; the router's scrollRestoration calls it on navigation.
window.scrollTo = () => {};

// jsdom doesn't implement IntersectionObserver; framer-motion's `whileInView` (and
// anything else relying on it) needs a stand-in constructor to avoid throwing in tests.
class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe = () => {};
    unobserve = () => {};
    disconnect = () => {};
    takeRecords = (): IntersectionObserverEntry[] => [];

    scrollMargin: string = "0px";
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

// jsdom doesn't implement matchMedia; `useIsMobile` (src/hooks/use-mobile.ts) calls it
// directly. `matches` is derived live from `window.innerWidth` so tests can flip
// mobile/desktop by setting `window.innerWidth` before rendering.
window.matchMedia = (query: string) => {
    const maxWidthMatch = /\(max-width:\s*(\d+)px\)/.exec(query);
    const maxWidth = maxWidthMatch ? Number(maxWidthMatch[1]) : Infinity;

    return {
        matches: window.innerWidth <= maxWidth,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    } as unknown as MediaQueryList;
};

// jsdom doesn't implement ResizeObserver; Embla Carousel's core uses it to watch
// container/slide sizing (src/components/ui/carousel.tsx).
class MockResizeObserver implements ResizeObserver {
    observe = () => {};
    unobserve = () => {};
    disconnect = () => {};
}

vi.stubGlobal("ResizeObserver", MockResizeObserver);
