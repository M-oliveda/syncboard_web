import { Link } from "@tanstack/react-router";

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
}

export function BoardCard({ board }: BoardCardProps) {
    const Icon = board.icon;
    const visibleMembers = board.memberInitials.slice(0, MAX_VISIBLE_MEMBERS);
    const overflow = board.memberInitials.length - visibleMembers.length;
    const accent = ACCENT_CLASSES[board.accent];

    return (
        <Link
            to="/app/boards/$boardId"
            params={{ boardId: board.id }}
            className="bg-surface-container-lowest hover:border-outline-variant/30 group flex flex-col overflow-hidden rounded-xl border border-transparent shadow-sm transition-shadow duration-300 hover:shadow-md"
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
    );
}
