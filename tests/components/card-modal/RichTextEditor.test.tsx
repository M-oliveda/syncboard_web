import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockMarkdownEditorProps {
    initialContent: string;
    placeholder?: string;
    onChange?: (markdown: string) => void;
    readOnly?: boolean;
}

const capturedProps: MockMarkdownEditorProps[] = [];

vi.mock("@/components/card-modal/markdown-editor", () => ({
    MarkdownEditor: (props: MockMarkdownEditorProps) => {
        capturedProps.push(props);
        return (
            <div
                data-testid="mock-markdown-editor"
                data-readonly={String(!!props.readOnly)}
            >
                {props.initialContent}
            </div>
        );
    },
}));

import { RichTextEditor } from "@/components/card-modal/RichTextEditor";

describe("RichTextEditor", () => {
    beforeEach(() => {
        capturedProps.length = 0;
    });

    it("renders the initial value read-only and a placeholder fallback when empty", () => {
        render(<RichTextEditor initialValue="Hello world" />);
        const editor = screen.getByTestId("mock-markdown-editor");
        expect(editor).toHaveTextContent("Hello world");
        expect(editor).toHaveAttribute("data-readonly", "true");

        render(<RichTextEditor initialValue="" placeholder="Nothing here" />);
        expect(screen.getByText("Nothing here")).toBeInTheDocument();
    });

    it("uses the default placeholder when none is provided and the value is empty", () => {
        render(<RichTextEditor initialValue="" />);
        expect(screen.getByText("No description yet.")).toBeInTheDocument();
        expect(screen.queryByTestId("mock-markdown-editor")).not.toBeInTheDocument();
    });

    it("enters edit mode with the real editor, editable and showing the default placeholder", () => {
        render(<RichTextEditor initialValue="Text" />);
        fireEvent.click(screen.getByRole("button", { name: "Edit" }));

        const editorProps = capturedProps.at(-1);
        expect(editorProps?.readOnly).toBeFalsy();
        expect(editorProps?.placeholder).toBe("Add a more detailed description...");
    });

    it("passes a custom placeholder through to the editable editor", () => {
        render(<RichTextEditor initialValue="Text" placeholder="Custom placeholder" />);
        fireEvent.click(screen.getByRole("button", { name: "Edit" }));

        const editorProps = capturedProps.at(-1);
        expect(editorProps?.placeholder).toBe("Custom placeholder");
    });

    it("cancels without keeping changes, then saves changes", () => {
        const onSave = vi.fn();
        render(<RichTextEditor initialValue="Original text" onSave={onSave} />);

        fireEvent.click(screen.getByRole("button", { name: "Edit" }));
        capturedProps.at(-1)?.onChange?.("Cancelled edit");
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(screen.getByTestId("mock-markdown-editor")).toHaveTextContent(
            "Original text",
        );
        expect(onSave).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "Edit" }));
        capturedProps.at(-1)?.onChange?.("Saved text");
        fireEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(screen.getByTestId("mock-markdown-editor")).toHaveTextContent(
            "Saved text",
        );
        expect(onSave).toHaveBeenCalledWith("Saved text");
    });

    it("saves the unchanged value when Save is clicked without editing anything", () => {
        const onSave = vi.fn();
        render(<RichTextEditor initialValue="Untouched" onSave={onSave} />);

        fireEvent.click(screen.getByRole("button", { name: "Edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(onSave).toHaveBeenCalledWith("Untouched");
    });

    it("does not throw when Save is clicked without an onSave handler", () => {
        render(<RichTextEditor initialValue="Text" />);
        fireEvent.click(screen.getByRole("button", { name: "Edit" }));
        expect(() =>
            fireEvent.click(screen.getByRole("button", { name: "Save" })),
        ).not.toThrow();
    });
});
