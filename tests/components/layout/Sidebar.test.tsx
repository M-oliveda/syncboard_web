import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sidebar } from "@/components/layout/Sidebar";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("Sidebar", () => {
    it("renders the logo, workspace switcher, boards nav link, and user footer", async () => {
        renderWithRouter(<Sidebar />);

        expect(await screen.findByText("SyncBoard")).toBeInTheDocument();
        expect(screen.getByText("Design Team")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Boards/ })).toHaveAttribute(
            "href",
            "/app",
        );
        expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    });
});
