import { Code2, Compass, Megaphone, Palette, type LucideIcon } from "lucide-react";

import { formatRelativeTime } from "@/lib/format-relative-time";
import type { Board, BoardCard, BoardList, LabelColor } from "@/types/board";
import type {
    ApiBoard,
    ApiCard,
    ApiList,
    ApiWorkspaceMember,
} from "@/types/api";
import type { AccentColor, BoardSummary, MemberRole, WorkspaceMember } from "@/types/workspace";

/** Deterministic string hash — used to derive a stable icon/accent/label color from
 * an id or name the backend doesn't carry a color/icon field for, so the same
 * board/label always renders the same way without persisting a new field. */
function hashString(value: string): number {
    let hash = 0;
    for (const char of value) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    return hash;
}

const LABEL_COLOR_PALETTE: LabelColor[] = ["primary", "secondary", "tertiary", "error"];

/** Backend labels are raw strings with no id/color — mapped to a deterministic color
 * so the same label name always renders the same way. Label color customization is
 * out of scope until the backend models labels as first-class resources. */
export function mapApiCardToBoardCard(card: ApiCard): BoardCard {
    const checklistTotal = card.checklist.length;
    const checklistCompleted = card.checklist.filter((item) => item.done).length;

    return {
        id: card._id,
        order: card.order,
        title: card.title,
        description: card.description,
        labels: card.labels.map((name) => ({
            id: name,
            name,
            /* v8 ignore next -- @preserve: modulo of a non-empty array is always in-bounds, fallback only satisfies noUncheckedIndexedAccess */
            color:
                LABEL_COLOR_PALETTE[hashString(name) % LABEL_COLOR_PALETTE.length] ??
                "secondary",
        })),
        checklist: card.checklist.map((item, index) => ({
            id: String(index),
            label: item.text,
            completed: item.done,
        })),
        checklistTotal,
        checklistCompleted,
        progress:
            checklistTotal > 0
                ? Math.round((checklistCompleted / checklistTotal) * 100)
                : undefined,
        // Backend stores unpopulated assignee ObjectIds; the "Add assignee" UI was
        // already inert in the Phase 1 mock and stays that way until there's a way
        // to resolve them to displayable initials.
        assignees: [],
    };
}

export function mapApiListToBoardList(list: ApiList, cards: ApiCard[]): BoardList {
    return {
        id: list._id,
        order: list.order,
        name: list.title,
        cards: cards
            .filter((card) => card.listId === list._id)
            .sort((a, b) => a.order - b.order)
            .map(mapApiCardToBoardCard),
    };
}

export interface ApiBoardDetail {
    board: ApiBoard;
    lists: ApiList[];
    cards: ApiCard[];
}

export function mapApiBoardDetailToBoard({ board, lists, cards }: ApiBoardDetail): Board {
    return {
        id: board._id,
        name: board.title,
        lists: [...lists]
            .sort((a, b) => a.order - b.order)
            .map((list) => mapApiListToBoardList(list, cards)),
    };
}

const BOARD_SUMMARY_ICONS: LucideIcon[] = [Megaphone, Compass, Palette, Code2];
const BOARD_SUMMARY_ACCENTS: AccentColor[] = ["primary", "secondary", "tertiary"];

/** `description`/`icon`/`accent`/`memberInitials` have no backend equivalent on
 * `Board` — `icon`/`accent` are picked deterministically from the board id so a
 * given board always looks the same; `memberInitials` comes from the parent
 * workspace's populated members, passed in by the caller. */
export function mapApiBoardToBoardSummary(
    board: ApiBoard,
    memberInitials: string[],
): BoardSummary {
    const hash = hashString(board._id);

    return {
        id: board._id,
        name: board.title,
        description: "",
        /* v8 ignore next -- @preserve: modulo of a non-empty array is always in-bounds, fallback only satisfies noUncheckedIndexedAccess */
        icon: BOARD_SUMMARY_ICONS[hash % BOARD_SUMMARY_ICONS.length] ?? Megaphone,
        /* v8 ignore next -- @preserve: modulo of a non-empty array is always in-bounds, fallback only satisfies noUncheckedIndexedAccess */
        accent: BOARD_SUMMARY_ACCENTS[hash % BOARD_SUMMARY_ACCENTS.length] ?? "primary",
        updatedAt: formatRelativeTime(board.updatedAt),
        memberInitials,
    };
}

function emailInitials(email: string): string {
    /* v8 ignore next -- @preserve: String.split always returns a non-empty array, so [0] is never undefined */
    const local = email.split("@")[0] ?? email;
    return local.slice(0, 2).toUpperCase();
}

const ROLE_MAP: Record<ApiWorkspaceMember["role"], MemberRole> = {
    Admin: "admin",
    Member: "member",
};

/** `WorkspaceMember.name` has no backend equivalent — `User` only stores `email` —
 * so it's derived from the email's local part, matching the email-initials
 * convention `PresenceHeader` already uses elsewhere for the same reason. */
export function mapApiWorkspaceMemberToWorkspaceMember(
    member: ApiWorkspaceMember,
): WorkspaceMember {
    return {
        id: member.userId._id,
        name: member.userId.email.replace(/@.*$/, ""),
        email: member.userId.email,
        role: ROLE_MAP[member.role],
    };
}

export function memberInitialsFromWorkspaceMembers(
    members: ApiWorkspaceMember[],
): string[] {
    return members.map((member) => emailInitials(member.userId.email));
}
