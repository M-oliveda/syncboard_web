import { screen } from "@testing-library/react";
import { Megaphone } from "lucide-react";
import { describe, expect, it } from "vitest";

import { BoardGrid } from "@/components/workspace/BoardGrid";
import type { BoardSummary } from "@/types/workspace";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("BoardGrid", () => {
    it("renders the new-board tile and every board card", async () => {
        const boards: BoardSummary[] = [
            {
                id: "b1",
                name: "First Board",
                description: "First board description.",
                icon: Megaphone,
                accent: "primary",
                updatedAt: "Updated 1h ago",
                memberInitials: ["AB"],
            },
            {
                id: "b2",
                name: "Second Board",
                description: "Second board description.",
                icon: Megaphone,
                accent: "tertiary",
                updatedAt: "Updated 2h ago",
                memberInitials: ["CD"],
            },
        ];

        renderWithRouter(<BoardGrid boards={boards} />);

        expect(
            await screen.findByRole("button", { name: /New Board/ }),
        ).toBeInTheDocument();
        expect(screen.getByText("First Board")).toBeInTheDocument();
        expect(screen.getByText("Second Board")).toBeInTheDocument();
    });
});
