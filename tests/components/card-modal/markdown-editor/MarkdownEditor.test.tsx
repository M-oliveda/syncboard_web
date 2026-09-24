import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let capturedExtension: unknown = null;
let capturedOnChange: ((es: unknown, editor: unknown) => void) | null = null;

vi.mock("@lexical/react/LexicalExtensionComposer", () => ({
    LexicalExtensionComposer: ({
        extension,
        children,
    }: {
        extension: unknown;
        children: React.ReactNode;
    }) => {
        capturedExtension = extension;
        return <>{children}</>;
    },
}));

vi.mock("@lexical/react/LexicalContentEditable", () => ({
    ContentEditable: ({
        placeholder,
        "aria-placeholder": _ariaPlaceholder,
        ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
        placeholder?: React.ReactNode;
        "aria-placeholder"?: string;
    }) => (
        <>
            <div {...props} />
            {placeholder}
        </>
    ),
}));

vi.mock("@lexical/react/LexicalListPlugin", () => ({
    ListPlugin: () => null,
}));

vi.mock("@lexical/react/LexicalOnChangePlugin", () => ({
    OnChangePlugin: ({
        onChange,
    }: {
        onChange: (es: unknown, editor: unknown) => void;
    }) => {
        capturedOnChange = onChange;
        return null;
    },
}));

vi.mock("@lexical/mdast", () => ({
    $convertFromMarkdownString: vi.fn(),
    $convertToMarkdownString: vi.fn().mockReturnValue("# Converted"),
}));

const mockCreateExtension = vi.fn((options: unknown) => ({
    kind: "markdown-editor-extension",
    options,
}));

vi.mock("@/components/card-modal/markdown-editor/editorExtension", () => ({
    createMarkdownEditorExtension: (options: unknown) => mockCreateExtension(options),
}));

vi.mock("@/components/card-modal/markdown-editor/EditorFormattingToolbar", () => ({
    EditorFormattingToolbar: () => <div data-testid="mock-formatting-toolbar" />,
}));

import { $convertToMarkdownString } from "@lexical/mdast";
import { MarkdownEditor } from "@/components/card-modal/markdown-editor/MarkdownEditor";

describe("MarkdownEditor", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        capturedOnChange = null;
        capturedExtension = null;
    });

    it("renders the placeholder text while editable", () => {
        render(
            <MarkdownEditor
                initialContent=""
                placeholder="Type here"
                onChange={vi.fn()}
            />,
        );
        expect(screen.getByText("Type here")).toBeInTheDocument();
    });

    it("does not render a placeholder when none is provided", () => {
        render(<MarkdownEditor initialContent="" onChange={vi.fn()} />);
        expect(screen.queryByText("Type here")).not.toBeInTheDocument();
    });

    it("does not render the placeholder when readOnly is true", () => {
        render(<MarkdownEditor initialContent="" readOnly placeholder="Type here" />);
        expect(screen.queryByText("Type here")).not.toBeInTheDocument();
    });

    it("renders the content-editable area with an aria-label", () => {
        render(<MarkdownEditor initialContent="" onChange={vi.fn()} />);
        expect(screen.getByLabelText("Card description")).toBeInTheDocument();
    });

    it("creates a markdown editor extension with the initial content", () => {
        render(<MarkdownEditor initialContent="Hello" onChange={vi.fn()} />);
        expect(mockCreateExtension).toHaveBeenCalledWith(
            expect.objectContaining({
                initialContent: "Hello",
                readOnly: false,
            }),
        );
        expect(capturedExtension).toEqual(
            expect.objectContaining({ kind: "markdown-editor-extension" }),
        );
    });

    it("passes readOnly through to createMarkdownEditorExtension", () => {
        render(<MarkdownEditor initialContent="" readOnly />);
        expect(mockCreateExtension).toHaveBeenCalledWith(
            expect.objectContaining({ readOnly: true }),
        );
    });

    it("calls onChange with the converted markdown when OnChangePlugin fires", () => {
        const onChange = vi.fn();
        render(<MarkdownEditor initialContent="" onChange={onChange} />);

        const mockEditor = { read: (fn: () => void) => fn() };
        act(() => {
            capturedOnChange?.({}, mockEditor);
        });

        expect($convertToMarkdownString).toHaveBeenCalledWith();
        expect(onChange).toHaveBeenCalledWith("# Converted");
    });

    it("does not call onChange when readOnly, even if OnChangePlugin fires", () => {
        const onChange = vi.fn();
        render(<MarkdownEditor initialContent="" readOnly onChange={onChange} />);

        const mockEditor = { read: (fn: () => void) => fn() };
        act(() => {
            capturedOnChange?.({}, mockEditor);
        });

        expect(onChange).not.toHaveBeenCalled();
    });

    it("works without an onChange prop when readOnly is true", () => {
        render(<MarkdownEditor initialContent="Hello" readOnly />);
        expect(screen.getByLabelText("Card description")).toBeInTheDocument();
    });

    it("does not throw when editable without an onChange prop and OnChangePlugin fires", () => {
        render(<MarkdownEditor initialContent="Hello" />);

        const mockEditor = { read: (fn: () => void) => fn() };
        expect(() => {
            act(() => {
                capturedOnChange?.({}, mockEditor);
            });
        }).not.toThrow();
        expect($convertToMarkdownString).not.toHaveBeenCalled();
    });

    it("renders the formatting toolbar when not readOnly", () => {
        render(<MarkdownEditor initialContent="" onChange={vi.fn()} />);
        expect(screen.getByTestId("mock-formatting-toolbar")).toBeInTheDocument();
    });

    it("does not render the formatting toolbar when readOnly", () => {
        render(<MarkdownEditor initialContent="" readOnly />);
        expect(screen.queryByTestId("mock-formatting-toolbar")).not.toBeInTheDocument();
    });

    it("calls console.error via the onError handler passed to createMarkdownEditorExtension", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        render(<MarkdownEditor initialContent="" onChange={vi.fn()} />);

        const capturedOptions = mockCreateExtension.mock.calls[0]?.[0] as {
            onError: (error: Error) => void;
        };
        const error = new Error("editor crash");
        act(() => {
            capturedOptions.onError(error);
        });

        expect(consoleSpy).toHaveBeenCalledWith("[MarkdownEditor]", error);
        consoleSpy.mockRestore();
    });
});
