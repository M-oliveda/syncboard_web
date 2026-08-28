import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardPage } from "@/components/workspace/DashboardPage";
import { mockBoardSummaries } from "@/lib/mock-workspace";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("DashboardPage", () => {
    it("renders the heading, stats, board grid, and header actions", async () => {
        renderWithRouter(<DashboardPage />);

        expect(
            await screen.findByRole("heading", { name: "Active boards" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Total boards")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Members" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /New board/ })).toBeInTheDocument();

        for (const board of mockBoardSummaries) {
            expect(screen.getByText(board.name)).toBeInTheDocument();
        }
    });
});
