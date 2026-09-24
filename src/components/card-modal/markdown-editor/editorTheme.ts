import type { EditorThemeClasses } from "lexical";

export const editorTheme: EditorThemeClasses = {
    list: {
        ul: "editor-ul",
        ol: "editor-ol",
        listitem: "editor-listitem",
        nested: {
            listitem: "editor-nested-listitem",
        },
    },
    quote: "editor-quote",
    code: "editor-code-block",
    link: "editor-link",
    text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        strikethrough: "editor-text-strikethrough",
        code: "editor-text-code",
    },
    paragraph: "editor-paragraph",
};
