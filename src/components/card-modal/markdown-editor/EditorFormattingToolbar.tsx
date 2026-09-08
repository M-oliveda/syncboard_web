import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    $isListNode,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
    Bold,
    Code,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Strikethrough,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IFormatState {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    bulletList: boolean;
    orderedList: boolean;
    code: boolean;
}

const INITIAL_FORMAT: IFormatState = {
    bold: false,
    italic: false,
    strikethrough: false,
    bulletList: false,
    orderedList: false,
    code: false,
};

// Only allow schemes that can't execute script in the resulting <a href> — this
// editor's output is stored as a card description and later rendered read-only
// in every tab watching the board, so an unvalidated `javascript:`/`data:` URL
// from the prompt below would be a stored-XSS vector.
const SAFE_URL_SCHEMES = new Set(["http:", "https:", "mailto:"]);

function isSafeUrl(url: string): boolean {
    try {
        const parsed = new URL(url, window.location.origin);
        return SAFE_URL_SCHEMES.has(parsed.protocol);
    } catch {
        return false;
    }
}

export function EditorFormattingToolbar() {
    const [editor] = useLexicalComposerContext();
    const [fmt, setFmt] = useState<IFormatState>(INITIAL_FORMAT);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) {
                    setFmt(INITIAL_FORMAT);
                    return;
                }

                const anchorNode = selection.anchor.getNode();
                const element =
                    anchorNode.getKey() === "root"
                        ? anchorNode
                        : anchorNode.getTopLevelElementOrThrow();

                let bulletList = false;
                let orderedList = false;
                let code = false;

                if ($isListNode(element)) {
                    const listType = element.getListType();
                    bulletList = listType === "bullet";
                    orderedList = listType === "number";
                } else {
                    code = element.getType() === "code";
                }

                setFmt({
                    bold: selection.hasFormat("bold"),
                    italic: selection.hasFormat("italic"),
                    strikethrough: selection.hasFormat("strikethrough"),
                    bulletList,
                    orderedList,
                    code,
                });
            });
        });
    }, [editor]);

    const applyCode = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createCodeNode());
            }
        });
    }, [editor]);

    const insertLink = useCallback(() => {
        const url = window.prompt("Enter a URL");
        if (!url || !isSafeUrl(url)) return;
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url });
    }, [editor]);

    const buttons = [
        {
            icon: Bold,
            label: "Bold",
            active: fmt.bold,
            onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
        },
        {
            icon: Italic,
            label: "Italic",
            active: fmt.italic,
            onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
        },
        {
            icon: Strikethrough,
            label: "Strikethrough",
            active: fmt.strikethrough,
            onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
        },
        {
            icon: List,
            label: "Bulleted list",
            active: fmt.bulletList,
            onClick: () =>
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
        },
        {
            icon: ListOrdered,
            label: "Numbered list",
            active: fmt.orderedList,
            onClick: () =>
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
        },
        {
            icon: LinkIcon,
            label: "Link",
            active: false,
            onClick: insertLink,
        },
        {
            icon: Code,
            label: "Code block",
            active: fmt.code,
            onClick: applyCode,
        },
    ];

    return (
        <div className="flex items-center gap-1">
            {buttons.map(({ icon: Icon, label, active, onClick }) => (
                <button
                    key={label}
                    type="button"
                    title={label}
                    onClick={onClick}
                    aria-pressed={active}
                    className={cn(
                        "flex size-7 items-center justify-center rounded transition-colors",
                        active
                            ? "bg-surface-container-highest text-on-surface"
                            : "text-on-surface-variant hover:bg-surface-container-highest",
                    )}
                >
                    <Icon className="size-[18px]" aria-hidden="true" />
                </button>
            ))}
        </div>
    );
}
