import { ChevronRight, Plus } from "lucide-react";

import { MembersPanel } from "@/components/workspace/MembersPanel";
import { BoardGrid } from "@/components/workspace/BoardGrid";
import { StatsOverview } from "@/components/workspace/StatsOverview";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { mockBoardSummaries } from "@/lib/mock-workspace";

export function DashboardPage() {
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
                <div className="gap-stack-sm flex items-center">
                    <MembersPanel />
                    <Button>
                        <Plus className="size-4" aria-hidden="true" />
                        New board
                    </Button>
                </div>
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

                <div className="mx-auto w-full max-w-7xl">
                    <StatsOverview />
                </div>

                <div className="mx-auto w-full max-w-7xl">
                    <BoardGrid boards={mockBoardSummaries} />
                </div>
            </div>
        </AppShell>
    );
}
