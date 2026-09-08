import { useRef, useState } from "react";

import { MarkdownEditor } from "@/components/card-modal/markdown-editor";
import { Button } from "@/components/ui/button";

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
    const [isEditing, setIsEditing] = useState(false);
    const draftRef = useRef(initialValue);

    if (!isEditing) {
        return (
            <div>
                {value ? (
                    <MarkdownEditor key={value} initialContent={value} readOnly />
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
                        draftRef.current = value;
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
            <MarkdownEditor
                initialContent={value}
                placeholder={placeholder ?? "Add a more detailed description..."}
                onChange={(markdown) => {
                    draftRef.current = markdown;
                }}
            />
            <div className="border-outline-variant/30 bg-surface-container-low flex items-center justify-end gap-2 border-t p-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                </Button>
                <Button
                    size="sm"
                    onClick={() => {
                        setValue(draftRef.current);
                        setIsEditing(false);
                        onSave?.(draftRef.current);
                    }}
                >
                    Save
                </Button>
            </div>
        </div>
    );
}
