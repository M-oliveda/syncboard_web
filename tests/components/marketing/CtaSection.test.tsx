import {
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CtaSection } from "@/components/marketing/CtaSection";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

/** Mounts CtaSection alongside a dummy /register route, so submitting can be asserted against real router navigation/search state. */
function renderCtaWithRegisterRoute() {
    const rootRoute = createRootRoute();
    const ctaRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: "/",
        component: CtaSection,
    });
    const registerRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: "/register",
        component: () => null,
    });
    const router = createRouter({
        routeTree: rootRoute.addChildren([ctaRoute, registerRoute]),
        history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(<RouterProvider router={router} />);
    return router;
}

describe("CtaSection", () => {
    it("renders the email capture form and a submit button", async () => {
        renderWithRouter(<CtaSection />);

        expect(
            await screen.findByRole("heading", { name: "Ready to move faster?" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Get started" })).toHaveAttribute(
            "type",
            "submit",
        );
        expect(screen.getByLabelText("Work email")).toBeRequired();
    });

    it("submits the entered email and navigates to /register with it prefilled", async () => {
        const user = userEvent.setup();
        const router = renderCtaWithRegisterRoute();

        await user.type(await screen.findByLabelText("Work email"), "jane@company.com");
        await user.click(screen.getByRole("button", { name: "Get started" }));

        expect(router.state.location.pathname).toBe("/register");
        expect(router.state.location.search).toEqual({ email: "jane@company.com" });
    });
});
