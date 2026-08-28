import { screen } from "@testing-library/react";
import { Megaphone } from "lucide-react";
import { describe, expect, it } from "vitest";

import { BoardCard } from "@/components/workspace/BoardCard";
import type { BoardSummary } from "@/types/workspace";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("BoardCard", () => {
    it("links to the board and shows visible member initials without overflow", async () => {
        const board: BoardSummary = {
            id: "b1",
            name: "Launch Plan",
            description: "Coordinate the launch.",
            icon: Megaphone,
            accent: "primary",
            updatedAt: "Updated 1h ago",
            memberInitials: ["AB", "CD"],
        };

        renderWithRouter(<BoardCard board={board} />);

        expect(await screen.findByText("Launch Plan")).toBeInTheDocument();
        expect(screen.getByText("Coordinate the launch.")).toBeInTheDocument();
        expect(screen.getByText("Updated 1h ago")).toBeInTheDocument();
        expect(screen.getByText("AB")).toBeInTheDocument();
        expect(screen.getByText("CD")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Launch Plan/ })).toHaveAttribute(
            "href",
            "/app/boards/b1",
        );
        expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    it("caps visible member initials at three and shows an overflow badge", async () => {
        const board: BoardSummary = {
            id: "b2",
            name: "Big Team Board",
            description: "Lots of collaborators.",
            icon: Megaphone,
            accent: "secondary",
            updatedAt: "Updated 3h ago",
            memberInitials: ["AB", "CD", "EF", "GH", "IJ"],
        };

        renderWithRouter(<BoardCard board={board} />);

        await screen.findByText("Big Team Board");
        expect(screen.getByText("+2")).toBeInTheDocument();
    });
});
