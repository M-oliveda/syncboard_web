import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";

import { LoginPage } from "@/components/auth/LoginPage";
import { authSession } from "@/lib/auth-session";

import { server } from "../../mocks/server";
import { renderWithRoutes } from "../../test-utils/renderWithRoutes";

function renderLoginPage() {
    return renderWithRoutes(
        [
            { path: "/login", element: <LoginPage /> },
            { path: "/app", element: <p>App home</p> },
        ],
        "/login",
    );
}

describe("LoginPage", () => {
    it("renders the form and the sign-up/forgot-password links", async () => {
        renderLoginPage();

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

    it("shows a validation error and does not submit for an invalid email", async () => {
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(await screen.findByLabelText("Email"), "not-an-email");
        await user.type(screen.getByLabelText("Password"), "irrelevant");
        await user.click(screen.getByRole("button", { name: "Log in" }));

        expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    });

    it("logs in and navigates to /app on success", async () => {
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(await screen.findByLabelText("Email"), "mauricio@test.dev");
        await user.type(screen.getByLabelText("Password"), "correct-password1");
        await user.click(screen.getByRole("button", { name: "Log in" }));

        expect(await screen.findByText("App home")).toBeInTheDocument();
        expect(authSession.getAccessToken()).toBe("mock-access-token");
    });

    it("shows an API error message for invalid credentials", async () => {
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(await screen.findByLabelText("Email"), "mauricio@test.dev");
        await user.type(screen.getByLabelText("Password"), "wrong-password");
        await user.click(screen.getByRole("button", { name: "Log in" }));

        expect(
            await screen.findByText("Invalid email or password"),
        ).toBeInTheDocument();
    });

    it("shows a validation error for an empty password", async () => {
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(await screen.findByLabelText("Email"), "mauricio@test.dev");
        await user.type(screen.getByLabelText("Password"), "x");
        await user.type(screen.getByLabelText("Password"), "{backspace}");
        await user.click(screen.getByRole("button", { name: "Log in" }));

        expect(await screen.findByText("Password is required")).toBeInTheDocument();
    });

    it("shows a pending state while the request is in flight", async () => {
        server.use(
            http.post("*/auth/login", async () => {
                await delay(50);
                return HttpResponse.json({
                    success: true,
                    data: {
                        user: { _id: "user-1", email: "mauricio@test.dev" },
                        accessToken: "mock-access-token",
                    },
                });
            }),
        );
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(await screen.findByLabelText("Email"), "mauricio@test.dev");
        await user.type(screen.getByLabelText("Password"), "correct-password1");
        await user.click(screen.getByRole("button", { name: "Log in" }));

        expect(
            await screen.findByRole("button", { name: "Logging in…" }),
        ).toBeDisabled();
        expect(await screen.findByText("App home")).toBeInTheDocument();
    });
});
