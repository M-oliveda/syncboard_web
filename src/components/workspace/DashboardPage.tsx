import { AlertTriangle, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";

import { MembersPanel } from "@/components/workspace/MembersPanel";
import { BoardGrid } from "@/components/workspace/BoardGrid";
import { StatsOverview } from "@/components/workspace/StatsOverview";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { OriginUiEmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoardsQuery } from "@/hooks/useBoardsQuery";
import {
    useCreateWorkspaceMutation,
    useCurrentWorkspace,
} from "@/hooks/useWorkspacesQuery";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    mapApiBoardToBoardSummary,
    memberInitialsFromWorkspaceMembers,
} from "@/lib/api-mappers";

function CreateWorkspacePrompt() {
    const [name, setName] = useState("");
    const createWorkspaceMutation = useCreateWorkspaceMutation();

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        try {
            await createWorkspaceMutation.mutateAsync(trimmed);
        } catch {
            // handled via createWorkspaceMutation.isError below
        }
    }

    return (
        <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
            <div className="bg-muted mb-4 inline-flex size-12 items-center justify-center rounded-full">
                <Sparkles className="text-muted-foreground size-6" />
            </div>
            <h3 className="text-base font-semibold">Create your first workspace</h3>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                Workspaces group your boards and teammates together.
            </p>
            <form
                onSubmit={(event) => void handleSubmit(event)}
                className="gap-stack-sm mt-4 flex flex-col items-center sm:flex-row"
            >
                <Input
                    autoFocus
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Acme Inc."
                    aria-label="Workspace name"
                />
                <Button type="submit" disabled={createWorkspaceMutation.isPending}>
                    {createWorkspaceMutation.isPending
                        ? "Creating…"
                        : "Create workspace"}
                </Button>
            </form>
            {createWorkspaceMutation.isError && (
                <p className="text-error text-body-sm mt-2" role="alert">
                    {getApiErrorMessage(
                        createWorkspaceMutation.error,
                        "Couldn't create the workspace. Please try again.",
                    )}
                </p>
            )}
        </div>
    );
}

export function DashboardPage() {
    const workspaceQuery = useCurrentWorkspace();
    const workspace = workspaceQuery.data;
    const boardsQuery = useBoardsQuery(workspace?._id);

    const memberInitials = workspace
        ? memberInitialsFromWorkspaceMembers(workspace.members)
        : [];
    const boardSummaries = (boardsQuery.data ?? []).map((board) =>
        mapApiBoardToBoardSummary(board, memberInitials),
    );

    const isLoading = workspaceQuery.isLoading || boardsQuery.isLoading;
    const isError = workspaceQuery.isError || boardsQuery.isError;

    return (
        <AppShell
            breadcrumb={
                <>
                    <span>Workspace</span>
                    <ChevronRight className="size-4" aria-hidden="true" />
                    <span className="text-on-surface font-semibold">Boards</span>
                </>
            }
            action={
                workspace && (
                    <div className="gap-stack-sm flex items-center">
                        <MembersPanel workspaceId={workspace._id} />
                    </div>
                )
            }
        >
            <div className="p-section-padding gap-stack-lg flex flex-col">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-1">
                    <h1 className="text-headline-lg-mobile sm:text-headline-xl text-on-background">
                        Active boards
                    </h1>
                    <p className="text-body-base text-on-surface-variant max-w-lg">
                        Manage and organize your team&rsquo;s collaborative workspaces.
                    </p>
                </div>

                {isError && (
                    <div className="mx-auto w-full max-w-7xl">
                        <OriginUiEmptyState
                            icon={AlertTriangle}
                            title="Couldn't load your workspace"
                            description="Something went wrong while loading your boards. Please try again."
                        />
                    </div>
                )}

                {!isError && isLoading && (
                    <div className="mx-auto w-full max-w-7xl">
                        <div className="gap-gutter grid grid-cols-1 md:grid-cols-4">
                            <Skeleton className="h-28 rounded-xl" />
                            <Skeleton className="h-28 rounded-xl" />
                        </div>
                    </div>
                )}

                {!isError && !isLoading && !workspace && (
                    <div className="mx-auto w-full max-w-7xl">
                        <CreateWorkspacePrompt />
                    </div>
                )}

                {!isError && !isLoading && workspace && (
                    <>
                        <div className="mx-auto w-full max-w-7xl">
                            <StatsOverview
                                boardCount={boardSummaries.length}
                                memberCount={workspace.members.length}
                            />
                        </div>

                        <div className="mx-auto w-full max-w-7xl">
                            <BoardGrid
                                boards={boardSummaries}
                                workspaceId={workspace._id}
                            />
                        </div>
                    </>
                )}
            </div>
        </AppShell>
    );
}
