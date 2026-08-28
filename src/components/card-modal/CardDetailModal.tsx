import {
    Eye,
    LayoutDashboard,
    ListChecks,
    ListTodo,
    MoreHorizontal,
    Plus,
    Share2,
    Subscript,
    Tag,
    Trash2,
    User,
    X,
} from "lucide-react";
import { useState } from "react";

import { ActivityFeed } from "@/components/card-modal/ActivityFeed";
import { Checklist } from "@/components/card-modal/Checklist";
import { RichTextEditor } from "@/components/card-modal/RichTextEditor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteCardMutation, useUpdateCardMutation } from "@/hooks/useCardMutations";
import { mockCardDetail } from "@/lib/mock-card-detail";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/types/card-detail";
import type { BoardCard, LabelColor } from "@/types/board";

const LABEL_COLORS: Record<LabelColor, string> = {
    primary: "bg-primary-container text-on-primary-container",
    secondary: "bg-secondary-container text-on-secondary-container",
    tertiary: "bg-tertiary-container text-on-tertiary-container",
    error: "bg-error-container text-on-error-container",
};

const HEADER_ACTIONS = [
    { icon: Eye, label: "Watch" },
    { icon: Share2, label: "Share" },
];

export interface CardDetailModalProps {
    card: BoardCard;
    listName: string;
    boardId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CardDetailModal({
    card,
    listName,
    boardId,
    open,
    onOpenChange,
}: CardDetailModalProps) {
    const [labels, setLabels] = useState(card.labels ?? []);
    const [title, setTitle] = useState(card.title);
    const updateCardMutation = useUpdateCardMutation(boardId);
    const deleteCardMutation = useDeleteCardMutation(boardId);

    function saveTitle() {
        const trimmed = title.trim();
        if (!trimmed || trimmed === card.title) return;
        updateCardMutation.mutate({ cardId: card.id, title: trimmed });
    }

    function saveDescription(description: string) {
        updateCardMutation.mutate({ cardId: card.id, description });
    }

    function saveChecklist(items: ChecklistItem[]) {
        updateCardMutation.mutate({
            cardId: card.id,
            checklist: items.map((item) => ({
                text: item.label,
                done: item.completed,
            })),
        });
    }

    function removeLabel(id: string) {
        const next = labels.filter((label) => label.id !== id);
        setLabels(next);
        updateCardMutation.mutate({
            cardId: card.id,
            labels: next.map((label) => label.name),
        });
    }

    async function deleteCard() {
        try {
            await deleteCardMutation.mutateAsync(card.id);
        } catch {
            return;
        }
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="flex max-h-[90vh] w-full max-w-[800px] flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-[800px]"
            >
                <DialogTitle className="sr-only">{card.title}</DialogTitle>

                <div className="px-container-margin py-stack-md bg-surface-container-low border-outline-variant/30 flex items-center justify-between border-b">
                    <div className="text-body-sm text-on-surface-variant gap-stack-sm flex items-center">
                        <LayoutDashboard className="size-[18px]" aria-hidden="true" />
                        <span>
                            in list{" "}
                            <span className="decoration-outline-variant hover:text-primary cursor-pointer underline underline-offset-4 transition-colors">
                                {listName}
                            </span>
                        </span>
                    </div>
                    <div className="gap-stack-sm flex items-center">
                        {HEADER_ACTIONS.map(({ icon: Icon, label }) => (
                            <button
                                key={label}
                                type="button"
                                title={label}
                                className="text-on-surface-variant hover:bg-surface-container-highest flex size-8 items-center justify-center rounded-lg transition-colors"
                            >
                                <Icon className="size-5" aria-hidden="true" />
                            </button>
                        ))}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <button
                                        type="button"
                                        title="More actions"
                                        className="text-on-surface-variant hover:bg-surface-container-highest flex size-8 items-center justify-center rounded-lg transition-colors"
                                    />
                                }
                            >
                                <MoreHorizontal className="size-5" aria-hidden="true" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => void deleteCard()}
                                >
                                    <Trash2 className="size-4" aria-hidden="true" />
                                    Delete card
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div
                            className="bg-outline-variant/50 mx-1 h-5 w-px"
                            aria-hidden="true"
                        />
                        <DialogClose
                            title="Close modal"
                            className="text-on-surface-variant hover:bg-error-container hover:text-on-error-container flex size-8 items-center justify-center rounded-lg transition-colors"
                        >
                            <X className="size-5" aria-hidden="true" />
                        </DialogClose>
                    </div>
                </div>

