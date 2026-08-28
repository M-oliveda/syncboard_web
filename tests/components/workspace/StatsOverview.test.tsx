import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatsOverview } from "@/components/workspace/StatsOverview";

describe("StatsOverview", () => {
    it("renders the total boards and members stat tiles", () => {
        render(<StatsOverview boardCount={3} memberCount={5} />);

        expect(screen.getByText("Total boards")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("Members")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });
});
