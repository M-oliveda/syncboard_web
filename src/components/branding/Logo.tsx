import { Kanban } from "lucide-react";

import { cn } from "@/lib/utils";

export interface LogoProps {
    className?: string;
    /** Render only the mark, without the "SyncBoard" wordmark (e.g. a collapsed sidebar). */
    iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
    return (
        <span
            className={cn("inline-flex items-center gap-2", className)}
            aria-label={iconOnly ? "SyncBoard" : undefined}
        >
            <Kanban className="text-primary size-6 shrink-0" aria-hidden="true" />
            {!iconOnly && (
                <span className="text-title-md text-on-surface font-semibold">
                    SyncBoard
                </span>
            )}
        </span>
    );
}
