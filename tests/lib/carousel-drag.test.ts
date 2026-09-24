import { describe, expect, it } from "vitest";

import { shouldCarouselHandleDrag } from "@/lib/carousel-drag";

describe("shouldCarouselHandleDrag", () => {
    it("lets Embla handle a gesture starting on a plain element", () => {
        const target = document.createElement("div");
        const event = { target } as unknown as MouseEvent;

        expect(shouldCarouselHandleDrag(undefined, event)).toBe(true);
    });

    it("cedes to @dnd-kit when the target itself is a draggable handle", () => {
        const target = document.createElement("div");
        target.setAttribute("aria-roledescription", "draggable");
        const event = { target } as unknown as MouseEvent;

        expect(shouldCarouselHandleDrag(undefined, event)).toBe(false);
    });

    it("cedes to @dnd-kit when the target is nested inside a draggable handle", () => {
        const handle = document.createElement("div");
        handle.setAttribute("aria-roledescription", "draggable");
        const target = document.createElement("span");
        handle.appendChild(target);
        const event = { target } as unknown as TouchEvent;

        expect(shouldCarouselHandleDrag(undefined, event)).toBe(false);
    });

    it("lets Embla handle a gesture when the target isn't an Element", () => {
        const event = { target: null } as unknown as MouseEvent;

        expect(shouldCarouselHandleDrag(undefined, event)).toBe(true);
    });
});
