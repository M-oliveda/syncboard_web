import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginPage } from "@/components/auth/LoginPage";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("LoginPage", () => {
    it("renders the form and the sign-up/forgot-password links", async () => {
        renderWithRouter(<LoginPage />);

        expect(
            await screen.findByRole("heading", { name: "Welcome back" }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeRequired();
        expect(screen.getByLabelText("Password")).toBeRequired();
        expect(screen.getByRole("link", { name: "Sign up for free" })).toHaveAttribute(
            "href",
            "/register",
        );
        expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
            "href",
            "/forgot-password",
        );
    });

    it("prevents the default (unwired) form submission", async () => {
        renderWithRouter(<LoginPage />);

        const form = (await screen.findByLabelText("Email")).closest("form");
        expect(form).not.toBeNull();
        expect(fireEvent.submit(form as HTMLFormElement)).toBe(false);
    });
});
