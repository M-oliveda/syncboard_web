import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegalDocument } from "@/components/legal/LegalDocument";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("LegalDocument", () => {
    it("renders the breadcrumb, header, TOC, sections, and contact CTA", async () => {
        renderWithRouter(
            <LegalDocument
                icon={<span data-testid="icon" />}
                title="Example Policy"
                description="An example description."
                lastUpdated="January 1, 2026"
                sections={[
                    {
                        id: "one",
                        number: 1,
                        title: "First section",
                        children: <p>First body</p>,
                    },
                    {
                        id: "two",
                        number: 2,
                        title: "Second section",
                        children: <p>Second body</p>,
                    },
                ]}
            />,
        );

        expect(await screen.findByRole("link", { name: "Home" })).toHaveAttribute(
            "href",
            "/",
        );
        expect(
            screen.getByRole("heading", { level: 1, name: "Example Policy" }),
        ).toBeInTheDocument();
        expect(screen.getByText("An example description.")).toBeInTheDocument();
        expect(screen.getByText("Last updated: January 1, 2026")).toBeInTheDocument();
        expect(screen.getByTestId("icon")).toBeInTheDocument();

        expect(screen.getByRole("link", { name: "1. First section" })).toHaveAttribute(
            "href",
            "#one",
        );
        expect(screen.getByRole("link", { name: "2. Second section" })).toHaveAttribute(
            "href",
            "#two",
        );
        expect(screen.getByText("First body")).toBeInTheDocument();
        expect(screen.getByText("Second body")).toBeInTheDocument();

        expect(screen.getByRole("link", { name: /Contact legal/ })).toHaveAttribute(
            "href",
            "mailto:hello@moliveda.dev",
        );
    });
});
