import { useNavigate } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const contentVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

export function CtaSection() {
    const navigate = useNavigate();

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const email = new FormData(event.currentTarget).get("email") as string;
        navigate({ to: "/register", search: { email } });
    }

    return (
        <section className="bg-primary text-on-primary px-container-margin relative w-full overflow-hidden py-32">
            <div
                className="pointer-events-none absolute inset-0 opacity-10"
                aria-hidden="true"
            >
                <motion.div
                    className="absolute -top-20 -left-20 size-96 rounded-full bg-white mix-blend-overlay blur-3xl"
                    animate={{ x: [0, 24, 0], y: [0, -16, 0], scale: [1, 1.08, 1] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="bg-secondary-fixed absolute right-20 bottom-0 size-80 rounded-full mix-blend-overlay blur-3xl"
                    animate={{ x: [0, -20, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={contentVariants}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="gap-stack-lg relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
            >
                <h2 className="text-headline-lg-mobile sm:text-headline-lg">
                    Ready to move faster?
                </h2>
                <p className="text-body-base max-w-xl opacity-80">
                    Join teams already using SyncBoard to manage their workflows with
                    unprecedented speed.
                </p>
                <form
                    className="bg-surface text-on-surface flex w-full max-w-md gap-2 rounded-xl p-2 shadow-2xl"
                    onSubmit={handleSubmit}
                >
                    <Input
                        type="email"
                        name="email"
                        placeholder="Enter your work email"
                        aria-label="Work email"
                        required
                        className="border-none bg-transparent shadow-none focus-visible:ring-0"
                    />
                    <Button type="submit">Get started</Button>
                </form>
            </motion.div>
        </section>
    );
}
