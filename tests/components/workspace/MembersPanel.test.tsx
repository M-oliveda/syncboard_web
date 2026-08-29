import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MembersPanel } from "@/components/workspace/MembersPanel";

import { FIXTURE_WORKSPACE } from "../../mocks/fixtures";
import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("MembersPanel", () => {
    it("opens to show the disabled invite row and the existing member list with role badges", async () => {
        const user = userEvent.setup();
        renderWithRouter(<MembersPanel workspaceId="workspace-1" />);

        await user.click(await screen.findByRole("button", { name: "Members" }));

        expect(await screen.findByText("Workspace members")).toBeInTheDocument();
        expect(
            screen.getByText(/self-service invites aren.t available yet/),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Invite" })).toBeDisabled();

        for (const member of FIXTURE_WORKSPACE.members) {
            expect(screen.getByText(member.userId.email)).toBeInTheDocument();
        }
        expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Member").length).toBeGreaterThan(0);
    });

    it("changes a member's role via the row menu", async () => {
        const user = userEvent.setup();
        const memberRoleUser = FIXTURE_WORKSPACE.members.find(
            (m) => m.role === "Member",
        );
        if (!memberRoleUser) throw new Error("expected a Member-role fixture member");

        renderWithRouter(<MembersPanel workspaceId="workspace-1" />);

        await user.click(await screen.findByRole("button", { name: "Members" }));
        await screen.findByText(memberRoleUser.userId.email);

        await user.click(
            screen.getByRole("button", {
                name: `Options for ${memberRoleUser.userId.email.replace(/@.*$/, "")}`,
            }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Make admin" }));

        expect(screen.getByText(memberRoleUser.userId.email)).toBeInTheDocument();
    });

    it("demotes an admin to member via the row menu", async () => {
        const user = userEvent.setup();
        const adminUser = FIXTURE_WORKSPACE.members.find((m) => m.role === "Admin");
        if (!adminUser) throw new Error("expected an Admin-role fixture member");
        const name = adminUser.userId.email.replace(/@.*$/, "");

        renderWithRouter(<MembersPanel workspaceId="workspace-1" />);

        await user.click(await screen.findByRole("button", { name: "Members" }));
        await screen.findByText(adminUser.userId.email);

        await user.click(screen.getByRole("button", { name: `Options for ${name}` }));
        await user.click(await screen.findByRole("menuitem", { name: "Make member" }));

        expect(screen.getByText(adminUser.userId.email)).toBeInTheDocument();
    });

    it("removes a member via the row menu", async () => {
        const user = userEvent.setup();
        const adminUser = FIXTURE_WORKSPACE.members.find((m) => m.role === "Admin");
        if (!adminUser) throw new Error("expected an Admin-role fixture member");
        const name = adminUser.userId.email.replace(/@.*$/, "");

        renderWithRouter(<MembersPanel workspaceId="workspace-1" />);

        await user.click(await screen.findByRole("button", { name: "Members" }));
        await screen.findByText(adminUser.userId.email);

        await user.click(screen.getByRole("button", { name: `Options for ${name}` }));
        await user.click(
            await screen.findByRole("menuitem", { name: "Remove from workspace" }),
        );

        expect(
            screen.queryByRole("menuitem", { name: "Remove from workspace" }),
        ).not.toBeInTheDocument();
        expect(screen.getByText("Workspace members")).toBeInTheDocument();
    });
});
