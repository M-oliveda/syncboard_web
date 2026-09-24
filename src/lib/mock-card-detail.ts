import type { CardDetailContent } from "@/types/card-detail";

/**
 * Shared mock detail content shown in the Card Detail modal for any card — Phase 1
 * has no backend, so this stands in for what a real `GET /cards/:cardId` (description,
 * checklist, activity) would return, regardless of which card was clicked.
 */
export const mockCardDetail: CardDetailContent = {
    description:
        "The current polling mechanism is causing significant server load and noticeable lag in multi-user collaboration sessions. We need to replace it with a persistent WebSocket connection.\n\nKey requirements:\n1. Establish a secure connection on app load\n2. Handle reconnection logic with exponential backoff\n3. Implement presence indicators (who is currently viewing the board)\n4. Fall back gracefully if the socket connection fails",
    checklistName: "Implementation steps",
    checklist: [
        { id: "step-1", label: "Set up the server infrastructure", completed: true },
        { id: "step-2", label: "Create the client-side connection manager", completed: true },
        { id: "step-3", label: "Implement presence events (join/leave/cursor)", completed: false },
    ],
    activity: [
        {
            id: "activity-1",
            kind: "event",
            author: "Jamie Santos",
            timestamp: "2 hours ago",
            action: "moved this card to",
            target: "In Progress",
        },
        {
            id: "activity-2",
            kind: "comment",
            author: "Jamie Santos",
            authorInitials: "JS",
            timestamp: "2 hours ago",
            body: "I've provisioned the adapter for scaling multiple instances. We should coordinate on testing the reconnection logic once the client-side manager is done.",
        },
        {
            id: "activity-3",
            kind: "event",
            author: "Mauricio Oliveda",
            timestamp: "Yesterday at 4:23 PM",
            action: "added the",
            target: "Frontend",
        },
        {
            id: "activity-4",
            kind: "event",
            author: "Mauricio Oliveda",
            timestamp: "2 days ago",
            action: "created this card",
        },
    ],
};
