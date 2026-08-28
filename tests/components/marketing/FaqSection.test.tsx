import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FaqSection } from "@/components/marketing/FaqSection";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("FaqSection", () => {
    it("renders every question and expands an answer on click", async () => {
        const user = userEvent.setup();
        renderWithRouter(<FaqSection />);

        const trigger = await screen.findByRole("button", {
            name: "Is SyncBoard available today?",
        });
        expect(trigger).toHaveAttribute("aria-expanded", "false");
        expect(
            screen.getByText("How does the real-time sync actually work?"),
        ).toBeInTheDocument();
        expect(screen.getByText("Is there a native mobile app?")).toBeInTheDocument();

        await user.click(trigger);

        expect(trigger).toHaveAttribute("aria-expanded", "true");
        expect(
            screen.getByText(/The board UI you're browsing is built/),
        ).toBeInTheDocument();
    });
});
