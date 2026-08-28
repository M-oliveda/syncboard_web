import type { ReactNode } from "react";

export interface AuthCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    children: ReactNode;
    footer: ReactNode;
}

export function AuthCard({
    icon,
    title,
    description,
    children,
    footer,
}: AuthCardProps) {
    return (
        <div className="bg-background p-stack-md flex min-h-screen items-center justify-center">
            <div className="bg-surface-container relative w-full max-w-md overflow-hidden rounded-xl p-6 shadow-xl">
                <div
                    aria-hidden="true"
                    className="bg-secondary-container pointer-events-none absolute -top-32 -right-32 size-64 rounded-full opacity-20 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="bg-primary-container pointer-events-none absolute -bottom-24 -left-24 size-48 rounded-full opacity-10 blur-3xl"
                />

                <div className="gap-stack-sm relative z-10 mb-4 flex flex-col items-center text-center">
                    {icon}
                    <h1 className="text-headline-lg-mobile sm:text-headline-lg text-on-surface">
                        {title}
                    </h1>
                    <p className="text-body-base text-on-surface-variant">
                        {description}
                    </p>
                </div>

                <div className="relative z-10">{children}</div>

                <p className="text-body-sm text-on-surface-variant relative z-10 mt-4 text-center">
                    {footer}
                </p>
            </div>
        </div>
    );
}
