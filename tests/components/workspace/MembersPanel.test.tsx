import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MembersPanel } from "@/components/workspace/MembersPanel";
import { mockWorkspaceMembers } from "@/lib/mock-workspace";

describe("MembersPanel", () => {
    it("opens to show the invite form and the existing member list with role badges", async () => {
        const user = userEvent.setup();
        render(<MembersPanel />);

        await user.click(screen.getByRole("button", { name: "Members" }));

        expect(await screen.findByText("Workspace members")).toBeInTheDocument();
        for (const member of mockWorkspaceMembers) {
            expect(screen.getByText(member.name)).toBeInTheDocument();
        }
        expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Member").length).toBeGreaterThan(0);
    });

    it("does not invite anyone when the email field is submitted empty", async () => {
        const user = userEvent.setup();
        render(<MembersPanel />);

        await user.click(screen.getByRole("button", { name: "Members" }));
        await screen.findByText("Workspace members");

        const rowsBefore = screen.getAllByRole("listitem").length;
        await user.click(screen.getByRole("button", { name: "Invite" }));
        expect(screen.getAllByRole("listitem")).toHaveLength(rowsBefore);
    });

    it("invites a new member with the selected role", async () => {
        const user = userEvent.setup();
        render(<MembersPanel />);

        await user.click(screen.getByRole("button", { name: "Members" }));
        await screen.findByText("Workspace members");

        await user.click(screen.getByRole("button", { name: "member" }));
        await user.click(await screen.findByRole("menuitem", { name: "Member" }));

        await user.click(screen.getByRole("button", { name: "member" }));
        await user.click(await screen.findByRole("menuitem", { name: "Admin" }));

        await user.type(
            screen.getByLabelText("Email address to invite"),
            "new.hire@syncboard.dev",
        );
        await user.click(screen.getByRole("button", { name: "Invite" }));

        const row = screen.getByText("new.hire@syncboard.dev").closest("li");
        expect(row).not.toBeNull();
        expect(within(row as HTMLElement).getByText("Admin")).toBeInTheDocument();
    });

    it("changes a member's role and removes a member via the row menu", async () => {
        const user = userEvent.setup();
        render(<MembersPanel />);

        await user.click(screen.getByRole("button", { name: "Members" }));
        const firstMember = mockWorkspaceMembers[0];
        if (!firstMember) throw new Error("expected at least one mock member");

        await screen.findByText(firstMember.name);

        await user.click(
            screen.getByRole("button", { name: `Options for ${firstMember.name}` }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Make member" }));

        const row = screen.getByText(firstMember.name).closest("li");
        expect(row).not.toBeNull();
        expect(within(row as HTMLElement).getByText("Member")).toBeInTheDocument();

        await user.click(
            within(row as HTMLElement).getByRole("button", {
                name: `Options for ${firstMember.name}`,
            }),
        );
        await user.click(
            await screen.findByRole("menuitem", { name: "Remove from workspace" }),
        );

        expect(screen.queryByText(firstMember.name)).not.toBeInTheDocument();
    });

    it("promotes a member to admin via the row menu", async () => {
        const user = userEvent.setup();
        render(<MembersPanel />);

        await user.click(screen.getByRole("button", { name: "Members" }));
        const memberRoleUser = mockWorkspaceMembers.find(
            (member) => member.role === "member",
        );
        if (!memberRoleUser)
            throw new Error("expected at least one mock member with role member");

        await screen.findByText(memberRoleUser.name);

        await user.click(
            screen.getByRole("button", { name: `Options for ${memberRoleUser.name}` }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Make admin" }));

        const row = screen.getByText(memberRoleUser.name).closest("li");
        expect(row).not.toBeNull();
        expect(within(row as HTMLElement).getByText("Admin")).toBeInTheDocument();
    });
});
