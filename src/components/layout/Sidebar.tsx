import { Link } from "@tanstack/react-router";
import { ChevronsUpDown, LayoutGrid } from "lucide-react";

import { Logo } from "@/components/branding/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    return (
        <aside
            className={cn(
                "bg-surface-container-low border-outline-variant/30 flex h-full w-64 flex-col border-r",
                className,
            )}
        >
            <div className="p-stack-md mb-stack-md">
                <Link to="/app" className="inline-flex">
                    <Logo />
                </Link>
            </div>

            <div className="px-stack-md mb-stack-lg">
                <button
                    type="button"
                    className="bg-surface-container-high text-body-sm text-on-surface px-stack-md py-stack-sm flex w-full items-center justify-between rounded-lg"
                >
                    Design Team
                    <ChevronsUpDown
                        className="text-on-surface-variant size-4"
                        aria-hidden="true"
                    />
                </button>
            </div>

            <nav className="px-stack-md flex-1 space-y-1">
                <Link
                    to="/app"
                    className="text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface px-stack-md py-stack-sm text-body-sm flex items-center gap-3 rounded-lg transition-all"
                    activeProps={{
                        className:
                            "bg-secondary-container text-on-secondary-container font-bold",
                    }}
                >
                    <LayoutGrid className="size-4" aria-hidden="true" />
                    Boards
                </Link>
            </nav>

            <div className="p-stack-md border-outline-variant/30 gap-stack-md flex items-center border-t">
                <Avatar size="sm">
                    <AvatarFallback className="bg-primary text-on-primary text-xs">
                        AR
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="text-body-sm text-on-surface truncate font-medium">
                        Alex Rivera
                    </p>
                </div>
            </div>
        </aside>
    );
}
