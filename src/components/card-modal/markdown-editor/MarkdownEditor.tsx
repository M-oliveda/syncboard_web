import { useMemo } from "react";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { $convertToMarkdownString } from "@lexical/mdast";
import type { EditorState, LexicalEditor } from "lexical";

import { EditorFormattingToolbar } from "./EditorFormattingToolbar";
import { createMarkdownEditorExtension } from "./editorExtension";

export interface MarkdownEditorProps {
    initialContent: string;
    placeholder?: string;
    onChange?: (markdown: string) => void;
    readOnly?: boolean;
}

export function MarkdownEditor({
    initialContent,
    placeholder,
    onChange,
    readOnly = false,
}: MarkdownEditorProps) {
    const extension = useMemo(
        () =>
            createMarkdownEditorExtension({
                initialContent,
                readOnly,
                onError: (error) => {
                    console.error("[MarkdownEditor]", error);
                },
            }),
        [initialContent, readOnly],
    );

    function handleChange(_editorState: EditorState, editor: LexicalEditor) {
        if (readOnly || !onChange) return;
        editor.read(() => {
            onChange($convertToMarkdownString());
        });
    }

    return (
        <LexicalExtensionComposer extension={extension} contentEditable={null}>
            <div className="flex flex-col gap-2">
                {!readOnly && (
                    <div className="border-outline-variant/30 bg-surface-container-low rounded-t-lg border-b p-2">
                        <EditorFormattingToolbar />
                    </div>
                )}
                <div className="relative">
                    {!readOnly && placeholder ? (
                        <ContentEditable
                            className="editor-content"
                            aria-label="Card description"
                            aria-placeholder={placeholder}
                            placeholder={
                                <div className="editor-placeholder">{placeholder}</div>
                            }
                        />
                    ) : (
                        <ContentEditable
                            className="editor-content"
                            aria-label="Card description"
                        />
                    )}
                    {!readOnly && <ListPlugin />}
                    {!readOnly && (
                        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
                    )}
                </div>
            </div>
        </LexicalExtensionComposer>
    );
}
