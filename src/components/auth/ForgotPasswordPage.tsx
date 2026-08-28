import { Link } from "@tanstack/react-router";
import { ArrowRight, KeyRound, Mail } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordPage() {
    return (
        <AuthCard
            icon={
                <div className="bg-primary text-on-primary flex size-12 items-center justify-center rounded-full shadow-md">
                    <KeyRound className="size-5" aria-hidden="true" />
                </div>
            }
            title="Reset your password"
            description="Enter your email and we'll send you a link to reset your password."
            footer={
                <>
                    Remembered your password?{" "}
                    <Link
                        to="/login"
                        className="text-primary font-medium underline-offset-4 hover:underline"
                    >
                        Log in here
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

                <Button type="submit" size="lg" className="group mt-2">
                    Send reset link
                    <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                    />
                </Button>
            </form>
        </AuthCard>
    );
}
