import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";

import { RegisterPage } from "@/components/auth/RegisterPage";
import { authSession } from "@/lib/auth-session";

import { server } from "../../mocks/server";
import { renderWithRoutes } from "../../test-utils/renderWithRoutes";

function renderRegisterPage(path = "/register") {
    return renderWithRoutes(
        [
            { path: "/register", element: <RegisterPage /> },
            { path: "/app", element: <p>App home</p> },
        ],
        path,
    );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(await screen.findByLabelText("Full name"), "Jane Doe");
    await user.type(screen.getByLabelText("Work email"), "jane@company.com");
    await user.type(screen.getByLabelText("Password"), "correct-password1");
    await user.type(screen.getByLabelText("Confirm password"), "correct-password1");
}

describe("RegisterPage", () => {
    it("renders the form fields and legal/login links", async () => {
        renderRegisterPage();

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

    it("pre-fills the email field from the ?email= search param", async () => {
        renderRegisterPage("/register?email=jane@company.com");

        expect(await screen.findByLabelText("Work email")).toHaveValue(
            "jane@company.com",
        );
    });

    it("shows a validation error when the passwords do not match", async () => {
        const user = userEvent.setup();
        renderRegisterPage();

        await user.type(await screen.findByLabelText("Full name"), "Jane Doe");
        await user.type(screen.getByLabelText("Work email"), "jane@company.com");
        await user.type(screen.getByLabelText("Password"), "correct-password1");
        await user.type(screen.getByLabelText("Confirm password"), "different1");
        await user.click(screen.getByRole("button", { name: "Create account" }));

        expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    });

    it("registers and navigates to /app on success", async () => {
        const user = userEvent.setup();
        renderRegisterPage();

        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "Create account" }));

        expect(await screen.findByText("App home")).toBeInTheDocument();
        expect(authSession.getAccessToken()).toBe("mock-access-token");
    });

    it("shows an API error message when the email is already registered", async () => {
        server.use(
            http.post("*/auth/register", () =>
                HttpResponse.json(
                    {
                        type: "https://syncboard.dev/errors/conflict",
                        title: "Conflict",
                        status: 409,
                        detail: "An account with this email already exists",
                        instance: "/api/v1/auth/register",
                    },
                    { status: 409 },
                ),
            ),
        );
        const user = userEvent.setup();
        renderRegisterPage();

        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "Create account" }));

        expect(
            await screen.findByText("An account with this email already exists"),
        ).toBeInTheDocument();
    });

    it("shows a validation error for an invalid email", async () => {
        const user = userEvent.setup();
        renderRegisterPage();

        await user.type(await screen.findByLabelText("Full name"), "Jane Doe");
        await user.type(screen.getByLabelText("Work email"), "not-an-email");
        await user.type(screen.getByLabelText("Password"), "correct-password1");
        await user.type(screen.getByLabelText("Confirm password"), "correct-password1");
        await user.click(screen.getByRole("button", { name: "Create account" }));

        expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    });

    it("shows validation errors for an empty name and a weak password", async () => {
        const user = userEvent.setup();
        renderRegisterPage();

        await user.type(await screen.findByLabelText("Full name"), "x");
        await user.type(screen.getByLabelText("Full name"), "{backspace}");
        await user.type(screen.getByLabelText("Work email"), "jane@company.com");
        await user.type(screen.getByLabelText("Password"), "onlyletters");
        await user.type(screen.getByLabelText("Confirm password"), "onlyletters");
        await user.click(screen.getByRole("button", { name: "Create account" }));

        expect(await screen.findByText("Full name is required")).toBeInTheDocument();
        expect(
            await screen.findByText("Must contain a letter and a number"),
        ).toBeInTheDocument();
    });

    it("shows a pending state while the request is in flight", async () => {
        server.use(
            http.post("*/auth/register", async () => {
                await delay(50);
                return HttpResponse.json(
                    {
                        success: true,
                        data: {
                            user: { _id: "user-1", email: "jane@company.com" },
                            accessToken: "mock-access-token",
                        },
                    },
                    { status: 201 },
                );
            }),
        );
        const user = userEvent.setup();
        renderRegisterPage();

        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "Create account" }));

        expect(
            await screen.findByRole("button", { name: "Creating account…" }),
        ).toBeDisabled();
    });
});
