import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HowItWorks } from "@/components/marketing/HowItWorks";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("HowItWorks", () => {
    it("renders all three steps in order", async () => {
        renderWithRouter(<HowItWorks />);

        expect(
            await screen.findByRole("heading", {
                name: "Up and running in three steps.",
            }),
        ).toBeInTheDocument();
        expect(screen.getByText("Create a board")).toBeInTheDocument();
        expect(screen.getByText("Invite your team")).toBeInTheDocument();
        expect(screen.getByText("Watch it sync")).toBeInTheDocument();
    });
});
