import { CheckCircle2, MessageCircle, SquareCheck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { BoardCard, LabelColor } from "@/types/board";

const LABEL_COLORS: Record<LabelColor, string> = {
    primary: "bg-primary-container text-on-primary-container",
    secondary: "bg-secondary-container text-on-secondary-container",
    tertiary: "bg-tertiary-container text-on-tertiary-container",
    error: "bg-error-container text-on-error-container",
};

export interface CardItemProps {
    card: BoardCard;
    onClick?: () => void;
}

function getInteractiveCardProps(onClick: (() => void) | undefined) {
    if (!onClick) return {};

    return {
        role: "button" as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
            }
        },
    };
}

export function CardItem({ card, onClick }: CardItemProps) {
    const interactiveProps = getInteractiveCardProps(onClick);

    if (card.completed) {
        return (
            <div
                {...interactiveProps}
                className={cn(
                    "bg-surface/50 p-stack-md border-surface-container-highest rounded-lg border shadow-sm",
                    onClick && "cursor-pointer",
                )}
            >
                <h3 className="text-body-base text-on-surface-variant mb-2 leading-tight font-medium line-through">
                    {card.title}
                </h3>
                <div className="text-success flex items-center gap-1 text-xs">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Completed
                </div>
            </div>
        );
    }

    const hasMeta = Boolean(card.checklistTotal) || Boolean(card.commentCount);
    const hasAssignees = Boolean(card.assignees?.length);

    return (
        <div
            {...interactiveProps}
            className={cn(
                "bg-surface p-stack-md border-surface-container-highest rounded-lg border shadow-sm transition-shadow hover:shadow-md",
                onClick && "cursor-pointer",
            )}
        >
            {card.labels && card.labels.length > 0 && (
                <div className="mb-stack-sm flex flex-wrap gap-2">
                    {card.labels.map((label) => (
                        <span
                            key={label.id}
                            className={cn(
                                "text-label-caps rounded px-2 py-1",
                                LABEL_COLORS[label.color],
                            )}
                        >
                            {label.name}
                        </span>
                    ))}
                </div>
            )}

            <h3 className="text-body-base text-on-surface mb-2 leading-tight font-medium">
                {card.title}
            </h3>

            {card.description && (
                <p className="text-body-sm text-on-surface-variant mb-stack-md line-clamp-2">
                    {card.description}
                </p>
            )}

            {typeof card.progress === "number" && (
                <Progress value={card.progress} className="mb-stack-sm" />
            )}

            {(hasMeta || hasAssignees) && (
                <div className="flex items-center justify-between">
                    <div className="text-on-surface-variant flex items-center gap-3 text-xs">
                        {Boolean(card.checklistTotal) && (
                            <span className="flex items-center gap-1">
                                <SquareCheck className="size-4" aria-hidden="true" />
                                {card.checklistCompleted ?? 0}/{card.checklistTotal}
                            </span>
                        )}
                        {Boolean(card.commentCount) && (
                            <span className="flex items-center gap-1">
                                <MessageCircle className="size-4" aria-hidden="true" />
                                {card.commentCount}
                            </span>
                        )}
                    </div>
                    {hasAssignees && (
                        <div className="flex -space-x-2">
                            {card.assignees?.map((assignee) => (
                                <Avatar
                                    key={assignee.id}
                                    size="sm"
                                    className="ring-surface ring-2"
                                >
                                    <AvatarFallback className="text-[10px]">
                                        {assignee.initials}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
