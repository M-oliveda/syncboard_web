import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

// CardDetailModal's own responsibility is wiring RichTextEditor's onSave to the
// card mutation, not exercising Lexical's contentEditable typing/selection
// machinery — that's covered by the markdown-editor test suite directly.
// jsdom's Selection/Range support isn't reliable enough for real typing into a
// Lexical editor to behave deterministically here, so this stubs the editable
// surface as a plain textbox that mirrors the same onChange contract.
vi.mock("@/components/card-modal/markdown-editor", () => ({
    MarkdownEditor: (props: {
        initialContent: string;
        onChange?: (markdown: string) => void;
        readOnly?: boolean;
    }) =>
        props.readOnly ? (
            <div>{props.initialContent}</div>
        ) : (
            <textarea
                aria-label="Card description"
                defaultValue={props.initialContent}
                onChange={(event) => props.onChange?.(event.target.value)}
            />
        ),
}));

import { CardDetailModal } from "@/components/card-modal/CardDetailModal";
import type { BoardCard } from "@/types/board";

import { server } from "../../mocks/server";
import { renderWithRouter } from "../../test-utils/renderWithRouter";

const card: BoardCard = {
    id: "c1",
    order: 0,
    title: "Fix the thing",
    labels: [
        { id: "l1", name: "BUG", color: "error" },
        { id: "l2", name: "FRONTEND", color: "primary" },
    ],
    assignees: [{ id: "a1", initials: "MO" }],
    checklist: [{ id: "0", label: "Reproduce it", completed: false }],
};

describe("CardDetailModal", () => {
    it("renders nothing when closed", () => {
        renderWithRouter(
            <CardDetailModal
                card={card}
                listName="In Progress"
                boardId="board-1"
                open={false}
                onOpenChange={vi.fn()}
            />,
        );
        expect(screen.queryByText("Description")).not.toBeInTheDocument();
    });

    it("renders the card title, list name, labels, assignees, checklist, and activity when open", async () => {
        renderWithRouter(
            <CardDetailModal
                card={card}
                listName="In Progress"
                boardId="board-1"
                open
                onOpenChange={vi.fn()}
            />,
        );

        expect(await screen.findByDisplayValue("Fix the thing")).toBeInTheDocument();
        expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);
        expect(screen.getByText("BUG")).toBeInTheDocument();
        expect(screen.getByText("FRONTEND")).toBeInTheDocument();
        expect(screen.getByTitle("MO")).toBeInTheDocument();
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("Reproduce it")).toBeInTheDocument();
        expect(screen.getByText("Activity")).toBeInTheDocument();
    });

    it("calls onOpenChange(false) when the close button is clicked", async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderWithRouter(
            <CardDetailModal
                card={card}
                listName="In Progress"
                boardId="board-1"
                open
                onOpenChange={onOpenChange}
            />,
        );

        await user.click(await screen.findByTitle("Close modal"));

        expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
    });

    it("removes a label when its remove control is clicked", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal
                card={card}
                listName="In Progress"
                boardId="board-1"
                open
                onOpenChange={vi.fn()}
            />,
        );

        await user.click(await screen.findByRole("button", { name: /BUG/ }));

        expect(screen.queryByText("BUG")).not.toBeInTheDocument();
        expect(screen.getByText("FRONTEND")).toBeInTheDocument();
    });

    it("renders with no labels, assignees, or checklist items", async () => {
        renderWithRouter(
            <CardDetailModal
                card={{ id: "c2", order: 0, title: "No extras" }}
                listName="Backlog"
                boardId="board-1"
                open
                onOpenChange={vi.fn()}
            />,
        );

        expect(await screen.findByDisplayValue("No extras")).toBeInTheDocument();
    });

    it("saves the title when it changes on blur", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal
                card={card}
                listName="In Progress"
                boardId="board-1"
                open
                onOpenChange={vi.fn()}
            />,
        );

        const titleInput = await screen.findByDisplayValue("Fix the thing");
        await user.clear(titleInput);
        await user.type(titleInput, "Fix the other thing");
        await user.tab();

        expect(titleInput).toHaveValue("Fix the other thing");
    });

    it("does not save the title when it is unchanged on blur", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal
                card={card}
                listName="In Progress"
                boardId="board-1"
                open
                onOpenChange={vi.fn()}
            />,
        );

        const titleInput = await screen.findByDisplayValue("Fix the thing");
        await user.click(titleInput);
        await user.tab();

        expect(titleInput).toHaveValue("Fix the thing");
    });

    it("saves the description via the rich text editor", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal
                card={card}
                listName="In Progress"
                boardId="board-1"
                open
                onOpenChange={vi.fn()}
            />,
        );

        await screen.findByDisplayValue("Fix the thing");
        await user.click(screen.getByRole("button", { name: "Edit" }));
        const editable = screen.getByLabelText("Card description");
        await user.type(editable, "New description");
        await user.click(screen.getByRole("button", { name: "Save" }));

        expect(await screen.findByText("New description")).toBeInTheDocument();
    });

    it("toggles a checklist item", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal
                card={card}
                listName="In Progress"
                boardId="board-1"
                open
                onOpenChange={vi.fn()}
            />,
        );

        await screen.findByDisplayValue("Fix the thing");
        await user.click(screen.getByRole("checkbox"));

        expect(screen.getByText("Reproduce it")).toHaveClass("line-through");
    });

    it("deletes the card via the more-actions menu and closes the modal", async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderWithRouter(
            <CardDetailModal
                card={card}
                listName="In Progress"
                boardId="board-1"
                open
                onOpenChange={onOpenChange}
            />,
        );

        await user.click(await screen.findByTitle("More actions"));
        await user.click(await screen.findByRole("menuitem", { name: /Delete card/ }));

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("keeps the modal open when deleting the card fails", async () => {
        server.use(http.delete("*/cards/:cardId", () => HttpResponse.error()));
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderWithRouter(
            <CardDetailModal
                card={card}
                listName="In Progress"
                boardId="board-1"
                open
                onOpenChange={onOpenChange}
            />,
        );

        await user.click(await screen.findByTitle("More actions"));
        await user.click(await screen.findByRole("menuitem", { name: /Delete card/ }));

        expect(await screen.findByDisplayValue(card.title)).toBeInTheDocument();
        expect(onOpenChange).not.toHaveBeenCalled();
    });
});
