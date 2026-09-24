import { LayoutDashboard, Users } from "lucide-react";

export interface StatsOverviewProps {
    boardCount: number;
    memberCount: number;
}

export function StatsOverview({ boardCount, memberCount }: StatsOverviewProps) {
    return (
        <div className="gap-gutter grid grid-cols-1 md:grid-cols-4">
            <div className="bg-primary-container p-container-margin flex flex-col justify-between rounded-xl shadow-sm">
                <div className="mb-stack-md flex items-center justify-between">
                    <span className="text-label-caps text-on-primary-container/80 tracking-widest uppercase">
                        Total boards
                    </span>
                    <div className="bg-primary/20 text-on-primary-container flex size-8 items-center justify-center rounded-full">
                        <LayoutDashboard className="size-[18px]" aria-hidden="true" />
                    </div>
                </div>
                <span className="text-headline-lg text-on-primary-container">
                    {boardCount}
                </span>
            </div>

            <div className="bg-secondary-container p-container-margin flex flex-col justify-between rounded-xl shadow-sm">
                <div className="mb-stack-md flex items-center justify-between">
                    <span className="text-label-caps text-on-secondary-container/80 tracking-widest uppercase">
                        Members
                    </span>
                    <div className="bg-secondary/20 text-on-secondary-container flex size-8 items-center justify-center rounded-full">
                        <Users className="size-[18px]" aria-hidden="true" />
                    </div>
                </div>
                <span className="text-headline-lg text-on-secondary-container">
                    {memberCount}
                </span>
            </div>
        </div>
    );
}
