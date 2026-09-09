import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarkdownEditor } from "@/components/card-modal/markdown-editor/MarkdownEditor";

describe("MarkdownEditor (real render)", () => {
    it("renders bold, italic, and strikethrough Markdown as formatted read-only content", () => {
        render(
            <MarkdownEditor
                initialContent="**bold** and _italic_ and ~~struck~~"
                readOnly
            />,
        );

        const content = screen.getByLabelText("Card description");
        expect(content.querySelector(".editor-text-bold")).toHaveTextContent("bold");
        expect(content.querySelector(".editor-text-italic")).toHaveTextContent(
            "italic",
        );
        expect(content.querySelector(".editor-text-strikethrough")).toHaveTextContent(
            "struck",
        );
    });

    it("renders a Markdown bulleted list as a real list in read-only content", () => {
        render(<MarkdownEditor initialContent={"- one\n- two"} readOnly />);

        const content = screen.getByLabelText("Card description");
        const list = content.querySelector("ul.editor-ul");
        expect(list).not.toBeNull();
        const items = content.querySelectorAll("li.editor-listitem");
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent("one");
        expect(items[1]).toHaveTextContent("two");
    });

    it("renders plain Markdown text content in read-only mode", () => {
        render(<MarkdownEditor initialContent="Just plain text" readOnly />);
        expect(screen.getByText("Just plain text")).toBeInTheDocument();
    });
});
