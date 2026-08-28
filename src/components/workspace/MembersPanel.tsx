import { MoreVertical, UserPlus, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCurrentWorkspace } from "@/hooks/useWorkspacesQuery";
import {
    useRemoveMemberMutation,
    useUpdateMemberRoleMutation,
} from "@/hooks/useMemberMutations";
import { buttonVariants } from "@/lib/button-variants";
import { mapApiWorkspaceMemberToWorkspaceMember } from "@/lib/api-mappers";
import { cn } from "@/lib/utils";
import type { MemberRole } from "@/types/workspace";

function initials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

export interface MembersPanelProps {
    workspaceId: string;
}

export function MembersPanel({ workspaceId }: MembersPanelProps) {
    const workspaceQuery = useCurrentWorkspace();
    const members = (workspaceQuery.data?.members ?? []).map(
        mapApiWorkspaceMemberToWorkspaceMember,
    );
    const updateRoleMutation = useUpdateMemberRoleMutation(workspaceId);
    const removeMemberMutation = useRemoveMemberMutation(workspaceId);

    function setRole(id: string, role: MemberRole) {
        updateRoleMutation.mutate({ userId: id, role });
    }

    function removeMember(id: string) {
        removeMemberMutation.mutate(id);
    }

    return (
        <Dialog>
            <DialogTrigger
                render={
                    <button
                        type="button"
                        className={cn(buttonVariants({ variant: "outline" }), "gap-1")}
                    />
                }
            >
                <Users className="size-4" aria-hidden="true" />
                Members
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Workspace members</DialogTitle>
                    <DialogDescription>
                        Manage Admin/Member roles for this workspace.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                        type="email"
                        placeholder="name@company.com"
                        aria-label="Email address to invite"
                        disabled
                        className="min-w-0 flex-1"
                    />
                    <button
                        type="button"
                        disabled
                        className={cn(buttonVariants({ variant: "outline" }), "gap-1")}
                    >
                        <UserPlus className="size-4" aria-hidden="true" />
                        Invite
                    </button>
                </div>
                <p className="text-on-surface-variant -mt-1 text-xs">
                    Teammates need an existing SyncBoard account — self-service invites
                    aren&rsquo;t available yet.
                </p>

                <ul className="divide-border -mx-5 divide-y">
                    {members.map((member) => (
                        <li
                            key={member.id}
                            className="flex items-center gap-3 px-5 py-3"
                        >
                            <Avatar size="sm">
                                <AvatarFallback className="bg-secondary-container text-on-secondary-container text-xs">
                                    {initials(member.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="text-body-sm text-on-surface truncate font-medium">
                                    {member.name}
                                </p>
                                <p className="text-on-surface-variant truncate text-xs">
                                    {member.email}
                                </p>
                            </div>
                            <Badge
                                variant={
                                    member.role === "admin" ? "default" : "secondary"
                                }
                            >
                                {member.role === "admin" ? "Admin" : "Member"}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <button
                                            type="button"
                                            aria-label={`Options for ${member.name}`}
                                            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded p-1 transition-colors"
                                        />
                                    }
                                >
                                    <MoreVertical
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {member.role === "admin" ? (
                                        <DropdownMenuItem
                                            onClick={() => setRole(member.id, "member")}
                                        >
                                            Make member
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem
                                            onClick={() => setRole(member.id, "admin")}
                                        >
                                            Make admin
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => removeMember(member.id)}
                                    >
                                        Remove from workspace
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}
