import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { PresenceUser } from "@/types/board";

export interface PresenceHeaderProps {
    users: PresenceUser[];
}

function initialsFromEmail(email: string): string {
    const namePart = email.replace(/@.*$/, "");
    const parts = namePart.split(/[._-]/).filter(Boolean);
    const initials = parts
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
    return initials || "?";
}

const MAX_VISIBLE = 3;

export function PresenceHeader({ users }: PresenceHeaderProps) {
    const visible = users.slice(0, MAX_VISIBLE);
    const overflow = users.length - visible.length;

    return (
        <div
            className="flex items-center -space-x-3"
            aria-label={`${users.length} ${users.length === 1 ? "person" : "people"} viewing this board`}
        >
            {visible.map((user) => (
                <div key={user.id} className="relative">
                    <Avatar size="sm" className="ring-surface shadow-sm ring-2">
                        <AvatarFallback className="bg-secondary-container text-on-secondary-container text-[10px]">
                            {initialsFromEmail(user.email)}
                        </AvatarFallback>
                    </Avatar>
                    <span
                        className={cn(
                            "border-surface absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2",
                            user.status === "online"
                                ? "bg-success"
                                : "bg-on-surface-variant",
                        )}
                        aria-hidden="true"
                    />
                </div>
            ))}
            {overflow > 0 && (
                <span className="bg-surface-container-high text-on-surface ring-surface relative z-10 flex size-6 items-center justify-center rounded-full text-[10px] font-medium ring-2">
                    +{overflow}
                </span>
            )}
        </div>
    );
}
