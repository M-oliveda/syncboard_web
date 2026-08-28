import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/branding/Logo";

const linkClassName =
    "text-body-sm text-on-surface-variant hover:text-on-surface transition-colors";

const columns: { heading: string; links: { label: string; href: string }[] }[] = [
    {
        heading: "Product",
        links: [
            { label: "Features", href: "#features" },
            { label: "Roadmap", href: "/roadmap" },
        ],
    },
    {
        heading: "Account",
        links: [
            { label: "Sign in", href: "/login" },
            { label: "Get started", href: "/register" },
        ],
    },
    {
        heading: "Legal",
        links: [
            { label: "Terms of Service", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
        ],
    },
];

export function MarketingFooter() {
    return (
        <footer className="bg-surface-container-low py-section-padding w-full">
            <div className="px-container-margin gap-section-padding mx-auto flex max-w-7xl flex-col">
                <div className="gap-stack-lg flex flex-col justify-between md:flex-row">
                    <div className="max-w-xs">
                        <Link to="/" className="mb-stack-md inline-flex">
                            <Logo />
                        </Link>
                        <p className="text-body-sm text-on-surface-variant">
                            Real-time Kanban boards for teams who&rsquo;d rather ship
                            than sync manually.
                        </p>
                    </div>

                    <div className="gap-stack-lg grid grid-cols-3 sm:gap-16">
                        {columns.map((column) => (
                            <div
                                key={column.heading}
                                className="gap-stack-sm flex flex-col"
                            >
                                <p className="text-label-caps text-on-secondary-container">
                                    {column.heading}
                                </p>
                                <nav className="gap-stack-sm flex flex-col">
                                    {column.links.map((link) =>
                                        link.href.startsWith("/") ? (
                                            <Link
                                                key={link.label}
                                                to={link.href}
                                                className={linkClassName}
                                            >
                                                {link.label}
                                            </Link>
                                        ) : (
                                            <a
                                                key={link.label}
                                                href={link.href}
                                                className={linkClassName}
                                            >
                                                {link.label}
                                            </a>
                                        ),
                                    )}
                                </nav>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-outline-variant/30 text-on-surface-variant text-body-sm border-t pt-8 text-center sm:text-left">
                    <p>
                        <small>
                            &copy; {new Date().getFullYear()} SyncBoard, A{" "}
                            <a
                                href="https://www.github.com/M-oliveda"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-on-surface-variant hover:text-on-surface transition-colors hover:underline"
                            >
                                M-oliveda
                            </a>{" "}
                            project. Built for high-performance teams.
                        </small>
                    </p>
                </div>
            </div>
        </footer>
    );
}
