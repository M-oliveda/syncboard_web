import {
    Check,
    LayoutDashboard,
    ListChecks,
    ListTodo,
    Plus,
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    useDeleteCardMutation,
    useMoveCardMutation,
    useUpdateCardMutation,
} from "@/hooks/useCardMutations";
import { colorForLabel, emailInitials } from "@/lib/api-mappers";
import { mockCardDetail } from "@/lib/mock-card-detail";
import { computeOrderForIndex } from "@/lib/reorder";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/types/card-detail";
import type { BoardCard, BoardList, LabelColor } from "@/types/board";
import type { WorkspaceMember } from "@/types/workspace";

const LABEL_COLORS: Record<LabelColor, string> = {
    primary: "bg-primary-container text-on-primary-container",
    secondary: "bg-secondary-container text-on-secondary-container",
    tertiary: "bg-tertiary-container text-on-tertiary-container",
    error: "bg-error-container text-on-error-container",
};

/** Shared by both assignee triggers (the "Add to card" entry and the sidebar's
 * dashed "+" avatar) so the member list only needs to be built once. */
function renderAssigneeMenuItems(
    members: WorkspaceMember[],
    assigneeIds: string[],
    onToggle: (memberId: string) => void,
) {
    if (members.length === 0) {
        return <DropdownMenuItem disabled>No workspace members</DropdownMenuItem>;
    }
    return members.map((member) => (
        <DropdownMenuCheckboxItem
            key={member.id}
            checked={assigneeIds.includes(member.id)}
            onCheckedChange={() => onToggle(member.id)}
        >
            {member.name}
        </DropdownMenuCheckboxItem>
    ));
}

/** Shared by both label-adder triggers, matching `renderAssigneeMenuItems`. The
 * input stops keydown propagation because Base UI's `Menu.Popup` intercepts
 * single-character keys for its own typeahead-to-select-an-item behavior — without
 * this, keystrokes never reach the input's value. */
function renderLabelAdderForm(
    value: string,
    onChange: (value: string) => void,
    onSubmit: () => void,
) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
            className="flex items-center gap-2"
        >
            <Input
                autoFocus
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder="Label name"
                aria-label="New label name"
                className="h-8 w-36"
            />
            <button
                type="submit"
                className="bg-primary text-on-primary text-body-sm shrink-0 rounded-lg px-2 py-1.5"
            >
                Add
            </button>
        </form>
    );
}

