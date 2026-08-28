import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppShell } from "@/components/layout/AppShell";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("AppShell", () => {
    it("renders the sidebar, breadcrumb, optional action, and children", async () => {
        renderWithRouter(
            <AppShell
                breadcrumb={<span>Workspace</span>}
                action={<button>New Board</button>}
            >
                <p>Page content</p>
            </AppShell>,
        );

        expect(await screen.findByText("SyncBoard")).toBeInTheDocument();
        expect(screen.getByText("Workspace")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "New Board" })).toBeInTheDocument();
        expect(screen.getByText("Page content")).toBeInTheDocument();
    });

    it("renders without an action when none is provided", async () => {
        renderWithRouter(
            <AppShell breadcrumb={<span>Workspace</span>}>content</AppShell>,
        );

        expect(await screen.findByText("Workspace")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "New Board" }),
        ).not.toBeInTheDocument();
    });

    it("opens the mobile navigation sheet from the hamburger button", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <AppShell breadcrumb={<span>Workspace</span>}>content</AppShell>,
        );

        await user.click(
            await screen.findByRole("button", { name: "Open navigation" }),
        );

        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByText("Design Team")).toBeInTheDocument();
    });
});
