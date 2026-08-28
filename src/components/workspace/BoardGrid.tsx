import { Plus } from "lucide-react";
import { useState } from "react";

import { BoardCard } from "@/components/workspace/BoardCard";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBoardMutation } from "@/hooks/useBoardsQuery";
import { getApiErrorMessage } from "@/lib/api-error";
import type { BoardSummary } from "@/types/workspace";

export interface BoardGridProps {
    boards: BoardSummary[];
    workspaceId: string;
}

export function BoardGrid({ boards, workspaceId }: BoardGridProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const createBoardMutation = useCreateBoardMutation(workspaceId);

    async function handleCreate(event: React.FormEvent) {
        event.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;

        try {
            await createBoardMutation.mutateAsync(trimmed);
        } catch {
            return;
        }
        setTitle("");
        setOpen(false);
    }

    return (
        <div className="gap-gutter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Dialog open={open} onOpenChange={setOpen}>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="bg-surface-container-low border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container group flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300"
                >
                    <div className="bg-surface-container-highest group-hover:bg-primary group-hover:text-on-primary text-on-surface mb-stack-sm flex size-12 items-center justify-center rounded-full shadow-sm transition-colors duration-300">
                        <Plus className="size-6" aria-hidden="true" />
                    </div>
                    <span className="text-title-md text-on-surface group-hover:text-primary transition-colors">
                        New Board
                    </span>
                    <span className="text-body-sm text-on-surface-variant mt-1">
                        Create from template
                    </span>
                </button>

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create a board</DialogTitle>
                        <DialogDescription>
                            Give your new board a name to get started.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(event) => void handleCreate(event)}>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="board-title">Board name</Label>
                            <Input
                                id="board-title"
                                autoFocus
                                required
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Q1 Marketing Campaign"
                            />
                        </div>

                        {createBoardMutation.isError && (
                            <p className="text-error text-body-sm mt-2" role="alert">
                                {getApiErrorMessage(
                                    createBoardMutation.error,
                                    "Couldn't create the board. Please try again.",
                                )}
                            </p>
                        )}

                        <DialogFooter className="mt-4">
                            <Button
                                type="submit"
                                disabled={createBoardMutation.isPending}
                            >
                                {createBoardMutation.isPending
                                    ? "Creating…"
                                    : "Create board"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {boards.map((board) => (
                <BoardCard key={board.id} board={board} />
            ))}
        </div>
    );
}
