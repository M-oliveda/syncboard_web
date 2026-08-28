import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RichTextEditor } from "@/components/card-modal/RichTextEditor";

describe("RichTextEditor", () => {
    it("renders the initial value and a placeholder fallback when empty", () => {
        render(<RichTextEditor initialValue="Hello world" />);
        expect(screen.getByText("Hello world")).toBeInTheDocument();

        render(<RichTextEditor initialValue="" placeholder="Nothing here" />);
        expect(screen.getByText("Nothing here")).toBeInTheDocument();
    });

    it("uses the default placeholder when none is provided and the value is empty", () => {
        render(<RichTextEditor initialValue="" />);
        expect(screen.getByText("No description yet.")).toBeInTheDocument();
    });

    it("enters edit mode, cancels without keeping changes, then saves changes", async () => {
        const user = userEvent.setup();
        render(<RichTextEditor initialValue="Original text" />);

        await user.click(screen.getByRole("button", { name: "Edit" }));
        const textarea = screen.getByPlaceholderText(
            "Add a more detailed description...",
        );
        await user.clear(textarea);
        await user.type(textarea, "Cancelled edit");
        await user.click(screen.getByRole("button", { name: "Cancel" }));

        expect(screen.getByText("Original text")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Edit" }));
        const textareaAgain = screen.getByPlaceholderText(
            "Add a more detailed description...",
        );
        await user.clear(textareaAgain);
        await user.type(textareaAgain, "Saved text");
        await user.click(screen.getByRole("button", { name: "Save" }));

        expect(screen.getByText("Saved text")).toBeInTheDocument();
    });

    it("renders inert toolbar buttons while editing", async () => {
        const user = userEvent.setup();
        render(<RichTextEditor initialValue="Text" />);

        await user.click(screen.getByRole("button", { name: "Edit" }));

        expect(screen.getByTitle("Bold")).toBeInTheDocument();
        expect(screen.getByTitle("Code block")).toBeInTheDocument();
    });
});
