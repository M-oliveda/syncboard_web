import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Megaphone } from "lucide-react";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";

import { BoardCard } from "@/components/workspace/BoardCard";
import type { BoardSummary } from "@/types/workspace";

import { server } from "../../mocks/server";
import { renderWithRouter } from "../../test-utils/renderWithRouter";

const board: BoardSummary = {
    id: "b1",
    name: "Launch Plan",
    description: "Coordinate the launch.",
    icon: Megaphone,
    accent: "primary",
    updatedAt: "Updated 1h ago",
    memberInitials: ["AB", "CD"],
};

describe("BoardCard", () => {
    it("links to the board and shows visible member initials without overflow", async () => {
        renderWithRouter(<BoardCard board={board} workspaceId="workspace-1" />);

        expect(await screen.findByText("Launch Plan")).toBeInTheDocument();
        expect(screen.getByText("Coordinate the launch.")).toBeInTheDocument();
        expect(screen.getByText("Updated 1h ago")).toBeInTheDocument();
        expect(screen.getByText("AB")).toBeInTheDocument();
        expect(screen.getByText("CD")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Launch Plan/ })).toHaveAttribute(
            "href",
            "/app/boards/b1",
        );
        expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    it("caps visible member initials at three and shows an overflow badge", async () => {
        const bigTeamBoard: BoardSummary = {
            id: "b2",
            name: "Big Team Board",
            description: "Lots of collaborators.",
            icon: Megaphone,
            accent: "secondary",
            updatedAt: "Updated 3h ago",
            memberInitials: ["AB", "CD", "EF", "GH", "IJ"],
        };

        renderWithRouter(<BoardCard board={bigTeamBoard} workspaceId="workspace-1" />);

        await screen.findByText("Big Team Board");
        expect(screen.getByText("+2")).toBeInTheDocument();
    });

    it("renames a board via the options menu", async () => {
        const user = userEvent.setup();
        renderWithRouter(<BoardCard board={board} workspaceId="workspace-1" />);

        await user.click(
            await screen.findByRole("button", { name: "Launch Plan board options" }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Rename board" }));

        const input = screen.getByLabelText("Board name");
        await user.clear(input);
        await user.type(input, "Relaunch Plan");
        await user.click(screen.getByRole("button", { name: "Rename board" }));

        await waitFor(() => {
            expect(
                screen.queryByRole("heading", { name: "Rename board" }),
            ).not.toBeInTheDocument();
        });
    });

    it("does not submit a whitespace-only board name", async () => {
        const user = userEvent.setup();
        renderWithRouter(<BoardCard board={board} workspaceId="workspace-1" />);

        await user.click(
            await screen.findByRole("button", { name: "Launch Plan board options" }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Rename board" }));

        const input = screen.getByLabelText("Board name");
        await user.clear(input);
        await user.type(input, "   ");
        await user.click(screen.getByRole("button", { name: "Rename board" }));

        expect(
            screen.getByRole("heading", { name: "Rename board" }),
        ).toBeInTheDocument();
    });

    it("shows an error when renaming fails", async () => {
        server.use(http.patch("*/boards/:boardId", () => HttpResponse.error()));
        const user = userEvent.setup();
        renderWithRouter(<BoardCard board={board} workspaceId="workspace-1" />);

        await user.click(
            await screen.findByRole("button", { name: "Launch Plan board options" }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Rename board" }));

        const input = screen.getByLabelText("Board name");
        await user.clear(input);
        await user.type(input, "Relaunch Plan");
        await user.click(screen.getByRole("button", { name: "Rename board" }));

        expect(
            await screen.findByText("Couldn't rename the board. Please try again."),
        ).toBeInTheDocument();
    });

    it("deletes a board after confirming in the alert dialog", async () => {
        const user = userEvent.setup();
        renderWithRouter(<BoardCard board={board} workspaceId="workspace-1" />);

        await user.click(
            await screen.findByRole("button", { name: "Launch Plan board options" }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Delete board" }));

        expect(
            await screen.findByRole("heading", { name: "Delete “Launch Plan”?" }),
        ).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Delete" }));

        await waitFor(() => {
            expect(
                screen.queryByRole("heading", {
                    name: "Delete “Launch Plan”?",
                }),
            ).not.toBeInTheDocument();
        });
    });

    it("keeps the board when the delete confirmation is cancelled", async () => {
        const user = userEvent.setup();
        renderWithRouter(<BoardCard board={board} workspaceId="workspace-1" />);

        await user.click(
            await screen.findByRole("button", { name: "Launch Plan board options" }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Delete board" }));
        await user.click(await screen.findByRole("button", { name: "Cancel" }));

        await waitFor(() => {
            expect(
                screen.queryByRole("heading", {
                    name: "Delete “Launch Plan”?",
                }),
            ).not.toBeInTheDocument();
        });
    });

    it("shows a pending state while the rename request is in flight", async () => {
        server.use(
            http.patch("*/boards/:boardId", async () => {
                await delay(50);
                return HttpResponse.json({ success: true, data: board });
            }),
        );
        const user = userEvent.setup();
        renderWithRouter(<BoardCard board={board} workspaceId="workspace-1" />);

        await user.click(
            await screen.findByRole("button", { name: "Launch Plan board options" }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Rename board" }));

        const input = screen.getByLabelText("Board name");
        await user.clear(input);
        await user.type(input, "Relaunch Plan");
        await user.click(screen.getByRole("button", { name: "Rename board" }));

        expect(await screen.findByRole("button", { name: "Renaming…" })).toBeDisabled();
    });

    it("shows a pending state while the delete request is in flight", async () => {
        server.use(
            http.delete("*/boards/:boardId", async () => {
                await delay(50);
                return new HttpResponse(null, { status: 204 });
            }),
        );
        const user = userEvent.setup();
        renderWithRouter(<BoardCard board={board} workspaceId="workspace-1" />);

        await user.click(
            await screen.findByRole("button", { name: "Launch Plan board options" }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Delete board" }));
        await user.click(await screen.findByRole("button", { name: "Delete" }));

        expect(await screen.findByRole("button", { name: "Deleting…" })).toBeDisabled();
    });

    it("shows an error when deleting fails", async () => {
        server.use(http.delete("*/boards/:boardId", () => HttpResponse.error()));
        const user = userEvent.setup();
        renderWithRouter(<BoardCard board={board} workspaceId="workspace-1" />);

        await user.click(
            await screen.findByRole("button", { name: "Launch Plan board options" }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Delete board" }));
        await user.click(await screen.findByRole("button", { name: "Delete" }));

        expect(
            await screen.findByText("Couldn't delete the board. Please try again."),
        ).toBeInTheDocument();
    });
});
