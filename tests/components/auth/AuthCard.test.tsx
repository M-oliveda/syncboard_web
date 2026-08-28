import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthCard } from "@/components/auth/AuthCard";

describe("AuthCard", () => {
    it("renders the icon, title, description, children, and footer", () => {
        render(
            <AuthCard
                icon={<span data-testid="icon">icon</span>}
                title="A title"
                description="A description"
                footer={<span>A footer</span>}
            >
                <p>Form content</p>
            </AuthCard>,
        );

        expect(screen.getByTestId("icon")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "A title" })).toBeInTheDocument();
        expect(screen.getByText("A description")).toBeInTheDocument();
        expect(screen.getByText("Form content")).toBeInTheDocument();
        expect(screen.getByText("A footer")).toBeInTheDocument();
    });
});
