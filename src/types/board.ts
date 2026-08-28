/** Colors are DESIGN.md container/on-container token pairs — see Card's LABEL_COLORS map. */
export type LabelColor = "primary" | "secondary" | "tertiary" | "error";

export interface CardLabel {
    id: string;
    name: string;
    color: LabelColor;
}

export interface CardAssignee {
    id: string;
    initials: string;
}

export interface BoardCard {
    id: string;
    title: string;
    description?: string;
    labels?: CardLabel[];
    checklistTotal?: number;
    checklistCompleted?: number;
    commentCount?: number;
    /** 0-100. Rendered as a progress bar when present. */
    progress?: number;
    assignees?: CardAssignee[];
    completed?: boolean;
}

export interface BoardList {
    id: string;
    name: string;
    cards: BoardCard[];
}

export interface Board {
    id: string;
    name: string;
    lists: BoardList[];
}

export interface PresenceUser {
    id: string;
    email: string;
    status: "online" | "away";
}
