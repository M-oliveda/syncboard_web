import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/branding/Logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

const desktopLinkClassName =
    "text-body-sm text-on-surface-variant hover:text-on-surface transition-colors";
const mobileLinkClassName =
    "text-body-base text-on-surface-variant hover:text-on-surface py-stack-sm transition-colors";
const activeLinkClassName = "text-on-surface font-semibold";

export function MarketingHeader() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const closeMobileNav = () => setMobileNavOpen(false);

    return (
        <header
            className={cn(
                "bg-surface/80 fixed top-0 z-50 w-full backdrop-blur-xl transition-shadow duration-300",
                scrolled
                    ? "border-outline-variant/30 border-b shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
                    : "shadow-[0_1px_8px_rgba(0,0,0,0.04)]",
            )}
        >
            <div className="px-container-margin flex h-16 w-full items-center justify-between">
                <Link to="/" className="flex items-center">
                    <Logo />
                </Link>

                <nav className="gap-stack-md hidden items-center md:flex">
                    <a href="#features" className={desktopLinkClassName}>
                        Features
                    </a>
                    <Link
                        to="/roadmap"
                        className={desktopLinkClassName}
                        activeProps={{ className: activeLinkClassName }}
                    >
                        Roadmap
                    </Link>
                    <Link
                        to="/login"
                        className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                        Sign in
                    </Link>
                </nav>

                <button
                    type="button"
                    aria-label="Open navigation"
                    onClick={() => setMobileNavOpen(true)}
                    className="text-on-surface-variant hover:bg-surface-container-high flex size-9 items-center justify-center rounded-lg transition-colors md:hidden"
                >
                    <Menu className="size-5" aria-hidden="true" />
                </button>
            </div>

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetContent side="right" className="gap-0 p-0">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <nav className="gap-stack-sm px-container-margin flex flex-col pt-20">
                        <a
                            href="#features"
                            onClick={closeMobileNav}
                            className={mobileLinkClassName}
                        >
                            Features
                        </a>
                        <Link
                            to="/roadmap"
                            onClick={closeMobileNav}
                            className={mobileLinkClassName}
                            activeProps={{ className: activeLinkClassName }}
                        >
                            Roadmap
                        </Link>
                        <Link
                            to="/login"
                            onClick={closeMobileNav}
                            className={mobileLinkClassName}
                        >
                            Sign in
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>
        </header>
    );
}
