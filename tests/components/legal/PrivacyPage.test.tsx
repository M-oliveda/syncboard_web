import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrivacyPage } from "@/components/legal/PrivacyPage";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("PrivacyPage", () => {
    it("renders all five Privacy Policy sections", async () => {
        renderWithRouter(<PrivacyPage />);

        expect(
            await screen.findByRole("heading", { level: 1, name: "Privacy Policy" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "1. Information We Collect" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "5. Changes to This Policy" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Provided by you")).toBeInTheDocument();
        expect(screen.getByText("Collected automatically")).toBeInTheDocument();
    });
});
