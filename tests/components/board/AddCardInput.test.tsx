import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";

import { AddCardInput } from "@/components/board/AddCardInput";

import { server } from "../../mocks/server";
import { renderWithRouter } from "../../test-utils/renderWithRouter";

describe("AddCardInput", () => {
    it("opens the form, accepts text, and closes on submit", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <AddCardInput boardId="board-1" listId="list-1" listName="Backlog" />,
        );

        await user.click(await screen.findByRole("button", { name: "Add a card" }));

        const textarea = screen.getByPlaceholderText("Add a card to Backlog");
        await user.type(textarea, "New task");
        expect(textarea).toHaveValue("New task");

        await user.click(screen.getByRole("button", { name: "Add card" }));

        expect(
            await screen.findByRole("button", { name: "Add a card" }),
        ).toBeInTheDocument();
        expect(
            screen.queryByPlaceholderText("Add a card to Backlog"),
        ).not.toBeInTheDocument();
    });

    it("does not submit an empty/whitespace-only card title", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <AddCardInput boardId="board-1" listId="list-1" listName="Backlog" />,
        );

        await user.click(await screen.findByRole("button", { name: "Add a card" }));
        await user.type(screen.getByPlaceholderText("Add a card to Backlog"), "   ");
        await user.click(screen.getByRole("button", { name: "Add card" }));

        expect(
            screen.getByPlaceholderText("Add a card to Backlog"),
        ).toBeInTheDocument();
    });

    it("closes the form via the cancel button without submitting", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <AddCardInput boardId="board-1" listId="list-1" listName="Backlog" />,
        );

        await user.click(await screen.findByRole("button", { name: "Add a card" }));
        await user.click(screen.getByRole("button", { name: "Cancel adding a card" }));

        expect(screen.getByRole("button", { name: "Add a card" })).toBeInTheDocument();
    });

    it("keeps the form open when the create request fails", async () => {
        server.use(http.post("*/lists/:listId/cards", () => HttpResponse.error()));
        const user = userEvent.setup();
        renderWithRouter(
            <AddCardInput boardId="board-1" listId="list-1" listName="Backlog" />,
        );

        await user.click(await screen.findByRole("button", { name: "Add a card" }));
        await user.type(
            screen.getByPlaceholderText("Add a card to Backlog"),
            "New task",
        );
        await user.click(screen.getByRole("button", { name: "Add card" }));

        expect(
            await screen.findByPlaceholderText("Add a card to Backlog"),
        ).toBeInTheDocument();
    });

    it("shows a pending state while the request is in flight", async () => {
        server.use(
            http.post("*/lists/:listId/cards", async () => {
                await delay(50);
                return HttpResponse.json(
                    {
                        success: true,
                        data: {
                            _id: "card-new",
                            listId: "list-1",
                            title: "New task",
                            description: "",
                            order: 1,
                            assignees: [],
                            labels: [],
                            checklist: [],
                        },
                    },
                    { status: 201 },
                );
            }),
        );
        const user = userEvent.setup();
        renderWithRouter(
            <AddCardInput boardId="board-1" listId="list-1" listName="Backlog" />,
        );

        await user.click(await screen.findByRole("button", { name: "Add a card" }));
        await user.type(
            screen.getByPlaceholderText("Add a card to Backlog"),
            "New task",
        );
        await user.click(screen.getByRole("button", { name: "Add card" }));

        expect(await screen.findByRole("button", { name: "Adding…" })).toBeDisabled();
    });
});
