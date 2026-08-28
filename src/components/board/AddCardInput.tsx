import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface AddCardInputProps {
    listName: string;
}

export function AddCardInput({ listName }: AddCardInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState("");

    function close() {
        setIsOpen(false);
        setValue("");
    }

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex items-center gap-1 rounded-lg p-2 transition-colors"
            >
                <Plus className="size-4" aria-hidden="true" />
                Add a card
            </button>
        );
    }

    return (
        <form
            className="gap-stack-sm flex flex-col"
            onSubmit={(event) => {
                event.preventDefault();
                close();
            }}
        >
            <Textarea
                autoFocus
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={`Add a card to ${listName}`}
                className="min-h-16"
            />
            <div className="flex items-center gap-2">
                <Button type="submit" size="sm">
                    Add card
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={close}
                    aria-label="Cancel adding a card"
                >
                    <X className="size-4" aria-hidden="true" />
                </Button>
            </div>
        </form>
    );
}
