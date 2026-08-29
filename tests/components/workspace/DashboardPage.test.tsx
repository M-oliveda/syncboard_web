import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";

import { DashboardPage } from "@/components/workspace/DashboardPage";

import { FIXTURE_BOARDS, FIXTURE_WORKSPACE } from "../../mocks/fixtures";
import { server } from "../../mocks/server";
import { renderWithRouter } from "../../test-utils/renderWithRouter";

const emptyWorkspacesResponse = () =>
    HttpResponse.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

describe("DashboardPage", () => {
    it("renders the heading, stats, board grid, and members action", async () => {
        renderWithRouter(<DashboardPage />);

        expect(
            await screen.findByRole("heading", { name: "Active boards" }),
        ).toBeInTheDocument();
        expect(await screen.findByText("Total boards")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Members" })).toBeInTheDocument();

        for (const board of FIXTURE_BOARDS) {
            expect(screen.getByText(board.title)).toBeInTheDocument();
        }
    });

    it("shows a create-workspace prompt when the user has no workspace yet", async () => {
        server.use(http.get("*/workspaces", emptyWorkspacesResponse));

        renderWithRouter(<DashboardPage />);

        expect(
            await screen.findByText("Create your first workspace"),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Members" }),
        ).not.toBeInTheDocument();
    });

    it("shows an error state when the workspace fails to load", async () => {
        server.use(http.get("*/workspaces", () => HttpResponse.error()));

        renderWithRouter(<DashboardPage />);

        expect(
            await screen.findByText("Couldn't load your workspace"),
        ).toBeInTheDocument();
    });

    it("creates a workspace from the empty-state prompt", async () => {
        server.use(http.get("*/workspaces", emptyWorkspacesResponse, { once: true }));

        const user = userEvent.setup();
        renderWithRouter(<DashboardPage />);

        await screen.findByText("Create your first workspace");
        await user.type(
            screen.getByLabelText("Workspace name"),
            FIXTURE_WORKSPACE.name,
        );
        await user.click(screen.getByRole("button", { name: "Create workspace" }));

        expect(
            await screen.findByRole("button", { name: "Members" }),
        ).toBeInTheDocument();
    });

    it("does not submit a whitespace-only workspace name", async () => {
        server.use(http.get("*/workspaces", emptyWorkspacesResponse));

        const user = userEvent.setup();
        renderWithRouter(<DashboardPage />);

        await screen.findByText("Create your first workspace");
        await user.type(screen.getByLabelText("Workspace name"), "   ");
        await user.click(screen.getByRole("button", { name: "Create workspace" }));

        expect(screen.getByText("Create your first workspace")).toBeInTheDocument();
    });

    it("shows a pending state while the create request is in flight", async () => {
        server.use(
            http.get("*/workspaces", emptyWorkspacesResponse, { once: true }),
            http.post("*/workspaces", async () => {
                await delay(50);
                return HttpResponse.json(
                    {
                        success: true,
                        data: { _id: "workspace-new", name: "Acme Inc." },
                    },
                    { status: 201 },
                );
            }),
        );

        const user = userEvent.setup();
        renderWithRouter(<DashboardPage />);

        await screen.findByText("Create your first workspace");
        await user.type(screen.getByLabelText("Workspace name"), "Acme Inc.");
        await user.click(screen.getByRole("button", { name: "Create workspace" }));

        expect(await screen.findByRole("button", { name: "Creating…" })).toBeDisabled();
    });

    it("shows an error message when workspace creation fails", async () => {
        server.use(
            http.get("*/workspaces", emptyWorkspacesResponse),
            http.post("*/workspaces", () => HttpResponse.error()),
        );

        const user = userEvent.setup();
        renderWithRouter(<DashboardPage />);

        await screen.findByText("Create your first workspace");
        await user.type(screen.getByLabelText("Workspace name"), "Acme Inc.");
        await user.click(screen.getByRole("button", { name: "Create workspace" }));

        expect(
            await screen.findByText("Couldn't create the workspace. Please try again."),
        ).toBeInTheDocument();
    });
});
