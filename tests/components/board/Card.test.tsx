import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CardItem } from "@/components/board/Card";
import type { BoardCard } from "@/types/board";

const baseCard: BoardCard = {
    id: "c1",
    title: "Write release notes",
};

describe("CardItem", () => {
    it("renders a completed card with strikethrough title and no meta row", () => {
        render(<CardItem card={{ ...baseCard, completed: true }} />);

        expect(screen.getByText("Write release notes")).toHaveClass("line-through");
        expect(screen.getByText("Completed")).toBeInTheDocument();
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("renders labels, description, and progress when present", () => {
        render(
            <CardItem
                card={{
                    ...baseCard,
                    description: "Summarize the sprint changes.",
                    labels: [{ id: "l1", name: "DOCS", color: "secondary" }],
                    progress: 40,
                }}
            />,
        );

        expect(screen.getByText("DOCS")).toBeInTheDocument();
        expect(screen.getByText("Summarize the sprint changes.")).toBeInTheDocument();
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders checklist/comment meta and assignee avatars when present", () => {
        render(
            <CardItem
                card={{
                    ...baseCard,
                    checklistTotal: 4,
                    checklistCompleted: 2,
                    commentCount: 3,
                    assignees: [{ id: "a1", initials: "MO" }],
                }}
            />,
        );

        expect(screen.getByText("2/4")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("MO")).toBeInTheDocument();
    });

    it("defaults checklistCompleted to 0 when omitted", () => {
        render(<CardItem card={{ ...baseCard, checklistTotal: 5 }} />);

        expect(screen.getByText("0/5")).toBeInTheDocument();
    });

    it("renders nothing in the meta row when there is no meta or assignees", () => {
        render(<CardItem card={baseCard} />);

        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
        expect(screen.getByText("Write release notes")).toBeInTheDocument();
    });

    it("is not interactive when no onClick is provided", () => {
        render(<CardItem card={baseCard} />);

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("calls onClick when clicked or activated via keyboard, for both card states", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        const { unmount } = render(<CardItem card={baseCard} onClick={onClick} />);

        const button = screen.getByRole("button", { name: "Write release notes" });
        await user.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);

        button.focus();
        await user.keyboard("{Enter}");
        expect(onClick).toHaveBeenCalledTimes(2);

        await user.keyboard(" ");
        expect(onClick).toHaveBeenCalledTimes(3);

        onClick.mockClear();
        unmount();
        render(<CardItem card={{ ...baseCard, completed: true }} onClick={onClick} />);
        await user.click(screen.getByRole("button", { name: /Write release notes/ }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("ignores other keys while focused", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<CardItem card={baseCard} onClick={onClick} />);

        screen.getByRole("button", { name: "Write release notes" }).focus();
        await user.keyboard("a");

        expect(onClick).not.toHaveBeenCalled();
    });
});
