import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PresenceHeader } from "@/components/layout/PresenceHeader";
import type { PresenceUser } from "@/types/board";

describe("PresenceHeader", () => {
    it("renders initials for up to three users without an overflow badge", () => {
        const users: PresenceUser[] = [
            { id: "1", email: "jamie.santos@example.com", status: "online" },
            { id: "2", email: "avery@example.com", status: "away" },
        ];

        render(<PresenceHeader users={users} />);

        expect(screen.getByText("JS")).toBeInTheDocument();
        expect(screen.getByText("A")).toBeInTheDocument();
        expect(
            screen.getByLabelText("2 people viewing this board"),
        ).toBeInTheDocument();
        expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    it("caps visible avatars at three and shows an overflow count", () => {
        const users: PresenceUser[] = [
            { id: "1", email: "one@example.com", status: "online" },
            { id: "2", email: "two@example.com", status: "online" },
            { id: "3", email: "three@example.com", status: "online" },
            { id: "4", email: "four@example.com", status: "online" },
        ];

        render(<PresenceHeader users={users} />);

        expect(screen.getByText("+1")).toBeInTheDocument();
        expect(
            screen.getByLabelText("4 people viewing this board"),
        ).toBeInTheDocument();
    });

    it("uses singular wording for exactly one viewer and falls back to ? for an unparseable email", () => {
        render(
            <PresenceHeader
                users={[{ id: "1", email: "@example.com", status: "online" }]}
            />,
        );

        expect(
            screen.getByLabelText("1 person viewing this board"),
        ).toBeInTheDocument();
        expect(screen.getByText("?")).toBeInTheDocument();
    });
});
