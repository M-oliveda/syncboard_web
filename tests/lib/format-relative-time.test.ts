import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatRelativeTime } from "@/lib/format-relative-time";

const NOW = new Date("2026-01-15T12:00:00.000Z");

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
});

afterEach(() => {
    vi.useRealTimers();
});

function isoMinutesAgo(minutes: number): string {
    return new Date(NOW.getTime() - minutes * 60_000).toISOString();
}

describe("formatRelativeTime", () => {
    it("returns 'just now' for under a minute", () => {
        expect(formatRelativeTime(isoMinutesAgo(0))).toBe("Updated just now");
    });

    it("formats minutes ago", () => {
        expect(formatRelativeTime(isoMinutesAgo(5))).toBe("Updated 5m ago");
    });

    it("formats hours ago", () => {
        expect(formatRelativeTime(isoMinutesAgo(120))).toBe("Updated 2h ago");
    });

    it("formats days ago", () => {
        expect(formatRelativeTime(isoMinutesAgo(60 * 24 * 3))).toBe("Updated 3d ago");
    });

    it("formats months ago", () => {
        expect(formatRelativeTime(isoMinutesAgo(60 * 24 * 60))).toBe("Updated 2mo ago");
    });
});