export interface CardDetailModalProps {
    card: BoardCard;
    listName: string;
    listId: string;
    lists: BoardList[];
    members: WorkspaceMember[];
    boardId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CardDetailModal({
    card,
    listName,
    listId,
    lists,
    members,
    boardId,
    open,
    onOpenChange,
}: CardDetailModalProps) {
    const [labels, setLabels] = useState(card.labels ?? []);
    const [title, setTitle] = useState(card.title);
    const [assigneeIds, setAssigneeIds] = useState(
        (card.assignees ?? []).map((assignee) => assignee.id),
    );
    const [labelDraft, setLabelDraft] = useState("");
    const updateCardMutation = useUpdateCardMutation(boardId);
    const deleteCardMutation = useDeleteCardMutation(boardId);
    const moveCardMutation = useMoveCardMutation(boardId);

    const assignedMembers = members.filter((member) => assigneeIds.includes(member.id));

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

    function addLabel(name: string) {
        const trimmed = name.trim();
        if (!trimmed) return;
        const isDuplicate = labels.some(
            (label) => label.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (isDuplicate) return;

        const next = [
            ...labels,
            { id: trimmed, name: trimmed, color: colorForLabel(trimmed) },
        ];
        setLabels(next);
        updateCardMutation.mutate({
            cardId: card.id,
            labels: next.map((label) => label.name),
        });
    }

    function toggleAssignee(memberId: string) {
        const next = assigneeIds.includes(memberId)
            ? assigneeIds.filter((id) => id !== memberId)
            : [...assigneeIds, memberId];
        setAssigneeIds(next);
        updateCardMutation.mutate({ cardId: card.id, assignees: next });
    }

    function moveToList(targetList: BoardList) {
        if (targetList.id === listId) return;
        const order = computeOrderForIndex(
            targetList.cards.map((targetCard) => targetCard.order),
            targetList.cards.length,
        );
        moveCardMutation.mutate({ cardId: card.id, listId: targetList.id, order });
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
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <button
                                            type="button"
                                            className="decoration-outline-variant hover:text-primary cursor-pointer underline underline-offset-4 transition-colors"
                                        />
                                    }
                                >
                                    {listName}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {lists.map((list) => (
                                        <DropdownMenuItem
                                            key={list.id}
                                            onClick={() => moveToList(list)}
                                        >
                                            {list.id === listId && (
                                                <Check
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {list.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </span>
                    </div>
                    <div className="gap-stack-sm flex items-center">
                        <AlertDialog>
                            <AlertDialogTrigger
                                render={
                                    <button
                                        type="button"
                                        title="Delete card"
                                        className="text-on-surface-variant hover:bg-error-container hover:text-on-error-container flex size-8 items-center justify-center rounded-lg transition-colors"
                                    />
                                }
                            >
                                <Trash2 className="size-5" aria-hidden="true" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete this card?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This can&rsquo;t be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        variant="destructive"
                                        onClick={() => void deleteCard()}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        render={
                                            <button
                                                type="button"
                                                className="bg-surface-container-low hover:bg-surface-container-high text-body-sm text-on-surface border-outline-variant/30 flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-solid"
                                            />
                                        }
                                    >
                                        <User
                                            className="text-on-surface-variant size-[18px]"
                                            aria-hidden="true"
                                        />
                                        Assignees
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {renderAssigneeMenuItems(
                                            members,
                                            assigneeIds,
                                            toggleAssignee,
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        render={
                                            <button
                                                type="button"
                                                className="bg-surface-container-low hover:bg-surface-container-high text-body-sm text-on-surface border-outline-variant/30 flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-solid"
                                            />
                                        }
                                    >
                                        <Tag
                                            className="text-on-surface-variant size-[18px]"
                                            aria-hidden="true"
                                        />
                                        Labels
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="p-2">
                                        {renderLabelAdderForm(
                                            labelDraft,
                                            setLabelDraft,
                                            () => {
                                                addLabel(labelDraft);
                                                setLabelDraft("");
                                            },
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
                            <div className="flex flex-wrap items-center gap-2">
                                {assignedMembers.length === 0 && (
                                    <span className="text-body-sm text-on-surface-variant">
                                        No one assigned
                                    </span>
                                )}
                                {assignedMembers.map((member) => (
                                    <Avatar
                                        key={member.id}
                                        className="ring-surface shadow-sm ring-2"
                                        title={member.name}
                                    >
                                        <AvatarFallback className="bg-secondary-container text-on-secondary-container text-label-caps">
                                            {emailInitials(member.email)}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        render={
                                            <button
                                                type="button"
                                                aria-label="Add assignee"
                                                className="bg-surface-container-highest border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary ring-surface flex size-8 items-center justify-center rounded-full border border-dashed ring-2 transition-colors"
                                            />
                                        }
                                    >
                                        <Plus className="size-4" aria-hidden="true" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {renderAssigneeMenuItems(
                                            members,
                                            assigneeIds,
                                            toggleAssignee,
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h4 className="text-label-caps text-on-surface-variant tracking-wider uppercase">
                                Labels
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                                {labels.length === 0 && (
                                    <span className="text-body-sm text-on-surface-variant">
                                        No labels yet
                                    </span>
                                )}
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        render={
                                            <button
                                                type="button"
                                                aria-label="Add label"
                                                className="bg-surface-container-highest border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary flex h-6 w-8 items-center justify-center rounded border border-dashed transition-colors"
                                            />
                                        }
                                    >
                                        <Plus className="size-4" aria-hidden="true" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="p-2">
                                        {renderLabelAdderForm(
                                            labelDraft,
                                            setLabelDraft,
                                            () => {
                                                addLabel(labelDraft);
                                                setLabelDraft("");
                                            },
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
