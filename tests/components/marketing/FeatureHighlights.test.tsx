import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeatureHighlights } from "@/components/marketing/FeatureHighlights";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("FeatureHighlights", () => {
    it("renders all three feature cards", async () => {
        renderWithRouter(<FeatureHighlights />);

        expect(await screen.findByText("Live Presence")).toBeInTheDocument();
        expect(screen.getByText("Optimistic Drag & Drop")).toBeInTheDocument();
        expect(screen.getByText("Real-Time Sync Engine")).toBeInTheDocument();
        expect(screen.getByText("sync_status: OK")).toBeInTheDocument();
    });
});
