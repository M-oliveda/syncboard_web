import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Hero } from "@/components/marketing/Hero";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("Hero", () => {
    it("renders the headline and both CTAs with their target links", async () => {
        renderWithRouter(<Hero />);

        expect(
            await screen.findByRole("heading", {
                name: "Kanban boards that move as fast as your team.",
            }),
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Start for free" })).toHaveAttribute(
            "href",
            "/register",
        );
        expect(screen.getByRole("link", { name: /See how it works/ })).toHaveAttribute(
            "href",
            "#features",
        );
    });
});
