import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatsOverview } from "@/components/workspace/StatsOverview";

describe("StatsOverview", () => {
    it("renders the total boards and members stat tiles", () => {
        render(<StatsOverview />);

        expect(screen.getByText("Total boards")).toBeInTheDocument();
        expect(screen.getByText("24")).toBeInTheDocument();
        expect(screen.getByText("Members")).toBeInTheDocument();
        expect(screen.getByText("18")).toBeInTheDocument();
    });
});
