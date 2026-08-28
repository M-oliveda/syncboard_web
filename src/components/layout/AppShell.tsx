import { Menu } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export interface AppShellProps {
    breadcrumb: ReactNode;
    action?: ReactNode;
    children: ReactNode;
}

export function AppShell({ breadcrumb, action, children }: AppShellProps) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="bg-background min-h-screen">
            <Sidebar className="fixed inset-y-0 left-0 z-50 hidden lg:flex" />

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetContent
                    side="left"
                    className="w-64 gap-0 p-0"
                    showCloseButton={false}
                >
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <Sidebar className="border-none" />
                </SheetContent>
            </Sheet>

            <div className="flex min-h-screen flex-col lg:pl-64">
                <header className="bg-surface/80 border-outline-variant/30 fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur-xl lg:left-64 lg:px-8">
                    <div className="flex min-w-0 items-center gap-2">
                        <button
                            type="button"
                            aria-label="Open navigation"
                            onClick={() => setMobileNavOpen(true)}
                            className="text-on-surface-variant hover:bg-surface-container-high flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors lg:hidden"
                        >
                            <Menu className="size-5" aria-hidden="true" />
                        </button>
                        <div className="text-body-sm text-on-surface-variant gap-base hidden min-w-0 items-center sm:flex">
                            {breadcrumb}
                        </div>
                    </div>
                    {action}
                </header>
                <main className="flex flex-1 flex-col pt-16">{children}</main>
            </div>
        </div>
    );
}
