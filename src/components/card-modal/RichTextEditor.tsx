import {
    Bold,
    Code,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Strikethrough,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TOOLBAR_BUTTONS = [
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: Strikethrough, label: "Strikethrough" },
    { icon: List, label: "Bulleted list" },
    { icon: ListOrdered, label: "Numbered list" },
    { icon: LinkIcon, label: "Link" },
    { icon: Code, label: "Code block" },
];

export interface RichTextEditorProps {
    initialValue: string;
    placeholder?: string;
    onSave?: (value: string) => void;
}

export function RichTextEditor({
    initialValue,
    placeholder,
    onSave,
}: RichTextEditorProps) {
    const [value, setValue] = useState(initialValue);
    const [draft, setDraft] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);

    if (!isEditing) {
        // Rendered as plain JSX text (React escapes it) — the toolbar above is
        // decorative and doesn't produce HTML, so there's no raw-HTML sink here that
        // would need sanitizing before render.
        return (
            <div>
                {value ? (
                    <p className="text-body-base text-on-surface-variant whitespace-pre-line">
                        {value}
                    </p>
                ) : (
                    <p className="text-body-base text-on-surface-variant/60 italic">
                        {placeholder ?? "No description yet."}
                    </p>
                )}
                <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                        setDraft(value);
                        setIsEditing(true);
                    }}
                >
                    Edit
                </Button>
            </div>
        );
    }

    return (
        <div className="border-outline-variant/30 bg-surface-container-lowest focus-within:border-primary overflow-hidden rounded-lg border transition-colors">
            <div className="border-outline-variant/30 bg-surface-container-low flex items-center gap-1 border-b p-2">
                {TOOLBAR_BUTTONS.map(({ icon: Icon, label }) => (
                    <button
                        key={label}
                        type="button"
                        title={label}
                        className="text-on-surface-variant hover:bg-surface-container-highest flex size-7 items-center justify-center rounded transition-colors"
                    >
                        <Icon className="size-[18px]" aria-hidden="true" />
                    </button>
                ))}
            </div>
            <Textarea
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder ?? "Add a more detailed description..."}
                className="min-h-[120px] resize-y rounded-none border-0 shadow-none focus-visible:ring-0"
            />
            <div className="border-outline-variant/30 bg-surface-container-low flex items-center justify-end gap-2 border-t p-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                </Button>
                <Button
                    size="sm"
                    onClick={() => {
                        setValue(draft);
                        setIsEditing(false);
                        onSave?.(draft);
                    }}
                >
                    Save
                </Button>
            </div>
        </div>
    );
}
