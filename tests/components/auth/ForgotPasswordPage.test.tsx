import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";

import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("ForgotPasswordPage", () => {
    it("renders the form and a link back to login", async () => {
        renderWithRouter(<ForgotPasswordPage />);

        expect(
            await screen.findByRole("heading", { name: "Reset your password" }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeRequired();
        expect(screen.getByRole("link", { name: "Log in here" })).toHaveAttribute(
            "href",
            "/login",
        );
    });

    it("prevents the default (unwired) form submission", async () => {
        renderWithRouter(<ForgotPasswordPage />);

        const form = (await screen.findByLabelText("Email")).closest("form");
        expect(form).not.toBeNull();
        expect(fireEvent.submit(form as HTMLFormElement)).toBe(false);
    });
});
