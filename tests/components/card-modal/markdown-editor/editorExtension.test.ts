import type * as LexicalMdast from "@lexical/mdast";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConvertFromMarkdownString = vi.fn();

vi.mock("@lexical/mdast", async () => {
    const actual = await vi.importActual<typeof LexicalMdast>("@lexical/mdast");
    return {
        ...actual,
        $convertFromMarkdownString: (markdown: string) =>
            mockConvertFromMarkdownString(markdown),
    };
});

import { createMarkdownEditorExtension } from "@/components/card-modal/markdown-editor/editorExtension";

describe("createMarkdownEditorExtension", () => {
    beforeEach(() => {
        mockConvertFromMarkdownString.mockClear();
    });

    it("returns a defined extension with the expected name/namespace", () => {
        const extension = createMarkdownEditorExtension({
            initialContent: "Hello",
            readOnly: false,
            onError: vi.fn(),
        });

        expect(extension).toBeDefined();
        expect(extension.name).toBe("CardDescriptionMarkdownEditor");
        expect(extension.namespace).toBe("CardDescriptionMarkdownEditor");
    });

    it("sets editable to the inverse of readOnly", () => {
        const editableExtension = createMarkdownEditorExtension({
            initialContent: "",
            readOnly: false,
            onError: vi.fn(),
        });
        const readOnlyExtension = createMarkdownEditorExtension({
            initialContent: "",
            readOnly: true,
            onError: vi.fn(),
        });

        expect(editableExtension.editable).toBe(true);
        expect(readOnlyExtension.editable).toBe(false);
    });

    it("includes the rich text, list, link, and mdast dependencies", () => {
        const extension = createMarkdownEditorExtension({
            initialContent: "",
            readOnly: false,
            onError: vi.fn(),
        });

        const dependencyNames = extension.dependencies?.map((dependency) =>
            typeof dependency === "object" &&
            dependency !== null &&
            "name" in dependency
                ? dependency.name
                : String(dependency),
        );

        expect(dependencyNames).toEqual(
            expect.arrayContaining([
                "@lexical/mdast/CommonMark",
                "@lexical/mdast/Mdast",
                "@lexical/mdast/Shortcuts",
            ]),
        );
    });

    it("converts non-empty initial content from markdown on $initialEditorState", () => {
        const extension = createMarkdownEditorExtension({
            initialContent: "Hello world",
            readOnly: false,
            onError: vi.fn(),
        });

        (extension.$initialEditorState as (() => void) | undefined)?.();

        expect(mockConvertFromMarkdownString).toHaveBeenCalledWith("Hello world");
    });

    it("does not call $convertFromMarkdownString when initial content is empty", () => {
        const extension = createMarkdownEditorExtension({
            initialContent: "",
            readOnly: false,
            onError: vi.fn(),
        });

        (extension.$initialEditorState as (() => void) | undefined)?.();

        expect(mockConvertFromMarkdownString).not.toHaveBeenCalled();
    });
});
