export interface ChecklistItem {
    id: string;
    label: string;
    completed: boolean;
}

export type ActivityEntry =
    | {
          id: string;
          kind: "event";
          author: string;
          timestamp: string;
          action: string;
          target?: string;
      }
    | {
          id: string;
          kind: "comment";
          author: string;
          authorInitials: string;
          timestamp: string;
          body: string;
      };

export interface CardDetailContent {
    description: string;
    checklistName: string;
    checklist: ChecklistItem[];
    activity: ActivityEntry[];
}
