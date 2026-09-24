import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TermsPage } from "@/components/legal/TermsPage";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("TermsPage", () => {
    it("renders all five Terms of Service sections", async () => {
        renderWithRouter(<TermsPage />);

        expect(
            await screen.findByRole("heading", { level: 1, name: "Terms of Service" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "1. Acceptance of Terms" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "5. Limitation of Liability" }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/must notify us immediately upon becoming aware/),
        ).toBeInTheDocument();
    });
});
