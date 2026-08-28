import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/types/card-detail";

export interface ChecklistProps {
    items: ChecklistItem[];
}

export function Checklist({ items: initialItems }: ChecklistProps) {
    const [items, setItems] = useState(initialItems);
    const [newItem, setNewItem] = useState("");

    const completedCount = items.filter((item) => item.completed).length;
    const progress =
        items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);

    function toggleItem(id: string) {
        setItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item,
            ),
        );
    }

    function addItem(event: React.FormEvent) {
        event.preventDefault();
        const label = newItem.trim();
        if (!label) return;

        setItems((current) => [
            ...current,
            { id: `item-${current.length}-${Date.now()}`, label, completed: false },
        ]);
        setNewItem("");
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="mb-2 flex items-center gap-3">
                <span className="text-label-caps text-on-surface-variant w-8">
                    {progress}%
                </span>
                <Progress value={progress} className="flex-1" />
            </div>

            {items.map((item) => (
                <label
                    key={item.id}
                    className="hover:bg-surface-container-lowest group flex items-start gap-3 rounded-lg p-2 transition-colors"
                >
                    <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                    />
                    <span
                        className={cn(
                            "text-body-base flex-1",
                            item.completed
                                ? "text-on-surface-variant line-through"
                                : "text-on-surface",
                        )}
                    >
                        {item.label}
                    </span>
                </label>
            ))}

            <form onSubmit={addItem} className="mt-2 flex items-center gap-2">
                <Input
                    value={newItem}
                    onChange={(event) => setNewItem(event.target.value)}
                    placeholder="Add an item"
                    aria-label="New checklist item"
                />
                <Button
                    type="submit"
                    variant="secondary"
                    size="icon"
                    aria-label="Add item"
                >
                    <Plus className="size-4" aria-hidden="true" />
                </Button>
            </form>
        </div>
    );
}
