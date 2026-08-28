import { motion, type Variants } from "framer-motion";
import { LayoutGrid, UserPlus, Zap } from "lucide-react";
import type { ComponentType } from "react";

interface StepDefinition {
    icon: ComponentType<{ className?: string; "aria-hidden": true }>;
    title: string;
    description: string;
}

const steps: StepDefinition[] = [
    {
        icon: LayoutGrid,
        title: "Create a board",
        description:
            "Spin one up in seconds. Add lists, name your columns — it's yours until you're ready to share it.",
    },
    {
        icon: UserPlus,
        title: "Invite your team",
        description:
            "Send a link. Everyone lands on the same board, in the same state, instantly.",
    },
    {
        icon: Zap,
        title: "Watch it sync",
        description:
            "Drag a card and it's already moved on their screen — no refresh, no merge conflicts, no waiting.",
    },
];

const stepVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

function Step({ index, step }: { index: number; step: StepDefinition }) {
    const Icon = step.icon;

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={stepVariants}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
            className="gap-stack-md relative z-10 flex flex-1 flex-col items-center text-center"
        >
            <div className="bg-primary text-on-primary flex size-14 items-center justify-center rounded-full shadow-sm">
                <Icon className="size-6" aria-hidden={true} />
            </div>
            <h3 className="text-title-md text-on-surface">{step.title}</h3>
            <p className="text-body-sm text-on-surface-variant max-w-xs">
                {step.description}
            </p>
        </motion.div>
    );
}

export function HowItWorks() {
    return (
        <section className="py-section-padding px-container-margin w-full">
            <div className="gap-section-padding mx-auto flex max-w-7xl flex-col">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-headline-lg-mobile sm:text-headline-lg text-on-background mb-4">
                        Up and running in three steps.
                    </h2>
                    <p className="text-body-base text-on-surface-variant">
                        No setup calls, no onboarding deck — just a board that&rsquo;s
                        ready before your coffee is.
                    </p>
                </div>

                <div className="relative flex flex-col gap-12 md:flex-row md:gap-6">
                    <div
                        className="border-outline-variant/50 absolute top-7 right-[16.66%] left-[16.66%] hidden border-t md:block"
                        aria-hidden="true"
                    />
                    {steps.map((step, index) => (
                        <Step key={step.title} index={index} step={step} />
                    ))}
                </div>
            </div>
        </section>
    );
}
