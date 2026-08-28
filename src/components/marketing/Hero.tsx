import { Link } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import { Check, PlayCircle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import type { LabelColor } from "@/types/board";

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.05,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/** Duplicated from Card.tsx/CardDetailModal.tsx per this codebase's existing convention. */
const LABEL_COLORS: Record<LabelColor, string> = {
    primary: "bg-primary-container text-on-primary-container",
    secondary: "bg-secondary-container text-on-secondary-container",
    tertiary: "bg-tertiary-container text-on-tertiary-container",
    error: "bg-error-container text-on-error-container",
};

interface MiniCard {
    id: string;
    title: string;
    label?: { name: string; color: LabelColor };
    done?: boolean;
}

const miniColumns: { id: string; name: string; cards: MiniCard[] }[] = [
    {
        id: "backlog",
        name: "Backlog",
        cards: [
            {
                id: "c1",
                title: "Add keyboard shortcuts",
                label: { name: "ENHANCEMENT", color: "primary" },
            },
            { id: "c1b", title: "Draft Q3 roadmap notes" },
        ],
    },
    {
        id: "in-progress",
        name: "In Progress",
        cards: [
            {
                id: "c2",
                title: "Fix drag ghost image",
                label: { name: "BUG", color: "error" },
            },
            {
                id: "c2b",
                title: "Audit color contrast",
                label: { name: "A11Y", color: "tertiary" },
            },
        ],
    },
    {
        id: "review",
        name: "Review",
        cards: [
            {
                id: "c3",
                title: "Checklist progress bar",
                label: { name: "FRONTEND", color: "secondary" },
            },
            { id: "c3b", title: "Card modal spacing pass" },
        ],
    },
    {
        id: "done",
        name: "Done",
        cards: [
            { id: "c4", title: "Ship presence header", done: true },
            {
                id: "c4b",
                title: "Set up optimistic drag-and-drop cache",
                done: true,
            },
        ],
    },
];

function MiniCardView({ card }: { card: MiniCard }) {
    if (card.done) {
        return (
            <div className="bg-surface-container-highest/50 space-y-1 rounded p-2">
                <p className="text-on-surface-variant line-clamp-2 text-[9px] leading-tight font-medium line-through sm:text-xs">
                    {card.title}
                </p>
                <Check className="text-success size-3" aria-hidden="true" />
            </div>
        );
    }

    return (
        <div className="bg-surface-container-highest/50 space-y-1.5 rounded p-2">
            {card.label && (
                <span
                    className={cn(
                        "rounded px-1.5 py-0.5 text-[8px] font-semibold tracking-wide uppercase",
                        LABEL_COLORS[card.label.color],
                    )}
                >
                    {card.label.name}
                </span>
            )}
            <p className="text-on-surface line-clamp-2 text-[9px] leading-tight font-medium sm:text-xs">
                {card.title}
            </p>
        </div>
    );
}

/**
 * Loop timeline shared by the flying card, its trailing cursor pulse, and the
 * sync badge: 4 dwell-then-move stops (Backlog → In Progress → Review → Done
 * → back to Backlog) over one 11s cycle. Consecutive equal keyframe values
 * are a dwell; differing values are the transit between two columns.
 */
const DRAG_LOOP_TIMES = [0, 0.15, 0.25, 0.4, 0.5, 0.65, 0.75, 0.9, 1];
const DRAG_LOOP_TRANSITION = {
    duration: 11,
    times: DRAG_LOOP_TIMES,
    repeat: Infinity,
    ease: "easeInOut" as const,
};

export function Hero() {
    return (
        <section className="pb-section-padding px-container-margin relative flex w-full flex-col items-center overflow-hidden pt-32 text-center">
            <div
                className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center"
                aria-hidden="true"
            >
                <div className="bg-secondary-fixed/30 h-[80vw] max-h-200 w-[80vw] max-w-200 rounded-full opacity-70 blur-[100px]" />
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="gap-stack-lg relative z-10 mx-auto flex max-w-4xl flex-col items-center"
            >
                <motion.span
                    variants={itemVariants}
                    className="bg-secondary-container text-on-secondary-container text-label-caps inline-flex items-center gap-2 rounded-full px-3 py-1"
                >
                    <span className="bg-on-secondary-container size-2 animate-pulse rounded-full" />
                    v1.0.0
                </motion.span>

                <motion.h1
                    variants={itemVariants}
                    className="text-headline-lg-mobile sm:text-headline-xl text-on-background max-w-3xl"
                >
                    Kanban boards that move as{" "}
                    <span className="text-on-secondary-container font-light italic">
                        fast
                    </span>{" "}
                    as your team.
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-title-md text-on-surface-variant max-w-2xl"
                >
                    Experience zero-latency collaboration with optimistic UI updates and
                    real-time multiplayer presence. Your team&rsquo;s workflow,
                    unblocked.
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    className="gap-stack-md mt-4 flex flex-col sm:flex-row"
                >
                    <Link
                        to="/register"
                        className={cn(
                            buttonVariants({ size: "lg" }),
                            "shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]",
                        )}
                    >
                        Start for free
                    </Link>
                    <a
                        href="#features"
                        className={cn(
                            buttonVariants({ size: "lg", variant: "outline" }),
                            "group",
                        )}
                    >
                        <PlayCircle className="text-on-secondary-container transition-transform group-hover:translate-x-1" />
                        See how it works
                    </a>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                className="mt-section-padding relative z-10 w-full max-w-6xl"
            >
                <div className="bg-surface-container relative aspect-video w-full overflow-hidden rounded-2xl border-t border-l border-t-white/20 p-2 shadow-2xl">
                    <div className="absolute top-4 left-4 z-30 flex gap-2">
                        <span className="bg-error size-3 rounded-full" />
                        <span className="bg-on-secondary-container size-3 rounded-full" />
                        <span className="size-3 rounded-full bg-[#34c759]" />
                    </div>

                    <div className="flex h-full w-full items-stretch gap-2 p-4 pt-12 sm:gap-3 sm:p-8">
                        {miniColumns.map((column) => (
                            <div
                                key={column.id}
                                className="bg-surface relative min-w-0 flex-1 space-y-2 overflow-hidden rounded-lg p-2 shadow-sm sm:p-3"
                            >
                                {column.id === "done" && (
                                    <motion.span
                                        className="border-success pointer-events-none absolute inset-0 z-10 rounded-lg border-2"
                                        animate={{
                                            opacity: [0, 0, 0, 0, 0, 0, 1, 1, 0],
                                        }}
                                        transition={DRAG_LOOP_TRANSITION}
                                        aria-hidden="true"
                                    />
                                )}
                                <div className="flex items-center gap-1.5">
                                    <p className="text-label-caps text-on-surface-variant truncate">
                                        {column.name}
                                    </p>
                                    <span className="bg-surface-container-high text-on-surface-variant relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-medium">
                                        {column.id === "done" ? (
                                            <>
                                                <motion.span
                                                    className="absolute inset-0 flex items-center justify-center"
                                                    animate={{
                                                        opacity: [
                                                            1, 1, 1, 1, 1, 1, 0, 0, 1,
                                                        ],
                                                    }}
                                                    transition={DRAG_LOOP_TRANSITION}
                                                >
                                                    {column.cards.length}
                                                </motion.span>
                                                <motion.span
                                                    className="absolute inset-0 flex items-center justify-center"
                                                    animate={{
                                                        opacity: [
                                                            0, 0, 0, 0, 0, 0, 1, 1, 0,
                                                        ],
                                                    }}
                                                    transition={DRAG_LOOP_TRANSITION}
                                                >
                                                    {column.cards.length + 1}
                                                </motion.span>
                                            </>
                                        ) : (
                                            column.cards.length
                                        )}
                                    </span>
                                </div>

                                {column.cards.map((card) => (
                                    <MiniCardView key={card.id} card={card} />
                                ))}

                                {column.id === "done" && (
                                    <motion.div
                                        animate={{
                                            opacity: [0, 0, 0, 0, 0, 0, 1, 1, 0],
                                            scale: [
                                                0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 1, 1, 0.9,
                                            ],
                                        }}
                                        transition={DRAG_LOOP_TRANSITION}
                                    >
                                        <MiniCardView
                                            card={{
                                                id: "incoming",
                                                title: "Ship optimistic sync",
                                                done: true,
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Demo card: loops across all four columns, trailed by a
                        collaborator cursor and a sync pulse, to illustrate the
                        real-time optimistic drag-and-drop pitch without a real
                        DndContext. */}
                    <motion.div
                        className="bg-surface absolute top-[58%] z-20 w-[24%] space-y-1.5 rounded-lg p-2 text-left shadow-lg sm:p-3"
                        animate={{
                            left: [
                                "4%",
                                "4%",
                                "29%",
                                "29%",
                                "54%",
                                "54%",
                                "79%",
                                "79%",
                                "4%",
                            ],
                            rotate: [0, -4, 0, 4, 0, -4, 0, 4, 0],
                            scale: [1, 1.06, 1, 1.06, 1, 1.06, 1, 1.06, 1],
                            opacity: [1, 1, 1, 1, 1, 1, 1, 0, 1],
                        }}
                        transition={DRAG_LOOP_TRANSITION}
                    >
                        <motion.div
                            className="border-surface bg-tertiary-container text-on-tertiary-container absolute -top-3 -left-3 z-10 flex size-6 items-center justify-center rounded-full border-2 text-[9px] font-semibold shadow-sm"
                            animate={{ y: [0, -3, 0] }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            aria-hidden="true"
                        >
                            JS
                        </motion.div>

                        <motion.span
                            className="border-success pointer-events-none absolute inset-0 rounded-lg border-2"
                            animate={{
                                opacity: [0, 0, 1, 0, 1, 0, 1, 0, 1],
                                scale: [
                                    0.85, 0.85, 1.35, 0.85, 1.35, 0.85, 1.35, 0.85,
                                    1.35,
                                ],
                            }}
                            transition={{ ...DRAG_LOOP_TRANSITION, ease: "easeOut" }}
                            aria-hidden="true"
                        />

                        <motion.span
                            className="bg-surface text-success absolute -top-2 -right-2 z-10 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-semibold shadow-sm"
                            animate={{ opacity: [0, 0, 1, 0, 1, 0, 1, 0, 1] }}
                            transition={DRAG_LOOP_TRANSITION}
                        >
                            <Check className="size-2.5" aria-hidden="true" />
                            Synced
                        </motion.span>

                        <span className="bg-primary-container text-on-primary-container inline-block rounded px-1.5 py-0.5 text-[8px] font-semibold tracking-wide uppercase">
                            TASK-142
                        </span>
                        <p className="text-on-surface text-[9px] leading-tight font-medium sm:text-xs">
                            Ship optimistic sync
                        </p>
                        <div className="hidden items-center gap-2 sm:flex">
                            <Progress value={70} className="flex-1" />
                            <Avatar size="sm" className="ring-surface shrink-0 ring-1">
                                <AvatarFallback className="text-[8px]">
                                    MO
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
