import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
    cleanup();
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
