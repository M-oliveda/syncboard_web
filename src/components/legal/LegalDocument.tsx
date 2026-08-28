import { Link } from "@tanstack/react-router";
import { ChevronRight, Home, Mail } from "lucide-react";
import type { ReactNode } from "react";

import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export interface LegalSection {
    id: string;
    number: number;
    title: string;
    children: ReactNode;
}

export interface LegalDocumentProps {
    icon: ReactNode;
    title: string;
    description: string;
    lastUpdated: string;
    sections: LegalSection[];
}

export function LegalDocument({
    icon,
    title,
    description,
    lastUpdated,
    sections,
}: LegalDocumentProps) {
    return (
        <div className="bg-background px-container-margin py-section-padding min-h-screen">
            <nav className="text-body-sm text-on-surface-variant gap-stack-sm mb-stack-lg mx-auto flex w-full max-w-4xl items-center">
                <Link
                    to="/"
                    className="hover:text-primary flex items-center gap-1 transition-colors"
                >
                    <Home className="size-4" aria-hidden="true" />
                    Home
                </Link>
                <ChevronRight className="size-3.5" aria-hidden="true" />
                <span className="text-on-surface font-medium">{title}</span>
            </nav>

            <header className="mb-section-padding mx-auto flex w-full max-w-4xl flex-col items-center text-center">
                <div className="text-primary mb-stack-md" aria-hidden="true">
                    {icon}
                </div>
                <h1 className="text-headline-lg-mobile sm:text-headline-xl text-on-background mb-stack-md">
                    {title}
                </h1>
                <p className="text-body-base text-on-surface-variant max-w-2xl">
                    {description}
                </p>
                <span className="bg-surface-container text-label-caps text-on-surface mt-stack-lg inline-flex items-center gap-2 rounded-full px-4 py-2">
                    <span
                        className="bg-on-secondary-container size-2 rounded-full"
                        aria-hidden="true"
                    />
                    Last updated: {lastUpdated}
                </span>
            </header>

            <div className="gap-section-padding mx-auto flex w-full max-w-5xl flex-col items-start md:flex-row">
                <aside className="hidden w-64 shrink-0 self-start md:sticky md:top-25 md:block">
                    <nav
                        aria-label="Table of contents"
                        className="bg-surface-container/50 p-stack-md rounded-2xl shadow-sm backdrop-blur-md"
                    >
                        <h2 className="text-title-md text-on-background mb-stack-md">
                            Contents
                        </h2>
                        <ul className="flex flex-col gap-1">
                            {sections.map((section) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className="text-body-sm text-on-surface hover:text-primary block py-1 transition-colors"
                                    >
                                        {section.number}. {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <main className="bg-surface-container-lowest p-stack-lg shadow-primary/5 w-full max-w-180 flex-1 rounded-3xl shadow-md md:p-12">
                    {sections.map((section) => (
                        <section
                            key={section.id}
                            id={section.id}
                            className="mb-stack-lg scroll-mt-30"
                        >
                            <h3 className="text-title-md text-on-background gap-stack-sm mb-stack-sm flex items-baseline">
                                <span className="text-primary font-bold">
                                    {section.number}.
                                </span>{" "}
                                {section.title}
                            </h3>
                            <div className="text-body-base text-on-surface-variant space-y-4">
                                {section.children}
                            </div>
                        </section>
                    ))}

                    <div className="border-outline-variant/30 gap-stack-md bg-surface-container-low p-stack-lg mt-section-padding pt-stack-lg flex flex-col items-center justify-between rounded-2xl border-t md:flex-row">
                        <div>
                            <h4 className="text-title-md text-on-background mb-1">
                                Questions about this document?
                            </h4>
                            <p className="text-body-sm text-on-surface-variant">
                                Our legal team is here to help clarify any points.
                            </p>
                        </div>
                        <a
                            href="mailto:hello@moliveda.dev"
                            className={cn(buttonVariants(), "shrink-0")}
                        >
                            <Mail className="size-4" aria-hidden="true" />
                            Contact legal
                        </a>
                    </div>
                </main>
            </div>
        </div>
    );
}
