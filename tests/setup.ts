import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { authSession } from "@/lib/auth-session";

import { server } from "./mocks/server";

beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    authSession.clearAccessToken();
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
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