                <div className="p-container-margin gap-stack-lg flex flex-1 flex-col overflow-y-auto lg:flex-row">
                    <div className="gap-stack-lg flex min-w-0 flex-1 flex-col">
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            onBlur={saveTitle}
                            className="text-headline-lg-mobile sm:text-headline-lg text-on-surface focus-visible:bg-surface-container-low -ml-2 w-full rounded border-0 bg-transparent p-0 px-2 focus:outline-none"
                        />

                        <section className="flex flex-col gap-2">
                            <div className="text-on-surface flex items-center gap-2">
                                <Subscript
                                    className="text-on-surface-variant size-5"
                                    aria-hidden="true"
                                />
                                <h3 className="text-title-md">Description</h3>
                            </div>
                            <div className="ml-7">
                                <RichTextEditor
                                    initialValue={card.description ?? ""}
                                    onSave={saveDescription}
                                />
                            </div>
                        </section>

                        <section className="flex flex-col gap-2">
                            <div className="text-on-surface flex items-center gap-2">
                                <ListChecks
                                    className="text-on-surface-variant size-5"
                                    aria-hidden="true"
                                />
                                <h3 className="text-title-md">Checklist</h3>
                            </div>
                            <div className="ml-7">
                                <Checklist
                                    items={card.checklist ?? []}
                                    onChange={saveChecklist}
                                />
                            </div>
                        </section>

                        <section className="flex flex-col gap-2">
                            <div className="text-on-surface flex items-center gap-2">
                                <ListTodo
                                    className="text-on-surface-variant size-5"
                                    aria-hidden="true"
                                />
                                <h3 className="text-title-md">Activity</h3>
                            </div>
                            <div className="ml-7">
                                {/* No Activity model/service/route exists on the API
                                yet — stays on mock data until that lands. */}
                                <ActivityFeed entries={mockCardDetail.activity} />
                            </div>
                        </section>
                    </div>

                    <div className="gap-stack-lg border-outline-variant/30 pt-stack-lg lg:pl-stack-lg flex w-full shrink-0 flex-col border-t lg:w-60 lg:border-t-0 lg:border-l lg:pt-0">
                        <div className="flex flex-col gap-2">
                            <h4 className="text-label-caps text-on-surface-variant tracking-wider uppercase">
                                Add to card
                            </h4>
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    className="bg-surface-container-low hover:bg-surface-container-high text-body-sm text-on-surface border-outline-variant/30 flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-solid"
                                >
                                    <User
                                        className="text-on-surface-variant size-[18px]"
                                        aria-hidden="true"
                                    />
                                    Assignees
                                </button>
                                <button
                                    type="button"
                                    className="bg-surface-container-low hover:bg-surface-container-high text-body-sm text-on-surface border-outline-variant/30 flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-solid"
                                >
                                    <Tag
                                        className="text-on-surface-variant size-[18px]"
                                        aria-hidden="true"
                                    />
                                    Labels
                                </button>
                            </div>
                        </div>

                        <div
                            className="bg-outline-variant/30 h-px w-full"
                            aria-hidden="true"
                        />

                        <div className="flex flex-col gap-2">
                            <h4 className="text-label-caps text-on-surface-variant tracking-wider uppercase">
                                Assignees
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {(card.assignees ?? []).map((assignee) => (
                                    <Avatar
                                        key={assignee.id}
                                        className="ring-surface shadow-sm ring-2"
                                        title={assignee.initials}
                                    >
                                        <AvatarFallback className="bg-secondary-container text-on-secondary-container text-label-caps">
                                            {assignee.initials}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                                <button
                                    type="button"
                                    aria-label="Add assignee"
                                    className="bg-surface-container-highest border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary ring-surface flex size-8 items-center justify-center rounded-full border border-dashed ring-2 transition-colors"
                                >
                                    <Plus className="size-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h4 className="text-label-caps text-on-surface-variant tracking-wider uppercase">
                                Labels
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {labels.map((label) => (
                                    <button
                                        key={label.id}
                                        type="button"
                                        onClick={() => removeLabel(label.id)}
                                        className={cn(
                                            "text-label-caps flex items-center gap-1 rounded px-3 py-1 shadow-sm transition-opacity hover:opacity-90",
                                            LABEL_COLORS[label.color],
                                        )}
                                    >
                                        {label.name}
                                        <X className="size-3.5" aria-hidden="true" />
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    aria-label="Add label"
                                    className="bg-surface-container-highest border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary flex h-6 w-8 items-center justify-center rounded border border-dashed transition-colors"
                                >
                                    <Plus className="size-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
