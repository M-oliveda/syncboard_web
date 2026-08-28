import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Megaphone } from "lucide-react";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";

import { BoardGrid } from "@/components/workspace/BoardGrid";
import type { BoardSummary } from "@/types/workspace";

import { server } from "../../mocks/server";
import { renderWithRouter } from "../../test-utils/renderWithRouter";

const boards: BoardSummary[] = [
    {
        id: "b1",
        name: "First Board",
        description: "First board description.",
        icon: Megaphone,
        accent: "primary",
        updatedAt: "Updated 1h ago",
        memberInitials: ["AB"],
    },
    {
        id: "b2",
        name: "Second Board",
        description: "Second board description.",
        icon: Megaphone,
        accent: "tertiary",
        updatedAt: "Updated 2h ago",
        memberInitials: ["CD"],
    },
];

describe("BoardGrid", () => {
    it("renders the new-board tile and every board card", async () => {
        renderWithRouter(<BoardGrid boards={boards} workspaceId="workspace-1" />);

        expect(
            await screen.findByRole("button", { name: /New Board/ }),
        ).toBeInTheDocument();
        expect(screen.getByText("First Board")).toBeInTheDocument();
        expect(screen.getByText("Second Board")).toBeInTheDocument();
    });

    it("creates a board via the new-board dialog", async () => {
        const user = userEvent.setup();
        renderWithRouter(<BoardGrid boards={boards} workspaceId="workspace-1" />);

        await user.click(await screen.findByRole("button", { name: /New Board/ }));
        await user.type(screen.getByLabelText("Board name"), "Third Board");
        await user.click(screen.getByRole("button", { name: "Create board" }));

        await waitFor(() => {
            expect(
                screen.queryByRole("heading", { name: "Create a board" }),
            ).not.toBeInTheDocument();
        });
    });

    it("does not submit a whitespace-only board name", async () => {
        const user = userEvent.setup();
        renderWithRouter(<BoardGrid boards={boards} workspaceId="workspace-1" />);

        await user.click(await screen.findByRole("button", { name: /New Board/ }));
        await user.type(screen.getByLabelText("Board name"), "   ");
        await user.click(screen.getByRole("button", { name: "Create board" }));

        expect(
            screen.getByRole("heading", { name: "Create a board" }),
        ).toBeInTheDocument();
    });

    it("shows a pending state while the create request is in flight", async () => {
        server.use(
            http.post("*/workspaces/:workspaceId/boards", async () => {
                await delay(50);
                return HttpResponse.json(
                    { success: true, data: { _id: "board-new", title: "Third Board" } },
                    { status: 201 },
                );
            }),
        );
        const user = userEvent.setup();
        renderWithRouter(<BoardGrid boards={boards} workspaceId="workspace-1" />);

        await user.click(await screen.findByRole("button", { name: /New Board/ }));
        await user.type(screen.getByLabelText("Board name"), "Third Board");
        await user.click(screen.getByRole("button", { name: "Create board" }));

        expect(await screen.findByRole("button", { name: "Creating…" })).toBeDisabled();
    });

    it("keeps the dialog open and shows an error when creation fails", async () => {
        server.use(
            http.post("*/workspaces/:workspaceId/boards", () => HttpResponse.error()),
        );
        const user = userEvent.setup();
        renderWithRouter(<BoardGrid boards={boards} workspaceId="workspace-1" />);

        await user.click(await screen.findByRole("button", { name: /New Board/ }));
        await user.type(screen.getByLabelText("Board name"), "Third Board");
        await user.click(screen.getByRole("button", { name: "Create board" }));

        expect(
            await screen.findByText("Couldn't create the board. Please try again."),
        ).toBeInTheDocument();
    });
});
