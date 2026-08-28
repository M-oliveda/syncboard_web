import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";

import { ResetPasswordPage } from "@/components/auth/ResetPasswordPage";

import { server } from "../../mocks/server";
import { renderWithRoutes } from "../../test-utils/renderWithRoutes";

function renderResetPasswordPage(token: string) {
    return renderWithRoutes(
        [
            { path: "/reset-password", element: <ResetPasswordPage /> },
            { path: "/login", element: <p>Login page</p> },
        ],
        `/reset-password?token=${token}`,
    );
}

describe("ResetPasswordPage", () => {
    it("renders the form and a link back to login", async () => {
        renderResetPasswordPage("valid-token");

        expect(
            await screen.findByRole("heading", { name: "Choose a new password" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Log in here" })).toHaveAttribute(
            "href",
            "/login",
        );
    });

    it("shows a validation error when the passwords do not match", async () => {
        const user = userEvent.setup();
        renderResetPasswordPage("valid-token");

        await user.type(
            await screen.findByLabelText("New password"),
            "correct-password1",
        );
        await user.type(
            screen.getByLabelText("Confirm new password"),
            "different-password1",
        );
        await user.click(screen.getByRole("button", { name: "Reset password" }));

        expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    });

    it("shows a validation error for a password missing a digit", async () => {
        const user = userEvent.setup();
        renderResetPasswordPage("valid-token");

        await user.type(await screen.findByLabelText("New password"), "onlyletters");
        await user.type(screen.getByLabelText("Confirm new password"), "onlyletters");
        await user.click(screen.getByRole("button", { name: "Reset password" }));

        expect(
            await screen.findByText("Must contain a letter and a number"),
        ).toBeInTheDocument();
    });

    it("resets the password and navigates to /login on success", async () => {
        const user = userEvent.setup();
        renderResetPasswordPage("valid-token");

        await user.type(
            await screen.findByLabelText("New password"),
            "correct-password1",
        );
        await user.type(
            screen.getByLabelText("Confirm new password"),
            "correct-password1",
        );
        await user.click(screen.getByRole("button", { name: "Reset password" }));

        expect(await screen.findByText("Login page")).toBeInTheDocument();
    });

    it("shows an API error message for an invalid/expired token", async () => {
        const user = userEvent.setup();
        renderResetPasswordPage("bad-token");

        await user.type(
            await screen.findByLabelText("New password"),
            "correct-password1",
        );
        await user.type(
            screen.getByLabelText("Confirm new password"),
            "correct-password1",
        );
        await user.click(screen.getByRole("button", { name: "Reset password" }));

        expect(
            await screen.findByText("Invalid or expired reset token"),
        ).toBeInTheDocument();
    });

    it("shows a pending state while the request is in flight", async () => {
        server.use(
            http.post("*/auth/reset-password", async () => {
                await delay(50);
                return new HttpResponse(null, { status: 204 });
            }),
        );
        const user = userEvent.setup();
        renderResetPasswordPage("valid-token");

        await user.type(
            await screen.findByLabelText("New password"),
            "correct-password1",
        );
        await user.type(
            screen.getByLabelText("Confirm new password"),
            "correct-password1",
        );
        await user.click(screen.getByRole("button", { name: "Reset password" }));

        expect(
            await screen.findByRole("button", { name: "Resetting…" }),
        ).toBeDisabled();
    });
});
