import { History } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ActivityEntry } from "@/types/card-detail";

const PAGE_SIZE = 2;

export interface ActivityFeedProps {
    entries: ActivityEntry[];
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const visibleEntries = entries.slice(0, visibleCount);
    const hasMore = visibleCount < entries.length;

    return (
        <div className="flex flex-col gap-4">
            {visibleEntries.map((entry) =>
                entry.kind === "event" ? (
                    <div
                        key={entry.id}
                        className="text-body-sm text-on-surface-variant flex items-center gap-3"
                    >
                        <div className="flex w-8 justify-center">
                            <History className="size-4" aria-hidden="true" />
                        </div>
                        <div>
                            <span className="text-on-surface font-bold">
                                {entry.author}
                            </span>{" "}
                            {entry.action}{" "}
                            {entry.target && (
                                <span className="text-primary font-semibold">
                                    {entry.target}
                                </span>
                            )}
                            <span className="text-label-caps ml-2">
                                {entry.timestamp}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div key={entry.id} className="flex gap-3">
                        <Avatar size="sm" className="shrink-0">
                            <AvatarFallback className="bg-secondary-container text-on-secondary-container text-xs">
                                {entry.authorInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="mb-1 flex items-baseline gap-2">
                                <span className="text-body-sm text-on-surface font-title-md">
                                    {entry.author}
                                </span>
                                <span className="text-label-caps text-on-surface-variant">
                                    {entry.timestamp}
                                </span>
                            </div>
                            <div className="bg-surface-container-lowest border-outline-variant/30 text-body-sm text-on-surface rounded-lg border p-3">
                                {entry.body}
                            </div>
                        </div>
                    </div>
                ),
            )}

            {hasMore && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-11 self-start"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                    Show earlier activity
                </Button>
            )}
        </div>
    );
}
