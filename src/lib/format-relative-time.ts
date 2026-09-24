/** Lightweight relative-time formatter — no date library dependency for a single
 * "Updated Xh ago" string. */
export function formatRelativeTime(isoDate: string): string {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMinutes = Math.round(diffMs / 60_000);

    if (diffMinutes < 1) return "Updated just now";
    if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `Updated ${diffHours}h ago`;

    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 30) return `Updated ${diffDays}d ago`;

    const diffMonths = Math.round(diffDays / 30);
    return `Updated ${diffMonths}mo ago`;
}
