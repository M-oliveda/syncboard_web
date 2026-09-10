import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, LogOut, User } from "lucide-react";

import { Logo } from "@/components/branding/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const navigate = useNavigate();
    const logoutMutation = useLogoutMutation();

    async function handleLogout() {
        try {
            await logoutMutation.mutateAsync();
        } catch {
            // authSession is already cleared via onSettled regardless of outcome
        }
        await navigate({ to: "/login" });
    }

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

            <nav className="px-stack-md mt-stack-lg flex-1 space-y-1">
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

            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <button
                            type="button"
                            className="pt-stack-md px-stack-md border-outline-variant/30 gap-stack-md hover:bg-surface-container-highest flex items-center border-t pb-[calc(var(--spacing-stack-md)+env(safe-area-inset-bottom))] text-left transition-colors"
                        />
                    }
                >
                    <Avatar size="sm">
                        <AvatarFallback className="bg-primary text-on-primary text-xs">
                            <User className="size-4" aria-hidden="true" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="text-body-sm text-on-surface truncate font-medium">
                            Account
                        </p>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top">
                    <DropdownMenuItem onClick={() => void handleLogout()}>
                        <LogOut className="size-4" aria-hidden="true" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </aside>
    );
}
