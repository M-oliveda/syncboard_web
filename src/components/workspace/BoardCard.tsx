import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteBoardMutation, useUpdateBoardMutation } from "@/hooks/useBoardsQuery";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import type { AccentColor, BoardSummary } from "@/types/workspace";

const ACCENT_CLASSES: Record<AccentColor, { bar: string; badge: string }> = {
    primary: { bar: "bg-primary/80", badge: "bg-primary-fixed text-on-primary-fixed" },
    secondary: {
        bar: "bg-secondary/80",
        badge: "bg-secondary-fixed text-on-secondary-fixed",
    },
    tertiary: {
        bar: "bg-tertiary/80",
        badge: "bg-tertiary-fixed text-on-tertiary-fixed",
    },
};

const MAX_VISIBLE_MEMBERS = 3;

export interface BoardCardProps {
    board: BoardSummary;
    workspaceId: string;
}

export function BoardCard({ board, workspaceId }: BoardCardProps) {
    const Icon = board.icon;
    const visibleMembers = board.memberInitials.slice(0, MAX_VISIBLE_MEMBERS);
    const overflow = board.memberInitials.length - visibleMembers.length;
    const accent = ACCENT_CLASSES[board.accent];

    const [renameOpen, setRenameOpen] = useState(false);
    const [title, setTitle] = useState(board.name);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const updateBoardMutation = useUpdateBoardMutation(workspaceId);
    const deleteBoardMutation = useDeleteBoardMutation(workspaceId);

    function openRenameDialog() {
        setTitle(board.name);
        setRenameOpen(true);
    }

    async function handleRename(event: React.FormEvent) {
        event.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;

        try {
            await updateBoardMutation.mutateAsync({
                boardId: board.id,
                title: trimmed,
            });
        } catch {
            return;
        }
        setRenameOpen(false);
    }

    async function handleDelete() {
        try {
            await deleteBoardMutation.mutateAsync(board.id);
        } catch {
            return;
        }
        setDeleteOpen(false);
    }

    return (
        <div className="group relative">
            <Link
                to="/app/boards/$boardId"
                params={{ boardId: board.id }}
                className="bg-surface-container-lowest hover:border-outline-variant/30 flex flex-col overflow-hidden rounded-xl border border-transparent shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
                <div className={cn("h-2 w-full", accent.bar)} aria-hidden="true" />
                <div className="p-container-margin flex flex-1 flex-col">
                    <div className="mb-stack-md flex items-start justify-between">
                        <div
                            className={cn(
                                "flex size-10 items-center justify-center rounded-lg shadow-sm",
                                accent.badge,
                            )}
                        >
                            <Icon className="size-5" aria-hidden="true" />
                        </div>
                    </div>
                    <h3 className="text-title-md text-on-surface mb-1 truncate">
                        {board.name}
                    </h3>
                    <p className="text-body-sm text-on-surface-variant mb-stack-lg line-clamp-2 min-h-[3em]">
                        {board.description}
                    </p>
                    <div className="border-outline-variant/20 pt-stack-sm mt-auto flex items-center justify-between border-t">
                        <span className="text-label-caps text-on-surface-variant">
                            {board.updatedAt}
                        </span>
                        <div className="flex -space-x-2">
                            {visibleMembers.map((initials, index) => (
                                <span
                                    key={`${initials}-${index}`}
                                    className="border-surface-container-lowest bg-surface-container-highest text-on-surface flex size-7 items-center justify-center rounded-full border-2 text-[10px] font-bold shadow-sm"
                                >
                                    {initials}
                                </span>
                            ))}
                            {overflow > 0 && (
                                <span className="border-surface-container-lowest bg-surface-container-highest text-on-surface flex size-7 items-center justify-center rounded-full border-2 text-[10px] font-bold shadow-sm">
                                    +{overflow}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            <div className="absolute top-3 right-3">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                aria-label={`${board.name} board options`}
                                className="text-on-surface-variant hover:text-on-surface bg-surface-container-lowest/80 hover:bg-surface-container-high flex size-7 items-center justify-center rounded-full shadow-sm transition-colors"
                            />
                        }
                    >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={openRenameDialog}>
                            Rename board
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteOpen(true)}
                        >
                            Delete board
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rename board</DialogTitle>
                        <DialogDescription>
                            Give &ldquo;{board.name}&rdquo; a new name.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(event) => void handleRename(event)}>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`board-title-${board.id}`}>
                                Board name
                            </Label>
                            <Input
                                id={`board-title-${board.id}`}
                                autoFocus
                                required
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                            />
                        </div>

                        {updateBoardMutation.isError && (
                            <p className="text-error text-body-sm mt-2" role="alert">
                                {getApiErrorMessage(
                                    updateBoardMutation.error,
                                    "Couldn't rename the board. Please try again.",
                                )}
                            </p>
                        )}

                        <DialogFooter className="mt-4">
                            <Button
                                type="submit"
                                disabled={updateBoardMutation.isPending}
                            >
                                {updateBoardMutation.isPending
                                    ? "Renaming…"
                                    : "Rename board"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete &ldquo;{board.name}&rdquo;?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This deletes the board along with all of its lists and
                            cards. This can&rsquo;t be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {deleteBoardMutation.isError && (
                        <p className="text-error text-body-sm" role="alert">
                            {getApiErrorMessage(
                                deleteBoardMutation.error,
                                "Couldn't delete the board. Please try again.",
                            )}
                        </p>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleteBoardMutation.isPending}
                            onClick={() => void handleDelete()}
                        >
                            {deleteBoardMutation.isPending ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
