import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarketingFooter } from "@/components/marketing/MarketingFooter";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("MarketingFooter", () => {
    it("renders the copyright line, logo, and the product/account/legal link columns", async () => {
        renderWithRouter(<MarketingFooter />);

        expect(
            await screen.findByText(/Built for high-performance teams\./),
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "M-oliveda" })).toHaveAttribute(
            "href",
            "https://www.github.com/M-oliveda",
        );
        const [logoText] = await screen.findAllByText("SyncBoard");
        expect(logoText?.closest("a")).toHaveAttribute("href", "/");

        expect(screen.getByRole("link", { name: "Features" })).toHaveAttribute(
            "href",
            "#features",
        );
        expect(screen.getByRole("link", { name: "Roadmap" })).toHaveAttribute(
            "href",
            "/roadmap",
        );
        expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
            "href",
            "/login",
        );
        expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute(
            "href",
            "/register",
        );
        expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute(
            "href",
            "/terms",
        );
        expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
            "href",
            "/privacy",
        );
    });
});
