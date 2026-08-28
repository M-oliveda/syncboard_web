import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CardDetailModal } from "@/components/card-modal/CardDetailModal";
import type { BoardCard } from "@/types/board";

const card: BoardCard = {
    id: "c1",
    title: "Fix the thing",
    labels: [
        { id: "l1", name: "BUG", color: "error" },
        { id: "l2", name: "FRONTEND", color: "primary" },
    ],
    assignees: [{ id: "a1", initials: "MO" }],
};

describe("CardDetailModal", () => {
    it("renders nothing when closed", () => {
        render(
            <CardDetailModal
                card={card}
                listName="In Progress"
                open={false}
                onOpenChange={vi.fn()}
            />,
        );
        expect(screen.queryByText("Description")).not.toBeInTheDocument();
    });

    it("renders the card title, list name, labels, assignees, checklist, and activity when open", async () => {
        render(
            <CardDetailModal
                card={card}
                listName="In Progress"
                open
                onOpenChange={vi.fn()}
            />,
        );

        expect(await screen.findByDisplayValue("Fix the thing")).toBeInTheDocument();
        expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);
        expect(screen.getByText("BUG")).toBeInTheDocument();
        expect(screen.getByText("FRONTEND")).toBeInTheDocument();
        expect(screen.getByTitle("MO")).toBeInTheDocument();
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("Activity")).toBeInTheDocument();
    });

    it("calls onOpenChange(false) when the close button is clicked", async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        render(
            <CardDetailModal
                card={card}
                listName="In Progress"
                open
                onOpenChange={onOpenChange}
            />,
        );

        await user.click(await screen.findByTitle("Close modal"));

        expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
    });

    it("removes a label when its remove control is clicked", async () => {
        const user = userEvent.setup();
        render(
            <CardDetailModal
                card={card}
                listName="In Progress"
                open
                onOpenChange={vi.fn()}
            />,
        );

        await user.click(await screen.findByRole("button", { name: /BUG/ }));

        expect(screen.queryByText("BUG")).not.toBeInTheDocument();
        expect(screen.getByText("FRONTEND")).toBeInTheDocument();
    });

    it("renders with no labels or assignees", async () => {
        render(
            <CardDetailModal
                card={{ id: "c2", title: "No extras" }}
                listName="Backlog"
                open
                onOpenChange={vi.fn()}
            />,
        );

        expect(await screen.findByDisplayValue("No extras")).toBeInTheDocument();
    });
});
