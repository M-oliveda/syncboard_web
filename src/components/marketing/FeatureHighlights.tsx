import { motion, type Variants } from "framer-motion";
import { CheckCircle2, GripVertical, RefreshCw, Users } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

interface FeatureCardProps {
    index: number;
    className?: string;
    children: ReactNode;
}

function FeatureCard({ index, className, children }: FeatureCardProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
            className={cn(
                "bg-surface gap-6 rounded-2xl p-8 shadow-sm transition-shadow hover:shadow-md",
                className,
            )}
        >
            {children}
        </motion.div>
    );
}

export function FeatureHighlights() {
    return (
        <section
            id="features"
            className="py-section-padding px-container-margin bg-surface-container-low w-full"
        >
            <div className="gap-section-padding mx-auto flex max-w-7xl flex-col">
                <div className="gap-stack-lg border-outline-variant/30 flex flex-col items-end justify-between border-b pb-8 md:flex-row">
                    <div className="max-w-2xl">
                        <h2 className="text-headline-lg-mobile sm:text-headline-lg text-on-background mb-4">
                            Built for flow state.
                        </h2>
                        <p className="text-body-base text-on-surface-variant">
                            We stripped away the loading spinners and built a syncing
                            engine that updates the UI before the server even responds.
                        </p>
                    </div>
                    <div className="text-label-caps text-on-secondary-container hidden tracking-widest uppercase [writing-mode:vertical-rl] md:block">
                        Architecture
                    </div>
                </div>

                <div className="gap-gutter grid grid-cols-1 md:grid-cols-3">
                    <FeatureCard index={0} className="flex flex-col">
                        <div className="bg-primary-container text-on-primary-container flex size-12 items-center justify-center rounded-xl">
                            <Users className="size-6" aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="text-title-md text-on-surface mb-2">
                                Live Presence
                            </h3>
                            <p className="text-body-sm text-on-surface-variant">
                                See exactly where your teammates are clicking, dragging,
                                and typing in real time. No more colliding on tasks.
                            </p>
                        </div>
                        <div className="mt-auto flex -space-x-3 pt-6">
                            <span className="border-surface bg-secondary-container size-10 rounded-full border-2" />
                            <span className="border-surface bg-tertiary-container size-10 rounded-full border-2" />
                            <span className="border-surface bg-primary-container size-10 rounded-full border-2" />
                        </div>
                    </FeatureCard>

                    <FeatureCard index={1} className="flex flex-col md:col-span-2">
                        <div className="bg-secondary-container text-on-secondary-container flex size-12 items-center justify-center rounded-xl">
                            <GripVertical className="size-6" aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="text-title-md text-on-surface mb-2">
                                Optimistic Drag &amp; Drop
                            </h3>
                            <p className="text-body-sm text-on-surface-variant max-w-md">
                                Our UI assumes success. Cards snap to their new columns
                                instantly while the database syncs silently in the
                                background.
                            </p>
                        </div>
                        <div className="mt-auto flex w-full gap-4 pt-6">
                            <div className="bg-surface-container-highest flex-1 space-y-2 rounded-lg p-3">
                                <div className="bg-surface h-8 rounded opacity-50 shadow-sm" />
                                <div className="bg-surface h-16 rounded shadow-sm" />
                            </div>
                            <div className="bg-surface-container-highest border-secondary relative flex-1 space-y-2 rounded-lg border border-dashed p-3">
                                <div className="bg-surface h-16 translate-y-4 scale-105 rotate-2 rounded shadow-lg" />
                            </div>
                        </div>
                    </FeatureCard>

                    <FeatureCard
                        index={2}
                        className="flex flex-col items-center justify-between md:col-span-3 md:flex-row"
                    >
                        <div className="max-w-xl">
                            <div className="bg-tertiary-container text-on-tertiary-container mb-6 flex size-12 items-center justify-center rounded-xl">
                                <RefreshCw className="size-6" aria-hidden="true" />
                            </div>
                            <h3 className="text-title-md text-on-surface mb-2">
                                Real-Time Sync Engine
                            </h3>
                            <p className="text-body-base text-on-surface-variant">
                                Every card move is patched directly into each open
                                tab&rsquo;s cache over a live socket connection &mdash;
                                no polling, no refresh.
                            </p>
                        </div>
                        <div className="hidden w-64 flex-col gap-3 md:flex">
                            <div className="flex items-center gap-3">
                                <CheckCircle2
                                    className="text-on-secondary-container size-5"
                                    aria-hidden="true"
                                />
                                <span className="text-body-sm text-on-surface font-mono text-xs">
                                    sync_status: OK
                                </span>
                            </div>
                            <div className="bg-surface-container h-1 w-full rounded-full">
                                <div className="bg-on-secondary-container h-1 w-full animate-pulse rounded-full" />
                            </div>
                        </div>
                    </FeatureCard>
                </div>
            </div>
        </section>
    );
}
