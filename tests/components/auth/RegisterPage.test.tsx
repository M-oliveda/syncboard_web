import {
    RouterProvider,
    createMemoryHistory,
    createRouter,
} from "@tanstack/react-router";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

function renderAtPath(path: string) {
    const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: [path] }),
    });

    render(<RouterProvider router={router} />);
    return router;
}

describe("RegisterPage", () => {
    it("renders the form fields and legal/login links", async () => {
        renderAtPath("/register");

        expect(
            await screen.findByRole("heading", { name: "Create your account" }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Full name")).toBeRequired();
        expect(screen.getByLabelText("Work email")).toBeRequired();
        expect(screen.getByLabelText("Password")).toBeRequired();
        expect(screen.getByLabelText("Confirm password")).toBeRequired();
        expect(screen.getByRole("link", { name: "Log in here" })).toHaveAttribute(
            "href",
            "/login",
        );
        expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute(
            "href",
            "/terms",
        );
        expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
            "href",
            "/privacy",
        );
    });

    it("prevents the default (unwired) form submission", async () => {
        renderAtPath("/register");

        const form = (await screen.findByLabelText("Full name")).closest("form");
        expect(form).not.toBeNull();
        expect(fireEvent.submit(form as HTMLFormElement)).toBe(false);
    });

    it("pre-fills the email field from the ?email= search param", async () => {
        renderAtPath("/register?email=jane@company.com");

        expect(await screen.findByLabelText("Work email")).toHaveValue(
            "jane@company.com",
        );
    });
});
