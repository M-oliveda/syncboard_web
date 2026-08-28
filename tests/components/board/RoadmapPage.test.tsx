import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoadmapPage } from "@/components/board/RoadmapPage";
import { mockRoadmapBoard, mockRoadmapPresence } from "@/lib/mock-roadmap";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("RoadmapPage", () => {
    it("renders the board name, presence, and every list", async () => {
        renderWithRouter(<RoadmapPage />);

        expect(
            await screen.findByRole("heading", { name: mockRoadmapBoard.name }),
        ).toBeInTheDocument();

        for (const list of mockRoadmapBoard.lists) {
            expect(
                screen.getByRole("heading", { name: list.name }),
            ).toBeInTheDocument();
        }

        expect(
            screen.getByLabelText(
                `${mockRoadmapPresence.length} people viewing this board`,
            ),
        ).toBeInTheDocument();
    });
});
