import { Link } from "@tanstack/react-router";

import { BoardCanvas } from "@/components/board/BoardCanvas";
import { AppShell } from "@/components/layout/AppShell";
import { PresenceHeader } from "@/components/layout/PresenceHeader";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { mockRoadmapBoard, mockRoadmapPresence } from "@/lib/mock-roadmap";

export function RoadmapPage() {
    return (
        <AppShell
            breadcrumb={
                <Breadcrumb>
                    <BreadcrumbList className="flex-nowrap">
                        <BreadcrumbItem>
                            <span>Workspace</span>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink render={<Link to="/app" />}>
                                Boards
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-on-surface truncate font-semibold">
                                {mockRoadmapBoard.name}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
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
