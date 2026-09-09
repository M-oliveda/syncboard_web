import {
    $convertFromMarkdownString,
    MdastCommonMarkExtension,
    MdastExtension,
    MdastShortcutsExtension,
    MdastStrikethroughExtension,
} from "@lexical/mdast";
import { HistoryExtension } from "@lexical/history";
import { ListExtension } from "@lexical/list";
import { LinkExtension } from "@lexical/link";
import { RichTextExtension } from "@lexical/rich-text";
import { type LexicalEditor, defineExtension } from "lexical";
import { editorTheme } from "./editorTheme";

interface ICreateMarkdownEditorExtensionOptions {
    initialContent: string;
    readOnly: boolean;
    onError: (error: Error, editor: LexicalEditor) => void;
}

export function createMarkdownEditorExtension({
    initialContent,
    readOnly,
    onError,
}: ICreateMarkdownEditorExtensionOptions) {
    return defineExtension({
        name: "CardDescriptionMarkdownEditor",
        namespace: "CardDescriptionMarkdownEditor",
        theme: editorTheme,
        editable: !readOnly,
        onError,
        dependencies: [
            RichTextExtension,
            HistoryExtension,
            ListExtension,
            LinkExtension,
            MdastCommonMarkExtension,
            MdastExtension,
            MdastShortcutsExtension,
            MdastStrikethroughExtension,
        ],
        $initialEditorState() {
            if (initialContent) {
                $convertFromMarkdownString(initialContent);
            }
        },
    });
}
