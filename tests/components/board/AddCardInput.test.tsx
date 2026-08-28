import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AddCardInput } from "@/components/board/AddCardInput";

describe("AddCardInput", () => {
    it("opens the form, accepts text, and closes on submit", async () => {
        const user = userEvent.setup();
        render(<AddCardInput listName="Backlog" />);

        await user.click(screen.getByRole("button", { name: "Add a card" }));

        const textarea = screen.getByPlaceholderText("Add a card to Backlog");
        await user.type(textarea, "New task");
        expect(textarea).toHaveValue("New task");

        await user.click(screen.getByRole("button", { name: "Add card" }));

        expect(screen.getByRole("button", { name: "Add a card" })).toBeInTheDocument();
        expect(
            screen.queryByPlaceholderText("Add a card to Backlog"),
        ).not.toBeInTheDocument();
    });

    it("closes the form via the cancel button without submitting", async () => {
        const user = userEvent.setup();
        render(<AddCardInput listName="Backlog" />);

        await user.click(screen.getByRole("button", { name: "Add a card" }));
        await user.click(screen.getByRole("button", { name: "Cancel adding a card" }));

        expect(screen.getByRole("button", { name: "Add a card" })).toBeInTheDocument();
    });
});
