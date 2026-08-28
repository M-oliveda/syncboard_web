import { ChevronRight } from "lucide-react";

import { BoardCanvas } from "@/components/board/BoardCanvas";
import { AppShell } from "@/components/layout/AppShell";
import { PresenceHeader } from "@/components/layout/PresenceHeader";
import { mockRoadmapBoard, mockRoadmapPresence } from "@/lib/mock-roadmap";

export function RoadmapPage() {
    return (
        <AppShell
            breadcrumb={
                <>
                    <span>Workspace</span>
                    <ChevronRight className="size-4" aria-hidden="true" />
                    <span className="text-on-surface font-semibold">Boards</span>
                </>
            }
        >
            <div className="bg-surface border-surface-variant px-stack-lg py-stack-md flex flex-none items-center justify-between border-b">
                <div className="gap-stack-md flex items-center">
                    <h1 className="text-headline-lg text-on-surface">
                        {mockRoadmapBoard.name}
                    </h1>
                    <div
                        className="bg-outline-variant/30 h-6 w-px"
                        aria-hidden="true"
                    />
                    <PresenceHeader users={mockRoadmapPresence} />
                </div>
            </div>
            <BoardCanvas board={mockRoadmapBoard} />
        </AppShell>
    );
}
