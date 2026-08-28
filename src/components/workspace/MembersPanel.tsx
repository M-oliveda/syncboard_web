import { ChevronDown, MoreVertical, UserPlus, Users } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { mockWorkspaceMembers } from "@/lib/mock-workspace";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";

function initials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

export function MembersPanel() {
    const [members, setMembers] = useState<WorkspaceMember[]>(mockWorkspaceMembers);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<MemberRole>("member");

    function handleInvite(event: React.FormEvent) {
        event.preventDefault();
        const email = inviteEmail.trim();
        if (!email) return;

        setMembers((current) => [
            ...current,
            {
                id: `pending-${current.length}-${email}`,
                name: email.replace(/@.*$/, ""),
                email,
                role: inviteRole,
            },
        ]);
        setInviteEmail("");
        setInviteRole("member");
    }

    function setRole(id: string, role: MemberRole) {
        setMembers((current) =>
            current.map((member) => (member.id === id ? { ...member, role } : member)),
        );
    }

    function removeMember(id: string) {
        setMembers((current) => current.filter((member) => member.id !== id));
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
                        Invite teammates and manage Admin/Member roles.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleInvite}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                    <Input
                        type="email"
                        placeholder="name@company.com"
                        aria-label="Email address to invite"
                        value={inviteEmail}
                        onChange={(event) => setInviteEmail(event.target.value)}
                        className="min-w-0 flex-1"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button
                                    type="button"
                                    className={cn(
                                        buttonVariants({
                                            variant: "outline",
                                            size: "default",
                                        }),
                                        "capitalize",
                                    )}
                                />
                            }
                        >
                            {inviteRole}
                            <ChevronDown className="size-4" aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setInviteRole("member")}>
                                Member
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setInviteRole("admin")}>
                                Admin
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button type="submit">
                        <UserPlus className="size-4" aria-hidden="true" />
                        Invite
                    </Button>
                </form>

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
