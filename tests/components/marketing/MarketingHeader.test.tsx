import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MarketingHeader } from "@/components/marketing/MarketingHeader";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("MarketingHeader", () => {
    it("renders the logo linking home and the primary nav links", async () => {
        renderWithRouter(<MarketingHeader />);

        expect((await screen.findByText("SyncBoard")).closest("a")).toHaveAttribute(
            "href",
            "/",
        );
        expect(screen.getByRole("link", { name: "Features" })).toHaveAttribute(
            "href",
            "#features",
        );
        expect(screen.getByRole("link", { name: "Roadmap" })).toHaveAttribute(
            "href",
            "/roadmap",
        );
        expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
            "href",
            "/login",
        );
    });

    it("marks the Roadmap link active when it's the current route", async () => {
        renderWithRouter(<MarketingHeader />, "/roadmap");

        expect(await screen.findByRole("link", { name: "Roadmap" })).toHaveClass(
            "font-semibold",
        );
    });

    it("adds a shadow/border once the page is scrolled", async () => {
        renderWithRouter(<MarketingHeader />);
        const header = await screen.findByRole("banner");
        expect(header).not.toHaveClass("border-b");

        vi.spyOn(window, "scrollY", "get").mockReturnValue(40);
        act(() => {
            window.dispatchEvent(new Event("scroll"));
        });

        expect(header).toHaveClass("border-b");
    });

    it("opens the mobile navigation sheet and closes it when a link is activated", async () => {
        const user = userEvent.setup();
        renderWithRouter(<MarketingHeader />);

        await user.click(
            await screen.findByRole("button", { name: "Open navigation" }),
        );

        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByRole("link", { name: "Sign in" })).toHaveAttribute(
            "href",
            "/login",
        );

        await user.click(within(dialog).getByRole("link", { name: "Features" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
