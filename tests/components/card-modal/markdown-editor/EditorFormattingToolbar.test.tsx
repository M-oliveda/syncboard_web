import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockDispatchCommand = vi.fn();
const mockUpdate = vi.fn().mockImplementation((fn: () => void) => fn());
let capturedListener:
    ((update: { editorState: { read: (fn: () => void) => void } }) => void) | null =
    null;
const mockRegisterUpdateListener = vi
    .fn()
    .mockImplementation((fn: (u: unknown) => void) => {
        capturedListener = fn as typeof capturedListener;
        return () => {
            capturedListener = null;
        };
    });

const mockEditor = {
    dispatchCommand: mockDispatchCommand,
    update: mockUpdate,
    registerUpdateListener: mockRegisterUpdateListener,
};

vi.mock("@lexical/react/LexicalComposerContext", () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

const mockGetSelection = vi.fn().mockReturnValue(null);
const mockIsRangeSelection = vi.fn().mockReturnValue(false);

vi.mock("lexical", () => ({
    $getSelection: () => mockGetSelection(),
    $isRangeSelection: (sel: unknown) => mockIsRangeSelection(sel),
    FORMAT_TEXT_COMMAND: "FORMAT_TEXT_COMMAND",
}));

const mockSetBlocksType = vi
    .fn()
    .mockImplementation((_sel: unknown, factory: () => unknown) => factory());

vi.mock("@lexical/selection", () => ({
    $setBlocksType: (...args: unknown[]) =>
        mockSetBlocksType(...(args as [unknown, () => unknown])),
}));

const mockIsListNode = vi.fn().mockReturnValue(false);

vi.mock("@lexical/list", () => ({
    $isListNode: (node: unknown) => mockIsListNode(node),
    INSERT_UNORDERED_LIST_COMMAND: "INSERT_UNORDERED_LIST_COMMAND",
    INSERT_ORDERED_LIST_COMMAND: "INSERT_ORDERED_LIST_COMMAND",
}));

const mockCreateCodeNode = vi.fn().mockReturnValue({});

vi.mock("@lexical/code", () => ({
    $createCodeNode: () => mockCreateCodeNode(),
}));

vi.mock("@lexical/link", () => ({
    TOGGLE_LINK_COMMAND: "TOGGLE_LINK_COMMAND",
}));

import { EditorFormattingToolbar } from "@/components/card-modal/markdown-editor/EditorFormattingToolbar";

type MockElement = {
    getKey: () => string;
    getTopLevelElementOrThrow: () => MockElement;
    getListType: () => string;
    getType: () => string;
};

function fireUpdateListener({
    anchorKey = "1",
    isList = false,
    listType = "bullet",
    nodeType = "paragraph",
    bold = false,
    italic = false,
    strikethrough = false,
}: {
    anchorKey?: string;
    isList?: boolean;
    listType?: string;
    nodeType?: string;
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
} = {}) {
    const element: MockElement = {
        getKey: () => anchorKey,
        getTopLevelElementOrThrow: () => element,
        getListType: () => listType,
        getType: () => nodeType,
    };

    const anchorNode =
        anchorKey === "root"
            ? element
            : { getKey: () => anchorKey, getTopLevelElementOrThrow: () => element };

    const mockSelection = {
        anchor: { getNode: () => anchorNode },
        hasFormat: (fmt: string) => {
            if (fmt === "bold") return bold;
            if (fmt === "italic") return italic;
            if (fmt === "strikethrough") return strikethrough;
            return false;
        },
    };

    mockGetSelection.mockReturnValue(mockSelection);
    mockIsRangeSelection.mockReturnValue(true);
    mockIsListNode.mockReturnValue(isList);

    const mockEditorState = { read: (fn: () => void) => fn() };
    act(() => {
        capturedListener?.({ editorState: mockEditorState });
    });
}

describe("EditorFormattingToolbar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        capturedListener = null;
        mockGetSelection.mockReturnValue(null);
        mockIsRangeSelection.mockReturnValue(false);
        mockIsListNode.mockReturnValue(false);
        mockUpdate.mockImplementation((fn: () => void) => fn());
        mockSetBlocksType.mockImplementation((_sel: unknown, factory: () => unknown) =>
            factory(),
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders all 7 formatting buttons", () => {
        render(<EditorFormattingToolbar />);
        expect(screen.getByTitle("Bold")).toBeInTheDocument();
        expect(screen.getByTitle("Italic")).toBeInTheDocument();
        expect(screen.getByTitle("Strikethrough")).toBeInTheDocument();
        expect(screen.getByTitle("Bulleted list")).toBeInTheDocument();
        expect(screen.getByTitle("Numbered list")).toBeInTheDocument();
        expect(screen.getByTitle("Link")).toBeInTheDocument();
        expect(screen.getByTitle("Code block")).toBeInTheDocument();
    });

    it("registers an update listener on mount and cleans it up on unmount", () => {
        const { unmount } = render(<EditorFormattingToolbar />);
        expect(mockRegisterUpdateListener).toHaveBeenCalledTimes(1);
        expect(capturedListener).not.toBeNull();
        unmount();
        expect(capturedListener).toBeNull();
    });

    it("resets format state when selection is not a RangeSelection", () => {
        render(<EditorFormattingToolbar />);
        mockGetSelection.mockReturnValue(null);
        mockIsRangeSelection.mockReturnValue(false);
        const mockEditorState = { read: (fn: () => void) => fn() };
        act(() => {
            capturedListener?.({ editorState: mockEditorState });
        });
        expect(screen.getByTitle("Bold")).toHaveAttribute("aria-pressed", "false");
    });

    it("sets bulletList active when selection is in a bullet list", () => {
        render(<EditorFormattingToolbar />);
        fireUpdateListener({ isList: true, listType: "bullet" });
        expect(screen.getByTitle("Bulleted list")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByTitle("Numbered list")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("sets orderedList active when selection is in a numbered list", () => {
        render(<EditorFormattingToolbar />);
        fireUpdateListener({ isList: true, listType: "number" });
        expect(screen.getByTitle("Numbered list")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByTitle("Bulleted list")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("sets code active when selection is in a code block", () => {
        render(<EditorFormattingToolbar />);
        fireUpdateListener({ nodeType: "code" });
        expect(screen.getByTitle("Code block")).toHaveAttribute("aria-pressed", "true");
    });

    it("leaves code inactive for a paragraph node", () => {
        render(<EditorFormattingToolbar />);
        fireUpdateListener({ nodeType: "paragraph" });
        expect(screen.getByTitle("Code block")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("handles a root anchor node without throwing", () => {
        render(<EditorFormattingToolbar />);
        fireUpdateListener({ anchorKey: "root" });
        expect(screen.getByTitle("Bold")).toHaveAttribute("aria-pressed", "false");
    });

    it("sets bold/italic/strikethrough active from selection format", () => {
        render(<EditorFormattingToolbar />);
        fireUpdateListener({ bold: true, italic: true, strikethrough: true });
        expect(screen.getByTitle("Bold")).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByTitle("Italic")).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByTitle("Strikethrough")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("dispatches bold/italic/strikethrough commands on click", () => {
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Bold"));
        expect(mockDispatchCommand).toHaveBeenCalledWith("FORMAT_TEXT_COMMAND", "bold");
        fireEvent.click(screen.getByTitle("Italic"));
        expect(mockDispatchCommand).toHaveBeenCalledWith(
            "FORMAT_TEXT_COMMAND",
            "italic",
        );
        fireEvent.click(screen.getByTitle("Strikethrough"));
        expect(mockDispatchCommand).toHaveBeenCalledWith(
            "FORMAT_TEXT_COMMAND",
            "strikethrough",
        );
    });

    it("dispatches INSERT_UNORDERED_LIST_COMMAND when Bulleted list is clicked", () => {
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Bulleted list"));
        expect(mockDispatchCommand).toHaveBeenCalledWith(
            "INSERT_UNORDERED_LIST_COMMAND",
            undefined,
        );
    });

    it("dispatches INSERT_ORDERED_LIST_COMMAND when Numbered list is clicked", () => {
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Numbered list"));
        expect(mockDispatchCommand).toHaveBeenCalledWith(
            "INSERT_ORDERED_LIST_COMMAND",
            undefined,
        );
    });

    it("calls $setBlocksType with a code node factory when Code block is clicked with a range selection", () => {
        mockIsRangeSelection.mockReturnValue(true);
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Code block"));
        expect(mockSetBlocksType).toHaveBeenCalled();
        expect(mockCreateCodeNode).toHaveBeenCalled();
    });

    it("skips $setBlocksType for Code block when there is no range selection", () => {
        mockIsRangeSelection.mockReturnValue(false);
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Code block"));
        expect(mockSetBlocksType).not.toHaveBeenCalled();
    });

    it("dispatches TOGGLE_LINK_COMMAND with a safe http(s) URL", () => {
        vi.spyOn(window, "prompt").mockReturnValue("https://example.com");
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Link"));
        expect(mockDispatchCommand).toHaveBeenCalledWith("TOGGLE_LINK_COMMAND", {
            url: "https://example.com",
        });
    });

    it("dispatches TOGGLE_LINK_COMMAND with a safe mailto URL", () => {
        vi.spyOn(window, "prompt").mockReturnValue("mailto:test@example.com");
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Link"));
        expect(mockDispatchCommand).toHaveBeenCalledWith("TOGGLE_LINK_COMMAND", {
            url: "mailto:test@example.com",
        });
    });

    it("dispatches TOGGLE_LINK_COMMAND with a safe relative URL", () => {
        vi.spyOn(window, "prompt").mockReturnValue("/some/page");
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Link"));
        expect(mockDispatchCommand).toHaveBeenCalledWith("TOGGLE_LINK_COMMAND", {
            url: "/some/page",
        });
    });

    it("does not dispatch TOGGLE_LINK_COMMAND when the user cancels the prompt", () => {
        vi.spyOn(window, "prompt").mockReturnValue(null);
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Link"));
        expect(mockDispatchCommand).not.toHaveBeenCalled();
    });

    it("does not dispatch TOGGLE_LINK_COMMAND for a javascript: URL", () => {
        vi.spyOn(window, "prompt").mockReturnValue("javascript:alert(1)");
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Link"));
        expect(mockDispatchCommand).not.toHaveBeenCalled();
    });

    it("does not dispatch TOGGLE_LINK_COMMAND for an unparseable URL", () => {
        vi.spyOn(window, "prompt").mockReturnValue("http://[");
        render(<EditorFormattingToolbar />);
        fireEvent.click(screen.getByTitle("Link"));
        expect(mockDispatchCommand).not.toHaveBeenCalled();
    });
});
