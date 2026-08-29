import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";

import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";

import { server } from "../../mocks/server";
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

    it("shows a confirmation message after submitting a valid email", async () => {
        const user = userEvent.setup();
        renderWithRouter(<ForgotPasswordPage />);

        await user.type(await screen.findByLabelText("Email"), "jane@company.com");
        await user.click(screen.getByRole("button", { name: "Send reset link" }));

        expect(
            await screen.findByText(/If that email exists, a reset link has been sent/),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Send reset link" }),
        ).not.toBeInTheDocument();
    });

    it("does not submit for an invalid email", async () => {
        const user = userEvent.setup();
        renderWithRouter(<ForgotPasswordPage />);

        await user.type(await screen.findByLabelText("Email"), "not-an-email");
        await user.click(screen.getByRole("button", { name: "Send reset link" }));

        expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    });

    it("shows an API error message when the request fails", async () => {
        server.use(http.post("*/auth/forgot-password", () => HttpResponse.error()));
        const user = userEvent.setup();
        renderWithRouter(<ForgotPasswordPage />);

        await user.type(await screen.findByLabelText("Email"), "jane@company.com");
        await user.click(screen.getByRole("button", { name: "Send reset link" }));

        expect(
            await screen.findByText("Something went wrong. Please try again."),
        ).toBeInTheDocument();
    });

    it("shows a pending state while the request is in flight", async () => {
        server.use(
            http.post("*/auth/forgot-password", async () => {
                await delay(50);
                return HttpResponse.json(
                    { success: true, data: null },
                    { status: 202 },
                );
            }),
        );
        const user = userEvent.setup();
        renderWithRouter(<ForgotPasswordPage />);

        await user.type(await screen.findByLabelText("Email"), "jane@company.com");
        await user.click(screen.getByRole("button", { name: "Send reset link" }));

        expect(await screen.findByRole("button", { name: "Sending…" })).toBeDisabled();
    });
});
