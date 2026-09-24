import { describe, expect, it } from "vitest";

import { editorTheme } from "@/components/card-modal/markdown-editor/editorTheme";

describe("editorTheme", () => {
    it("exports class names for lists", () => {
        expect(editorTheme.list?.ul).toBe("editor-ul");
        expect(editorTheme.list?.ol).toBe("editor-ol");
        expect(editorTheme.list?.listitem).toBe("editor-listitem");
        expect(editorTheme.list?.nested?.listitem).toBe("editor-nested-listitem");
    });

    it("exports a class name for blockquote", () => {
        expect(editorTheme.quote).toBe("editor-quote");
    });

    it("exports class names for inline text decorations", () => {
        expect(editorTheme.text?.bold).toBe("editor-text-bold");
        expect(editorTheme.text?.italic).toBe("editor-text-italic");
        expect(editorTheme.text?.strikethrough).toBe("editor-text-strikethrough");
        expect(editorTheme.text?.code).toBe("editor-text-code");
    });

    it("exports class names for code blocks and links", () => {
        expect(editorTheme.code).toBe("editor-code-block");
        expect(editorTheme.link).toBe("editor-link");
    });

    it("exports a class name for paragraphs", () => {
        expect(editorTheme.paragraph).toBe("editor-paragraph");
    });
});
