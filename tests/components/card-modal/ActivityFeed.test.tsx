import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ActivityFeed } from "@/components/card-modal/ActivityFeed";
import type { ActivityEntry } from "@/types/card-detail";

const entries: ActivityEntry[] = [
    {
        id: "e1",
        kind: "event",
        author: "Jamie",
        timestamp: "1h ago",
        action: "created this card",
    },
    {
        id: "e2",
        kind: "event",
        author: "Jamie",
        timestamp: "2h ago",
        action: "moved this card to",
        target: "In Progress",
    },
    {
        id: "e3",
        kind: "comment",
        author: "Avery",
        authorInitials: "AK",
        timestamp: "3h ago",
        body: "Looks good to me.",
    },
];

describe("ActivityFeed", () => {
    it("renders only the first page of entries with a button to reveal more", () => {
        render(<ActivityFeed entries={entries} />);

        expect(screen.getByText("created this card")).toBeInTheDocument();
        expect(screen.getByText("In Progress")).toBeInTheDocument();
        expect(screen.queryByText("Looks good to me.")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Show earlier activity" }),
        ).toBeInTheDocument();
    });

    it("reveals older entries and hides the button once everything is shown", async () => {
        const user = userEvent.setup();
        render(<ActivityFeed entries={entries} />);

        await user.click(screen.getByRole("button", { name: "Show earlier activity" }));

        expect(screen.getByText("Looks good to me.")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Show earlier activity" }),
        ).not.toBeInTheDocument();
    });
});
