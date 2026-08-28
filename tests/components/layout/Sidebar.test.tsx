import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Sidebar } from "@/components/layout/Sidebar";
import { authSession } from "@/lib/auth-session";

import { renderWithRouter } from "../../test-utils/renderWithRouter";
import { renderWithRoutes } from "../../test-utils/renderWithRoutes";

describe("Sidebar", () => {
    it("renders the logo, workspace switcher, and boards nav link", async () => {
        renderWithRouter(<Sidebar />);

        expect(await screen.findByText("SyncBoard")).toBeInTheDocument();
        expect(screen.getByText("Design Team")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Boards/ })).toHaveAttribute(
            "href",
            "/app",
        );
    });

    it("logs out, clears the session, and navigates to /login via the account menu", async () => {
        authSession.setAccessToken("test-token");
        const user = userEvent.setup();
        renderWithRoutes(
            [
                { path: "/", element: <Sidebar /> },
                { path: "/login", element: <p>Login page</p> },
            ],
            "/",
        );

        await user.click(await screen.findByRole("button", { name: "Account" }));
        await user.click(await screen.findByRole("menuitem", { name: "Log out" }));

        expect(await screen.findByText("Login page")).toBeInTheDocument();
        await vi.waitFor(() => {
            expect(authSession.getAccessToken()).toBeNull();
        });
    });
});
