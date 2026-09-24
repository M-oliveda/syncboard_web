import { motion, type Variants } from "framer-motion";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "Is SyncBoard available today?",
        answer: "SyncBoard is currently in preview. The board UI you're browsing is built — auth, drag-and-drop, and real-time sync are actively in progress. Check the roadmap to see what's shipped and what's next.",
    },
    {
        question: "How does the real-time sync actually work?",
        answer: "Every card move is pushed over a live socket connection and patched directly into your teammates' open tabs. There's no polling and no manual refresh — the update just appears.",
    },
    {
        question: "What happens if my connection drops mid-drag?",
        answer: "The UI updates the instant you drop a card, before the server confirms it. If the save fails, the card snaps back to where it was — nothing gets lost, and nothing gets stuck half-moved.",
    },
    {
        question: "Is my data secure?",
        answer: "Access tokens are short-lived and refreshed silently through an HttpOnly cookie your browser-side code never reads or stores — the same pattern most production SaaS auth flows use.",
    },
    {
        question: "Does SyncBoard work offline?",
        answer: "Not yet. SyncBoard is built as a real-time, always-connected experience today, so offline support isn't on the near-term roadmap.",
    },
    {
        question: "Is there a native mobile app?",
        answer: "Not a native one. SyncBoard is a responsive web app, so it works well on phone and tablet browsers without an install.",
    },
];

const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

export function FaqSection() {
    return (
        <section className="py-section-padding px-container-margin bg-surface-container-low w-full">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mx-auto flex max-w-3xl flex-col"
            >
                <div className="mb-stack-lg text-center">
                    <h2 className="text-headline-lg-mobile sm:text-headline-lg text-on-background mb-4">
                        Questions, answered.
                    </h2>
                    <p className="text-body-base text-on-surface-variant">
                        The straight answers, including the ones that aren&rsquo;t
                        finished yet.
                    </p>
                </div>

                <Accordion className="bg-surface rounded-2xl px-6 shadow-sm">
                    {faqs.map((faq) => (
                        <AccordionItem key={faq.question} value={faq.question}>
                            <AccordionTrigger className="text-body-base text-on-surface py-4">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-body-sm text-on-surface-variant">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </motion.div>
        </section>
    );
}
