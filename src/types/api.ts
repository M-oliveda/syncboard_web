/** Raw DTOs mirroring the backend's actual Mongoose/`toJSON` response shapes — kept
 * separate from `types/board.ts`/`types/workspace.ts`, which are the UI-facing shapes
 * presentational components render. `src/lib/api-mappers.ts` converts between the two. */

export interface ApiSuccess<T> {
    success: true;
    data: T;
    message?: string;
}

export interface ApiCollection<T> {
    success: true;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/** RFC 7807 `application/problem+json` error body. */
export interface ApiProblem {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
}

export interface ApiUser {
    _id: string;
    email: string;
}

export interface ApiWorkspaceMember {
    userId: ApiUser;
    role: "Admin" | "Member";
}

export interface ApiWorkspace {
    _id: string;
    name: string;
    members: ApiWorkspaceMember[];
    updatedAt: string;
}

export interface ApiBoard {
    _id: string;
    workspaceId: string;
    title: string;
    updatedAt: string;
}

export interface ApiList {
    _id: string;
    boardId: string;
    title: string;
    order: number;
}

export interface ApiChecklistItem {
    text: string;
    done: boolean;
}

export interface ApiCard {
    _id: string;
    listId: string;
    title: string;
    description: string;
    order: number;
    assignees: string[];
    labels: string[];
    checklist: ApiChecklistItem[];
}
