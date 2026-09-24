import { screen, waitFor } from "@testing-library/react";
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
import type { BoardCard, BoardList } from "@/types/board";
import type { WorkspaceMember } from "@/types/workspace";

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
    assignees: [{ id: "m1", initials: "MO" }],
    checklist: [{ id: "0", label: "Reproduce it", completed: false }],
};

const members: WorkspaceMember[] = [
    { id: "m1", name: "Mo", email: "mo@test.dev", role: "admin" },
    { id: "m2", name: "Jamie Santos", email: "jamie@test.dev", role: "member" },
];

const lists: BoardList[] = [
    { id: "list-1", order: 0, name: "In Progress", cards: [card] },
    {
        id: "list-2",
        order: 1,
        name: "Done",
        cards: [{ id: "c-done", order: 5, title: "Already shipped" }],
    },
];

function baseProps() {
    return {
        card,
        listName: "In Progress",
        listId: "list-1",
        lists,
        members,
        boardId: "board-1",
    };
}

describe("CardDetailModal", () => {
    it("renders nothing when closed", () => {
        renderWithRouter(
            <CardDetailModal {...baseProps()} open={false} onOpenChange={vi.fn()} />,
        );
        expect(screen.queryByText("Description")).not.toBeInTheDocument();
    });

    it("renders the card title, list name, labels, assignees, checklist, and activity when open", async () => {
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        expect(await screen.findByDisplayValue("Fix the thing")).toBeInTheDocument();
        expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);
        expect(screen.getByText("BUG")).toBeInTheDocument();
        expect(screen.getByText("FRONTEND")).toBeInTheDocument();
        expect(screen.getByTitle("Mo")).toBeInTheDocument();
        expect(screen.getByText("MO")).toBeInTheDocument();
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("Reproduce it")).toBeInTheDocument();
        expect(screen.getByText("Activity")).toBeInTheDocument();
    });

    it("calls onOpenChange(false) when the close button is clicked", async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={onOpenChange} />,
        );

        await user.click(await screen.findByTitle("Close modal"));

        expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
    });

    it("removes a label when its remove control is clicked", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        await user.click(await screen.findByRole("button", { name: /BUG/ }));

        expect(screen.queryByText("BUG")).not.toBeInTheDocument();
        expect(screen.getByText("FRONTEND")).toBeInTheDocument();
    });

    it("renders empty states when there are no labels, assignees, or checklist items", async () => {
        renderWithRouter(
            <CardDetailModal
                {...baseProps()}
                card={{ id: "c2", order: 0, title: "No extras" }}
                open
                onOpenChange={vi.fn()}
            />,
        );

        expect(await screen.findByDisplayValue("No extras")).toBeInTheDocument();
        expect(screen.getByText("No one assigned")).toBeInTheDocument();
        expect(screen.getByText("No labels yet")).toBeInTheDocument();
    });

    it("shows an empty state when the workspace has no members to assign", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal
                {...baseProps()}
                members={[]}
                open
                onOpenChange={vi.fn()}
            />,
        );

        await user.click(await screen.findByRole("button", { name: "Assignees" }));

        expect(await screen.findByText("No workspace members")).toBeInTheDocument();
    });

    it("saves the title when it changes on blur", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
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
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        const titleInput = await screen.findByDisplayValue("Fix the thing");
        await user.click(titleInput);
        await user.tab();

        expect(titleInput).toHaveValue("Fix the thing");
    });

    it("saves the description via the rich text editor", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
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
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        await screen.findByDisplayValue("Fix the thing");
        await user.click(screen.getByRole("checkbox"));

        expect(screen.getByText("Reproduce it")).toHaveClass("line-through");
    });

    it("deletes the card after confirming and closes the modal", async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={onOpenChange} />,
        );

        await user.click(await screen.findByTitle("Delete card"));
        await user.click(await screen.findByRole("button", { name: "Delete" }));

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("keeps the modal open when deleting the card fails", async () => {
        server.use(http.delete("*/cards/:cardId", () => HttpResponse.error()));
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={onOpenChange} />,
        );

        await user.click(await screen.findByTitle("Delete card"));
        await user.click(await screen.findByRole("button", { name: "Delete" }));

        expect(await screen.findByDisplayValue(card.title)).toBeInTheDocument();
        expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("cancels out of the delete confirmation without deleting", async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={onOpenChange} />,
        );

        await user.click(await screen.findByTitle("Delete card"));
        await user.click(await screen.findByRole("button", { name: "Cancel" }));

        expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("moves the card to a different list from the status dropdown", async () => {
        let requestBody: unknown;
        server.use(
            http.patch("*/cards/:cardId", async ({ request }) => {
                requestBody = await request.json();
                return HttpResponse.json({
                    success: true,
                    data: { _id: "c1", listId: "list-2", order: 6 },
                });
            }),
        );
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        await user.click(await screen.findByRole("button", { name: "In Progress" }));
        await user.click(await screen.findByRole("menuitem", { name: "Done" }));

        await waitFor(() =>
            expect(requestBody).toEqual({ listId: "list-2", order: 6 }),
        );
    });

    it("does not move the card when the current list is selected again", async () => {
        let patchCalls = 0;
        server.use(
            http.patch("*/cards/:cardId", () => {
                patchCalls += 1;
                return HttpResponse.json({
                    success: true,
                    data: { _id: "c1", listId: "list-1", order: 0 },
                });
            }),
        );
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        await user.click(await screen.findByRole("button", { name: "In Progress" }));
        await user.click(await screen.findByRole("menuitem", { name: "In Progress" }));

        expect(patchCalls).toBe(0);
    });

    it("adds a workspace member as an assignee when toggled on", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        // Base UI's Menu trigger settles open state on a longer tick than
        // testing-library's default 1s async timeout in this environment — extend
        // it rather than assert on a false negative.
        await user.click(await screen.findByRole("button", { name: "Assignees" }));
        await user.click(
            await screen.findByRole(
                "menuitemcheckbox",
                { name: "Jamie Santos" },
                { timeout: 3000 },
            ),
        );

        expect(await screen.findByTitle("Jamie Santos")).toBeInTheDocument();
    });

    it("removes a workspace member as an assignee when toggled off", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        expect(await screen.findByTitle("Mo")).toBeInTheDocument();

        await user.click(await screen.findByRole("button", { name: "Assignees" }));
        await user.click(
            await screen.findByRole(
                "menuitemcheckbox",
                { name: "Mo" },
                { timeout: 3000 },
            ),
        );

        expect(screen.queryByTitle("Mo")).not.toBeInTheDocument();
    });

    it("adds a new label via the label adder", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        await user.click(await screen.findByRole("button", { name: "Labels" }));
        await user.type(
            await screen.findByLabelText("New label name", {}, { timeout: 3000 }),
            "Design",
        );
        await user.click(screen.getByRole("button", { name: "Add" }));

        expect(await screen.findByText("Design")).toBeInTheDocument();
    });

    it("adds a new label via the sidebar's plus button", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        await user.click(await screen.findByRole("button", { name: "Add label" }));
        await user.type(
            await screen.findByLabelText("New label name", {}, { timeout: 3000 }),
            "Urgent",
        );
        await user.click(screen.getByRole("button", { name: "Add" }));

        expect(await screen.findByText("Urgent")).toBeInTheDocument();
    });

    it("does not add a blank or duplicate label", async () => {
        const user = userEvent.setup();
        renderWithRouter(
            <CardDetailModal {...baseProps()} open onOpenChange={vi.fn()} />,
        );

        await user.click(await screen.findByRole("button", { name: "Labels" }));
        await user.click(
            await screen.findByLabelText("New label name", {}, { timeout: 3000 }),
        );
        await user.click(screen.getByRole("button", { name: "Add" }));
        expect(screen.getAllByText("BUG")).toHaveLength(1);

        await user.type(screen.getByLabelText("New label name"), "bug");
        await user.click(screen.getByRole("button", { name: "Add" }));

        expect(screen.getAllByText(/bug/i)).toHaveLength(1);
    });
});
