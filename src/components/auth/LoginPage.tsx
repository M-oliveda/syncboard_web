import { Link } from "@tanstack/react-router";
import { ArrowRight, Kanban, Mail } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OriginInputPassword } from "@/components/ui/input-password";
import { Label } from "@/components/ui/label";

export function LoginPage() {
    return (
        <AuthCard
            icon={
                <div className="bg-primary text-on-primary flex size-14 items-center justify-center rounded-2xl shadow-md">
                    <Kanban className="size-7" aria-hidden="true" />
                </div>
            }
            title="Welcome back"
            description="Log in to continue to SyncBoard"
            footer={
                <>
                    Don&rsquo;t have an account?{" "}
                    <Link
                        to="/register"
                        className="text-on-secondary-container hover:text-primary font-medium transition-colors"
                    >
                        Sign up for free
                    </Link>
                </>
            }
        >
            <form
                className="gap-stack-md flex flex-col"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail
                            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                            aria-hidden="true"
                        />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@company.com"
                            required
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            to="/forgot-password"
                            className="text-body-sm text-on-secondary-container hover:text-primary transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <OriginInputPassword
                        id="password"
                        name="password"
                        label=""
                        rules={[]}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" size="lg" className="group mt-2">
                    Log in
                    <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                    />
                </Button>
            </form>
        </AuthCard>
    );
}
